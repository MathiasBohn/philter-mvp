'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { PhilterLogo } from '@/components/brand/philter-logo'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setEmail(user.email || null)
        if (user.email_confirmed_at) {
          setSuccess(true)
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/applications')
          }, 2000)
        } else {
          setError('Email not verified yet. Please check your inbox and click the verification link.')
        }
      } else {
        setError('No user session found. Please sign up or sign in.')
      }
      setIsLoading(false)
    }

    checkVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleResendVerification = async () => {
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setError(error.message)
      } else {
        setError('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Resend verification error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-philter-mint/30 to-philter-sage/20 dark:from-background dark:via-philter-navy/20 dark:to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-philter-mint/30 to-philter-sage/20 dark:from-background dark:via-philter-navy/20 dark:to-background p-4">
        <div className="fixed top-4 left-4 z-50">
          <Link href="/">
            <PhilterLogo size="sm" />
          </Link>
        </div>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Email verified!</h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified. Redirecting to your dashboard...
            </p>
          </div>
          <Button
            className="w-full"
            asChild
          >
            <Link href="/applications">
              Go to dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-philter-mint/30 to-philter-sage/20 dark:from-background dark:via-philter-navy/20 dark:to-background p-4">
      <div className="fixed top-4 left-4 z-50">
        <Link href="/">
          <PhilterLogo size="sm" />
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <XCircle className="h-6 w-6 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Email verification required</h1>
          {email && (
            <p className="text-muted-foreground">
              We sent a verification link to <strong className="text-foreground">{email}</strong>
            </p>
          )}
        </div>

        {error && (
          <Alert variant={error.includes('sent') ? 'default' : 'destructive'}>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Didn&apos;t receive the email? Check your spam folder or request a new verification email.
          </p>

          {email && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend verification email
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full"
            asChild
          >
            <Link href="/sign-in">
              Back to sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
