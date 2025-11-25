"use client"

import Image from "next/image"
import {
  X,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { UploadedFile } from "./upload-dropzone"

interface DocumentCardProps {
  document: UploadedFile
  onDelete: () => void
  onPreview?: () => void
  onPause?: () => void
  onResume?: () => void
  onReplace?: () => void
}

export function DocumentCard({
  document,
  onDelete,
  onPreview,
  onPause,
  onResume,
  onReplace,
}: DocumentCardProps) {
  const getFileIcon = () => {
    // Get MIME type from either file object or mimeType property
    const type = document.file?.type || document.mimeType || ''

    if (type.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />
    }
    if (type.includes("image")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    }
    if (type.includes("word") || type.includes("document")) {
      return <FileText className="h-6 w-6 text-blue-600" />
    }
    return <FileIcon className="h-6 w-6 text-gray-500" />
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
      case "paused":
        return <Pause className="h-4 w-4 text-orange-500" />
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (document.status) {
      case "uploading":
        return `${document.progress}% uploaded`
      case "paused":
        return "Paused"
      case "complete":
        return "Complete"
      case "error":
        return document.error || "Upload failed"
      case "pending":
        return "Pending..."
      default:
        return ""
    }
  }

  return (
    <Card
      className={cn(
        "p-4 transition-colors",
        document.status === "error" && "border-destructive bg-destructive/5"
      )}
    >
      <div className="flex items-start gap-3">
        {document.preview ? (
          <div className="relative h-14 w-14 flex-shrink-0">
            <Image
              src={document.preview}
              alt={document.file?.name || document.filename || 'Document preview'}
              width={56}
              height={56}
              className="h-full w-full rounded object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded bg-muted">
            {getFileIcon()}
          </div>
        )}

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate" title={document.file?.name || document.filename}>
                {document.file?.name || document.filename || 'Unknown file'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(document.file?.size || document.size || 0)}
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {getStatusIcon()}

              {/* Pause/Resume buttons for uploading files */}
              {document.status === "uploading" && onPause && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={onPause}
                  title="Pause upload"
                >
                  <Pause className="h-4 w-4" />
                  <span className="sr-only">Pause upload</span>
                </Button>
              )}

              {document.status === "paused" && onResume && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={onResume}
                  title="Resume upload"
                >
                  <Play className="h-4 w-4" />
                  <span className="sr-only">Resume upload</span>
                </Button>
              )}

              {/* Preview button for completed files */}
              {onPreview && document.status === "complete" && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={onPreview}
                  title="Preview file"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Preview</span>
                </Button>
              )}

              {/* Replace button for completed files */}
              {onReplace && document.status === "complete" && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={onReplace}
                  title="Replace file"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Replace</span>
                </Button>
              )}

              {/* Delete button */}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={onDelete}
                title="Delete file"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>

          {/* Progress bar for uploading/paused */}
          {(document.status === "uploading" || document.status === "paused") && (
            <div className="space-y-1">
              <Progress
                value={document.progress}
                className={cn(
                  "h-2",
                  document.status === "paused" && "opacity-50"
                )}
              />
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    "text-xs",
                    document.status === "paused"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-muted-foreground"
                  )}
                  role="status"
                  aria-live="polite"
                >
                  {getStatusText()}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {document.status === "error" && document.error && (
            <p className="text-xs text-destructive" role="alert">
              {document.error}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
