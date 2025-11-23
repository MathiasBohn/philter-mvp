import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Our Privacy Policy is currently being drafted and will be available soon.
          </p>
          <p className="text-sm text-muted-foreground">
            We are committed to protecting your privacy and securing your personal information.
            Our privacy policy will detail how we collect, use, store, and protect your data,
            including information about your rights under applicable privacy laws such as GDPR and CCPA.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild className="w-full">
            <Link href="/sign-up">
              Back to Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
