"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplication } from "@/lib/hooks/use-applications";

type SectionStatus = "not-started" | "in-progress" | "complete" | "error";

const TOTAL_SECTIONS = 13; // Total number of application sections

export function ApplicationProgressBar({ applicationId }: { applicationId: string }) {
  const { data: application, isLoading } = useApplication(applicationId);

  const completedCount = useMemo(() => {
    if (!application) return 0;

    const statuses: Record<string, SectionStatus> = {
      overview: "complete", // Always complete
      "building-policies": "complete", // Review only, always complete
    };

    // Lease Terms - check application data
    statuses["lease-terms"] = application.leaseTerms ? "complete" : "not-started";

    // Parties - check application data (participants)
    statuses.parties = application.participants && application.participants.length > 0 ? "complete" : "not-started";

    // Profile - check if basic info exists
    if (application.people && application.people.length > 0) {
      const primaryApplicant = application.people[0];
      statuses.profile = primaryApplicant.fullName ? "complete" : "not-started";
    } else {
      statuses.profile = "not-started";
    }

    // People - check for additional people
    statuses.people = application.people.length > 1 ? "complete" : "not-started";

    // Income & Employment
    statuses.income = application.employmentRecords && application.employmentRecords.length > 0 ? "complete" : "not-started";

    // Financials
    statuses.financials = application.financialEntries && application.financialEntries.length > 0 ? "complete" : "not-started";

    // Real Estate
    statuses["real-estate"] = "not-started"; // Will be updated when data exists

    // Documents
    statuses.documents = application.documents && application.documents.length > 0 ? "complete" : "not-started";

    // Cover Letter
    statuses["cover-letter"] = application.coverLetter && application.coverLetter.length > 0 ? "complete" : "not-started";

    // Disclosures
    statuses.disclosures = application.disclosures && application.disclosures.length >= 8 ? "complete" :
                           application.disclosures && application.disclosures.length > 0 ? "in-progress" : "not-started";

    // Review & Submit - always available but completion depends on submission status
    statuses.review = application.status === "SUBMITTED" || application.status === "IN_REVIEW" ||
                      application.status === "RFI" || application.status === "APPROVED" ||
                      application.status === "CONDITIONAL" || application.status === "DENIED" ? "complete" : "not-started";

    // Count completed sections
    return Object.values(statuses).filter(status => status === "complete").length;
  }, [application]);

  const totalCount = TOTAL_SECTIONS;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-6">
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mb-6">
      <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Application Progress</span>
            <span className="font-semibold text-lg">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedCount} of {totalCount} sections complete
            </span>
            <span>
              {completedCount === totalCount ? "Application Complete!" : `${totalCount - completedCount} remaining`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
