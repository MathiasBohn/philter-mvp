"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DocumentPreviewProps {
  file: File | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentPreview({ file, isOpen, onClose }: DocumentPreviewProps) {
  if (!file) return null

  const isPdf = file.type === "application/pdf"
  const isImage = file.type.startsWith("image/")

  const fileUrl = URL.createObjectURL(file)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{file.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4 overflow-auto" style={{ maxHeight: "calc(90vh - 8rem)" }}>
          {isPdf && (
            <iframe
              src={fileUrl}
              className="h-[600px] w-full rounded border"
              title={file.name}
            />
          )}

          {isImage && (
            <img
              src={fileUrl}
              alt={file.name}
              className="max-h-full w-full rounded object-contain"
            />
          )}

          {!isPdf && !isImage && (
            <div className="flex h-64 items-center justify-center rounded border bg-muted">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{file.name}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
