"use client"

import { useState } from "react"
import { Download, Upload, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DisclosureType } from "@/lib/types"
import type { UploadedFile } from "./upload-dropzone"

export interface Disclosure {
  id: string
  type: DisclosureType
  title: string
  description: string
  pdfUrl: string
  acknowledged: boolean
  signedDocument?: UploadedFile
  requiresUpload: boolean
}

interface DisclosureCardProps {
  disclosure: Disclosure
  onAcknowledge: (acknowledged: boolean) => void
  onDocumentUpload?: (file: File) => void
  onDocumentRemove?: () => void
}

export function DisclosureCard({
  disclosure,
  onAcknowledge,
  onDocumentUpload,
  onDocumentRemove,
}: DisclosureCardProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && onDocumentUpload) {
      setFile(selectedFile)
      onDocumentUpload(selectedFile)
    }
  }

  const handleRemove = () => {
    setFile(null)
    if (onDocumentRemove) {
      onDocumentRemove()
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{disclosure.title}</h3>
              {disclosure.requiresUpload && (
                <Badge variant="outline" className="text-xs">
                  Signature Required
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {disclosure.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(disclosure.pdfUrl, "_blank")}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Disclosure
          </Button>
        </div>

        {disclosure.requiresUpload && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Signed Document Upload</p>
            <p className="text-xs text-muted-foreground">
              After reviewing, please sign and upload the disclosure form.
            </p>

            {!file && !disclosure.signedDocument && (
              <div>
                <input
                  type="file"
                  id={`upload-${disclosure.id}`}
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <Label
                  htmlFor={`upload-${disclosure.id}`}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Upload Signed Form
                </Label>
              </div>
            )}

            {(file || disclosure.signedDocument) && (
              <div className="flex items-center justify-between rounded-md border bg-background p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {file?.name || disclosure.signedDocument?.file.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start space-x-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Checkbox
            id={`acknowledge-${disclosure.id}`}
            checked={disclosure.acknowledged}
            onCheckedChange={onAcknowledge}
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label
              htmlFor={`acknowledge-${disclosure.id}`}
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I acknowledge that I have read and understood this disclosure
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <p className="mt-1.5 text-xs text-muted-foreground">
              You must acknowledge this disclosure before submitting your application.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
