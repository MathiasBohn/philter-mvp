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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck } from "lucide-react";

interface AssignReviewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onAssign: (applicationId: string, reviewerId: string) => void;
}

// Mock reviewers data - in a real app this would come from an API
const mockReviewers = [
  {
    id: "reviewer-1",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    activeReviews: 3,
  },
  {
    id: "reviewer-2",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    activeReviews: 5,
  },
  {
    id: "reviewer-3",
    name: "James Rodriguez",
    email: "james.rodriguez@example.com",
    activeReviews: 2,
  },
  {
    id: "reviewer-4",
    name: "Emily Taylor",
    email: "emily.taylor@example.com",
    activeReviews: 4,
  },
];

export function AssignReviewerModal({
  open,
  onOpenChange,
  application,
  onAssign,
}: AssignReviewerModalProps) {
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");

  const handleAssign = () => {
    if (application && selectedReviewerId) {
      onAssign(application.id, selectedReviewerId);
      setSelectedReviewerId("");
      onOpenChange(false);
    }
  };

  const selectedReviewer = mockReviewers.find((r) => r.id === selectedReviewerId);
  const applicantNames = application?.people?.map((p) => p.fullName).join(", ") || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign to Reviewer
          </DialogTitle>
          <DialogDescription>
            Assign this application to a reviewer for detailed evaluation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Application Info */}
          <div className="rounded-lg bg-muted p-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Applicant(s)</p>
                <p className="font-medium">{applicantNames}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Building</p>
                <p className="font-medium">{application?.building?.name || "Unknown"}</p>
              </div>
              {application?.unit && (
                <div>
                  <p className="text-sm text-muted-foreground">Unit</p>
                  <p className="font-medium">{application.unit}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reviewer Selection */}
          <div className="space-y-3">
            <Label htmlFor="reviewer">Select Reviewer *</Label>
            <Select value={selectedReviewerId} onValueChange={setSelectedReviewerId}>
              <SelectTrigger id="reviewer">
                <SelectValue placeholder="Choose a reviewer" />
              </SelectTrigger>
              <SelectContent>
                {mockReviewers.map((reviewer) => (
                  <SelectItem key={reviewer.id} value={reviewer.id}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {reviewer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{reviewer.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {reviewer.activeReviews} active reviews
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedReviewer && (
              <div className="text-sm text-muted-foreground">
                <p>
                  {selectedReviewer.name} currently has {selectedReviewer.activeReviews} active
                  review{selectedReviewer.activeReviews === 1 ? "" : "s"}.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedReviewerId}>
            Assign Reviewer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
