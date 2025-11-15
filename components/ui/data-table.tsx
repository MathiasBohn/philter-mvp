"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableSort } from "@/lib/hooks/use-table-sort";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  sortable?: boolean;
  emptyState?: React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  mobileCardRenderer?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  initialSortColumn?: keyof T;
  initialSortDirection?: "asc" | "desc";
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortable = true,
  emptyState,
  actions,
  mobileCardRenderer,
  onRowClick,
  initialSortColumn,
  initialSortDirection = "desc",
}: DataTableProps<T>) {
  const { sortedData, sortColumn, sortDirection, handleSort } = useTableSort(
    data,
    {
      initialColumn: initialSortColumn,
      initialDirection: initialSortDirection,
    }
  );

  if (sortedData.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const SortIcon = ({ column }: { column: keyof T }) => {
    if (!sortable || sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <>
      {/* Desktop Table View - hidden on mobile */}
      <div className="hidden md:block rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    column.sortable && sortable
                      ? "cursor-pointer hover:bg-muted/50"
                      : "",
                    column.className
                  )}
                  onClick={() =>
                    column.sortable && sortable && handleSort(column.key)
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortable && <SortIcon column={column.key} />}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className={column.className}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key])}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">{actions(row)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards View - visible only on mobile */}
      {mobileCardRenderer && (
        <div className="md:hidden space-y-4">
          {sortedData.map((row) => (
            <div key={keyExtractor(row)}>{mobileCardRenderer(row)}</div>
          ))}
        </div>
      )}
    </>
  );
}
