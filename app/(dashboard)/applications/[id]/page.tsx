"use client";

import { use, useState, useEffect } from "react";
import { mockApplications } from "@/lib/mock-data";
import { SectionList } from "@/components/features/application/section-list";
import { InviteWidget } from "@/components/features/application/invite-widget";
import { RFIBanner } from "@/components/features/application/rfi-banner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BuildingType } from "@/lib/types";
import { notFound } from "next/navigation";
import { storage } from "@/lib/persistence";
import { mockRFIs } from "@/lib/mock-data/rfis";

export default function ApplicationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [application, setApplication] = useState(() => {
    const mockApp = mockApplications.find((app) => app.id === id);
    if (mockApp) {
      return {
        ...mockApp,
        rfis: storage.getRFIsForApplication(id, mockRFIs)
      };
    }
    return mockApp;
  });
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(!mockApplications.find((app) => app.id === id));

  useEffect(() => {
    // Sync form data to application storage
    storage.syncFormDataToApplication(id);

    // If not found in mock data, try localStorage
    if (!application && isLoadingFromStorage) {
      try {
        const storedApp = localStorage.getItem(`application_${id}`);
        if (storedApp) {
          const parsedApp = JSON.parse(storedApp);
          // Transform localStorage format to match Application type
          const transformedApp = {
            id: parsedApp.id,
            buildingId: parsedApp.buildingCode,
            building: {
              id: parsedApp.buildingCode,
              code: parsedApp.buildingCode,
              name: "Demo Building",
              type: BuildingType.CONDO,
              address: {
                street: "123 Main St",
                city: "New York",
                state: "NY",
                zip: "10001"
              },
              managementCompanyId: "demo-mgmt"
            },
            unit: undefined,
            transactionType: parsedApp.transactionType,
            status: parsedApp.status,
            createdBy: "current-user",
            createdAt: new Date(parsedApp.createdAt),
            lastActivityAt: new Date(parsedApp.createdAt),
            people: [],
            employmentRecords: [],
            financialEntries: [],
            documents: [],
            disclosures: [],
            participants: [],
            sections: Object.entries(parsedApp.sections || {}).map(([key, value]) => ({
              key: key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              isComplete: (value as { complete?: boolean }).complete || false,
              data: undefined
            })),
            completionPercentage: 0,
            rfis: storage.getRFIsForApplication(id, mockRFIs),
            isLocked: false
          };

          // Calculate completion percentage
          const completedSections = transformedApp.sections.filter(s => s.isComplete).length;
          transformedApp.completionPercentage = Math.round((completedSections / transformedApp.sections.length) * 100);

          setApplication(transformedApp);
        } else {
          // Try to load from storage utility
          const storedApplication = storage.getApplication(id, mockApplications);
          if (storedApplication) {
            setApplication({
              ...storedApplication,
              rfis: storage.getRFIsForApplication(id, mockRFIs)
            });
          }
        }
      } catch (error) {
        console.error("Error loading application from localStorage:", error);
      } finally {
        setIsLoadingFromStorage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoadingFromStorage]);

  // Show loading state while checking localStorage
  if (isLoadingFromStorage) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    notFound();
  }

  const handleInvite = () => {
    // In a real app, this would make an API call
    // Could also update localStorage or mock data here
  };

  const getStatusBadge = () => {
    switch (application.status) {
      case "IN_PROGRESS":
        return <Badge variant="secondary">In Progress</Badge>;
      case "SUBMITTED":
        return <Badge>Submitted</Badge>;
      case "IN_REVIEW":
        return <Badge variant="outline">In Review</Badge>;
      case "RFI":
        return <Badge variant="destructive">RFI Required</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-600 dark:bg-green-700">Approved</Badge>;
      case "CONDITIONAL":
        return <Badge className="bg-yellow-600 dark:bg-yellow-700">Conditional Approval</Badge>;
      case "DENIED":
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Application Overview</h1>
          {getStatusBadge()}
        </div>
        <p className="mt-2 text-muted-foreground">
          {application.building?.name} - {application.building?.address.street}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground">{application.completionPercentage}% complete</span>
        </div>
        <Progress value={application.completionPercentage} className="h-2" />
      </div>

      {/* RFI Banner */}
      <RFIBanner rfis={application.rfis} applicationId={id} />

      {/* Section List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Application Sections</h2>
        <SectionList application={application} />
      </div>

      {/* Invite Widget */}
      {!application.isLocked && (
        <InviteWidget applicationId={id} onInvite={handleInvite} />
      )}
    </div>
  );
}
