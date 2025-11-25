'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import type { Json } from '@/lib/database.types'

interface InvitationData {
  id: string
  application_id: string
  email: string
  status: string
  expires_at: string
  created_at: string
  application?: {
    id: string
    unit: string | null
    building?: {
      name: string
      address: Json
    } | null
  }
}

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  const validateInvitation = async () => {
    try {
      const supabase = createClient()

      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)
        setCurrentUserEmail(user.email || null)
      }

      // Fetch invitation details
      const { data: invitationData, error: inviteError } = await supabase
        .from('application_invitations')
        .select(`
          *,
          application:applications(
            id,
            unit,
            building:buildings(
              name,
              address
            )
          )
        `)
        .eq('token', token)
        .single()

      if (inviteError || !invitationData) {
        setError('Invalid or expired invitation link')
        setLoading(false)
        return
      }

      // Check if invitation is expired
      const expiresAt = new Date(invitationData.expires_at)
      if (expiresAt < new Date()) {
        setError('This invitation has expired')
        setLoading(false)
        return
      }

      // Check if invitation is already accepted
      if (invitationData.status === 'ACCEPTED') {
        setError('This invitation has already been accepted')
        setLoading(false)
        return
      }

      setInvitation(invitationData)
      setLoading(false)

    } catch (err) {
      console.error('Error validating invitation:', err)
      setError('Failed to validate invitation')
      setLoading(false)
    }
  }

  useEffect(() => {
    validateInvitation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    const supabase = createClient()

    // If user is authenticated
    if (isAuthenticated) {
      try {
        // Check if email matches invitation
        if (currentUserEmail && currentUserEmail !== invitation.email) {
          setError(`This invitation was sent to ${invitation.email}. Please sign in with that email address.`)
          return
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('Authentication error. Please sign in again.')
          return
        }

        // Link user to application via application_participants table
        const { error: participantError } = await supabase
          .from('application_participants')
          .insert({
            application_id: invitation.application_id,
            user_id: user.id,
            role: 'APPLICANT',
            invited_at: invitation.created_at,
            accepted_at: new Date().toISOString(),
          })

        if (participantError) {
          console.error('Error adding participant:', participantError)
          setError('Failed to accept invitation. You may already have access to this application.')
          return
        }

        // Update invitation status
        await supabase
          .from('application_invitations')
          .update({
            status: 'ACCEPTED',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', invitation.id)

        // Redirect to application
        router.push(`/applications/${invitation.application_id}/overview`)

      } catch (err) {
        console.error('Error accepting invitation:', err)
        setError('Failed to accept invitation')
      }
    } else {
      // Redirect to sign-up with invitation token
      router.push(`/sign-up?invitation=${token}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating invitation...</p>
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
              <CardTitle>Invalid Invitation</CardTitle>
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

  if (!invitation) {
    return null
  }

  const buildingName = invitation.application?.building?.name || 'Unknown Building'
  const unit = invitation.application?.unit || 'N/A'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle>Application Invitation</CardTitle>
          </div>
          <CardDescription>
            You&apos;ve been invited to collaborate on an application
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
              <span className="text-sm font-medium">Invited to:</span>
              <span className="text-sm text-muted-foreground">{invitation.email}</span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="space-y-3">
              {currentUserEmail === invitation.email ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Click below to accept the invitation and access the application.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    This invitation was sent to {invitation.email}, but you&apos;re signed in as {currentUserEmail}.
                    Please sign out and sign in with the invited email address.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleAcceptInvitation}
                disabled={currentUserEmail !== invitation.email}
                className="w-full"
              >
                Accept Invitation
              </Button>

              {currentUserEmail !== invitation.email && (
                <Button
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    router.push(`/sign-in?redirectTo=/accept-invitation/${token}`)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sign Out & Sign In with Invited Email
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  To accept this invitation, you need to create an account or sign in with the invited email address.
                </AlertDescription>
              </Alert>

              <Button onClick={handleAcceptInvitation} className="w-full">
                Create Account
              </Button>

              <Button
                onClick={() => router.push(`/sign-in?redirectTo=/accept-invitation/${token}`)}
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
