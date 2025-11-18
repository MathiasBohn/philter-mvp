"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { Application } from "@/lib/types";

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
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "in-progress":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Circle className="h-4 w-4 text-gray-300" />;
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

      <Separator />

      {/* Status Legend */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-gray-300" />
            <span className="text-muted-foreground">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-yellow-600" />
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplicationSidebar({ applicationId }: { applicationId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Calculate section statuses based on application data using useMemo
  const sectionStatuses = useMemo(() => {
    const applications = JSON.parse(localStorage.getItem("applications") || "[]") as Application[];
    const application = applications.find((app) => app.id === applicationId);

    if (!application) return {};

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

    return statuses;
  }, [applicationId]);

  const handleNavigate = (path: string) => {
    router.push(`/applications/${applicationId}${path}`);
    setIsOpen(false); // Close mobile menu
  };

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
          "fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-950 border-r dark:border-gray-800 z-50 transition-transform lg:hidden",
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
      <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:border-r lg:bg-white dark:bg-gray-950 dark:border-gray-800 overflow-hidden" aria-label="Application navigation">
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
