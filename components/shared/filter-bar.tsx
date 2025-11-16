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
import { Card } from "@/components/ui/card";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

export interface FilterOption {
  value: string;
  label: string;
}

export interface SelectFilterConfig {
  type: "select";
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

export interface DateRangeFilterConfig {
  type: "date-range";
  key: string;
  label: string;
  placeholder?: string;
}

export type FilterConfig = SelectFilterConfig | DateRangeFilterConfig;

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  showClearButton?: boolean;
}

export function FilterBar({
  filters,
  values,
  onChange,
  showClearButton = true,
}: FilterBarProps) {
  // Check if any filters are active (non-default values)
  const hasActiveFilters = filters.some((filter) => {
    const value = values[filter.key];
    if (filter.type === "select") {
      return value && value !== "ALL" && value !== "all";
    } else if (filter.type === "date-range") {
      const dateRange = value as { from?: Date; to?: Date } | undefined;
      return dateRange?.from !== undefined || dateRange?.to !== undefined;
    }
    return false;
  });

  const clearFilters = () => {
    filters.forEach((filter) => {
      if (filter.type === "select") {
        onChange(filter.key, "ALL");
      } else if (filter.type === "date-range") {
        onChange(filter.key, { from: undefined, to: undefined });
      }
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-4">
        {filters.map((filter) => {
          if (filter.type === "select") {
            return (
              <div key={filter.key} className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">
                  {filter.label}
                </label>
                <Select
                  value={String(values[filter.key] || "ALL")}
                  onValueChange={(value) => onChange(filter.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          } else if (filter.type === "date-range") {
            const dateRange = (values[filter.key] as { from?: Date; to?: Date }) || { from: undefined, to: undefined };
            return (
              <div key={filter.key} className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">
                  {filter.label}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
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
                        <span>{filter.placeholder || "Pick a date range"}</span>
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
                        onChange(filter.key, {
                          from: range?.from,
                          to: range?.to,
                        })
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            );
          }
          return null;
        })}

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && (
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
