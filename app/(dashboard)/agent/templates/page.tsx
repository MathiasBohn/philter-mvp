"use client";

import { useTemplates, useCreateTemplate } from "@/lib/hooks/use-templates";
import { TemplateTable } from "@/components/features/agent/template-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Template } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TemplatesPage() {
  const { data: templates, isLoading, error } = useTemplates();
  const createTemplate = useCreateTemplate();

  const handleDuplicate = async (template: Template) => {
    const newTemplateData: Partial<Template> = {
      buildingId: template.buildingId,
      name: `${template.name} (Copy)`,
      description: template.description,
      version: 1,
      requiredSections: template.requiredSections,
      optionalSections: template.optionalSections,
      requiredDocuments: template.requiredDocuments,
      optionalDocuments: template.optionalDocuments,
      enabledDisclosures: template.enabledDisclosures,
      buildingPolicies: template.buildingPolicies,
      isPublished: false,
    };

    await createTemplate.mutateAsync(newTemplateData);
  };

  const handleDelete = async () => {
    // Note: The delete hook should be called at component level
    // For now, we'll handle this via the TemplateTable component
    // or create a separate DeleteTemplateButton component
    console.warn("Delete functionality needs to be handled via TemplateTable");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading templates</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load templates. Please try again."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage building-specific application requirements
          </p>
        </div>
        <Link href="/agent/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </Link>
      </div>

      {/* Template Table */}
      <TemplateTable
        templates={templates || []}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </div>
  );
}
