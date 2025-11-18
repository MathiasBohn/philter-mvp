"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { US_STATES } from "@/lib/data/us-states";

interface StateSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  "aria-invalid"?: "true" | "false";
  "aria-describedby"?: string;
  "aria-required"?: "true" | "false";
}

export function StateSelect({
  id,
  value,
  onChange,
  placeholder = "Select State",
  disabled = false,
  required = false,
  error,
  ...ariaProps
}: StateSelectProps) {
  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-required={required ? "true" : "false"}
          aria-invalid={ariaProps["aria-invalid"]}
          aria-describedby={ariaProps["aria-describedby"]}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {US_STATES.map((state) => (
            <SelectItem key={state.code} value={state.code}>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
