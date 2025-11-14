"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompletenessChecklist } from "./completeness-checklist";
import { RequestInfoDialog } from "./request-info-dialog";
import { Application } from "@/lib/types";
import { AlertCircle, MessageSquare, Upload } from "lucide-react";
import { useState } from "react";

interface QAPanelProps {
  application: Application;
  applicationId: string;
}

export function QAPanel({ application, applicationId }: QAPanelProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const incompleteSections = application.sections.filter((s) => !s.isComplete);

  return (
    <div className="space-y-4">
      {/* Completeness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completeness Check</CardTitle>
          <CardDescription>Review application requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <CompletenessChecklist application={application} />
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
          <Button variant="outline" className="w-full justify-start">
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
    </div>
  );
}
