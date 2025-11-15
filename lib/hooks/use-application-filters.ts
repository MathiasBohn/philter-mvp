import { useState, useMemo } from "react";
import { Application, ApplicationStatus } from "@/lib/types";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface ApplicationFilterOptions {
  /**
   * Initial value for status filter
   * @default "ALL"
   */
  initialStatusFilter?: ApplicationStatus | "ALL" | "all";

  /**
   * Initial value for building filter
   * @default "ALL"
   */
  initialBuildingFilter?: string;

  /**
   * Enable date range filtering
   * @default false
   */
  enableDateRange?: boolean;

  /**
   * Optional array of allowed statuses (e.g., only show submitted applications)
   */
  allowedStatuses?: ApplicationStatus[];
}

/**
 * Custom hook for filtering applications by status, building, and optional date range
 *
 * @param applications - Array of applications to filter
 * @param options - Configuration options for the filter
 * @returns Filtered applications and filter state management functions
 *
 * @example
 * // Basic usage (broker)
 * const { filteredApplications, filters, setStatusFilter, setBuildingFilter } =
 *   useApplicationFilters(applications, { enableDateRange: true });
 *
 * @example
 * // With allowed statuses (agent)
 * const { filteredApplications, filters, setStatusFilter } =
 *   useApplicationFilters(applications, {
 *     initialStatusFilter: "all",
 *     allowedStatuses: [ApplicationStatus.SUBMITTED, ApplicationStatus.IN_REVIEW]
 *   });
 */
export function useApplicationFilters(
  applications: Application[],
  options: ApplicationFilterOptions = {}
) {
  const {
    initialStatusFilter = "ALL",
    initialBuildingFilter = "ALL",
    enableDateRange = false,
    allowedStatuses,
  } = options;

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL" | "all">(
    initialStatusFilter
  );
  const [buildingFilter, setBuildingFilter] = useState<string>(initialBuildingFilter);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Filter by allowed statuses if specified
      if (allowedStatuses && !allowedStatuses.includes(app.status)) {
        return false;
      }

      // Filter by status (handle both "ALL" and "all")
      const statusFilterNormalized = statusFilter.toUpperCase();
      if (statusFilterNormalized !== "ALL" && app.status !== statusFilter) {
        return false;
      }

      // Filter by building (handle both "ALL" and "all")
      const buildingFilterNormalized = buildingFilter.toUpperCase();
      if (buildingFilterNormalized !== "ALL" && app.buildingId !== buildingFilter) {
        return false;
      }

      // Filter by date range if enabled
      if (enableDateRange && dateRange.from && app.createdAt < dateRange.from) {
        return false;
      }
      if (enableDateRange && dateRange.to && app.createdAt > dateRange.to) {
        return false;
      }

      return true;
    });
  }, [applications, statusFilter, buildingFilter, dateRange, allowedStatuses, enableDateRange]);

  return {
    filteredApplications,
    filters: {
      statusFilter,
      buildingFilter,
      dateRange,
    },
    setStatusFilter,
    setBuildingFilter,
    setDateRange,
  };
}
