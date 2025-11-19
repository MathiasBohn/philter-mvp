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
import { FormSkeleton } from "@/components/loading/form-skeleton"
import { storageService, STORAGE_KEYS } from "@/lib/persistence"
import {
  uploadManager,
  saveFileToStorage,
  getStoredFiles,
  deleteStoredFile,
  getFileObject
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
  const [isLoading, setIsLoading] = useState(true);

  // Get application data
  const application = mockApplications.find((app) => app.id === id);

  const [categories, setCategories] = useState<DocumentCategory[]>(INITIAL_CATEGORIES)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Load data and files from storage on mount
  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Load metadata from storageService
          const saved = storageService.get(STORAGE_KEYS.documentsData(id), null)

          // Load files from IndexedDB
          const storedFiles = await getStoredFiles()

          if (saved) {
            const data = typeof saved === 'string' ? JSON.parse(saved) : saved
            if (data.categories) {
              // Merge metadata with actual files from IndexedDB
              const categoriesWithFiles = data.categories.map((cat: DocumentCategory) => {
                const documentsWithFiles = cat.documents.map((doc: UploadedFile) => {
                  const storedFile = storedFiles[doc.id]
                  if (storedFile) {
                    // Restore the actual File object
                    const file = getFileObject(storedFile)
                    const preview = storedFile.type.startsWith('image/')
                      ? URL.createObjectURL(storedFile.blob)
                      : undefined

                    return {
                      ...doc,
                      file,
                      preview,
                      status: 'complete' as const,
                      progress: 100,
                    }
                  }
                  return doc
                })

                return {
                  ...cat,
                  documents: documentsWithFiles,
                }
              })

              setCategories(categoriesWithFiles)
            }
          }
        } catch (error) {
          console.error('Error loading documents data:', error)
        }
      }

      // Simulate brief loading for better UX
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }

    loadData()
  }, [id])

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
    uploadManager.resumeUpload(fileId)
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

    // Save metadata to storageService
    const data = {
      categories,
      updatedAt: new Date().toISOString(),
    }
    storageService.set(STORAGE_KEYS.documentsData(id), data)

    // Save files to IndexedDB
    try {
      for (const category of categories) {
        for (const doc of category.documents) {
          if (doc.status === 'complete') {
            await saveFileToStorage(doc.file, doc.id, category.id)
          }
        }
      }
    } catch (error) {
      console.error('Error saving files to IndexedDB:', error)
      // Show error to user if needed
    }

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
