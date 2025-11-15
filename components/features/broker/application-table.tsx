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
import { Progress } from "@/components/ui/progress";
import { DataTable, Column } from "@/components/ui/data-table";
import { ApplicationMobileCard } from "./mobile-cards/application-mobile-card";
import { StatusTag } from "./status-tag";
import { Application } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MoreHorizontal, FileText, UserPlus, Eye } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

interface ApplicationTableProps {
  applications: Application[];
}

const columns: Column<Application>[] = [
  {
    key: "createdAt",
    label: "Applicant(s)",
    sortable: true,
    render: (_, application) => (
      <span className="font-medium">
        {application.people.length > 0
          ? application.people.map((p) => p.fullName).join(", ")
          : "New Application"}
      </span>
    ),
  },
  {
    key: "buildingId",
    label: "Building",
    sortable: true,
    render: (_, application) => (
      <div>
        <p className="font-medium">{application.building?.name}</p>
        <p className="text-xs text-muted-foreground">
          {application.building?.address.street}
        </p>
      </div>
    ),
  },
  {
    key: "transactionType",
    label: "Transaction Type",
    sortable: true,
    render: (value) => String(value).replace(/_/g, " "),
  },
  {
    key: "completionPercentage",
    label: "Completion",
    sortable: true,
    render: (value) => (
      <div className="space-y-1">
        <Progress value={value as number} className="h-2" />
        <p className="text-xs text-muted-foreground">{String(value)}%</p>
      </div>
    ),
  },
  {
    key: "lastActivityAt",
    label: "Last Activity",
    sortable: true,
    className: "text-muted-foreground",
    render: (value) => formatDate(value as string, "relative"),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => <StatusTag status={value as Application["status"]} />,
  },
];

export function ApplicationTable({ applications }: ApplicationTableProps) {
  const emptyState = (
    <EmptyState
      icon={FileText}
      title="No Applications Yet"
      description="Get started by creating your first application"
      action={
        <Link href="/broker/new">
          <Button>Start New Application</Button>
        </Link>
      }
    />
  );

  const renderActions = (application: Application) => (
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
  );

  return (
    <DataTable
      data={applications}
      columns={columns}
      keyExtractor={(app) => app.id}
      emptyState={emptyState}
      actions={renderActions}
      mobileCardRenderer={(app) => <ApplicationMobileCard application={app} />}
    />
  );
}
