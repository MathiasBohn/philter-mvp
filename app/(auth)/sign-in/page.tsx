'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/auth-context'
import { Role } from '@/lib/types'
import { Loader2, Mail } from 'lucide-react'
import { PhilterLogo } from '@/components/brand/philter-logo'
import { getDashboardForRole } from '@/lib/routing'

function SignInForm() {
  const searchParams = useSearchParams()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  // Track if we're in the middle of a sign-in to prevent duplicate redirects
  const [isRedirecting, setIsRedirecting] = useState(false)

  const supabase = createClient()

  // Redirect authenticated users away from sign-in page
  // IMPORTANT: Wait for profile to be loaded to get the correct role
  // The user object has a fallback role of 'APPLICANT' until profile loads
  useEffect(() => {
    // Debug logging
    console.log('[SignIn useEffect] State:', {
      authLoading,
      hasUser: !!user,
      userRole: user?.role,
      hasProfile: !!profile,
      profileRole: profile?.role,
      isRedirecting
    })

    // Only redirect if:
    // 1. Auth loading is complete
    // 2. User exists
    // 3. Profile has loaded (so we have the real role, not the fallback)
    // 4. We're not already in the middle of a redirect
    if (!authLoading && user && profile && !isRedirecting) {
      setIsRedirecting(true)
      const redirectTo = searchParams.get('redirectTo')
      // Use the profile role (authoritative) instead of user.role (may be fallback)
      const defaultRoute = getDashboardForRole(profile.role)
      console.log('[SignIn useEffect] Auto-redirecting authenticated user to:', defaultRoute, 'for role:', profile.role)
      // Use window.location.href for full page reload to ensure auth state is synced
      window.location.href = redirectTo || defaultRoute
    }
  }, [user, profile, authLoading, searchParams, isRedirecting])

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          setError('Please verify your email before signing in.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        // Fetch user profile to get role for redirect
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // Log profile fetch result for debugging
        if (profileError) {
          console.error('[SignIn] Profile fetch error:', profileError.message)
        }
        console.log('[SignIn] Profile data:', profile, 'Role:', profile?.role)

        // Use role-based redirect or fallback
        // Keep loading state true during redirect to prevent double-clicks
        setIsRedirecting(true)
        const redirectTo = searchParams.get('redirectTo')
        const userRole = (profile?.role as Role) || Role.APPLICANT
        const defaultRoute = getDashboardForRole(userRole)
        console.log('[SignIn] Redirecting to:', defaultRoute, 'for role:', userRole)
        // Use window.location.href for full page reload to ensure auth state is synced
        window.location.href = redirectTo || defaultRoute
        // Don't set isLoading to false - keep button disabled during redirect
        return
      }

      // No user data returned
      setIsLoading(false)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Sign in error:', err)
      setIsLoading(false)
    }
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMagicLinkSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Magic link error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a magic link to <strong className="text-foreground">{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in to your account.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMagicLinkSent(false)}
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your philter account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={useMagicLink ? handleMagicLinkSignIn : handlePasswordSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || isRedirecting}
          />
        </div>

        {!useMagicLink && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || isRedirecting}
            />
          </div>
        )}

        {!useMagicLink && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading || isRedirecting}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
          {(isLoading || isRedirecting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRedirecting ? 'Redirecting...' : useMagicLink ? 'Send magic link' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setUseMagicLink(!useMagicLink)}
        disabled={isLoading || isRedirecting}
      >
        {useMagicLink ? 'Sign in with password' : 'Sign in with magic link'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}

function SignInLoading() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your philter account
        </p>
      </div>
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

export default function SignInPage() {
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

      <Suspense fallback={<SignInLoading />}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
