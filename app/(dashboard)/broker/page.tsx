"use client";

import { mockApplications } from "@/lib/mock-data";
import { ApplicationTable } from "@/components/features/broker/application-table";
import { FilterBar } from "@/components/features/broker/filter-bar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApplicationStatus } from "@/lib/types";

export default function BrokerPipelinePage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [buildingFilter, setBuildingFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Filter applications based on selected filters
  const filteredApplications = mockApplications.filter((app) => {
    if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
    if (buildingFilter !== "ALL" && app.buildingId !== buildingFilter) return false;
    if (dateRange.from && app.createdAt < dateRange.from) return false;
    if (dateRange.to && app.createdAt > dateRange.to) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Pipeline</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track all client applications
          </p>
        </div>
        <Link href="/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Start New Application
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        buildingFilter={buildingFilter}
        onBuildingFilterChange={setBuildingFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Application Table */}
      <ApplicationTable applications={filteredApplications} />
    </div>
  );
}
