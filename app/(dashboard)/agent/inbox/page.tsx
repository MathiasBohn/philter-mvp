"use client";

import { useState } from "react";
import { InboxFilterBar } from "@/components/features/agent/inbox-filter-bar";
import { InboxTable } from "@/components/features/agent/inbox-table";
import { mockApplications } from "@/lib/mock-data/applications";
import { ApplicationStatus } from "@/lib/types";
import { storage } from "@/lib/persistence";
import { useApplicationFilters } from "@/lib/hooks/use-application-filters";

export default function AgentInboxPage() {
  const [applications, setApplications] = useState(() => storage.getApplications(mockApplications));

  // Filter applications with custom hook
  const {
    filteredApplications,
    filters,
    setStatusFilter,
    setBuildingFilter,
  } = useApplicationFilters(applications, {
    initialStatusFilter: "all",
    initialBuildingFilter: "all",
    allowedStatuses: [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.IN_REVIEW,
      ApplicationStatus.RFI,
      ApplicationStatus.APPROVED,
      ApplicationStatus.CONDITIONAL,
      ApplicationStatus.DENIED,
    ],
  });

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    // Update localStorage
    storage.updateApplicationStatus(appId, newStatus);
    // Reload applications from storage
    setApplications(storage.getApplications(mockApplications));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Application Inbox</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage submitted applications
        </p>
      </div>

      <InboxFilterBar
        statusFilter={filters.statusFilter as string}
        buildingFilter={filters.buildingFilter}
        onStatusChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}
        onBuildingChange={setBuildingFilter}
      />

      <InboxTable
        applications={filteredApplications}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
