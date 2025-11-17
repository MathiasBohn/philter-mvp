"use client";

import { useState } from "react";
import { mockTemplates } from "@/lib/mock-data";
import { TemplateTable } from "@/components/features/agent/template-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Template } from "@/lib/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      version: 1,
      isPublished: false,
      publishedAt: undefined,
      createdAt: new Date(),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
  };

  const handleDelete = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

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
        templates={templates}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </div>
  );
}
