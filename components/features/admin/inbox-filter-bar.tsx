"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ApplicationStatus } from "@/lib/types";
import { mockBuildings } from "@/lib/mock-data";

interface InboxFilterBarProps {
  statusFilter: string;
  buildingFilter: string;
  onStatusChange: (value: string) => void;
  onBuildingChange: (value: string) => void;
}

export function InboxFilterBar({
  statusFilter,
  buildingFilter,
  onStatusChange,
  onBuildingChange,
}: InboxFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={ApplicationStatus.SUBMITTED}>Submitted</SelectItem>
            <SelectItem value={ApplicationStatus.IN_REVIEW}>In Review</SelectItem>
            <SelectItem value={ApplicationStatus.RFI}>
              Request for Information
            </SelectItem>
            <SelectItem value={ApplicationStatus.APPROVED}>Approved</SelectItem>
            <SelectItem value={ApplicationStatus.CONDITIONAL}>
              Conditional Approval
            </SelectItem>
            <SelectItem value={ApplicationStatus.DENIED}>Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label htmlFor="building-filter">Building</Label>
        <Select value={buildingFilter} onValueChange={onBuildingChange}>
          <SelectTrigger id="building-filter">
            <SelectValue placeholder="All buildings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All buildings</SelectItem>
            {mockBuildings.map((building) => (
              <SelectItem key={building.id} value={building.id}>
                {building.name} ({building.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
