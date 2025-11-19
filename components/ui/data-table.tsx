"use client";

import { memo } from "react";
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

// Memoized table row component to prevent unnecessary re-renders
interface DataRowProps<T> {
  row: T;
  columns: Column<T>[];
  actions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

const DataRow = memo(function DataRow<T>({
  row,
  columns,
  actions,
  onRowClick,
}: DataRowProps<T>) {
  return (
    <TableRow
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
  );
}) as <T>(props: DataRowProps<T>) => React.ReactElement;

// Memoized mobile card wrapper to prevent unnecessary re-renders
interface MobileCardWrapperProps<T> {
  row: T;
  keyExtractor: (row: T) => string;
  mobileCardRenderer: (row: T) => React.ReactNode;
}

const MobileCardWrapper = memo(function MobileCardWrapper<T>({
  row,
  keyExtractor,
  mobileCardRenderer,
}: MobileCardWrapperProps<T>) {
  return <div key={keyExtractor(row)}>{mobileCardRenderer(row)}</div>;
}) as <T>(props: MobileCardWrapperProps<T>) => React.ReactElement;

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
              <DataRow
                key={keyExtractor(row)}
                row={row}
                columns={columns}
                actions={actions}
                onRowClick={onRowClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards View - visible only on mobile */}
      {mobileCardRenderer && (
        <div className="md:hidden space-y-4">
          {sortedData.map((row) => (
            <MobileCardWrapper
              key={keyExtractor(row)}
              row={row}
              keyExtractor={keyExtractor}
              mobileCardRenderer={mobileCardRenderer}
            />
          ))}
        </div>
      )}
    </>
  );
}
