"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Application } from "@/lib/types";

type SectionStatus = "not-started" | "in-progress" | "complete" | "error";

const TOTAL_SECTIONS = 13; // Total number of application sections

export function ApplicationProgressBar({ applicationId }: { applicationId: string }) {
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(TOTAL_SECTIONS);

  useEffect(() => {
    const applications = JSON.parse(localStorage.getItem("applications") || "[]") as Application[];
    const application = applications.find((app) => app.id === applicationId);

    if (!application) return;

    const statuses: Record<string, SectionStatus> = {
      overview: "complete", // Always complete
      "building-policies": "complete", // Review only, always complete
    };

    // Lease Terms - check localStorage
    const leaseTermsData = localStorage.getItem(`lease-terms_${applicationId}`);
    statuses["lease-terms"] = leaseTermsData ? "complete" : "not-started";

    // Parties - check localStorage
    const partiesData = localStorage.getItem(`parties_${applicationId}`);
    statuses.parties = partiesData ? "complete" : "not-started";

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
    const completed = Object.values(statuses).filter(status => status === "complete").length;
    setCompletedCount(completed);
    setTotalCount(TOTAL_SECTIONS);
  }, [applicationId]);

  const progressPercentage = (completedCount / totalCount) * 100;

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
