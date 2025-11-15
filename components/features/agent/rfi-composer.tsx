"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Application, Role } from "@/lib/types";
import { Plus } from "lucide-react";

type RFIComposerProps = {
  application: Application;
  onCreateRFI?: (data: {
    sectionKey: string;
    assigneeRole: Role.APPLICANT | Role.BROKER;
    message: string;
  }) => void;
};

export function RFIComposer({ application, onCreateRFI }: RFIComposerProps) {
  const [open, setOpen] = useState(false);
  const [sectionKey, setSectionKey] = useState("");
  const [assigneeRole, setAssigneeRole] = useState<Role.APPLICANT | Role.BROKER>(
    Role.APPLICANT
  );
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (sectionKey && message.trim() && onCreateRFI) {
      onCreateRFI({
        sectionKey,
        assigneeRole,
        message: message.trim(),
      });

      // Reset form
      setSectionKey("");
      setAssigneeRole(Role.APPLICANT);
      setMessage("");
      setOpen(false);
    }
  };

  const canSubmit = sectionKey && message.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create RFI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Request for Information</DialogTitle>
          <DialogDescription>
            Request additional information or clarification from the applicant or
            broker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Select value={sectionKey} onValueChange={setSectionKey}>
              <SelectTrigger id="section">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {application.sections.map((section) => (
                  <SelectItem key={section.key} value={section.key}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Which section does this request relate to?
            </p>
          </div>

          {/* Assign To */}
          <div className="space-y-2">
            <Label>Assign To *</Label>
            <RadioGroup
              value={assigneeRole}
              onValueChange={(value) =>
                setAssigneeRole(value as Role.APPLICANT | Role.BROKER)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={Role.APPLICANT} id="applicant" />
                <Label htmlFor="applicant" className="font-normal cursor-pointer">
                  Applicant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={Role.BROKER} id="broker" />
                <Label htmlFor="broker" className="font-normal cursor-pointer">
                  Broker
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Who should respond to this request?
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Describe what information you need and why..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what documentation or clarification is needed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Send RFI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
