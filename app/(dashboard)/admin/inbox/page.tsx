"use client";

import { useState, useMemo } from "react";
import { InboxFilterBar } from "@/components/features/admin/inbox-filter-bar";
import { InboxTable } from "@/components/features/admin/inbox-table";
import { mockApplications } from "@/lib/mock-data/applications";
import { ApplicationStatus } from "@/lib/types";

export default function AdminInboxPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");

  // Filter applications based on selected filters
  const filteredApplications = useMemo(() => {
    return mockApplications.filter((app) => {
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
  }, [statusFilter, buildingFilter]);

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

      <InboxTable applications={filteredApplications} />
    </div>
  );
}
