"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { RFI, RFIStatus } from "@/lib/types";
import Link from "next/link";

export interface RFIBannerProps {
  rfis: RFI[];
  applicationId: string;
}

export function RFIBanner({ rfis, applicationId }: RFIBannerProps) {
  const openRFIs = rfis.filter((rfi) => rfi.status === RFIStatus.OPEN);

  if (openRFIs.length === 0) {
    return null;
  }

  const getSectionLabel = (sectionKey: string): string => {
    const labels: Record<string, string> = {
      profile: "Profile",
      income: "Employment & Income",
      financials: "Financial Summary",
      documents: "Documents",
      disclosures: "Disclosures",
      review: "Review & Submit",
    };
    return labels[sectionKey] || sectionKey;
  };

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Action Required: Information Requested</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          {openRFIs.length === 1
            ? "There is 1 outstanding request for information."
            : `There are ${openRFIs.length} outstanding requests for information.`}
        </p>
        <div className="space-y-2">
          {openRFIs.map((rfi) => (
            <div key={rfi.id} className="flex items-center justify-between bg-white/10 dark:bg-black/20 rounded-lg p-3">
              <div>
                <p className="font-medium">{getSectionLabel(rfi.sectionKey)}</p>
                <p className="text-sm opacity-90">
                  {rfi.messages.length} {rfi.messages.length === 1 ? "message" : "messages"}
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/applications/${applicationId}/${rfi.sectionKey}`}>
                  View & Respond
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
