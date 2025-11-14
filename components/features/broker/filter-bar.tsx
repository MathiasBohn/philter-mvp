"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ApplicationStatus } from "@/lib/types";
import { mockBuildings } from "@/lib/mock-data";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

interface FilterBarProps {
  statusFilter: ApplicationStatus | "ALL";
  onStatusFilterChange: (status: ApplicationStatus | "ALL") => void;
  buildingFilter: string;
  onBuildingFilterChange: (buildingId: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export function FilterBar({
  statusFilter,
  onStatusFilterChange,
  buildingFilter,
  onBuildingFilterChange,
  dateRange,
  onDateRangeChange,
}: FilterBarProps) {
  const hasActiveFilters =
    statusFilter !== "ALL" ||
    buildingFilter !== "ALL" ||
    dateRange.from !== undefined ||
    dateRange.to !== undefined;

  const clearFilters = () => {
    onStatusFilterChange("ALL");
    onBuildingFilterChange("ALL");
    onDateRangeChange({ from: undefined, to: undefined });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value as ApplicationStatus | "ALL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value={ApplicationStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={ApplicationStatus.SUBMITTED}>Submitted</SelectItem>
              <SelectItem value={ApplicationStatus.IN_REVIEW}>In Review</SelectItem>
              <SelectItem value={ApplicationStatus.RFI}>RFI</SelectItem>
              <SelectItem value={ApplicationStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={ApplicationStatus.CONDITIONAL}>Conditional</SelectItem>
              <SelectItem value={ApplicationStatus.DENIED}>Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Building Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Building</label>
          <Select value={buildingFilter} onValueChange={onBuildingFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All buildings</SelectItem>
              {mockBuildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) =>
                  onDateRangeChange({ from: range?.from, to: range?.to })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
