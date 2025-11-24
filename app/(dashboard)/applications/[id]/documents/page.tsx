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
import { FormSkeleton } from "@/components/loading/form-skeleton"
import { useApplication } from "@/lib/hooks/use-applications"
import {
  uploadManager,
  saveFileToStorage,
  deleteStoredFile
} from "@/lib/upload-manager"
import { useFilePreview } from "@/lib/hooks/use-file-preview"

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

  // Fetch application data using React Query
  const { data: application, isLoading, error } = useApplication(id)

  const [categories, setCategories] = useState<DocumentCategory[]>(INITIAL_CATEGORIES)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Note: Document loading is handled through the DocumentChecklist component's
  // own state management and upload functionality. The application.documents array
  // contains Document metadata from the backend, which is synced separately from
  // the local file storage in IndexedDB.

  // Cleanup previews automatically using custom hook
  useFilePreview(
    categories.flatMap(cat => cat.documents)
  )

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
    // Find the file object
    const category = categories.find(c => c.id === categoryId)
    const document = category?.documents.find(d => d.id === fileId)

    if (!document?.file) {
      console.error('File not found for upload')
      return
    }

    // Update status to uploading
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              documents: cat.documents.map((doc) =>
                doc.id === fileId ? { ...doc, status: "uploading" as const } : doc
              ),
            }
          : cat
      )
    )

    uploadManager.startUpload(
      fileId,
      document.file,
      'documents', // bucket
      `applications/${id}/documents/${fileId}`, // path
      // Progress callback
      (progress) => {
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
      },
      // Complete callback
      async () => {
        // Mark as complete
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

        // Save to IndexedDB
        const category = categories.find(c => c.id === categoryId)
        const document = category?.documents.find(d => d.id === fileId)
        if (document) {
          try {
            await saveFileToStorage(document.file, fileId, categoryId)
          } catch (error) {
            console.error('Error saving file to IndexedDB:', error)
          }
        }
      },
      // Error callback
      (error) => {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  documents: cat.documents.map((doc) =>
                    doc.id === fileId
                      ? { ...doc, status: "error" as const, error }
                      : doc
                  ),
                }
              : cat
          )
        )
      }
    )
  }

  const handleFileRemoved = async (categoryId: string, fileId: string) => {
    // Remove from state
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

    // Delete from IndexedDB
    try {
      await deleteStoredFile(fileId)
    } catch (error) {
      console.error('Error deleting file from IndexedDB:', error)
    }
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

  const handlePauseUpload = (fileId: string) => {
    uploadManager.pauseUpload(fileId)
    // Update state to show paused
    setCategories(prev => prev.map(cat => ({
      ...cat,
      documents: cat.documents.map(doc =>
        doc.id === fileId ? { ...doc, status: 'paused' as const } : doc
      )
    })))
  }

  const handleResumeUpload = (fileId: string) => {
    // Find the category containing this file
    let categoryId = ''
    for (const cat of categories) {
      if (cat.documents.find(d => d.id === fileId)) {
        categoryId = cat.id
        break
      }
    }

    if (!categoryId) {
      console.error('Category not found for file')
      return
    }

    uploadManager.resumeUpload(
      fileId,
      // Progress callback
      (progress) => {
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
      },
      // Complete callback
      async () => {
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
      },
      // Error callback
      (error) => {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  documents: cat.documents.map((doc) =>
                    doc.id === fileId
                      ? { ...doc, status: "error" as const, error }
                      : doc
                  ),
                }
              : cat
          )
        )
      }
    )

    // Update state to show uploading
    setCategories(prev => prev.map(cat => ({
      ...cat,
      documents: cat.documents.map(doc =>
        doc.id === fileId ? { ...doc, status: 'uploading' as const } : doc
      )
    })))
  }

  // Cleanup upload manager on unmount
  useEffect(() => {
    return () => {
      uploadManager.cleanup()
    }
  }, [])

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

    try {
      // Save files to IndexedDB (keeping existing logic for Phase 4)
      for (const category of categories) {
        for (const doc of category.documents) {
          if (doc.status === 'complete') {
            await saveFileToStorage(doc.file, doc.id, category.id)
          }
        }
      }

      // Note: Documents are saved individually through the upload system and Supabase Storage.
      // The application.documents array is managed separately via the documents API.
    } catch (error) {
      console.error('Error saving documents:', error)
      // Error toast is handled by the mutation hook
    } finally {
      setIsSaving(false)
    }
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
            onPauseUpload={handlePauseUpload}
            onResumeUpload={handleResumeUpload}
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
