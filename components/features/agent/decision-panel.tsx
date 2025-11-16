"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReasonTags, type ReasonCode } from "./reason-tags";
import { Decision, DecisionRecord, Application } from "@/lib/types";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { DecisionEmailPreview } from "./decision-email-preview";

interface DecisionPanelProps {
  application: Application;
  onDecisionSubmit?: (decision: DecisionRecord) => void;
}

export function DecisionPanel({
  application,
  onDecisionSubmit,
}: DecisionPanelProps) {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(
    null
  );
  const [selectedReasons, setSelectedReasons] = useState<ReasonCode[]>([]);
  const [notes, setNotes] = useState("");
  const [usesConsumerReport, setUsesConsumerReport] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if adverse action notice is required
  const adverseActionRequired =
    usesConsumerReport &&
    (selectedDecision === Decision.DENY ||
      selectedDecision === Decision.CONDITIONAL);

  // Check if form is valid
  const isFormValid =
    selectedDecision !== null &&
    (!adverseActionRequired ||
      (adverseActionRequired && selectedReasons.length > 0));

  const getDecisionLabel = (decision: Decision) => {
    switch (decision) {
      case Decision.APPROVE:
        return "Approve";
      case Decision.CONDITIONAL:
        return "Approve with Conditions";
      case Decision.DENY:
        return "Deny";
    }
  };

  const getEmailSubject = () => {
    if (!selectedDecision) return "";
    switch (selectedDecision) {
      case Decision.APPROVE:
        return "Your application has been approved";
      case Decision.CONDITIONAL:
        return "Your application has been conditionally approved";
      case Decision.DENY:
        return "Update on your application";
    }
  };

  const getEmailBody = () => {
    const applicantName =
      application.people[0]?.fullName || "Valued Applicant";
    const buildingName = application.building?.name || "the building";

    if (!selectedDecision) return "";

    let body = `Dear ${applicantName},\n\n`;

    switch (selectedDecision) {
      case Decision.APPROVE:
        body += `Congratulations! Your application for ${buildingName} has been approved by the board.\n\n`;
        body += `Next steps will be communicated to you separately.\n`;
        break;
      case Decision.CONDITIONAL:
        body += `Your application for ${buildingName} has been conditionally approved by the board.\n\n`;
        if (notes) {
          body += `Please note the following conditions:\n${notes}\n\n`;
        }
        body += `Please address these items at your earliest convenience.\n`;
        break;
      case Decision.DENY:
        body += `Thank you for your interest in ${buildingName}. After careful review, the board has decided not to approve your application at this time.\n\n`;
        if (adverseActionRequired && selectedReasons.length > 0) {
          body += `This decision was based on the following factors:\n`;
          selectedReasons.forEach((reason) => {
            body += `- ${reason.replace(/_/g, " ")}\n`;
          });
          body += `\n`;
          body += `As this decision was based in part on information from a consumer report, you have certain rights under the Fair Credit Reporting Act. An adverse action notice with additional details will be sent separately.\n\n`;
        }
        break;
    }

    if (notes && selectedDecision !== Decision.CONDITIONAL) {
      body += `\nAdditional notes:\n${notes}\n`;
    }

    body += `\nThank you,\n${buildingName} Management`;

    return body;
  };

  const handleSubmit = () => {
    if (!isFormValid || !selectedDecision) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    if (!selectedDecision) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const decisionRecord: DecisionRecord = {
        id: `dec-${Date.now()}`,
        applicationId: application.id,
        decision: selectedDecision,
        reasonCodes: selectedReasons,
        notes: notes || undefined,
        usesConsumerReport,
        adverseActionRequired,
        decidedBy: "user-4", // Transaction Agent user ID
        decidedAt: new Date(),
      };

      onDecisionSubmit?.(decisionRecord);
      setIsSubmitting(false);
      setShowConfirmDialog(false);
      setSubmitted(true);
    }, 1000);
  };

  const handlePreviewEmail = () => {
    if (!isFormValid || !selectedDecision) return;
    setShowEmailPreview(true);
  };

  const handleSendEmail = (editedSubject: string, editedBody: string) => {
    // Close the preview modal
    setShowEmailPreview(false);

    // Show confirmation dialog
    setShowConfirmDialog(true);

    // In a real implementation, you would pass the edited email content
    // to the API along with the decision
    console.log("Sending email with subject:", editedSubject);
    console.log("Sending email with body:", editedBody);
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">Decision Recorded</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-800">
            The decision has been recorded and the applicant has been notified.
          </p>
          <p className="text-xs text-green-700 mt-2">
            Decision submitted on {new Date().toLocaleString()}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Record Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Decision</Label>
            <RadioGroup
              value={selectedDecision || ""}
              onValueChange={(value) => setSelectedDecision(value as Decision)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={Decision.APPROVE} id="approve" />
                <Label htmlFor="approve" className="font-normal cursor-pointer">
                  Approve
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={Decision.CONDITIONAL}
                  id="conditional"
                />
                <Label
                  htmlFor="conditional"
                  className="font-normal cursor-pointer"
                >
                  Approve with Conditions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={Decision.DENY} id="deny" />
                <Label htmlFor="deny" className="font-normal cursor-pointer">
                  Deny
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Reason Tags */}
          {selectedDecision &&
            (selectedDecision === Decision.DENY ||
              selectedDecision === Decision.CONDITIONAL) && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Reason Codes
                  {adverseActionRequired && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <ReasonTags
                  selectedReasons={selectedReasons}
                  onReasonsChange={setSelectedReasons}
                />
              </div>
            )}

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-semibold">
              Additional Notes
              {selectedDecision === Decision.CONDITIONAL && (
                <span className="text-muted-foreground text-sm font-normal ml-2">
                  (Conditions will be included in the email)
                </span>
              )}
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes or conditions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Consumer Report Checkbox */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consumer-report"
                checked={usesConsumerReport}
                onCheckedChange={(checked) =>
                  setUsesConsumerReport(checked as boolean)
                }
              />
              <Label
                htmlFor="consumer-report"
                className="text-sm font-normal cursor-pointer"
              >
                This decision uses information from a consumer report (credit
                check, background check, etc.)
              </Label>
            </div>
          </div>

          {/* Adverse Action Notice Alert */}
          {adverseActionRequired && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Adverse Action Notice Required:</strong> Because this
                decision uses consumer report information and results in a
                denial or conditional approval, you must select at least one
                reason code. An adverse action notice will be included with the
                decision email as required by the Fair Credit Reporting Act.
              </AlertDescription>
            </Alert>
          )}

          {/* Email Preview */}
          {selectedDecision && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Email Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">To:</span>{" "}
                  {application.people[0]?.email || "applicant@example.com"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Subject:</span>{" "}
                  {getEmailSubject()}
                </div>
                <div className="border-t pt-2 mt-2">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {getEmailBody()}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handlePreviewEmail}
                disabled={!isFormValid}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Preview Email
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid}
                size="lg"
                className="w-full"
              >
                Submit Decision
              </Button>
            </div>
            {!isFormValid && selectedDecision && (
              <p className="text-sm text-muted-foreground text-center">
                {adverseActionRequired
                  ? "Please select at least one reason code to continue"
                  : "Please complete all required fields"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Decision</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this decision? The applicant will
              be notified immediately via email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              <strong>Decision:</strong>{" "}
              {selectedDecision && getDecisionLabel(selectedDecision)}
            </p>
            {selectedReasons.length > 0 && (
              <p className="text-sm mt-2">
                <strong>Reason Codes:</strong> {selectedReasons.length}{" "}
                selected
              </p>
            )}
            {adverseActionRequired && (
              <p className="text-sm mt-2 text-amber-600">
                <strong>Note:</strong> An adverse action notice will be included
                with this decision.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Preview Modal */}
      <DecisionEmailPreview
        open={showEmailPreview}
        onOpenChange={setShowEmailPreview}
        recipientEmail={application.people[0]?.email || "applicant@example.com"}
        subject={getEmailSubject()}
        body={getEmailBody()}
        onSend={handleSendEmail}
        isSending={isSubmitting}
      />
    </>
  );
}
