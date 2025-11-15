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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Application, ApplicationStatus, TransactionType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";

interface InboxMobileCardProps {
  application: Application;
  onStatusChange?: (appId: string, newStatus: ApplicationStatus) => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.IN_PROGRESS]: "bg-gray-500 dark:bg-gray-600",
  [ApplicationStatus.SUBMITTED]: "bg-blue-500 dark:bg-blue-600",
  [ApplicationStatus.IN_REVIEW]: "bg-purple-500 dark:bg-purple-600",
  [ApplicationStatus.RFI]: "bg-orange-500 dark:bg-orange-600",
  [ApplicationStatus.APPROVED]: "bg-green-500 dark:bg-green-600",
  [ApplicationStatus.CONDITIONAL]: "bg-yellow-500 dark:bg-yellow-600",
  [ApplicationStatus.DENIED]: "bg-red-500 dark:bg-red-600",
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

export function InboxMobileCard({
  application,
  onStatusChange,
}: InboxMobileCardProps) {
  const applicants =
    application.people && application.people.length > 0
      ? application.people.map((p) => p.fullName).join(", ")
      : "New Application";
  const unit = application.unit || "—";
  const age = getDaysSinceSubmission(application.submittedAt);

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (onStatusChange) {
      onStatusChange(application.id, newStatus);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{applicants}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              {application.building?.name || "Unknown Building"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Open actions menu"
                className="h-8 w-8 p-0 shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/agent/review/${application.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Review Workspace
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Assign to Reviewer</DropdownMenuItem>
              <DropdownMenuItem>Download Package</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Unit</p>
            <p className="font-medium mt-0.5">{unit}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Type</p>
            <p className="font-medium mt-0.5 text-xs">
              {TRANSACTION_TYPE_LABELS[application.transactionType]}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Status</p>
            <div className="mt-0.5">
              <Select
                value={application.status}
                onValueChange={(value) =>
                  handleStatusChange(value as ApplicationStatus)
                }
              >
                <SelectTrigger className="w-full h-8" aria-label="Change application status">
                  <Badge
                    className={STATUS_COLORS[application.status]}
                    variant="default"
                  >
                    {application.status}
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
                  <SelectItem value={ApplicationStatus.DENIED}>
                    Denied
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Age</p>
            <p className="text-sm mt-0.5">
              {application.submittedAt ? `${age} day${age === 1 ? "" : "s"}` : "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Last Activity</p>
            <p className="text-sm mt-0.5">
              {formatDate(application.lastActivityAt, "relative")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
