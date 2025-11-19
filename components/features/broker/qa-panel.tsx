"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompletenessChecklist } from "./completeness-checklist";
import { RequestInfoDialog } from "./request-info-dialog";
import { UploadBehalfDialog } from "./upload-behalf-dialog";
import { OverrideModal, SectionOverride } from "./override-modal";
import { Application } from "@/lib/types";
import { AlertCircle, MessageSquare, Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/lib/hooks/use-toast";
import { storageService, STORAGE_KEYS } from "@/lib/persistence";

interface QAPanelProps {
  application: Application;
  applicationId: string;
}

export function QAPanel({ application, applicationId }: QAPanelProps) {
  const { toast } = useToast();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideSectionKey, setOverrideSectionKey] = useState("");
  const [overrideSectionLabel, setOverrideSectionLabel] = useState("");

  // Load overrides from storage using lazy initialization
  const [overrides, setOverrides] = useState<SectionOverride[]>(() => {
    const storedOverrides = storageService.get(`application_overrides_${applicationId}`, null);
    if (storedOverrides) {
      try {
        const parsed = typeof storedOverrides === 'string' ? JSON.parse(storedOverrides) : storedOverrides;
        // Convert date strings back to Date objects
        return parsed.map((o: SectionOverride) => ({
          ...o,
          overriddenAt: new Date(o.overriddenAt)
        }));
      } catch (error) {
        console.error("Error loading overrides:", error);
        return [];
      }
    }
    return [];
  });

  const handleOpenOverrideModal = (sectionKey: string, sectionLabel: string) => {
    setOverrideSectionKey(sectionKey);
    setOverrideSectionLabel(sectionLabel);
    setIsOverrideModalOpen(true);
  };

  const handleConfirmOverride = (override: SectionOverride) => {
    // Add override to state
    const updatedOverrides = [...overrides, override];
    setOverrides(updatedOverrides);

    // Save to storage
    storageService.set(`application_overrides_${applicationId}`, updatedOverrides);

    // Log audit entry
    const auditEntry = {
      action: 'MANUAL_OVERRIDE',
      section: override.sectionKey,
      applicationId,
      performedBy: override.overriddenBy,
      timestamp: override.overriddenAt.toISOString(),
      reason: override.reason,
      previousStatus: 'incomplete',
      newStatus: 'complete_override'
    };

    // Store audit log
    const auditLogData = storageService.get(STORAGE_KEYS.AUDIT_LOG, '[]');
    const auditLog = typeof auditLogData === 'string' ? JSON.parse(auditLogData) : auditLogData;
    auditLog.push(auditEntry);
    storageService.set(STORAGE_KEYS.AUDIT_LOG, auditLog);

    toast({
      title: "Override Applied",
      description: `"${override.sectionLabel}" has been marked as complete. This action has been logged.`,
    });
  };

  // Filter out overridden sections from incomplete list
  const incompleteSections = application.sections.filter((s) =>
    !s.isComplete && !overrides.find(o => o.sectionKey === s.key)
  );

  return (
    <div className="space-y-4">
      {/* Completeness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completeness Check</CardTitle>
          <CardDescription>Review application requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <CompletenessChecklist
            application={application}
            overrides={overrides}
            onOverride={handleOpenOverrideModal}
          />
        </CardContent>
      </Card>

      {/* Blockers Alert */}
      {incompleteSections.length > 0 && (
        <Card className="border-yellow-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Blockers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              {incompleteSections.length} section(s) incomplete:
            </p>
            {incompleteSections.map((section) => (
              <div key={section.key} className="text-sm">
                • {section.label}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsRequestDialogOpen(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Request Info
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload on Behalf
          </Button>
        </CardContent>
      </Card>

      {/* Request Info Dialog */}
      <RequestInfoDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        applicationId={applicationId}
        sections={application.sections}
      />

      {/* Upload on Behalf Dialog */}
      <UploadBehalfDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        applicationId={applicationId}
      />

      {/* Override Modal */}
      <OverrideModal
        open={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onConfirm={handleConfirmOverride}
        sectionKey={overrideSectionKey}
        sectionLabel={overrideSectionLabel}
      />
    </div>
  );
}
