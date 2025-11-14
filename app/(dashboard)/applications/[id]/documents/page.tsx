"use client"

import { useState, useEffect } from "react"
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

export default function DocumentsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [categories, setCategories] = useState<DocumentCategory[]>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`documents-data-${params.id}`)
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

    // Check if government ID is uploaded
    const govtIdCategory = categories.find((cat) => cat.id === "govt-id")
    if (govtIdCategory && govtIdCategory.documents.length === 0) {
      newErrors.push("At least one government-issued ID is required")
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
    localStorage.setItem(`documents-data-${params.id}`, JSON.stringify(data))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSaving(false)
  }

  const handleContinue = async () => {
    if (!validate()) {
      return
    }

    await handleSave()
    router.push(`/applications/${params.id}/disclosures`)
  }

  // Count total documents
  const totalDocuments = categories.reduce(
    (sum, cat) => sum + cat.documents.length,
    0
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
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
        onCancel={() => router.push(`/applications/${params.id}`)}
        onContinue={handleContinue}
        isSaving={isSaving}
        continueText="Save & Continue"
      />
    </div>
  )
}
