"use client";

import { useParams, useRouter } from "next/navigation";
import { mockTemplates } from "@/lib/mock-data";
import { mockBuildings } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Edit, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ViewTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const template = mockTemplates.find((t) => t.id === templateId);
  const building = mockBuildings.find((b) => b.id === template?.buildingId);

  if (!template) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Template Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The template you&apos;re looking for doesn&apos;t exist.
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
          onClick={() => router.push("/agent/templates")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          {template.description && (
            <p className="text-muted-foreground mt-2">{template.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/agent/templates/${template.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Template Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Template Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Building</p>
              <p className="font-medium">{building?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <Badge variant="outline">v{template.version}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              {template.isPublished ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">
                {formatDate(template.createdAt.toISOString(), "long")}
              </p>
            </div>
            {template.publishedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-sm">
                  {formatDate(template.publishedAt.toISOString(), "long")}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Template Purpose</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This template defines the application requirements for{" "}
            <strong>{building?.name || "this building"}</strong>. It specifies which sections are required,
            what documents applicants must upload, and which disclosures need to be acknowledged.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            When applicants start a new application for this building, they will be guided through
            the sections and prompted for documents based on this template&apos;s configuration.
          </p>
        </Card>
      </div>

      {/* Required Sections */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Required Sections</h2>
        <div className="flex flex-wrap gap-2">
          {template.requiredSections.map((section) => (
            <Badge key={section} variant="default">
              {section}
            </Badge>
          ))}
        </div>
        {template.optionalSections.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mt-4 mb-2 text-muted-foreground">
              Optional Sections
            </h3>
            <div className="flex flex-wrap gap-2">
              {template.optionalSections.map((section) => (
                <Badge key={section} variant="outline">
                  {section}
                </Badge>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Required Documents */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Required Documents</h2>
        <div className="flex flex-wrap gap-2">
          {template.requiredDocuments.map((doc) => (
            <Badge key={doc} variant="default">
              {doc}
            </Badge>
          ))}
        </div>
        {template.optionalDocuments.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mt-4 mb-2 text-muted-foreground">
              Optional Documents
            </h3>
            <div className="flex flex-wrap gap-2">
              {template.optionalDocuments.map((doc) => (
                <Badge key={doc} variant="outline">
                  {doc}
                </Badge>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Enabled Disclosures */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Enabled Disclosures</h2>
        {template.enabledDisclosures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {template.enabledDisclosures.map((disclosure) => (
              <Badge key={disclosure} variant="default">
                {disclosure}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No disclosures enabled for this template
          </p>
        )}
      </Card>
    </div>
  );
}
