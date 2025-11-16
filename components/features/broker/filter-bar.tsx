"use client";

import { FilterBar as GenericFilterBar, FilterConfig } from "@/components/shared/filter-bar";
import { ApplicationStatus } from "@/lib/types";
import { mockBuildings } from "@/lib/mock-data";

interface BrokerFilterBarProps {
  statusFilter: ApplicationStatus | "ALL";
  onStatusFilterChange: (status: ApplicationStatus | "ALL") => void;
  buildingFilter: string;
  onBuildingFilterChange: (buildingId: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const BROKER_FILTERS: FilterConfig[] = [
  {
    type: "select",
    key: "status",
    label: "Status",
    placeholder: "All statuses",
    options: [
      { value: "ALL", label: "All statuses" },
      { value: ApplicationStatus.IN_PROGRESS, label: "In Progress" },
      { value: ApplicationStatus.SUBMITTED, label: "Submitted" },
      { value: ApplicationStatus.IN_REVIEW, label: "In Review" },
      { value: ApplicationStatus.RFI, label: "RFI" },
      { value: ApplicationStatus.APPROVED, label: "Approved" },
      { value: ApplicationStatus.CONDITIONAL, label: "Conditional" },
      { value: ApplicationStatus.DENIED, label: "Denied" },
    ],
  },
  {
    type: "select",
    key: "building",
    label: "Building",
    placeholder: "All buildings",
    options: [
      { value: "ALL", label: "All buildings" },
      ...mockBuildings.map((building) => ({
        value: building.id,
        label: building.name,
      })),
    ],
  },
  {
    type: "date-range",
    key: "dateRange",
    label: "Date Range",
    placeholder: "Pick a date range",
  },
];

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
  buildingFilter,
  onBuildingFilterChange,
  dateRange,
  onDateRangeChange,
}: BrokerFilterBarProps) {
  const handleChange = (key: string, value: string) => {
    if (key === "status") {
      onStatusFilterChange(value as ApplicationStatus | "ALL");
    } else if (key === "building") {
      onBuildingFilterChange(value);
    } else if (key === "dateRange") {
      onDateRangeChange(value);
    }
  };

  return (
    <GenericFilterBar
      filters={BROKER_FILTERS}
      values={{
        status: statusFilter,
        building: buildingFilter,
        dateRange: dateRange,
      }}
      onChange={handleChange}
      showClearButton={true}
    />
  );
}
