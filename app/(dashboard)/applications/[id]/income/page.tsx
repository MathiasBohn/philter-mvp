"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmployerEntry } from "@/components/features/application/employer-entry"
import { UploadDropzone, type UploadedFile } from "@/components/features/application/upload-dropzone"
import { DocumentCard } from "@/components/features/application/document-card"
import { FormActions } from "@/components/forms/form-actions"
import { ErrorSummary } from "@/components/forms/error-summary"
import { PayCadence, type EmploymentRecord } from "@/lib/types"

export default function IncomePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [employers, setEmployers] = useState<EmploymentRecord[]>([])
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const addEmployer = () => {
    const newEmployer: EmploymentRecord = {
      id: Math.random().toString(36).substring(7),
      employer: "",
      title: "",
      startDate: new Date(),
      payCadence: PayCadence.ANNUAL,
      annualIncome: 0,
      isCurrent: true,
    }
    setEmployers((prev) => [...prev, newEmployer])
  }

  // Load data from localStorage on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`income-data-${params.id}`)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.employers) {
          setEmployers(
            data.employers.map((e: { startDate: string; endDate?: string }) => ({
              ...e,
              startDate: new Date(e.startDate),
              endDate: e.endDate ? new Date(e.endDate) : undefined,
            }))
          )
        }
        if (data.documents) {
          setDocuments(data.documents)
        }
      } else {
        // Initialize with one empty employer
        addEmployer()
      }
    } catch (error) {
      console.error("Error loading income data:", error)
      // Initialize with one empty employer on error
      addEmployer()
    }
  }, [params.id])

  const updateEmployer = (id: string, updated: EmploymentRecord) => {
    setEmployers(employers.map((e) => (e.id === id ? updated : e)))
  }

  const removeEmployer = (id: string) => {
    if (employers.length > 1) {
      setEmployers(employers.filter((e) => e.id !== id))
    }
  }

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    setDocuments([...documents, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((file) => {
      if (file.status === "pending") {
        simulateUpload(file.id)
      }
    })
  }

  const simulateUpload = (fileId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === fileId ? { ...doc, status: "uploading" as const } : doc
      )
    )

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === fileId ? { ...doc, progress } : doc
        )
      )

      if (progress >= 100) {
        clearInterval(interval)
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === fileId
              ? { ...doc, status: "complete" as const, progress: 100 }
              : doc
          )
        )
      }
    }, 300)
  }

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    employers.forEach((employer) => {
      if (!employer.employer.trim()) {
        newErrors[`employer-${employer.id}`] = "Employer name is required"
      }
      if (!employer.title.trim()) {
        newErrors[`title-${employer.id}`] = "Job title is required"
      }
      if (employer.annualIncome < 0) {
        newErrors[`annualIncome-${employer.id}`] = "Income must be 0 or greater"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      return
    }

    setIsSaving(true)

    // Save to localStorage
    const data = {
      employers,
      documents,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(`income-data-${params.id}`, JSON.stringify(data))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSaving(false)
  }

  const handleContinue = async () => {
    if (!validate()) {
      return
    }

    await handleSave()
    router.push(`/applications/${params.id}/financials`)
  }

  const getEmployerErrors = (employerId: string) => {
    const employerErrors: Record<string, string> = {}
    Object.keys(errors).forEach((key) => {
      if (key.includes(employerId)) {
        const field = key.split("-")[0]
        employerErrors[field] = errors[key]
      }
    })
    return employerErrors
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Employment & Income</h1>
        <p className="mt-2 text-muted-foreground">
          Add your employment history and upload income verification documents.
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <ErrorSummary
          errors={Object.entries(errors).map(([key, value]) => ({
            field: key,
            message: value,
          }))}
        />
      )}

      <Separator />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Employment History</h2>
          <Button type="button" onClick={addEmployer} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Employer
          </Button>
        </div>

        <div className="space-y-4">
          {employers.map((employer, index) => (
            <EmployerEntry
              key={employer.id}
              employer={employer}
              onUpdate={(updated) => updateEmployer(employer.id, updated)}
              onRemove={() => removeEmployer(employer.id)}
              showRemove={employers.length > 1}
              errors={getEmployerErrors(employer.id)}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Income Verification Documents</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload documents that verify your income (pay stubs, W-2, 1099, tax returns, etc.)
          </p>
        </div>

        <UploadDropzone onFilesAdded={handleFilesAdded} />

        {documents.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Uploaded Documents ({documents.length})</h3>
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={() => removeDocument(doc.id)}
              />
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <Alert>
            <AlertDescription>
              No documents uploaded yet. Please upload income verification documents to continue.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      <FormActions
        onSave={handleSave}
        onCancel={() => router.push(`/applications/${params.id}`)}
        onContinue={handleContinue}
        isSaving={isSaving}
        continueText="Save & Continue"
      />
    </div>
  )
}
