"use client";

import { InboxFilterBar } from "@/components/features/agent/inbox-filter-bar";
import { InboxTable } from "@/components/features/agent/inbox-table";
import { ApplicationStatus } from "@/lib/types";
import { useApplicationFilters } from "@/lib/hooks/use-application-filters";
import { useApplications } from "@/lib/hooks/use-applications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AgentInboxPage() {
  const { data: applications, isLoading, error } = useApplications();

  // Filter applications with custom hook
  const {
    filteredApplications,
    filters,
    setStatusFilter,
    setBuildingFilter,
  } = useApplicationFilters(applications || [], {
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

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      // Make direct API call for status updates across multiple applications
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading inbox...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Inbox</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {error instanceof Error ? error.message : "Failed to load applications. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-6">
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
