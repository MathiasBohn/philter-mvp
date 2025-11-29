"use client";

import { useState, useCallback, useMemo } from "react";
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
import { InviteApplicantModal } from "./invite-applicant-modal";
import { InvitationStatusBadge, getInvitationStatus } from "./invitation-status-badge";
import { Application } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MoreHorizontal, FileText, UserPlus, Eye } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox } from "@/components/ui/checkbox";

interface ApplicationTableProps {
  applications: Application[];
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
}

// Helper to create columns with memoized age data
function createColumns(applicationAges: Record<string, { days: number; colorClass: string }>): Column<Application>[] {
  return [
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
          <p className="font-medium">{application.building?.name || "Unknown Building"}</p>
          <p className="text-xs text-muted-foreground">
            {application.building?.address?.street || "Address not available"}
          </p>
        </div>
      ),
    },
    {
      key: "transactionType",
      label: "Transaction Type",
      sortable: true,
      render: (value) => value ? String(value).replace(/_/g, " ") : "—",
    },
    {
      key: "completionPercentage",
      label: "Completion",
      sortable: true,
      render: (value) => {
        const percentage = typeof value === "number" ? value : 0;
        return (
          <div className="space-y-1">
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{percentage}%</p>
          </div>
        );
      },
    },
    {
      key: "submittedAt",
      label: "Time",
      sortable: true,
      render: (_, application) => {
        // Use pre-calculated memoized values
        const ageData = applicationAges[application.id];
        return ageData ? (
          <span className={ageData.colorClass}>
            {ageData.days} day{ageData.days === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
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
      render: (value, application) => (
        <div className="flex flex-col gap-1.5">
          <StatusTag status={value as Application["status"]} />
          <InvitationStatusBadge
            status={getInvitationStatus(application)}
            email={application.primaryApplicantEmail}
          />
        </div>
      ),
    },
  ];
}

export function ApplicationTable({
  applications,
  selectedIds = [],
  onToggleSelection,
  onSelectAll,
  isAllSelected = false,
}: ApplicationTableProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Memoize application age calculations to avoid recalculating on every render
  const applicationAges = useMemo(() => {
    const now = new Date();
    return applications.reduce((acc, app) => {
      if (app.submittedAt) {
        const submitted = new Date(app.submittedAt);
        const diffTime = Math.abs(now.getTime() - submitted.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        acc[app.id] = {
          days,
          colorClass: days > 14 ? "text-red-600 font-semibold" : days > 7 ? "text-yellow-600 font-semibold" : "",
        };
      }
      return acc;
    }, {} as Record<string, { days: number; colorClass: string }>);
  }, [applications]);

  // Create columns with memoized age data
  const columns = useMemo(() => createColumns(applicationAges), [applicationAges]);

  const emptyState = useMemo(() => (
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
  ), []);

  const renderActions = useCallback((application: Application) => (
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
            Review Application
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Applicant
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ), [setShowInviteModal]);

  // If selection is enabled, wrap the table with custom rendering for checkboxes
  if (onToggleSelection) {
    return (
      <>
        {/* Desktop View with Checkboxes */}
        <div className="hidden md:block rounded-md border overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    <Checkbox
                      checked={selectedIds.includes(app.id)}
                      onCheckedChange={() => onToggleSelection(app.id)}
                      aria-label={`Select ${app.people.map((p) => p.fullName).join(", ")}`}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`p-4 align-middle ${col.className || ""}`}>
                      {col.render ? col.render(app[col.key], app) : String(app[col.key])}
                    </td>
                  ))}
                  <td className="p-4 align-middle text-right">{renderActions(app)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="flex gap-3 items-start">
              <Checkbox
                checked={selectedIds.includes(app.id)}
                onCheckedChange={() => onToggleSelection(app.id)}
                className="mt-4"
                aria-label={`Select ${app.people.map((p) => p.fullName).join(", ")}`}
              />
              <div className="flex-1">
                <ApplicationMobileCard application={app} />
              </div>
            </div>
          ))}
        </div>

        {/* Invite Applicant Modal */}
        <InviteApplicantModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
        />
      </>
    );
  }

  // Default rendering without checkboxes
  return (
    <>
      <DataTable
        data={applications}
        columns={columns}
        keyExtractor={(app) => app.id}
        emptyState={emptyState}
        actions={renderActions}
        mobileCardRenderer={(app) => <ApplicationMobileCard application={app} />}
      />

      {/* Invite Applicant Modal */}
      <InviteApplicantModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
      />
    </>
  );
}
