"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BuildingCodeInput } from "@/components/features/application/building-code-input"
import { TransactionTypeTiles } from "@/components/features/application/transaction-type-tiles"
import { ErrorSummary } from "@/components/forms/error-summary"
import type { TransactionType } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useCreateApplication } from "@/lib/hooks/use-applications"
import { createClient } from "@/lib/supabase/client"

export default function NewApplicationPage() {
  const router = useRouter()
  const [buildingCode, setBuildingCode] = useState("")
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)
  const [errors, setErrors] = useState<{ field: string; message: string; anchor?: string }[]>([])

  const createApplication = useCreateApplication()

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

    try {
      // Look up building by code
      console.log('[Form] Looking up building with code:', buildingCode.toUpperCase())
      const supabase = createClient()
      const { data: building, error: lookupError } = await supabase
        .from('buildings')
        .select('id, name, code')
        .eq('code', buildingCode.toUpperCase())
        .single()

      console.log('[Form] Building lookup result:', { building, lookupError })

      if (lookupError || !building) {
        console.error('[Form] Building lookup failed:', lookupError)
        setErrors([
          {
            field: "buildingCode",
            message: `Invalid building code. ${lookupError ? `Error: ${lookupError.message}` : 'Building not found.'}`,
            anchor: "building-code",
          },
        ])
        return
      }

      console.log('[Form] Found building:', building.name, 'with ID:', building.id)

      // Create a new application via API with the building UUID
      console.log('[Form] Creating application with buildingId:', building.id, 'type:', typeof building.id)
      const newApplication = await createApplication.mutateAsync({
        buildingId: building.id,
        transactionType: transactionType || undefined,
      })

      // Navigate to the application overview
      router.push(`/applications/${newApplication.id}`)
    } catch (error) {
      setErrors([
        {
          field: "buildingCode",
          message: error instanceof Error ? error.message : "Failed to create application. Please try again.",
          anchor: "building-code",
        },
      ])
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
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

            <div className="flex flex-col gap-4 border-t pt-6">
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:ml-auto" disabled={createApplication.isPending}>
                {createApplication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
