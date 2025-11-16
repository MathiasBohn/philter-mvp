"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";

interface DecisionEmailPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientEmail: string;
  subject: string;
  body: string;
  onSend: (editedSubject: string, editedBody: string) => void;
  isSending?: boolean;
}

export function DecisionEmailPreview({
  open,
  onOpenChange,
  recipientEmail,
  subject,
  body,
  onSend,
  isSending = false,
}: DecisionEmailPreviewProps) {
  const [editedSubject, setEditedSubject] = useState(subject);
  const [editedBody, setEditedBody] = useState(body);

  // Update local state when props change
  useState(() => {
    setEditedSubject(subject);
    setEditedBody(body);
  });

  const handleSend = () => {
    onSend(editedSubject, editedBody);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Preview Decision Email
          </DialogTitle>
          <DialogDescription>
            Review and edit the email before sending to the applicant. You can
            customize the subject and message as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-sm font-semibold">
              To
            </Label>
            <Input
              id="recipient"
              value={recipientEmail}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-semibold">
              Subject
            </Label>
            <Input
              id="subject"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-semibold">
              Message
            </Label>
            <Textarea
              id="body"
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              placeholder="Email message..."
              rows={16}
              className="resize-none font-sans"
            />
            <p className="text-xs text-muted-foreground">
              You can edit this message to add any additional information or
              personalize the communication.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send Decision Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
