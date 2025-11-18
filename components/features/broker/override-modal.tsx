"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"

export type SectionOverride = {
  sectionKey: string
  sectionLabel: string
  overriddenBy: string
  overriddenAt: Date
  reason: string
}

type OverrideModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (override: SectionOverride) => void
  sectionKey: string
  sectionLabel: string
}

export function OverrideModal({ open, onClose, onConfirm, sectionKey, sectionLabel }: OverrideModalProps) {
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the override")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const override: SectionOverride = {
      sectionKey,
      sectionLabel,
      overriddenBy: "broker@example.com", // In production, get from auth context
      overriddenAt: new Date(),
      reason: reason.trim(),
    }

    onConfirm(override)
    setIsLoading(false)

    // Reset and close
    setReason("")
    onClose()
  }

  const handleCancel = () => {
    setReason("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Override Completion Check</DialogTitle>
          <DialogDescription>
            Manually mark "{sectionLabel}" as complete
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> The system has flagged this section as incomplete.
              By overriding, you confirm that you have verified the information and accept responsibility.
              This action will be logged for compliance and audit purposes.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Override <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why this section should be marked complete despite system checks. For example: 'Applicant provided verbal confirmation' or 'Documents received via email and verified manually'..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground">
              Provide a clear, detailed explanation for this override. This will be visible to other team members and in audit logs.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
