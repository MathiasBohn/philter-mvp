"use client";

import { Input } from "@/components/ui/input";

interface MonthYearInputProps {
  id?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  "aria-invalid"?: "true" | "false";
  "aria-describedby"?: string;
  "aria-required"?: "true" | "false";
}

/**
 * MonthYearInput component for entering dates with month/year precision.
 * Uses the HTML5 month input type (YYYY-MM format).
 * Suitable for employment dates, education dates, and address history dates.
 */
export function MonthYearInput({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  ...ariaProps
}: MonthYearInputProps) {
  // Convert Date to YYYY-MM format for the input
  const formatToMonthInput = (date: Date | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // Convert YYYY-MM string to Date object (first day of month)
  const parseFromMonthInput = (value: string): Date | undefined => {
    if (!value) return undefined;
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  };

  const inputValue = formatToMonthInput(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(parseFromMonthInput(newValue));
  };

  return (
    <div className="space-y-2">
      <Input
        id={id}
        type="month"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={ariaProps["aria-invalid"]}
        aria-describedby={ariaProps["aria-describedby"]}
        aria-required={ariaProps["aria-required"]}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
