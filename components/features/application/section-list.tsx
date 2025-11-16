"use client";

import { SectionCard, SectionStatus } from "./section-card";
import { Application, TransactionType } from "@/lib/types";

export interface SectionDefinition {
  key: string;
  title: string;
  description: string;
  href: string;
  isRequired: boolean;
  showForTransactions?: TransactionType[];
}

const sectionDefinitions: SectionDefinition[] = [
  {
    key: "building-policies",
    title: "Building Policies",
    description: "Review building-specific policies and requirements",
    href: "/building-policies",
    isRequired: true,
  },
  {
    key: "lease-terms",
    title: "Lease Terms",
    description: "Proposed lease terms and financial details",
    href: "/lease-terms",
    isRequired: true,
  },
  {
    key: "parties",
    title: "Deal Parties",
    description: "Unit owner, brokers, and attorneys involved in the transaction",
    href: "/parties",
    isRequired: true,
  },
  {
    key: "profile",
    title: "Profile",
    description: "Personal information and address history",
    href: "/profile",
    isRequired: true,
  },
  {
    key: "income",
    title: "Employment & Income",
    description: "Employment history and income documentation",
    href: "/income",
    isRequired: true,
  },
  {
    key: "financials",
    title: "Financial Summary",
    description: "Assets, liabilities, and monthly cash flow",
    href: "/financials",
    isRequired: true,
  },
  {
    key: "documents",
    title: "Documents",
    description: "Upload required supporting documents",
    href: "/documents",
    isRequired: true,
  },
  {
    key: "disclosures",
    title: "Disclosures",
    description: "Required acknowledgments and disclosures",
    href: "/disclosures",
    isRequired: true,
    showForTransactions: [TransactionType.CONDO_LEASE, TransactionType.COOP_SUBLET],
  },
  {
    key: "review",
    title: "Review & Submit",
    description: "Review your application and submit",
    href: "/review",
    isRequired: true,
  },
];

export interface SectionListProps {
  application: Application;
}

export function SectionList({ application }: SectionListProps) {
  const getSectionStatus = (sectionKey: string): SectionStatus => {
    const section = application.sections.find((s) => s.key === sectionKey);

    if (!section) return "incomplete";

    // Check if there's an RFI for this section
    const hasRFI = application.rfis.some(
      (rfi) => rfi.sectionKey === sectionKey && rfi.status === "OPEN"
    );

    if (hasRFI) return "error";

    return section.isComplete ? "complete" : "incomplete";
  };

  const hasRFI = (sectionKey: string): boolean => {
    return application.rfis.some(
      (rfi) => rfi.sectionKey === sectionKey && rfi.status === "OPEN"
    );
  };

  const visibleSections = sectionDefinitions.filter((section) => {
    if (!section.showForTransactions) return true;
    return section.showForTransactions.includes(application.transactionType);
  });

  return (
    <div className="space-y-4">
      {visibleSections.map((section) => (
        <SectionCard
          key={section.key}
          title={section.title}
          description={section.description}
          status={getSectionStatus(section.key)}
          href={section.href}
          applicationId={application.id}
          hasRFI={hasRFI(section.key)}
        />
      ))}
    </div>
  );
}
