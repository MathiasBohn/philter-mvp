"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Template } from "@/lib/types";
import { MoreHorizontal, Edit, Eye, Copy, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockBuildings } from "@/lib/mock-data";

interface TemplateTableProps {
  templates: Template[];
}

export function TemplateTable({ templates }: TemplateTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Template | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: keyof Template) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === undefined || bValue === undefined) return 0;

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getBuildingName = (buildingId: string) => {
    const building = mockBuildings.find((b) => b.id === buildingId);
    return building?.name || "Unknown Building";
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No Templates Yet</CardTitle>
          <CardDescription>
            Get started by creating your first application template
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/agent/templates/new">
            <Button>Create Template</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table View - hidden on mobile */}
      <div className="hidden md:block rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                Template Name
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("buildingId")}
              >
                Building
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("version")}
              >
                Version
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("isPublished")}
              >
                Status
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                Created
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {template.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getBuildingName(template.buildingId)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">v{template.version}</Badge>
                </TableCell>
                <TableCell>
                  {template.isPublished ? (
                    <Badge variant="default">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getRelativeTime(template.createdAt)}
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - visible only on mobile */}
      <div className="md:hidden space-y-4">
        {sortedTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {getBuildingName(template.buildingId)}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Open actions menu" className="h-8 w-8 p-0">
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
                  <Badge variant="outline" className="mt-1">v{template.version}</Badge>
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
                    {getRelativeTime(template.createdAt)}
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
        ))}
      </div>
    </>
  );
}
