"use client";

import { useParams, useRouter } from "next/navigation";
import { mockTemplates } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TemplateWizard } from "@/components/features/agent/template-wizard";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const template = mockTemplates.find((t) => t.id === templateId);

  if (!template) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Template Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The template you're trying to edit doesn't exist.
          </p>
          <Link href="/agent/templates">
            <Button className="mt-4">Back to Templates</Button>
          </Link>
        </div>
      </div>
    );
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

      {/* Template Editor - Using the wizard component */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is the MVP version. Template editing uses the same wizard
          as creating a new template. In a future version, the form will be pre-populated
          with existing template data.
        </p>
      </div>

      <TemplateWizard />
    </div>
  );
}
