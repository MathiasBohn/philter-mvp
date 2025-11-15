import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export interface UseTableSortOptions<T> {
  initialColumn?: keyof T;
  initialDirection?: SortDirection;
}

export interface UseTableSortReturn<T> {
  sortedData: T[];
  sortColumn: keyof T | null;
  sortDirection: SortDirection;
  handleSort: (column: keyof T) => void;
}

/**
 * Generic hook for table sorting functionality
 * @param data - Array of data to sort
 * @param options - Configuration options for initial sort state
 * @returns Sorted data and sorting controls
 */
export function useTableSort<T>(
  data: T[],
  options: UseTableSortOptions<T> = {}
): UseTableSortReturn<T> {
  const { initialColumn, initialDirection = "desc" } = options;

  const [sortColumn, setSortColumn] = useState<keyof T | null>(
    initialColumn || null
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialDirection);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue === null || bValue === null) return 0;

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
  };
}
