"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type ReasonCode =
  | "income_insufficient"
  | "dti_too_high"
  | "incomplete_documentation"
  | "unsatisfactory_references"
  | "board_policy_criteria_not_met"
  | "other";

const reasonCodeLabels: Record<ReasonCode, string> = {
  income_insufficient: "Income insufficient",
  dti_too_high: "DTI too high",
  incomplete_documentation: "Incomplete documentation",
  unsatisfactory_references: "Unsatisfactory references",
  board_policy_criteria_not_met: "Board policy criteria not met",
  other: "Other",
};

interface ReasonTagsProps {
  selectedReasons: ReasonCode[];
  onReasonsChange: (reasons: ReasonCode[]) => void;
  disabled?: boolean;
}

export function ReasonTags({
  selectedReasons,
  onReasonsChange,
  disabled = false,
}: ReasonTagsProps) {
  const allReasons: ReasonCode[] = [
    "income_insufficient",
    "dti_too_high",
    "incomplete_documentation",
    "unsatisfactory_references",
    "board_policy_criteria_not_met",
    "other",
  ];

  const handleToggle = (reason: ReasonCode) => {
    if (disabled) return;

    if (selectedReasons.includes(reason)) {
      onReasonsChange(selectedReasons.filter((r) => r !== reason));
    } else {
      onReasonsChange([...selectedReasons, reason]);
    }
  };

  return (
    <div className="space-y-3">
      {allReasons.map((reason) => (
        <div key={reason} className="flex items-center space-x-2">
          <Checkbox
            id={reason}
            checked={selectedReasons.includes(reason)}
            onCheckedChange={() => handleToggle(reason)}
            disabled={disabled}
          />
          <Label
            htmlFor={reason}
            className="text-sm font-normal cursor-pointer"
          >
            {reasonCodeLabels[reason]}
          </Label>
        </div>
      ))}
    </div>
  );
}
