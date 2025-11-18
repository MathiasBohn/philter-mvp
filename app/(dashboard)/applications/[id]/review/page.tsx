"use client"

import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, FileText } from "lucide-react"
import {
  ValidationSummary,
  type ValidationItem,
} from "@/components/features/application/validation-summary"
import { TransactionType } from "@/lib/types"

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null)
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)

  const validateApplication = useCallback(() => {
    const items: ValidationItem[] = []

    // Check profile
    const profileData = localStorage.getItem(`profile-data-${id}`)
    items.push({
      section: "Profile",
      requirement: "Complete personal information",
      status: profileData ? "complete" : "incomplete",
      link: `/applications/${id}/profile`,
      message: profileData
        ? "Name, email, phone, DOB, SSN, and 2-year address history"
        : "Please complete your profile",
    })

    // Check employment
    const incomeData = localStorage.getItem(`income-data-${id}`)
    const hasIncome = incomeData
      ? JSON.parse(incomeData).employers?.length > 0
      : false
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
    const financialsData = localStorage.getItem(`financials-data-${id}`)
    const hasFinancials = financialsData
      ? JSON.parse(financialsData).entries?.length > 0
      : false
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
    const documentsData = localStorage.getItem(`documents-data-${id}`)
    const hasGovtId = documentsData
      ? JSON.parse(documentsData).categories?.find(
          (c: { id: string; documents?: unknown[] }) => c.id === "govt-id" && c.documents?.length && c.documents.length > 0
        )
      : false
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
      const disclosuresData = localStorage.getItem(`disclosures-data-${id}`)
      const allAcknowledged = disclosuresData
        ? JSON.parse(disclosuresData).disclosures?.every((d: { acknowledged: boolean }) => d.acknowledged)
        : false
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
  }, [id, transactionType])

  useEffect(() => {
    const loadData = () => {
      try {
        let loadedTxType: TransactionType | null = null
        let loadedSubmitted = false
        let loadedSubmittedAt: Date | null = null

        // Load transaction type
        const appData = localStorage.getItem(`application-${id}`)
        if (appData) {
          const data = JSON.parse(appData)
          loadedTxType = data.transactionType
        }

        // Check submission status
        const submissionData = localStorage.getItem(`submission-${id}`)
        if (submissionData) {
          const data = JSON.parse(submissionData)
          loadedSubmitted = data.submitted
          loadedSubmittedAt = data.submittedAt ? new Date(data.submittedAt) : null
        }

        // Batch state updates
        if (loadedTxType) {
          setTransactionType(loadedTxType)
        }
        setIsSubmitted(loadedSubmitted)
        if (loadedSubmittedAt) {
          setSubmittedAt(loadedSubmittedAt)
        }
      } catch (error) {
        console.error("Error loading application data:", error)
      }
    }

    loadData()
  }, [id])

  // Perform validation when dependencies change
  useEffect(() => {
    // validateApplication is a memoized callback that updates validation state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    validateApplication()
  }, [validateApplication])

  const canSubmit = () => {
    return validationItems.every((item) => item.status === "complete" || item.status === "warning")
  }

  const handleSubmit = async () => {
    if (!canSubmit()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mark as submitted
    const submissionData = {
      submitted: true,
      submittedAt: new Date().toISOString(),
      applicationId: id,
    }
    localStorage.setItem(`submission-${id}`, JSON.stringify(submissionData))

    setIsSubmitted(true)
    setSubmittedAt(new Date())
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Application Submitted!</h1>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review & Submit</h1>
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
            disabled={!canSubmit() || isSubmitting}
          >
            {isSubmitting ? (
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
