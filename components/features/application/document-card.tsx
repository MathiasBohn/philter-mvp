"use client"

import { X, Eye, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { UploadedFile } from "./upload-dropzone"

interface DocumentCardProps {
  document: UploadedFile
  onDelete: () => void
  onPreview?: () => void
}

export function DocumentCard({ document, onDelete, onPreview }: DocumentCardProps) {
  const getFileIcon = () => {
    const { file } = document
    if (file.type.includes("pdf")) return "📄"
    if (file.type.includes("image")) return "🖼️"
    if (file.type.includes("word")) return "📝"
    return "📎"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getStatusIcon = () => {
    switch (document.status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  return (
    <Card className={cn("p-4", document.status === "error" && "border-destructive")}>
      <div className="flex items-start gap-3">
        {document.preview ? (
          <img
            src={document.preview}
            alt={document.file.name}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-2xl">
            {getFileIcon()}
          </div>
        )}

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{document.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(document.file.size)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {getStatusIcon()}
              {onPreview && document.status === "complete" && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={onPreview}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Preview</span>
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={onDelete}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>

          {document.status === "uploading" && (
            <div className="space-y-1">
              <Progress value={document.progress} className="h-1" />
              <p className="text-xs text-muted-foreground">{document.progress}% uploaded</p>
            </div>
          )}

          {document.status === "error" && document.error && (
            <p className="text-xs text-destructive">{document.error}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
