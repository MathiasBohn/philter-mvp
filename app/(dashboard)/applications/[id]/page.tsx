"use client";

import { use, useEffect } from "react";
import { useApplication } from "@/lib/hooks/use-applications";
import { useRFIs } from "@/lib/hooks/use-rfis";
import { SectionList } from "@/components/features/application/section-list";
import { InviteWidget } from "@/components/features/application/invite-widget";
import { RFIBanner } from "@/components/features/application/rfi-banner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function ApplicationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: application, isLoading, error, isFetching, status, fetchStatus } = useApplication(id);
  const { data: rfis } = useRFIs(id, !!id);

  // Debug logging
  useEffect(() => {
    console.log('[ApplicationPage] State:', {
      id,
      isLoading,
      isFetching,
      status,
      fetchStatus,
      hasApplication: !!application,
      hasError: !!error,
      errorMessage: error?.message,
      applicationId: application?.id,
      transactionType: application?.transactionType,
    });
  }, [id, isLoading, isFetching, status, fetchStatus, application, error]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-5 w-80" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />

          <div>
            <Skeleton className="h-7 w-48 mb-4" />
            <div className="grid gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Overview</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load application</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {error.message || "An error occurred while loading the application."}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
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
        return <Badge className="bg-primary text-primary-foreground">Approved</Badge>;
      case "CONDITIONAL":
        return <Badge className="bg-warning text-warning-foreground">Conditional Approval</Badge>;
      case "DENIED":
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Application Overview</h1>
          {getStatusBadge()}
        </div>
        <p className="mt-2 text-muted-foreground">
          {application.building?.name} - {application.building?.address.street}
        </p>
      </div>

      {/* RFI Banner */}
      <RFIBanner rfis={rfis || []} applicationId={id} />

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
