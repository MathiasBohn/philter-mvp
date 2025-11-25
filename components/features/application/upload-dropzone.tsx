"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, File as FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface UploadedFile {
  id: string
  file?: File  // Optional for persisted documents
  filename?: string  // For persisted documents without File object
  size?: number  // For persisted documents
  mimeType?: string  // For persisted documents
  preview?: string  // Blob URL for local files, signed URL for persisted docs
  progress: number
  status: "pending" | "uploading" | "paused" | "complete" | "error"
  error?: string
  isPaused?: boolean
  isPersisted?: boolean  // True if loaded from database
  signedUrlExpiresAt?: Date  // Track when signed URL expires
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
  const [justDropped, setJustDropped] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const validateFile = useCallback((file: File): string | null => {
    if (file.size === 0) {
      return "File is empty"
    }

    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / (1024 * 1024)}MB`
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return "This file type isn't allowed. Use PDF/JPG/PNG/DOCX."
    }

    return null
  }, [maxSize])

  const createPreview = useCallback(async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file)
    }
    return undefined
  }, [])

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList)
      const uploadedFiles: UploadedFile[] = []

      for (const file of files) {
        const error = validateFile(file)
        const preview = await createPreview(file)

        uploadedFiles.push({
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          progress: 0,
          status: error ? "error" : "pending",
          error: error || undefined,
          isPaused: false,
        })
      }

      onFilesAdded(uploadedFiles)
    },
    [onFilesAdded, validateFile, createPreview]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      dragCounter.current = 0
      setIsDragging(false)
      setJustDropped(true)

      // Show visual feedback
      setTimeout(() => setJustDropped(false), 300)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
        e.dataTransfer.clearData()
      }
    },
    [processFiles]
  )

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
        // Reset input so same file can be selected again
        e.target.value = ""
      }
    },
    [processFiles]
  )

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleButtonClick()
      }
    },
    [handleButtonClick]
  )

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200",
        isDragging && "border-primary bg-primary/10 scale-[1.02] shadow-lg",
        justDropped && "border-green-500 bg-green-500/10",
        !isDragging && !justDropped && "border-muted-foreground/25 hover:border-muted-foreground/50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      role="region"
      aria-label="File upload area"
    >
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload"
        className="sr-only"
        onChange={handleFileInput}
        accept={accept}
        multiple={multiple}
        aria-label="Choose files to upload"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div
          className={cn(
            "rounded-full bg-muted p-4 transition-transform duration-200",
            isDragging && "scale-110 bg-primary/20",
            justDropped && "scale-95"
          )}
        >
          {isDragging ? (
            <Upload className="h-8 w-8 text-primary animate-bounce" />
          ) : (
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-base font-medium">
            {isDragging
              ? "Drop files here"
              : justDropped
              ? "Files received!"
              : "Drag and drop files here"}
          </p>
          <p className="text-sm text-muted-foreground">or</p>

          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            onKeyDown={handleKeyDown}
            className="mx-auto"
          >
            Choose files
          </Button>

          <p className="text-xs text-muted-foreground mt-2">
            Supports PDF, JPG, PNG, DOC, DOCX (max {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      </div>
    </div>
  )
}
