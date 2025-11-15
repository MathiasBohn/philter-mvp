"use client";

import { mockApplications } from "@/lib/mock-data";
import { ApplicationTable } from "@/components/features/broker/application-table";
import { FilterBar } from "@/components/features/broker/filter-bar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useApplicationFilters } from "@/lib/hooks/use-application-filters";
import { ApplicationStatus } from "@/lib/types";

export default function BrokerPipelinePage() {
  const {
    filteredApplications,
    filters,
    setStatusFilter,
    setBuildingFilter,
    setDateRange,
  } = useApplicationFilters(mockApplications, {
    enableDateRange: true,
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
        <Link href="/broker/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Start New Application
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar
        statusFilter={filters.statusFilter as ApplicationStatus | "ALL"}
        onStatusFilterChange={(status) => setStatusFilter(status)}
        buildingFilter={filters.buildingFilter}
        onBuildingFilterChange={setBuildingFilter}
        dateRange={filters.dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Application Table */}
      <ApplicationTable applications={filteredApplications} />
    </div>
  );
}
