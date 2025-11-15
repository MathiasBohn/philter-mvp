"use client";

import { useState, useMemo, useEffect } from "react";
import { InboxFilterBar } from "@/components/features/agent/inbox-filter-bar";
import { InboxTable } from "@/components/features/agent/inbox-table";
import { mockApplications } from "@/lib/mock-data/applications";
import { ApplicationStatus } from "@/lib/types";
import { storage } from "@/lib/persistence";

export default function AgentInboxPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [applications, setApplications] = useState(() => storage.getApplications(mockApplications));

  // Reload applications from storage when component mounts or updates
  useEffect(() => {
    setApplications(storage.getApplications(mockApplications));
  }, []);

  // Filter applications based on selected filters
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Only show submitted or later status applications
      const submittedStatuses = [
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.IN_REVIEW,
        ApplicationStatus.RFI,
        ApplicationStatus.APPROVED,
        ApplicationStatus.CONDITIONAL,
        ApplicationStatus.DENIED,
      ];

      if (!submittedStatuses.includes(app.status)) {
        return false;
      }

      // Filter by status
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }

      // Filter by building
      if (buildingFilter !== "all" && app.buildingId !== buildingFilter) {
        return false;
      }

      return true;
    });
  }, [applications, statusFilter, buildingFilter]);

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
        statusFilter={statusFilter}
        buildingFilter={buildingFilter}
        onStatusChange={setStatusFilter}
        onBuildingChange={setBuildingFilter}
      />

      <InboxTable
        applications={filteredApplications}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
