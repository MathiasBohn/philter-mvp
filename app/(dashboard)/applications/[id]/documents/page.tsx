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
import { useDocuments, useUploadDocument, useDocumentSignedURLs } from "@/lib/hooks/use-documents"
import type { Document } from "@/lib/types"

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

  // Fetch application data and documents using React Query
  const { data: application, isLoading, error } = useApplication(id)
  const { data: dbDocuments, isLoading: isLoadingDocuments } = useDocuments(id)
  const { uploadFile, isUploading } = useUploadDocument(id)
  const { urlMap, isLoading: isLoadingURLs, refreshURL } = useDocumentSignedURLs(dbDocuments)

  const [categories, setCategories] = useState<DocumentCategory[]>(INITIAL_CATEGORIES)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [_uploadingFiles, setUploadingFiles] = useState<Map<string, { progress: number; categoryId: string }>>(new Map())
  const [documentsLoaded, setDocumentsLoaded] = useState(false)

  // Convert Document from database to UploadedFile format for display
  const convertDocumentToUploadedFile = (doc: Document, signedUrl?: string, expiresAt?: Date): UploadedFile => {
    return {
      id: doc.id,
      filename: doc.filename,
      size: doc.size,
      mimeType: doc.mimeType,
      preview: signedUrl,
      progress: 100,
      status: 'complete',
      isPersisted: true,
      signedUrlExpiresAt: expiresAt,
    }
  }

  // Map document category to category ID
  const mapDocumentCategoryToId = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'GOVERNMENT_ID': 'govt-id',
      'BANK_STATEMENT': 'bank-statements',
      'TAX_RETURN': 'tax-returns',
      'REFERENCE_LETTER': 'reference-letters',
      'OTHER': 'building-forms',
    }
    return categoryMap[category] || 'building-forms'
  }

  // Merge database documents into categories when they load
  useEffect(() => {
    if (!dbDocuments || isLoadingDocuments || isLoadingURLs || documentsLoaded) {
      return
    }

    // Convert db documents to UploadedFile format with signed URLs
    const uploadedFilesFromDB: UploadedFile[] = dbDocuments.map((doc) => {
      const urlData = urlMap.get(doc.id)
      return convertDocumentToUploadedFile(doc, urlData?.url, urlData?.expiresAt)
    })

    // Group documents by category
    const documentsByCategory: Record<string, UploadedFile[]> = {}
    uploadedFilesFromDB.forEach((uploadedFile) => {
      const doc = dbDocuments.find(d => d.id === uploadedFile.id)
      if (doc) {
        const categoryId = mapDocumentCategoryToId(doc.category)
        if (!documentsByCategory[categoryId]) {
          documentsByCategory[categoryId] = []
        }
        documentsByCategory[categoryId].push(uploadedFile)
      }
    })

    // Merge into categories
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        documents: documentsByCategory[cat.id] || [],
      }))
    )

    setDocumentsLoaded(true)
  }, [dbDocuments, isLoadingDocuments, urlMap, isLoadingURLs, documentsLoaded])

  const handleFilesAdded = async (categoryId: string, newFiles: UploadedFile[]) => {
    // Add files to UI state
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, documents: [...cat.documents, ...newFiles] }
          : cat
      )
    )

    // Upload each file to Supabase Storage
    for (const file of newFiles) {
      if (file.status === "pending") {
        await startUpload(categoryId, file)
      }
    }
  }

  const startUpload = async (categoryId: string, uploadedFile: UploadedFile) => {
    const fileId = uploadedFile.id

    // Ensure file exists (should always be present for new uploads)
    if (!uploadedFile.file) {
      console.error("Cannot upload: file object is missing")
      return
    }

    // Mark as uploading
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

    // Track upload progress
    setUploadingFiles((prev) => new Map(prev).set(fileId, { progress: 0, categoryId }))

    try {
      // Upload to Supabase Storage and create metadata
      await uploadFile(
        uploadedFile.file,
        categoryId,
        (progress) => {
          // Update progress
          setUploadingFiles((prev) => new Map(prev).set(fileId, { progress, categoryId }))
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
        }
      )

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

      setUploadingFiles((prev) => {
        const newMap = new Map(prev)
        newMap.delete(fileId)
        return newMap
      })
    } catch (error) {
      console.error('Upload failed:', error)

      // Mark as error
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                documents: cat.documents.map((doc) =>
                  doc.id === fileId
                    ? {
                        ...doc,
                        status: "error" as const,
                        error: error instanceof Error ? error.message : "Upload failed"
                      }
                    : doc
                ),
              }
            : cat
        )
      )

      setUploadingFiles((prev) => {
        const newMap = new Map(prev)
        newMap.delete(fileId)
        return newMap
      })
    }
  }

  // Handle refreshing expired signed URLs
  const _handleRefreshSignedURL = async (fileId: string) => {
    await refreshURL(fileId)

    // Update the preview URL in categories state
    const urlData = urlMap.get(fileId)
    if (urlData) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          documents: cat.documents.map((doc) =>
            doc.id === fileId
              ? { ...doc, preview: urlData.url, signedUrlExpiresAt: urlData.expiresAt }
              : doc
          ),
        }))
      )
    }
  }

  const handleFileRemoved = async (categoryId: string, fileId: string) => {
    // Find the document in the database
    const _dbDocument = dbDocuments?.find(doc => doc.id === fileId)

    // Remove from UI state immediately (optimistic update)
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

    // Delete from database if it exists
    // Note: The useDeleteDocument hook will handle removing from storage and database
    // For now, we'll just remove from local state since documents aren't persisted yet
    // This will be replaced with the proper mutation when the Documents API is fully integrated
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
    // Note: Pause/resume functionality requires additional implementation
    // in the upload manager. For now, we'll show a paused state in UI.
    setCategories(prev => prev.map(cat => ({
      ...cat,
      documents: cat.documents.map(doc =>
        doc.id === fileId ? { ...doc, status: 'paused' as const } : doc
      )
    })))
  }

  const handleResumeUpload = async (fileId: string) => {
    // Find the category and document
    let categoryId = ''
    let document: UploadedFile | undefined

    for (const cat of categories) {
      const doc = cat.documents.find(d => d.id === fileId)
      if (doc) {
        categoryId = cat.id
        document = doc
        break
      }
    }

    if (!categoryId || !document) {
      console.error('Category or document not found for file')
      return
    }

    // Restart the upload
    await startUpload(categoryId, document)
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

    try {
      // All files are already saved to Supabase Storage through the upload process
      // Nothing additional needed here - metadata is created via useUploadDocument hook
    } catch (error) {
      console.error('Error saving documents:', error)
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

  if (isLoading || isLoadingDocuments) {
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
          ID is required. All files are securely stored in Supabase Storage.
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
        isSaving={isSaving || isUploading}
        continueText="Save & Continue"
      />
    </div>
  )
}
