"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApplicationSection, Role } from "@/lib/types";
import { useState } from "react";

interface RequestInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  sections: ApplicationSection[];
}

export function RequestInfoDialog({
  open,
  onOpenChange,
  applicationId,
  sections,
}: RequestInfoDialogProps) {
  const [selectedSection, setSelectedSection] = useState("");
  const [message, setMessage] = useState("");
  const [assignTo, setAssignTo] = useState<Role.APPLICANT | Role.BROKER>(Role.APPLICANT);

  const handleSubmit = () => {
    // In a real app, this would create an RFI in the database
    console.log("Creating RFI:", {
      applicationId,
      section: selectedSection,
      message,
      assignTo,
    });

    // Reset form
    setSelectedSection("");
    setMessage("");
    setAssignTo(Role.APPLICANT);

    // Close dialog
    onOpenChange(false);
  };

  const isValid = selectedSection && message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Information</DialogTitle>
          <DialogDescription>
            Send a request to the applicant or broker for additional information or clarification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger id="section">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.key} value={section.key}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assign To */}
          <div className="space-y-2">
            <Label htmlFor="assignTo">Assign To</Label>
            <Select
              value={assignTo}
              onValueChange={(value) => setAssignTo(value as Role.APPLICANT | Role.BROKER)}
            >
              <SelectTrigger id="assignTo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.APPLICANT}>Applicant</SelectItem>
                <SelectItem value={Role.BROKER}>Broker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe what information is needed..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
