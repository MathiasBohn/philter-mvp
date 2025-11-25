"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Building2,
  UserCircle,
  ClipboardCheck,
  MessageSquare,
  CheckCircle,
  Circle,
  AlertCircle,
  XCircle,
  Menu,
  X,
  Send,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useApplication } from "@/lib/hooks/use-applications";

type SectionStatus = "not-started" | "in-progress" | "complete" | "error";

interface ApplicationSection {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  description: string;
}

const SECTIONS: ApplicationSection[] = [
  {
    id: "overview",
    label: "Overview",
    path: "",
    icon: Home,
    description: "Application summary",
  },
  {
    id: "building-policies",
    label: "Building Policies",
    path: "/building-policies",
    icon: Building2,
    description: "Review building requirements",
  },
  {
    id: "lease-terms",
    label: "Lease Terms",
    path: "/lease-terms",
    icon: FileText,
    description: "Proposed lease terms",
  },
  {
    id: "parties",
    label: "Deal Parties",
    path: "/parties",
    icon: Users,
    description: "Unit owner, brokers, attorneys",
  },
  {
    id: "people",
    label: "People",
    path: "/people",
    icon: Users,
    description: "Co-applicants & guarantors",
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: UserCircle,
    description: "Personal information",
  },
  {
    id: "income",
    label: "Income & Employment",
    path: "/income",
    icon: Briefcase,
    description: "Employment history",
  },
  {
    id: "financials",
    label: "Financials",
    path: "/financials",
    icon: DollarSign,
    description: "Assets & liabilities",
  },
  {
    id: "real-estate",
    label: "Real Estate",
    path: "/real-estate",
    icon: Building2,
    description: "Property holdings",
  },
  {
    id: "documents",
    label: "Documents",
    path: "/documents",
    icon: FileText,
    description: "Upload required documents",
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    path: "/cover-letter",
    icon: MessageSquare,
    description: "Personal introduction",
  },
  {
    id: "disclosures",
    label: "Disclosures",
    path: "/disclosures",
    icon: ClipboardCheck,
    description: "Sign acknowledgements",
  },
  {
    id: "review",
    label: "Review & Submit",
    path: "/review",
    icon: Send,
    description: "Final review and submission",
  },
];

const getStatusIcon = (status: SectionStatus) => {
  switch (status) {
    case "complete":
      return <CheckCircle className="h-4 w-4 text-primary" />;
    case "in-progress":
      return <AlertCircle className="h-4 w-4 text-warning" />;
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/50" />;
  }
};

interface SidebarContentProps {
  applicationId: string;
  pathname: string;
  sectionStatuses: Record<string, SectionStatus>;
  setIsOpen: (isOpen: boolean) => void;
  handleNavigate: (path: string) => void;
}

