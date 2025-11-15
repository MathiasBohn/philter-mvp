"use client";

import { mockTemplates } from "@/lib/mock-data";
import { TemplateTable } from "@/components/features/agent/template-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
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
      <TemplateTable templates={mockTemplates} />
    </div>
  );
}
