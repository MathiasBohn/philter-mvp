"use client";

import { use } from "react";
import { mockApplications } from "@/lib/mock-data";
import { SectionList } from "@/components/features/application/section-list";
import { InviteWidget } from "@/components/features/application/invite-widget";
import { RFIBanner } from "@/components/features/application/rfi-banner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/lib/types";
import { notFound } from "next/navigation";

export default function ApplicationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const application = mockApplications.find((app) => app.id === id);

  if (!application) {
    notFound();
  }

  const handleInvite = (email: string, role: Role.CO_APPLICANT | Role.GUARANTOR) => {
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
        return <Badge className="bg-green-600">Approved</Badge>;
      case "CONDITIONAL":
        return <Badge className="bg-yellow-600">Conditional Approval</Badge>;
      case "DENIED":
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
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
