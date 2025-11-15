"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { TemplateMobileCard } from "./mobile-cards/template-mobile-card";
import { Template } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MoreHorizontal, Edit, Eye, Copy, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { mockBuildings } from "@/lib/mock-data";

interface TemplateTableProps {
  templates: Template[];
}

const getBuildingName = (buildingId: string) => {
  const building = mockBuildings.find((b) => b.id === buildingId);
  return building?.name || "Unknown Building";
};

const columns: Column<Template>[] = [
  {
    key: "name",
    label: "Template Name",
    sortable: true,
    render: (_, template) => (
      <div>
        <p className="font-medium">{template.name}</p>
        {template.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {template.description}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "buildingId",
    label: "Building",
    sortable: true,
    render: (value) => getBuildingName(value as string),
  },
  {
    key: "version",
    label: "Version",
    sortable: true,
    render: (value) => <Badge variant="outline">v{String(value)}</Badge>,
  },
  {
    key: "isPublished",
    label: "Status",
    sortable: true,
    render: (value) =>
      value ? (
        <Badge variant="default">Published</Badge>
      ) : (
        <Badge variant="secondary">Draft</Badge>
      ),
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    className: "text-muted-foreground",
    render: (value) => formatDate(value as string, "relative"),
  },
];

export function TemplateTable({ templates }: TemplateTableProps) {
  const emptyState = (
    <EmptyState
      icon={FileText}
      title="No Templates Yet"
      description="Get started by creating your first application template"
      action={
        <Link href="/agent/templates/new">
          <Button>Create Template</Button>
        </Link>
      }
    />
  );

  const renderActions = (template: Template) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Open actions menu">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/agent/templates/${template.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Template
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/agent/templates/${template.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Template
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Template
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DataTable
      data={templates}
      columns={columns}
      keyExtractor={(template) => template.id}
      emptyState={emptyState}
      actions={renderActions}
      mobileCardRenderer={(template) => (
        <TemplateMobileCard template={template} />
      )}
    />
  );
}
