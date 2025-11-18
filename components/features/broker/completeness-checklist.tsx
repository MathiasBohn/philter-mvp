"use client"

import { Application } from "@/lib/types";
import { Check, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionOverride } from "./override-modal";

interface CompletenessChecklistProps {
  application: Application;
  overrides?: SectionOverride[];
  onOverride?: (sectionKey: string, sectionLabel: string) => void;
}

export function CompletenessChecklist({ application, overrides = [], onOverride }: CompletenessChecklistProps) {
  const getOverrideForSection = (key: string) => {
    return overrides.find((o) => o.sectionKey === key);
  };

  const requirements = [
    {
      key: "profile",
      label: "Profile complete",
      completed: application.sections.find((s) => s.key === "profile")?.isComplete || false,
    },
    {
      key: "income",
      label: "Employment/income documented",
      completed: application.sections.find((s) => s.key === "income")?.isComplete || false,
    },
    {
      key: "financials",
      label: "Financials complete",
      completed: application.sections.find((s) => s.key === "financials")?.isComplete || false,
    },
    {
      key: "documents",
      label: "Documents uploaded",
      completed: application.sections.find((s) => s.key === "documents")?.isComplete || false,
    },
  ];

  // Add disclosures check for lease/sublet
  if (
    application.transactionType === "CONDO_LEASE" ||
    application.transactionType === "COOP_SUBLET"
  ) {
    requirements.push({
      key: "disclosures",
      label: "Disclosures acknowledged",
      completed:
        application.sections.find((s) => s.key === "disclosures")?.isComplete || false,
    });
  }

  // Count completed items (either actually complete or overridden)
  const completedCount = requirements.filter((r) => r.completed || getOverrideForSection(r.key)).length;
  const totalCount = requirements.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">
          {completedCount} of {totalCount} complete
        </span>
        <span className="text-muted-foreground">
          {Math.round((completedCount / totalCount) * 100)}%
        </span>
      </div>
      {requirements.map((req, idx) => {
        const override = getOverrideForSection(req.key);
        const isCompleted = req.completed || !!override;

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  override ? "bg-yellow-600" : "bg-green-600"
                }`}>
                  {override ? (
                    <ShieldAlert className="h-3 w-3 text-white" />
                  ) : (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              ) : (
                <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              <span className={`text-sm flex-1 ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                {req.label}
              </span>
              {!req.completed && !override && onOverride && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOverride(req.key, req.label)}
                  className="h-7 text-xs"
                >
                  Override
                </Button>
              )}
            </div>
            {override && (
              <div className="ml-7 space-y-1">
                <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-950/20 border-yellow-600">
                  Manually Overridden
                </Badge>
                <p className="text-xs text-muted-foreground" title={`By: ${override.overriddenBy}\nAt: ${override.overriddenAt.toLocaleString()}`}>
                  Reason: {override.reason}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
