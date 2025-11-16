"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { BuildingCodeInput } from "@/components/features/application/building-code-input"
import { TransactionTypeTiles } from "@/components/features/application/transaction-type-tiles"
import { ErrorSummary } from "@/components/forms/error-summary"
import type { TransactionType } from "@/lib/types"
import { Loader2, Info } from "lucide-react"

export default function NewApplicationPage() {
  const router = useRouter()
  const [buildingCode, setBuildingCode] = useState("")
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)
  const [expeditedReview, setExpeditedReview] = useState(false)
  const [errors, setErrors] = useState<{ field: string; message: string; anchor?: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: { field: string; message: string; anchor?: string }[] = []

    if (!buildingCode || buildingCode.length !== 6) {
      newErrors.push({
        field: "buildingCode",
        message: "Please enter a valid 6-character building code.",
        anchor: "building-code",
      })
    }

    if (!transactionType) {
      newErrors.push({
        field: "transactionType",
        message: "Please select a transaction type.",
      })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Focus on the error summary
      const errorSummary = document.querySelector('[role="alert"]')
      errorSummary?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    setIsLoading(true)

    // Simulate API call to validate building code
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock validation - accept any 6-character code
    // In a real app, this would validate against the database
    if (buildingCode.length === 6) {
      // Create a new application ID (mock)
      const newApplicationId = `app_${Date.now()}`

      // Store application data in localStorage (mock persistence)
      const applicationData = {
        id: newApplicationId,
        buildingCode,
        transactionType,
        status: "IN_PROGRESS",
        createdAt: new Date().toISOString(),
        expeditedReview,
        expeditedReviewFee: expeditedReview ? 500 : undefined,
        sections: {
          profile: { complete: false },
          income: { complete: false },
          financials: { complete: false },
          documents: { complete: false },
          disclosures: { complete: false },
        },
      }

      localStorage.setItem(`application_${newApplicationId}`, JSON.stringify(applicationData))

      // Navigate to the application overview (A1)
      router.push(`/applications/${newApplicationId}`)
    } else {
      setErrors([
        {
          field: "buildingCode",
          message: "Invalid building code. Please check and try again.",
          anchor: "building-code",
        },
      ])
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Start Your Application</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Begin your board package submission process
        </p>
      </div>

      {errors.length > 0 && (
        <ErrorSummary
          errors={errors}
          title="Please fix the following errors before continuing"
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Building & Transaction Details</CardTitle>
          <CardDescription>
            Enter your building code and select the type of transaction you&apos;re applying for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <BuildingCodeInput
              value={buildingCode}
              onChange={setBuildingCode}
              error={errors.find((e) => e.field === "buildingCode")?.message}
            />

            <TransactionTypeTiles
              value={transactionType}
              onChange={setTransactionType}
              error={errors.find((e) => e.field === "transactionType")?.message}
            />

            <div className="space-y-4 border-t pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Expedited Review (Optional)</h3>
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="expedited-review"
                    checked={expeditedReview}
                    onCheckedChange={(checked) => setExpeditedReview(checked === true)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="expedited-review"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I want expedited processing (1-2 business days) for an additional{" "}
                      <span className="font-bold text-red-600">NON-REFUNDABLE</span> fee of $500
                    </label>
                    <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>
                        FirstService Residential review time will be 1-2 business days. This does not
                        include Board review and approval time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t pt-6">
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:ml-auto" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Application
              </Button>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Don&apos;t have a building code?</strong> Contact your broker or building
                  management to obtain your unique application code.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
