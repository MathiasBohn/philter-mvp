"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { SectionConfig } from "./section-toggle-list";
import type { DocumentConfig } from "./document-toggle-list";
import type { ComplianceConfig } from "./compliance-toggles";

interface TemplatePreviewProps {
  buildingName: string;
  templateName: string;
  description: string;
  sections: SectionConfig[];
  documents: DocumentConfig[];
  compliance: ComplianceConfig;
}

export function TemplatePreview({
  buildingName,
  templateName,
  description,
  sections,
  documents,
  compliance,
}: TemplatePreviewProps) {
  const enabledSections = sections.filter((s) => s.enabled);
  const requiredSections = sections.filter((s) => s.enabled && s.required);
  const enabledDocuments = documents.filter((d) => d.enabled);
  const requiredDocuments = documents.filter((d) => d.enabled && d.required);

  return (
    <div className="space-y-6">
      {/* Template Basics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Template Details</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Building</dt>
            <dd className="text-base mt-1">{buildingName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Template Name</dt>
            <dd className="text-base mt-1">{templateName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Description</dt>
            <dd className="text-base mt-1">{description || "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Sections */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Application Sections
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({enabledSections.length} enabled, {requiredSections.length} required)
          </span>
        </h3>
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.key}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                {section.enabled ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={
                    section.enabled ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {section.label}
                </span>
              </div>
              {section.enabled && (
                <Badge variant={section.required ? "default" : "secondary"}>
                  {section.required ? "Required" : "Optional"}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Documents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Document Requirements
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({enabledDocuments.length} enabled, {requiredDocuments.length} required)
          </span>
        </h3>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                {doc.enabled ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={
                    doc.enabled ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {doc.label}
                </span>
              </div>
              {doc.enabled && (
                <Badge variant={doc.required ? "default" : "secondary"}>
                  {doc.required ? "Required" : "Optional"}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Compliance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {compliance.localLaw55 ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  compliance.localLaw55 ? "text-foreground" : "text-muted-foreground"
                }
              >
                Local Law 55 - Indoor Allergen Hazards
              </span>
            </div>
            {compliance.localLaw55 && <Badge>Enabled</Badge>}
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {compliance.windowGuard ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  compliance.windowGuard ? "text-foreground" : "text-muted-foreground"
                }
              >
                Window Guard Notice
              </span>
            </div>
            {compliance.windowGuard && <Badge>Enabled</Badge>}
          </div>
        </div>
      </Card>
    </div>
  );
}
