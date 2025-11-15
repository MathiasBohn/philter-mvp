"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FormActionsProps {
  onCancel?: () => void
  onSave?: () => void
  onContinue?: () => void
  cancelLabel?: string
  saveLabel?: string
  continueText?: string
  isLoading?: boolean
  isSaving?: boolean
  disabled?: boolean
  saveType?: "button" | "submit"
}

export function FormActions({
  onCancel,
  onSave,
  onContinue,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  continueText = "Save & Continue",
  isLoading = false,
  isSaving = false,
  disabled = false,
  saveType = "button",
}: FormActionsProps) {
  const loading = isLoading || isSaving

  return (
    <div className="flex items-center justify-end gap-3 border-t dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
      )}

      {onSave && !onContinue && (
        <Button
          type={saveType}
          onClick={saveType === "button" ? onSave : undefined}
          disabled={disabled || loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saveLabel}
        </Button>
      )}

      {onContinue && (
        <Button
          type="button"
          onClick={onContinue}
          disabled={disabled || loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {continueText}
        </Button>
      )}
    </div>
  )
}
