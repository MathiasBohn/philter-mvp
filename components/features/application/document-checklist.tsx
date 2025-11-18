"use client"

import { useState } from "react"
import { FileText, CheckCircle2, AlertCircle, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { UploadDropzone, type UploadedFile } from "./upload-dropzone"
import { DocumentCard } from "./document-card"
import { cn } from "@/lib/utils"
import type { Application } from "@/lib/types"
import { downloadCoverSheet, createCoverSheetData } from "@/lib/pdf-utils"

export interface DocumentCategory {
  id: string
  name: string
  description: string
  required: boolean
  documents: UploadedFile[]
  skipReason?: string
  canSkip: boolean
}

interface DocumentChecklistProps {
  category: DocumentCategory
  application?: Application
  onFilesAdded: (files: UploadedFile[]) => void
  onFileRemoved: (fileId: string) => void
  onSkipReasonChange: (reason: string) => void
  onSkipToggle: (skip: boolean) => void
}

export function DocumentChecklist({
  category,
  application,
  onFilesAdded,
  onFileRemoved,
  onSkipReasonChange,
  onSkipToggle,
}: DocumentChecklistProps) {
  const [showSkipReason, setShowSkipReason] = useState(!!category.skipReason)

  const handleSkipToggle = (checked: boolean) => {
    setShowSkipReason(checked)
    onSkipToggle(checked)
    if (!checked) {
      onSkipReasonChange("")
    }
  }

  const handlePrintCoverSheet = () => {
    if (!application) return;
    const coverSheetData = createCoverSheetData(application, category.name);
    downloadCoverSheet(coverSheetData);
  }

  const getStatus = () => {
    if (category.documents.length > 0) {
      const allComplete = category.documents.every((d) => d.status === "complete")
      if (allComplete) return "complete"
      return "uploading"
    }
    if (category.skipReason) return "skipped"
    if (category.required) return "required"
    return "optional"
  }

  const status = getStatus()

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-1 rounded-full p-2",
                status === "complete" && "bg-green-100",
                status === "uploading" && "bg-blue-100",
                status === "skipped" && "bg-gray-100",
                status === "required" && "bg-destructive/10",
                status === "optional" && "bg-muted"
              )}
            >
              {status === "complete" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : status === "required" ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{category.name}</h3>
                {category.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {!category.required && (
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                )}
                {application && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handlePrintCoverSheet}
                    className="h-auto p-0 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Print Cover Sheet
                  </Button>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {!showSkipReason && (
          <>
            <UploadDropzone
              onFilesAdded={onFilesAdded}
              className="py-6"
            />

            {category.documents.length > 0 && (
              <div className="space-y-3">
                {category.documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDelete={() => onFileRemoved(doc.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {category.canSkip && !category.required && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`skip-${category.id}`}
                checked={showSkipReason}
                onCheckedChange={handleSkipToggle}
              />
              <Label
                htmlFor={`skip-${category.id}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I don&apos;t have this document
              </Label>
            </div>

            {showSkipReason && (
              <div className="space-y-2 pl-6">
                <Label htmlFor={`skip-reason-${category.id}`} className="text-sm">
                  Please explain why this document is not available:
                </Label>
                <Textarea
                  id={`skip-reason-${category.id}`}
                  value={category.skipReason || ""}
                  onChange={(e) => onSkipReasonChange(e.target.value)}
                  placeholder="Enter your reason here..."
                  rows={3}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
