'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react'

interface ClaimData {
  id: string
  application_id: string
  status: string
  expires_at: string
  created_at: string
  application?: {
    id: string
    unit: string
    transaction_type: string
    building?: {
      name: string
      address: Record<string, unknown>
    }
  }
}

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [claiming, setClaiming] = useState(false)

  const validateClaimLink = async () => {
    try {
      const supabase = createClient()

      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)
      }

      // Fetch claim link details
      const { data: claimLinkData, error: claimError } = await supabase
        .from('application_invitations')
        .select(`
          *,
          application:applications(
            id,
            unit,
            transaction_type,
            building:buildings(
              name,
              address
            )
          )
        `)
        .eq('token', token)
        .single()

      if (claimError || !claimLinkData) {
        setError('Invalid or expired claim link')
        setLoading(false)
        return
      }

      // Check if claim link is expired
      const expiresAt = new Date(claimLinkData.expires_at)
      if (expiresAt < new Date()) {
        setError('This claim link has expired')
        setLoading(false)
        return
      }

      // Check if claim link is already used
      if (claimLinkData.status === 'ACCEPTED') {
        setError('This claim link has already been used')
        setLoading(false)
        return
      }

      setClaimData(claimLinkData)
      setLoading(false)

    } catch (err) {
      console.error('Error validating claim link:', err)
      setError('Failed to validate claim link')
      setLoading(false)
    }
  }

  useEffect(() => {
    validateClaimLink()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleClaimApplication = async () => {
    if (!claimData) return

    const supabase = createClient()

    // If user is authenticated, claim immediately
    if (isAuthenticated) {
      setClaiming(true)

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('Authentication error. Please sign in again.')
          setClaiming(false)
          return
        }

        // Check if user already has access
        const { data: existingParticipant } = await supabase
          .from('application_participants')
          .select('id')
          .eq('application_id', claimData.application_id)
          .eq('user_id', user.id)
          .single()

        if (existingParticipant) {
          // User already has access, redirect to application
          router.push(`/applications/${claimData.application_id}/overview`)
          return
        }

        // Link user to application via application_participants table
        const { error: participantError } = await supabase
          .from('application_participants')
          .insert({
            application_id: claimData.application_id,
            user_id: user.id,
            role: 'APPLICANT',
            invited_at: claimData.created_at,
            accepted_at: new Date().toISOString(),
          })

        if (participantError) {
          console.error('Error adding participant:', participantError)
          setError('Failed to claim application')
          setClaiming(false)
          return
        }

        // Update claim link status
        await supabase
          .from('application_invitations')
          .update({
            status: 'ACCEPTED',
            accepted_at: new Date().toISOString(),
            email: user.email, // Store the email of who claimed it
          })
          .eq('id', claimData.id)

        // Redirect to application
        router.push(`/applications/${claimData.application_id}/overview`)

      } catch (err) {
        console.error('Error claiming application:', err)
        setError('Failed to claim application')
        setClaiming(false)
      }
    } else {
      // Redirect to sign-up/sign-in with claim token
      router.push(`/sign-in?claim=${token}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating claim link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Invalid Claim Link</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => router.push('/sign-in')} className="flex-1">
                Sign In
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!claimData) {
    return null
  }

  const buildingName = claimData.application?.building?.name || 'Unknown Building'
  const unit = claimData.application?.unit || 'N/A'
  const transactionType = claimData.application?.transaction_type || 'Unknown'

  // Format transaction type for display
  const formattedTransactionType = transactionType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Claim Application</CardTitle>
          </div>
          <CardDescription>
            You&apos;ve been invited to claim this application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Building:</span>
              <span className="text-sm text-muted-foreground">{buildingName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Unit:</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm text-muted-foreground">{formattedTransactionType}</span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="space-y-3">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  You&apos;re signed in. Click below to claim this application and start collaborating.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleClaimApplication}
                disabled={claiming}
                className="w-full"
              >
                {claiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Claim Application
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  To claim this application, you need to create an account or sign in.
                </AlertDescription>
              </Alert>

              <Button onClick={handleClaimApplication} className="w-full">
                Create Account & Claim
              </Button>

              <Button
                onClick={() => router.push(`/sign-in?claim=${token}`)}
                variant="outline"
                className="w-full"
              >
                Already Have an Account? Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
