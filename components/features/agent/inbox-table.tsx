"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/ui/data-table";
import { InboxMobileCard } from "./mobile-cards/inbox-mobile-card";
import { AssignReviewerModal } from "./assign-reviewer-modal";
import { MoreVertical, ExternalLink, Download } from "lucide-react";
import { Application, ApplicationStatus, TransactionType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getStatusColor, getTransactionTypeLabel } from "@/lib/constants/labels";
import { useToast } from "@/lib/hooks/use-toast";
import Link from "next/link";

interface InboxTableProps {
  applications: Application[];
  onStatusChange?: (appId: string, newStatus: ApplicationStatus) => void;
}

function getDaysSinceSubmission(submittedAt?: Date): number {
  if (!submittedAt) return 0;
  const now = new Date();
  const submitted = new Date(submittedAt);
  const diffTime = Math.abs(now.getTime() - submitted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getAgeColorClass(days: number): string {
  if (days > 14) return "text-red-600 font-semibold";
  if (days > 7) return "text-yellow-600 font-semibold";
  return "";
}

export function InboxTable({ applications, onStatusChange }: InboxTableProps) {
  const { toast } = useToast();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    if (onStatusChange) {
      onStatusChange(appId, newStatus);
    }
  };

  const handleAssignClick = (app: Application) => {
    setSelectedApplication(app);
    setAssignModalOpen(true);
  };

  const handleAssignReviewer = (applicationId: string, reviewerId: string) => {
    // In a real app, this would call an API
    // For now, we'll just update the status and show a toast
    if (onStatusChange) {
      onStatusChange(applicationId, ApplicationStatus.IN_REVIEW);
    }

    toast({
      title: "Reviewer Assigned",
      description: "The application has been assigned for review",
    });
  };

  const handleDownloadPackage = (app: Application) => {
    const applicantNames = app.people?.map((p) => p.fullName).join(", ") || "Unknown";

    // Create a comprehensive JSON package of the application
    const packageData = {
      exportDate: new Date().toISOString(),
      exportedBy: "Transaction Agent",
      application: {
        id: app.id,
        applicants: applicantNames,
        building: app.building?.name || "Unknown",
        unit: app.unit || "N/A",
        transactionType: app.transactionType,
        status: app.status,
        submittedAt: app.submittedAt,
        completionPercentage: app.completionPercentage,
        // Include all application data
        people: app.people,
        employmentRecords: app.employmentRecords,
        financialEntries: app.financialEntries,
        realEstateProperties: app.realEstateProperties,
        documents: app.documents,
        disclosures: app.disclosures,
        participants: app.participants,
        sections: app.sections,
      },
    };

    // Convert to JSON and download
    const dataStr = JSON.stringify(packageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `application-${app.id}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Package Downloaded",
      description: `Application package for ${applicantNames} has been downloaded`,
    });
  };

  const columns: Column<Application>[] = [
    {
      key: "id",
      label: "Applicant(s)",
      sortable: false,
      render: (_, app) => {
        const applicants =
          app.people && app.people.length > 0
            ? app.people.map((p) => p.fullName).join(", ")
            : "—";
        return <span className="font-medium">{applicants}</span>;
      },
    },
    {
      key: "buildingId",
      label: "Building",
      sortable: false,
      render: (_, app) => app.building?.name || "Unknown Building",
    },
    {
      key: "unit",
      label: "Unit",
      sortable: false,
      render: (value) => (value as string) || "—",
    },
    {
      key: "transactionType",
      label: "Type",
      sortable: false,
      render: (value) => getTransactionTypeLabel(value as TransactionType),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (_, app) => (
        <Select
          value={app.status}
          onValueChange={(value) =>
            handleStatusChange(app.id, value as ApplicationStatus)
          }
        >
          <SelectTrigger className="w-[140px] h-8" aria-label="Change application status">
            <Badge className={getStatusColor(app.status)} variant="default">
              {app.status}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ApplicationStatus.SUBMITTED}>
              Submitted
            </SelectItem>
            <SelectItem value={ApplicationStatus.IN_REVIEW}>
              In Review
            </SelectItem>
            <SelectItem value={ApplicationStatus.RFI}>RFI</SelectItem>
            <SelectItem value={ApplicationStatus.APPROVED}>
              Approved
            </SelectItem>
            <SelectItem value={ApplicationStatus.CONDITIONAL}>
              Conditional
            </SelectItem>
            <SelectItem value={ApplicationStatus.DENIED}>Denied</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "submittedAt",
      label: "Age",
      sortable: true,
      render: (_, app) => {
        const age = getDaysSinceSubmission(app.submittedAt);
        const colorClass = getAgeColorClass(age);
        return app.submittedAt ? (
          <span className={colorClass}>
            {age} day{age === 1 ? "" : "s"}
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
      className: "text-muted-foreground text-sm",
      render: (value) => formatDate(value as string, "relative"),
    },
  ];

  const emptyState = (
    <div className="text-center py-12 border rounded-lg">
      <p className="text-muted-foreground">No applications found</p>
    </div>
  );

  const renderActions = (app: Application) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Open actions menu">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/agent/review/${app.id}`} className="flex items-center">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Review Workspace
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAssignClick(app)}>
          Assign to Reviewer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownloadPackage(app)}>
          <Download className="mr-2 h-4 w-4" />
          Download Package
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <DataTable
        data={applications}
        columns={columns}
        keyExtractor={(app) => app.id}
        emptyState={emptyState}
        actions={renderActions}
        mobileCardRenderer={(app) => (
          <InboxMobileCard application={app} onStatusChange={onStatusChange} />
        )}
      />

      <AssignReviewerModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        application={selectedApplication}
        onAssign={handleAssignReviewer}
      />
    </>
  );
}
