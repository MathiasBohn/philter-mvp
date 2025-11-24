"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Stepper, type Step } from "./stepper";
import { SectionToggleList, type SectionConfig } from "./section-toggle-list";
import { DocumentToggleList, type DocumentConfig } from "./document-toggle-list";
import { ComplianceToggles, type ComplianceConfig } from "./compliance-toggles";
import { TemplatePreview } from "./template-preview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";
import { mockBuildings } from "@/lib/mock-data";
import { useCreateTemplate, useUpdateTemplate } from "@/lib/hooks/use-templates";
import type { Template, DocumentCategory, DisclosureType } from "@/lib/types";

const STEPS: Step[] = [
  { id: "basics", label: "Basics", description: "Building & template info" },
  { id: "sections", label: "Sections", description: "Application sections" },
  { id: "documents", label: "Documents", description: "Document requirements" },
  { id: "compliance", label: "Compliance", description: "Legal disclosures" },
  { id: "review", label: "Review", description: "Verify settings" },
  { id: "publish", label: "Publish", description: "Save template" },
];

const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    key: "profile",
    label: "Profile",
    description: "Personal information and address history",
    enabled: true,
    required: true,
  },
  {
    key: "income",
    label: "Employment & Income",
    description: "Employment history and income verification",
    enabled: true,
    required: true,
  },
  {
    key: "financials",
    label: "Financial Summary",
    description: "Assets, liabilities, and financial statements",
    enabled: true,
    required: true,
  },
  {
    key: "documents",
    label: "Document Uploads",
    description: "Supporting documentation and proof",
    enabled: true,
    required: true,
  },
  {
    key: "disclosures",
    label: "Disclosures",
    description: "Legal disclosures and acknowledgments (lease/sublet only)",
    enabled: false,
    required: false,
  },
];

const DEFAULT_DOCUMENTS: DocumentConfig[] = [
  {
    key: "govt_id",
    label: "Government-issued ID",
    description: "Driver's license, passport, or state ID",
    enabled: true,
    required: true,
  },
  {
    key: "bank_letters",
    label: "Bank Letters & Statements",
    description: "Recent bank account verification",
    enabled: true,
    required: true,
  },
  {
    key: "tax_returns",
    label: "Tax Returns",
    description: "Recent tax returns (typically 2 years)",
    enabled: true,
    required: false,
  },
  {
    key: "reference_letters",
    label: "Reference Letters",
    description: "Personal or professional references",
    enabled: true,
    required: false,
  },
  {
    key: "building_forms",
    label: "Building-Specific Forms",
    description: "Any custom forms required by the building",
    enabled: false,
    required: false,
  },
];

interface TemplateWizardProps {
  mode?: 'create' | 'edit';
  initialData?: Template;
}

