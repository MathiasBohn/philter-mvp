"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Template } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MoreHorizontal, Edit, Eye, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { mockBuildings } from "@/lib/mock-data";

interface TemplateMobileCardProps {
  template: Template;
}

export function TemplateMobileCard({ template }: TemplateMobileCardProps) {
  const building = mockBuildings.find((b) => b.id === template.buildingId);
  const buildingName = building?.name || "Unknown Building";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription className="mt-1">{buildingName}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Open actions menu"
                className="h-8 w-8 p-0"
              >
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Version</p>
            <Badge variant="outline" className="mt-1">
              v{template.version}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Status</p>
            <div className="mt-1">
              {template.isPublished ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Created</p>
            <p className="text-sm mt-0.5">
              {formatDate(template.createdAt, "relative")}
            </p>
          </div>
          {template.description && (
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">Description</p>
              <p className="text-sm mt-0.5">{template.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
