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
import { Progress } from "@/components/ui/progress";
import { StatusTag } from "./status-tag";
import { Application } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MoreHorizontal, FileText, UserPlus, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicationTableProps {
  applications: Application[];
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Application | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: keyof Application) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedApplications = [...applications].sort((a, b) => {
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

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No Applications Yet</CardTitle>
          <CardDescription>
            Get started by creating your first application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/broker/new">
            <Button>Start New Application</Button>
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
                onClick={() => handleSort("createdAt")}
              >
                Applicant(s)
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("buildingId")}
              >
                Building
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("transactionType")}
              >
                Transaction Type
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("completionPercentage")}
              >
                Completion
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("lastActivityAt")}
              >
                Last Activity
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                Status
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">
                  {application.people.length > 0
                    ? application.people.map((p) => p.fullName).join(", ")
                    : "New Application"}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{application.building?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {application.building?.address.street}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {application.transactionType.replace(/_/g, " ")}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={application.completionPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {application.completionPercentage}%
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(application.lastActivityAt, "relative")}
                </TableCell>
                <TableCell>
                  <StatusTag status={application.status} />
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
                        <Link href={`/broker/${application.id}/qa`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Open QA Workspace
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Applicant
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/applications/${application.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
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
        {sortedApplications.map((application) => (
          <Card key={application.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">
                    {application.people.length > 0
                      ? application.people.map((p) => p.fullName).join(", ")
                      : "New Application"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {application.building?.name}
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
                      <Link href={`/broker/${application.id}/qa`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Open QA Workspace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Applicant
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/applications/${application.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium mt-0.5">
                    {application.transactionType.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="mt-0.5">
                    <StatusTag status={application.status} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Completion</p>
                  <div className="mt-1">
                    <Progress value={application.completionPercentage} className="h-2" />
                    <p className="text-xs mt-1">{application.completionPercentage}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Last Activity</p>
                  <p className="text-sm mt-0.5">
                    {formatDate(application.lastActivityAt, "relative")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
