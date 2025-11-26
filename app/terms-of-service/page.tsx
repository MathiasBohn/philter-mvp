import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">
            Our Terms of Service are currently being drafted and will be available soon.
          </p>
          <p className="text-sm text-muted-foreground">
            We are working to provide comprehensive terms that protect both our users and the platform.
            These terms will cover user responsibilities, platform usage guidelines, data handling practices,
            and other important legal provisions.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/sign-up" className="w-full block">
            <Button className="w-full">
              Back to Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
