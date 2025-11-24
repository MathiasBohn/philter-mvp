"use client";

import { useParams, useRouter } from "next/navigation";
import { useTemplate } from "@/lib/hooks/use-templates";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { TemplateWizard } from "@/components/features/agent/template-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notFound } from "next/navigation";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const { data: template, isLoading, error } = useTemplate(templateId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading template</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load template. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Link href="/agent/templates">
            <Button variant="outline">Back to Templates</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!template) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/agent/templates/${templateId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Template
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit Template</h1>
        <p className="text-muted-foreground mt-2">
          Update template configuration for {template.name}
        </p>
      </div>

      {/* Template Editor - Wizard in edit mode with initial data */}
      <TemplateWizard mode="edit" initialData={template} />
    </div>
  );
}
