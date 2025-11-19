"use client"

import { use, useState, useEffect } from "react"
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
import { FormSkeleton } from "@/components/loading/form-skeleton"
import { PayCadence, type EmploymentRecord } from "@/lib/types"
import { storageService, STORAGE_KEYS } from "@/lib/persistence"
import {
  uploadManager,
  saveFileToStorage,
  getStoredFiles,
  deleteStoredFile,
  getFileObject
} from "@/lib/upload-manager"
import { useFilePreview } from "@/lib/hooks/use-file-preview"

export default function IncomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [employers, setEmployers] = useState<EmploymentRecord[]>([])
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  const [isSelfEmployed, setIsSelfEmployed] = useState(false)
  const [cpaLetterDocuments, setCpaLetterDocuments] = useState<UploadedFile[]>([])
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

  // Load data from centralized storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300))

        const saved = storageService.get<string | null>(STORAGE_KEYS.income(id), null)
        const storedFiles = await getStoredFiles()

        if (saved) {
          const data = typeof saved === 'string' ? JSON.parse(saved) : saved

          // Restore employers
          if (data.employers) {
            const loadedEmployers = data.employers.map(
              (e: { startDate: string; endDate?: string }) => ({
                ...e,
                startDate: new Date(e.startDate),
                endDate: e.endDate ? new Date(e.endDate) : undefined,
              })
            )
            setEmployers(loadedEmployers)
          }

          // Restore employment verification documents
          if (data.documents) {
            const restoredDocs = data.documents.map((doc: UploadedFile) => {
              const storedFile = storedFiles[doc.id]
              if (storedFile) {
                const file = getFileObject(storedFile)
                const preview = storedFile.type.startsWith('image/')
                  ? URL.createObjectURL(storedFile.blob)
                  : undefined
                return { ...doc, file, preview, status: 'complete' as const, progress: 100 }
              }
              return doc
            })
            setDocuments(restoredDocs)
          }

          if (data.isSelfEmployed !== undefined) {
            setIsSelfEmployed(data.isSelfEmployed)
          }

          // Restore CPA letter documents
          if (data.cpaLetterDocuments) {
            const restoredCpaDocs = data.cpaLetterDocuments.map((doc: UploadedFile) => {
              const storedFile = storedFiles[doc.id]
              if (storedFile) {
                const file = getFileObject(storedFile)
                const preview = storedFile.type.startsWith('image/')
                  ? URL.createObjectURL(storedFile.blob)
                  : undefined
                return { ...doc, file, preview, status: 'complete' as const, progress: 100 }
              }
              return doc
            })
            setCpaLetterDocuments(restoredCpaDocs)
          }
        } else {
          // Initialize with one empty employer
          addEmployer()
        }
      } catch (error) {
        console.error("Error loading income data:", error)
        // Initialize with one empty employer on error
        addEmployer()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  // Cleanup previews automatically using custom hook
  useFilePreview(documents)
  useFilePreview(cpaLetterDocuments)

  // Cleanup upload manager on unmount
  useEffect(() => {
    return () => {
      uploadManager.cleanup()
    }
  }, [])

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

  const handleCpaLetterAdded = (newFiles: UploadedFile[]) => {
    setCpaLetterDocuments([...cpaLetterDocuments, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((file) => {
      if (file.status === "pending") {
        simulateCpaUpload(file.id)
      }
    })
  }

  const simulateUpload = (fileId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === fileId ? { ...doc, status: "uploading" as const } : doc
      )
    )

    uploadManager.startUpload(
      fileId,
      (progress) => {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === fileId ? { ...doc, progress } : doc))
        )
      },
      async () => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === fileId
              ? { ...doc, status: "complete" as const, progress: 100 }
              : doc
          )
        )

        const document = documents.find(d => d.id === fileId)
        if (document) {
          await saveFileToStorage(document.file, fileId, 'employment-verification')
        }
      },
      (error) => {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === fileId ? { ...doc, status: "error" as const, error } : doc
          )
        )
      }
    )
  }

  const simulateCpaUpload = (fileId: string) => {
    setCpaLetterDocuments((prev) =>
      prev.map((doc) =>
        doc.id === fileId ? { ...doc, status: "uploading" as const } : doc
      )
    )

    uploadManager.startUpload(
      fileId,
      (progress) => {
        setCpaLetterDocuments((prev) =>
          prev.map((doc) => (doc.id === fileId ? { ...doc, progress } : doc))
        )
      },
      async () => {
        setCpaLetterDocuments((prev) =>
          prev.map((doc) =>
            doc.id === fileId
              ? { ...doc, status: "complete" as const, progress: 100 }
              : doc
          )
        )

        const document = cpaLetterDocuments.find(d => d.id === fileId)
        if (document) {
          await saveFileToStorage(document.file, fileId, 'cpa-letter')
        }
      },
      (error) => {
        setCpaLetterDocuments((prev) =>
          prev.map((doc) =>
            doc.id === fileId ? { ...doc, status: "error" as const, error } : doc
          )
        )
      }
    )
  }

  const removeDocument = async (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id))
    try {
      await deleteStoredFile(id)
    } catch (error) {
      console.error('Error deleting file from IndexedDB:', error)
    }
  }

  const removeCpaDocument = async (id: string) => {
    setCpaLetterDocuments(cpaLetterDocuments.filter((d) => d.id !== id))
    try {
      await deleteStoredFile(id)
    } catch (error) {
      console.error('Error deleting file from IndexedDB:', error)
    }
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

    // Check if any uploads are in progress
    const hasUploadingDocs = documents.some((doc) => doc.status === "uploading" || doc.status === "pending")
    const hasUploadingCpaDocs = cpaLetterDocuments.some((doc) => doc.status === "uploading" || doc.status === "pending")

    if (hasUploadingDocs || hasUploadingCpaDocs) {
      newErrors["upload-in-progress"] = "Please wait for all document uploads to complete before continuing"
    }

    // Validate employment verification documents
    if (isSelfEmployed) {
      // If self-employed, require CPA letter
      const hasCompletedCpaLetter = cpaLetterDocuments.some((doc) => doc.status === "complete")
      if (!hasCompletedCpaLetter && !hasUploadingCpaDocs) {
        newErrors["cpa-letter"] = "CPA letter is required for self-employed applicants. Please upload a document."
      }
    } else {
      // If not self-employed, require at least one employment verification document
      const hasCompletedVerification = documents.some((doc) => doc.status === "complete")
      if (!hasCompletedVerification && !hasUploadingDocs) {
        newErrors["employment-verification"] = "At least one employment verification document is required. Please upload a document."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      return
    }

    setIsSaving(true)

    // Save metadata to centralized storage
    const data = {
      employers,
      documents,
      isSelfEmployed,
      cpaLetterDocuments,
      updatedAt: new Date().toISOString(),
    }
    storageService.set(STORAGE_KEYS.income(id), data)

    // Save files to IndexedDB
    try {
      // Save employment verification documents
      for (const doc of documents) {
        if (doc.status === 'complete') {
          await saveFileToStorage(doc.file, doc.id, 'employment-verification')
        }
      }

      // Save CPA letter documents
      for (const doc of cpaLetterDocuments) {
        if (doc.status === 'complete') {
          await saveFileToStorage(doc.file, doc.id, 'cpa-letter')
        }
      }
    } catch (error) {
      console.error('Error saving files to IndexedDB:', error)
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
    router.push(`/applications/${id}/financials`)
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

  if (isLoading) {
    return <FormSkeleton sections={3} fieldsPerSection={5} />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employment & Income</h1>
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
          {employers.map((employer) => (
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
          <h2 className="text-xl font-semibold">
            Income Verification Documents <span className="text-red-500">*</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload documents that verify your income
          </p>
        </div>

        {/* Self-employed Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="self-employed"
            checked={isSelfEmployed}
            onChange={(e) => setIsSelfEmployed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="self-employed" className="text-sm font-medium cursor-pointer">
            I am self-employed
          </label>
        </div>

        {/* Document Requirements Card */}
        <div className="rounded-lg border bg-muted/20 p-6 space-y-4">
          <h3 className="font-semibold text-lg">📋 Required Income Verification Documents</h3>
          {isSelfEmployed ? (
            <div className="space-y-3">
              <p className="text-sm">For self-employed applicants, please provide:</p>
              <div className="bg-background rounded-md p-4 border-l-4 border-blue-500">
                <p className="font-medium text-sm">Required Documents:</p>
                <ul className="mt-2 space-y-2 text-sm list-disc list-inside pl-2">
                  <li><strong>2 years of tax returns</strong> (Form 1040 with all schedules)</li>
                  <li className="text-muted-foreground">OR a <strong>CPA letter</strong> verifying your income</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tax returns should include all schedules (Schedule C, Schedule E, etc.) and be signed
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">Please provide <strong>ONE</strong> of the following options:</p>
              <div className="space-y-3">
                <div className="bg-background rounded-md p-4 border-l-4 border-green-500">
                  <p className="font-medium text-sm">✅ Option 1:</p>
                  <ul className="mt-2 space-y-1 text-sm list-disc list-inside pl-2">
                    <li>Most recent <strong>W-2</strong></li>
                    <li><strong>AND</strong> 2 most recent <strong>bank statements</strong></li>
                  </ul>
                </div>
                <div className="bg-background rounded-md p-4 border-l-4 border-green-500">
                  <p className="font-medium text-sm">✅ Option 2:</p>
                  <ul className="mt-2 space-y-1 text-sm list-disc list-inside pl-2">
                    <li>Most recent <strong>W-2</strong></li>
                    <li><strong>AND</strong> most recent <strong>1099 form</strong></li>
                  </ul>
                </div>
                <div className="bg-background rounded-md p-4 border-l-4 border-green-500">
                  <p className="font-medium text-sm">✅ Option 3:</p>
                  <ul className="mt-2 space-y-1 text-sm list-disc list-inside pl-2">
                    <li>Most recent <strong>W-2</strong></li>
                    <li><strong>AND 3</strong> most recent <strong>paystubs</strong></li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 All documents must be recent (within the last 3 months for paystubs and bank statements, current year for W-2 or 1099)
              </p>
            </div>
          )}
        </div>

        {/* Show CPA Letter upload for self-employed, otherwise show regular employment verification */}
        {isSelfEmployed ? (
          <>
            <div>
              <h3 className="text-lg font-medium">
                Upload Tax Returns or CPA Letter <span className="text-red-500">*</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload your 2 years of tax returns OR a CPA letter verifying your income
              </p>
            </div>

            <UploadDropzone onFilesAdded={handleCpaLetterAdded} />

            {cpaLetterDocuments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Uploaded CPA Letter ({cpaLetterDocuments.length})</h3>
                {cpaLetterDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDelete={() => removeCpaDocument(doc.id)}
                  />
                ))}
              </div>
            )}

            {cpaLetterDocuments.length === 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  CPA letter is required for self-employed applicants. Please upload your CPA letter to continue.
                </AlertDescription>
              </Alert>
            )}

            {errors["cpa-letter"] && (
              <Alert variant="destructive">
                <AlertDescription>{errors["cpa-letter"]}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-medium">
                Upload Employment Verification Documents <span className="text-red-500">*</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload documents according to one of the options above
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
                <div className="rounded-md bg-green-50 border border-green-200 p-3">
                  <p className="text-sm text-green-800">
                    ✓ {documents.length} document{documents.length > 1 ? 's' : ''} uploaded.
                    Make sure you&apos;ve uploaded all documents required for your chosen option.
                  </p>
                </div>
              </div>
            )}

            {documents.length === 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  No documents uploaded yet. Employment verification is required. Please upload at least one document to continue.
                </AlertDescription>
              </Alert>
            )}

            {errors["employment-verification"] && (
              <Alert variant="destructive">
                <AlertDescription>{errors["employment-verification"]}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>

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
