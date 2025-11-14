"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreVertical, ExternalLink } from "lucide-react";
import { Application, ApplicationStatus, TransactionType } from "@/lib/types";
import Link from "next/link";

interface InboxTableProps {
  applications: Application[];
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.IN_PROGRESS]: "bg-gray-500",
  [ApplicationStatus.SUBMITTED]: "bg-blue-500",
  [ApplicationStatus.IN_REVIEW]: "bg-purple-500",
  [ApplicationStatus.RFI]: "bg-orange-500",
  [ApplicationStatus.APPROVED]: "bg-green-500",
  [ApplicationStatus.CONDITIONAL]: "bg-yellow-500",
  [ApplicationStatus.DENIED]: "bg-red-500",
};

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.COOP_PURCHASE]: "Co-op Purchase",
  [TransactionType.CONDO_PURCHASE]: "Condo Purchase",
  [TransactionType.COOP_SUBLET]: "Co-op Sublet",
  [TransactionType.CONDO_LEASE]: "Condo Lease",
};

function getDaysSinceSubmission(submittedAt?: Date): number {
  if (!submittedAt) return 0;
  const now = new Date();
  const submitted = new Date(submittedAt);
  const diffTime = Math.abs(now.getTime() - submitted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else {
    return "Just now";
  }
}

export function InboxTable({ applications }: InboxTableProps) {
  const [localApplications, setLocalApplications] = useState(applications);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    setLocalApplications((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No applications found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant(s)</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localApplications.map((app) => {
            const applicants =
              app.people && app.people.length > 0
                ? app.people.map((p) => p.fullName).join(", ")
                : "—";
            const unit = app.unit || "—";
            const age = getDaysSinceSubmission(app.submittedAt);

            return (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{applicants}</TableCell>
                <TableCell>
                  {app.building?.name || "Unknown Building"}
                </TableCell>
                <TableCell>{unit}</TableCell>
                <TableCell>
                  {TRANSACTION_TYPE_LABELS[app.transactionType]}
                </TableCell>
                <TableCell>
                  <Select
                    value={app.status}
                    onValueChange={(value) =>
                      handleStatusChange(app.id, value as ApplicationStatus)
                    }
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <Badge
                        className={STATUS_COLORS[app.status]}
                        variant="default"
                      >
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
                      <SelectItem value={ApplicationStatus.RFI}>
                        RFI
                      </SelectItem>
                      <SelectItem value={ApplicationStatus.APPROVED}>
                        Approved
                      </SelectItem>
                      <SelectItem value={ApplicationStatus.CONDITIONAL}>
                        Conditional
                      </SelectItem>
                      <SelectItem value={ApplicationStatus.DENIED}>
                        Denied
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {app.submittedAt ? `${age} day${age === 1 ? "" : "s"}` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {getRelativeTime(app.lastActivityAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin/review/${app.id}`}
                          className="flex items-center"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Review Workspace
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Assign to Reviewer</DropdownMenuItem>
                      <DropdownMenuItem>Download Package</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
