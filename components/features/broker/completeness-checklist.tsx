import { Application } from "@/lib/types";
import { Check, X } from "lucide-react";

interface CompletenessChecklistProps {
  application: Application;
}

export function CompletenessChecklist({ application }: CompletenessChecklistProps) {
  const requirements = [
    {
      label: "Profile complete",
      completed: application.sections.find((s) => s.key === "profile")?.isComplete || false,
    },
    {
      label: "Employment/income documented",
      completed: application.sections.find((s) => s.key === "income")?.isComplete || false,
    },
    {
      label: "Financials complete",
      completed: application.sections.find((s) => s.key === "financials")?.isComplete || false,
    },
    {
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
      label: "Disclosures acknowledged",
      completed:
        application.sections.find((s) => s.key === "disclosures")?.isComplete || false,
    });
  }

  const completedCount = requirements.filter((r) => r.completed).length;
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
      {requirements.map((req, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {req.completed ? (
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <X className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <span className={`text-sm ${req.completed ? "text-foreground" : "text-muted-foreground"}`}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}