function SidebarContent({ applicationId, pathname, sectionStatuses, setIsOpen, handleNavigate }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-semibold text-sm">Application Sections</h2>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Sections List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {SECTIONS.map((section) => {
          const isActive = pathname === `/applications/${applicationId}${section.path}`;
          const status = sectionStatuses[section.id] || "not-started";
          const Icon = section.icon;

          return (
            <button
              key={section.id}
              onClick={() => handleNavigate(section.path)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-md transition-colors text-left",
                "hover:bg-accent",
                isActive && "bg-accent font-semibold",
                !isActive && "text-muted-foreground"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{section.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function ApplicationSidebar({ applicationId }: { applicationId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: application, isLoading } = useApplication(applicationId);

  // Calculate section statuses based on application data using useMemo
  const sectionStatuses = useMemo(() => {
    if (!application) return {};

    const statuses: Record<string, SectionStatus> = {
      overview: "complete", // Always complete
      "building-policies": "complete", // Review only, always complete
    };

    // Lease Terms - check application data (optional section for sublets/leases)
    statuses["lease-terms"] = application.leaseTerms ? "complete" : "not-started";

    // Parties - check application data (participants)
    statuses.parties = application.participants && application.participants.length > 0 ? "complete" : "not-started";

    // Profile - check ALL required fields, not just fullName
    if (application.people && application.people.length > 0) {
      const primaryApplicant = application.people[0];
      const applicantRecord = primaryApplicant as Record<string, unknown>; // Type assertion for optional fields
      // Required: fullName, email, phone, dateOfBirth, ssn, and at least 2 years of address history
      const hasBasicInfo = primaryApplicant.fullName &&
                          primaryApplicant.email &&
                          primaryApplicant.phone &&
                          (applicantRecord.dateOfBirth || primaryApplicant.dob) &&
                          (applicantRecord.ssn || primaryApplicant.ssnFull);

      const hasAddressHistory = primaryApplicant.addressHistory &&
                               primaryApplicant.addressHistory.length > 0;

      const hasEmergencyContact = Array.isArray(applicantRecord.emergencyContacts) &&
                                 (applicantRecord.emergencyContacts as unknown[]).length > 0;

      if (hasBasicInfo && hasAddressHistory && hasEmergencyContact) {
        statuses.profile = "complete";
      } else if (hasBasicInfo || hasAddressHistory) {
        statuses.profile = "in-progress";
      } else {
        statuses.profile = "not-started";
      }
    } else {
      statuses.profile = "not-started";
    }

    // People - check for co-applicants/guarantors (optional section)
    statuses.people = application.people.length > 1 ? "complete" : "not-started";

    // Income & Employment - at least one employment record required
    if (application.employmentRecords && application.employmentRecords.length > 0) {
      const hasCompleteRecord = application.employmentRecords.some(
        (record: { employer?: string; title?: string; annualIncome?: number }) =>
          record.employer && record.title && record.annualIncome
      );
      statuses.income = hasCompleteRecord ? "complete" : "in-progress";
    } else {
      statuses.income = "not-started";
    }

    // Financials - should have assets AND liabilities entries
    if (application.financialEntries && application.financialEntries.length > 0) {
      const hasAssets = application.financialEntries.some(
        (entry: { category?: string }) => entry.category && entry.category.includes('ASSET')
      );
      const hasLiabilities = application.financialEntries.some(
        (entry: { category?: string }) => entry.category && entry.category.includes('LIABILITY')
      );

      if (hasAssets && hasLiabilities) {
        statuses.financials = "complete";
      } else if (hasAssets || hasLiabilities) {
        statuses.financials = "in-progress";
      } else {
        statuses.financials = "not-started";
      }
    } else {
      statuses.financials = "not-started";
    }

    // Real Estate - optional section
    statuses["real-estate"] = application.realEstateProperties &&
                              application.realEstateProperties.length > 0 ? "complete" : "not-started";

    // Documents - check for required document categories
    if (application.documents && application.documents.length > 0) {
      const requiredCategories = ['GOVERNMENT_ID', 'BANK_STATEMENT', 'TAX_RETURN'];
      const uploadedCategories = new Set(
        application.documents.map((doc: { category?: string }) => doc.category)
      );
      const hasAllRequired = requiredCategories.every(cat => uploadedCategories.has(cat));

      if (hasAllRequired) {
        statuses.documents = "complete";
      } else if (application.documents.length > 0) {
        statuses.documents = "in-progress";
      } else {
        statuses.documents = "not-started";
      }
    } else {
      statuses.documents = "not-started";
    }

    // Cover Letter - should have meaningful content (at least 100 characters)
    statuses["cover-letter"] = application.coverLetter && application.coverLetter.length >= 100 ? "complete" :
                              application.coverLetter && application.coverLetter.length > 0 ? "in-progress" : "not-started";

    // Disclosures - must accept all required disclosures (8 total for NYC)
    statuses.disclosures = application.disclosures && application.disclosures.length >= 8 ? "complete" :
                           application.disclosures && application.disclosures.length > 0 ? "in-progress" : "not-started";

    // Review & Submit - complete only when actually submitted
    statuses.review = application.status === "SUBMITTED" || application.status === "IN_REVIEW" ||
                      application.status === "RFI" || application.status === "APPROVED" ||
                      application.status === "CONDITIONAL" || application.status === "DENIED" ? "complete" : "not-started";

    return statuses;
  }, [application]);

  const handleNavigate = (path: string) => {
    router.push(`/applications/${applicationId}${path}`);
    setIsOpen(false); // Close mobile menu
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          disabled
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Sidebar - Desktop Loading */}
        <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-r lg:border-border lg:bg-sidebar overflow-hidden" aria-label="Application navigation">
          <div className="p-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-border z-50 transition-transform lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          applicationId={applicationId}
          pathname={pathname}
          sectionStatuses={sectionStatuses}
          setIsOpen={setIsOpen}
          handleNavigate={handleNavigate}
        />
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-r lg:border-border lg:bg-sidebar overflow-hidden" aria-label="Application navigation">
        <SidebarContent
          applicationId={applicationId}
          pathname={pathname}
          sectionStatuses={sectionStatuses}
          setIsOpen={setIsOpen}
          handleNavigate={handleNavigate}
        />
      </aside>
    </>
  );
}
