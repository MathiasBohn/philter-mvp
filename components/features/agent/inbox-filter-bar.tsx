"use client";

import { FilterBar, FilterConfig } from "@/components/shared/filter-bar";
import { ApplicationStatus } from "@/lib/types";
import { mockBuildings } from "@/lib/mock-data";

interface InboxFilterBarProps {
  statusFilter: string;
  buildingFilter: string;
  onStatusChange: (value: string) => void;
  onBuildingChange: (value: string) => void;
}

const INBOX_FILTERS: FilterConfig[] = [
  {
    type: "select",
    key: "status",
    label: "Status",
    placeholder: "All statuses",
    options: [
      { value: "all", label: "All statuses" },
      { value: ApplicationStatus.SUBMITTED, label: "Submitted" },
      { value: ApplicationStatus.IN_REVIEW, label: "In Review" },
      { value: ApplicationStatus.RFI, label: "Request for Information" },
      { value: ApplicationStatus.APPROVED, label: "Approved" },
      { value: ApplicationStatus.CONDITIONAL, label: "Conditional Approval" },
      { value: ApplicationStatus.DENIED, label: "Denied" },
    ],
  },
  {
    type: "select",
    key: "building",
    label: "Building",
    placeholder: "All buildings",
    options: [
      { value: "all", label: "All buildings" },
      ...mockBuildings.map((building) => ({
        value: building.id,
        label: `${building.name} (${building.code})`,
      })),
    ],
  },
];

export function InboxFilterBar({
  statusFilter,
  buildingFilter,
  onStatusChange,
  onBuildingChange,
}: InboxFilterBarProps) {
  const handleChange = (key: string, value: unknown) => {
    const stringValue = String(value);
    if (key === "status") {
      onStatusChange(stringValue);
    } else if (key === "building") {
      onBuildingChange(stringValue);
    }
  };

  return (
    <FilterBar
      filters={INBOX_FILTERS}
      values={{
        status: statusFilter,
        building: buildingFilter,
      }}
      onChange={handleChange}
      showClearButton={false}
    />
  );
}
