"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  DocumentChecklist,
  type DocumentCategory,
} from "@/components/features/application/document-checklist"
import { FormActions } from "@/components/forms/form-actions"
import type { UploadedFile } from "@/components/features/application/upload-dropzone"
import { mockApplications } from "@/lib/mock-data/applications"
import type { Application } from "@/lib/types"
import { FormSkeleton } from "@/components/loading/form-skeleton"

const INITIAL_CATEGORIES: DocumentCategory[] = [
  {
    id: "govt-id",
    name: "Government-Issued ID",
    description: "Driver's license, passport, or state ID (required for all applicants)",
    required: true,
    documents: [],
    canSkip: false,
  },
  {
    id: "bank-statements",
    name: "Bank Statements",
    description: "Recent bank statements showing assets (last 2-3 months)",
    required: false,
    documents: [],
    canSkip: true,
  },
  {
    id: "tax-returns",
    name: "Tax Returns",
    description: "Personal and/or business tax returns (last 1-2 years)",
    required: false,
    documents: [],
    canSkip: true,
  },
  {
    id: "reference-letters",
    name: "Reference Letters",
    description: "Personal or professional references",
    required: false,
    documents: [],
    canSkip: true,
  },
  {
    id: "building-forms",
    name: "Building-Specific Forms",
    description: "Any forms provided by the building management or board",
    required: false,
    documents: [],
    canSkip: true,
  },
]

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true);

  // Get application data
  const application = mockApplications.find((app) => app.id === id);

  const [categories, setCategories] = useState<DocumentCategory[]>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`documents-data-${id}`)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.categories) {
          return data.categories
        }
      }
    }
    return INITIAL_CATEGORIES
  })
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleFilesAdded = (categoryId: string, newFiles: UploadedFile[]) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, documents: [...cat.documents, ...newFiles] }
          : cat
      )
    )

    // Simulate upload progress
    newFiles.forEach((file) => {
      if (file.status === "pending") {
        simulateUpload(categoryId, file.id)
      }
    })
  }

  const simulateUpload = (categoryId: string, fileId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              documents: cat.documents.map((doc) =>
                doc.id === fileId
                  ? { ...doc, status: "uploading" as const }
                  : doc
              ),
            }
          : cat
      )
    )

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                documents: cat.documents.map((doc) =>
                  doc.id === fileId ? { ...doc, progress } : doc
                ),
              }
            : cat
        )
      )

      if (progress >= 100) {
        clearInterval(interval)
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  documents: cat.documents.map((doc) =>
                    doc.id === fileId
                      ? { ...doc, status: "complete" as const, progress: 100 }
                      : doc
                  ),
                }
              : cat
          )
        )
      }
    }, 300)
  }

  const handleFileRemoved = (categoryId: string, fileId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              documents: cat.documents.filter((doc) => doc.id !== fileId),
            }
          : cat
      )
    )
  }

  const handleSkipReasonChange = (categoryId: string, reason: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, skipReason: reason } : cat
      )
    )
  }

  const handleSkipToggle = (categoryId: string, skip: boolean) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, skipReason: skip ? cat.skipReason || "" : undefined }
          : cat
      )
    )
  }

  const validate = () => {
    const newErrors: string[] = []

    // Check if any uploads are in progress
    const hasUploadingDocs = categories.some((cat) =>
      cat.documents.some((doc) => doc.status === "uploading" || doc.status === "pending")
    )

    if (hasUploadingDocs) {
      newErrors.push("Please wait for all document uploads to complete before continuing")
    }

    // Check if government ID is uploaded
    const govtIdCategory = categories.find((cat) => cat.id === "govt-id")
    if (govtIdCategory && govtIdCategory.documents.length === 0) {
      newErrors.push("At least one government-issued ID is required")
    } else if (govtIdCategory) {
      // Check if any government ID documents are still uploading
      const hasUploadingGovtId = govtIdCategory.documents.some(
        (doc) => doc.status === "uploading" || doc.status === "pending"
      )
      const hasCompletedGovtId = govtIdCategory.documents.some((doc) => doc.status === "complete")

      if (!hasCompletedGovtId && !hasUploadingGovtId) {
        newErrors.push("At least one government-issued ID must be successfully uploaded")
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Save to localStorage
    const data = {
      categories,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(`documents-data-${id}`, JSON.stringify(data))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSaving(false)
  }

  const handleContinue = async () => {
    if (!validate()) {
      return
    }

    await handleSave()
    router.push(`/applications/${id}/disclosures`)
  }

  // Count total documents
  const totalDocuments = categories.reduce(
    (sum, cat) => sum + cat.documents.length,
    0
  )

  if (isLoading) {
    return <FormSkeleton sections={3} fieldsPerSection={3} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="mt-2 text-muted-foreground">
          Upload all required and supporting documents. At least one government-issued
          ID is required.
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      <div className="space-y-6">
        {categories.map((category) => (
          <DocumentChecklist
            key={category.id}
            category={category}
            application={application}
            onFilesAdded={(files) => handleFilesAdded(category.id, files)}
            onFileRemoved={(fileId) => handleFileRemoved(category.id, fileId)}
            onSkipReasonChange={(reason) =>
              handleSkipReasonChange(category.id, reason)
            }
            onSkipToggle={(skip) => handleSkipToggle(category.id, skip)}
          />
        ))}
      </div>

      {totalDocuments > 0 && (
        <Alert>
          <AlertDescription>
            You have uploaded {totalDocuments} document{totalDocuments !== 1 ? "s" : ""}.
            Make sure all required documents are complete before continuing.
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      <FormActions
        onSave={handleSave}
        onCancel={() => router.push(`/applications/${id}`)}
        onContinue={handleContinue}
        isSaving={isSaving}
        continueText="Save & Continue"
      />
    </div>
  )
}