export function TemplateWizard({ mode = 'create', initialData }: TemplateWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  // Step 1: Basics
  const [buildingId, setBuildingId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Sections
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);

  // Step 3: Documents
  const [documents, setDocuments] = useState<DocumentConfig[]>(DEFAULT_DOCUMENTS);

  // Step 4: Compliance
  const [compliance, setCompliance] = useState<ComplianceConfig>({
    localLaw55: false,
    windowGuard: false,
  });

  // React Query mutations
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate(initialData?.id || '');

  // Pre-populate form in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setBuildingId(initialData.buildingId);
      setTemplateName(initialData.name);
      setDescription(initialData.description || '');

      // TODO: Map template data to section/document/compliance configs
      // For now, keep defaults - this can be enhanced in a future iteration
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const selectedBuilding = mockBuildings.find((b) => b.id === buildingId);

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return buildingId && templateName.trim();
      case 1: // Sections
        return sections.some((s) => s.enabled);
      case 2: // Documents
        return documents.some((d) => d.enabled);
      case 3: // Compliance
        return true;
      case 4: // Review
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = async () => {
    // Prepare template data
    const templateData: Partial<Template> = {
      buildingId,
      name: templateName,
      description: description || undefined,
      version: mode === 'create' ? 1 : (initialData?.version || 1) + 1,
      requiredSections: sections.filter(s => s.enabled && s.required).map(s => s.key),
      optionalSections: sections.filter(s => s.enabled && !s.required).map(s => s.key),
      requiredDocuments: documents.filter(d => d.enabled && d.required).map(d => d.key as DocumentCategory),
      optionalDocuments: documents.filter(d => d.enabled && !d.required).map(d => d.key as DocumentCategory),
      enabledDisclosures: Object.entries(compliance)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key as DisclosureType),
      buildingPolicies: {
        maxFinancePercent: 75,
        allowGuarantors: true,
        allowCorpOwnership: true,
        allowPiedATerre: true,
        allowTrustOwnership: true,
      },
      isPublished: true,
    };

    try {
      if (mode === 'edit' && initialData) {
        // Update existing template
        await updateTemplate.mutateAsync(templateData);
      } else {
        // Create new template
        await createTemplate.mutateAsync(templateData);
      }

      setIsPublished(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/agent/templates');
      }, 2000);
    } catch (error) {
      console.error('Failed to publish template:', error);
      // Error handling is done in the mutation hooks via toast
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="building">Building *</Label>
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger id="building">
                  <SelectValue placeholder="Select a building" />
                </SelectTrigger>
                <SelectContent>
                  {mockBuildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name} ({building.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Standard Application 2024"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description of this template"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 1: // Sections
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which sections applicants will need to complete. Mark sections
              as required or optional.
            </p>
            <SectionToggleList sections={sections} onChange={setSections} />
          </div>
        );

      case 2: // Documents
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which document categories are required. You can add custom
              categories as needed.
            </p>
            <DocumentToggleList documents={documents} onChange={setDocuments} />
          </div>
        );

      case 3: // Compliance
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable compliance disclosures required for lease and sublet
              transactions.
            </p>
            <ComplianceToggles config={compliance} onChange={setCompliance} />
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Review your template configuration before publishing.
            </p>
            <TemplatePreview
              buildingName={selectedBuilding?.name || ""}
              templateName={templateName}
              description={description}
              sections={sections}
              documents={documents}
              compliance={compliance}
            />
          </div>
        );

      case 5: // Publish
        const isSaving = createTemplate.isPending || updateTemplate.isPending;
        const newVersion = mode === 'create' ? 1 : (initialData?.version || 1) + 1;

        return (
          <div className="space-y-6">
            {isPublished ? (
              <Alert className="border-green-600">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-base">
                  <strong>Template {mode === 'edit' ? 'updated' : 'published'} successfully!</strong>
                  <p className="mt-2">
                    Version {newVersion} of &quot;{templateName}&quot; is now active for{" "}
                    {selectedBuilding?.name}.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Redirecting to templates page...
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {mode === 'edit' ? 'Ready to Update' : 'Ready to Publish'}
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Template Name
                    </dt>
                    <dd className="text-base mt-1">{templateName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Building
                    </dt>
                    <dd className="text-base mt-1">
                      {selectedBuilding?.name} ({selectedBuilding?.code})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Version
                    </dt>
                    <dd className="text-base mt-1">{newVersion}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Enabled Sections
                    </dt>
                    <dd className="text-base mt-1">
                      {sections.filter((s) => s.enabled).length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Document Categories
                    </dt>
                    <dd className="text-base mt-1">
                      {documents.filter((d) => d.enabled).length}
                    </dd>
                  </div>
                </dl>
                <Button
                  onClick={handlePublish}
                  className="w-full mt-6"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving
                    ? (mode === 'edit' ? 'Updating...' : 'Publishing...')
                    : (mode === 'edit' ? 'Update Template' : 'Publish Template')
                  }
                </Button>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Stepper steps={STEPS} currentStep={currentStep} />

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">{STEPS[currentStep].label}</h2>
        {renderStepContent()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isPublished}
        >
          Previous
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next
          </Button>
        ) : (
          isPublished && (
            <Button onClick={() => (window.location.href = "/agent/templates")}>
              Back to Templates
            </Button>
          )
        )}
      </div>
    </div>
  );
}
