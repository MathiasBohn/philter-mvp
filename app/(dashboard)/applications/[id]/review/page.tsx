"use client"

import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, FileText, AlertCircle } from "lucide-react"
import {
  ValidationSummary,
  type ValidationItem,
} from "@/components/features/application/validation-summary"
import { TransactionType } from "@/lib/types"
import { useApplication, useSubmitApplication } from "@/lib/hooks/use-applications"
import { FormSkeleton } from "@/components/loading/form-skeleton"

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()

  // Fetch application data using React Query
  const { data: application, isLoading, error } = useApplication(id)
  const submitApplication = useSubmitApplication(id)

  const [validationItems, setValidationItems] = useState<ValidationItem[]>([])

  const transactionType = application?.transactionType || null
  const isSubmitted = application?.status === 'SUBMITTED'
  const submittedAt = application?.submittedAt ? new Date(application.submittedAt) : null

  const validateApplication = useCallback(() => {
    if (!application) return

    const items: ValidationItem[] = []

    // Check profile
    const hasProfile = application.people && application.people.length > 0 && application.people[0].fullName
    items.push({
      section: "Profile",
      requirement: "Complete personal information",
      status: hasProfile ? "complete" : "incomplete",
      link: `/applications/${id}/profile`,
      message: hasProfile
        ? "Name, email, phone, DOB, SSN, and 2-year address history"
        : "Please complete your profile",
    })

    // Check employment
    const hasIncome = application.employmentRecords && application.employmentRecords.length > 0
    items.push({
      section: "Employment & Income",
      requirement: "At least one employer or income source",
      status: hasIncome ? "complete" : "incomplete",
      link: `/applications/${id}/income`,
      message: hasIncome
        ? "Employment history and income verification documents"
        : "Please add at least one employer",
    })

    // Check financials
    const hasFinancials = application.financialEntries && application.financialEntries.length > 0
    items.push({
      section: "Financial Summary",
      requirement: "Financial information complete",
      status: hasFinancials ? "complete" : "warning",
      link: `/applications/${id}/financials`,
      message: hasFinancials
        ? "Assets, liabilities, and income/expense breakdown"
        : "Financial entries help strengthen your application",
    })

    // Check documents
    const hasGovtId = application.documents?.find(
      (doc) => doc.category === "GOVERNMENT_ID"
    )
    items.push({
      section: "Documents",
      requirement: "At least one government-issued ID",
      status: hasGovtId ? "complete" : "incomplete",
      link: `/applications/${id}/documents`,
      message: hasGovtId
        ? "Required documents uploaded"
        : "Government ID is required",
    })

    // Check disclosures (if applicable)
    const isLeaseOrSublet =
      transactionType === TransactionType.CONDO_LEASE ||
      transactionType === TransactionType.COOP_SUBLET

    if (isLeaseOrSublet) {
      const allAcknowledged = application.disclosures?.every((d: { acknowledged: boolean }) => d.acknowledged)
      items.push({
        section: "Disclosures",
        requirement: "All disclosures acknowledged",
        status: allAcknowledged ? "complete" : "incomplete",
        link: `/applications/${id}/disclosures`,
        message: allAcknowledged
          ? "Legal disclosures acknowledged"
          : "Please acknowledge all required disclosures",
      })
    }

    setValidationItems(items)
  }, [application, id, transactionType])

  // Perform validation when application data changes
  useEffect(() => {
    if (application) {
      validateApplication()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application, id, transactionType])

  const canSubmit = () => {
    return validationItems.every((item) => item.status === "complete" || item.status === "warning")
  }

  const handleSubmit = async () => {
    if (!canSubmit()) {
      return
    }

    try {
      // Submit application via API
      await submitApplication.mutateAsync()
      // Success toast is handled by the mutation hook
    } catch (error) {
      console.error('Error submitting application:', error)
      // Error toast is handled by the mutation hook
    }
  }

  if (isLoading) {
    return <FormSkeleton sections={2} fieldsPerSection={3} />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load application data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Alert>
          <AlertDescription>
            Application not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Application Submitted!</h1>
          <p className="mt-2 text-muted-foreground">
            Your application has been successfully submitted.
          </p>
        </div>

        <Separator />

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Submission Details</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Application ID: {id}
              </p>
              <p className="text-sm text-muted-foreground">
                Submitted:{" "}
                {submittedAt?.toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold">What happens next?</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Your broker will review your application for completeness and may
                    request additional information.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Once the broker approves, your application will be submitted to the
                    building management and board for review.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    You will be notified if any additional information or documentation is
                    needed.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    The board review process typically takes 2-4 weeks. You will receive a
                    decision notification once complete.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-3">
          <Button onClick={() => router.push(`/applications/${id}`)}>
            View Application
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs text-muted-foreground">
            Your application is now locked for editing. If you need to make changes,
            please contact your broker.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review & Submit</h1>
        <p className="mt-2 text-muted-foreground">
          Review your application for completeness before submitting. All required
          sections must be complete.
        </p>
      </div>

      <Separator />

      <ValidationSummary items={validationItems} />

      <Separator />

      <div>
        <h2 className="text-xl font-semibold">Compiled Application Package</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preview of your complete application as it will appear to the building
          management and board.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-96 items-center justify-center bg-muted/20 p-12">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">PDF Preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A compiled PDF of your application will be generated upon submission
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      <div className="space-y-4 rounded-lg border bg-muted/20 p-6">
        <div>
          <p className="font-semibold text-lg">Ready to submit your application?</p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Your application will be submitted to your broker for verification and forwarding to the building management.
            You can make changes until the broker submits it to the building.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {canSubmit()
              ? "All requirements met. You can submit your application now."
              : "Complete all required sections before submitting."}
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit() || submitApplication.isPending}
          >
            {submitApplication.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting to Broker...
              </>
            ) : (
              "Submit Application to Broker"
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => router.push(`/applications/${id}`)}
        >
          Back to Overview
        </Button>
      </div>
    </div>
  )
}
