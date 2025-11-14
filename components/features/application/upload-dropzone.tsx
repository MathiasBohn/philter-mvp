"use client"

import { useCallback, useState } from "react"
import { Upload, File as FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UploadedFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: "pending" | "uploading" | "complete" | "error"
  error?: string
}

interface UploadDropzoneProps {
  onFilesAdded: (files: UploadedFile[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  className?: string
}

export function UploadDropzone({
  onFilesAdded,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxSize = 25 * 1024 * 1024, // 25MB
  multiple = true,
  className,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / (1024 * 1024)}MB`
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return "File must be PDF, JPG, PNG, DOC, or DOCX"
    }

    return null
  }

  const processFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList)
      const uploadedFiles: UploadedFile[] = []

      files.forEach((file) => {
        const error = validateFile(file)
        const preview =
          file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined

        uploadedFiles.push({
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          progress: 0,
          status: error ? "error" : "pending",
          error: error || undefined,
        })
      })

      onFilesAdded(uploadedFiles)
    },
    [onFilesAdded]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files)
      }
    },
    [processFiles]
  )

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        id="file-upload"
        className="sr-only"
        onChange={handleFileInput}
        accept={accept}
        multiple={multiple}
      />

      <label
        htmlFor="file-upload"
        className="flex cursor-pointer flex-col items-center justify-center space-y-4"
      >
        <div className="rounded-full bg-muted p-4">
          {isDragging ? (
            <Upload className="h-8 w-8 text-primary" />
          ) : (
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-base font-medium">
            {isDragging ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <span className="font-medium text-primary hover:underline">
              browse files
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, JPG, PNG, DOC, DOCX (max {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      </label>
    </div>
  )
}
