"use client";

import { use, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { ReviewNavigator } from "@/components/features/admin/review-navigator";
import { DataPanel } from "@/components/features/admin/data-panel";
import { RFIThread } from "@/components/features/admin/rfi-thread";
import { RFIComposer } from "@/components/features/admin/rfi-composer";
import { ActivityLog } from "@/components/features/admin/activity-log";
import { DecisionPanel } from "@/components/features/admin/decision-panel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockApplications } from "@/lib/mock-data/applications";
import { mockRFIs } from "@/lib/mock-data/rfis";
import {
  Role,
  RFIStatus,
  ActivityLogEntry,
  RFIMessage,
  DecisionRecord,
} from "@/lib/types";

export default function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentSection, setCurrentSection] = useState("profile");
  const [rfis, setRfis] = useState(mockRFIs);

  // Find the application
  const application = mockApplications.find((app) => app.id === id);

  if (!application) {
    notFound();
  }

  // Generate mock activity log entries
  const activityLog: ActivityLogEntry[] = useMemo(() => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return [
      {
        id: "act-1",
        applicationId: id,
        userId: "user-1",
        userName: application.people[0]?.fullName || "Applicant",
        userRole: Role.APPLICANT,
        action: "submit",
        description: "Submitted application for review",
        timestamp: application.submittedAt || new Date(),
      },
      {
        id: "act-2",
        applicationId: id,
        userId: "user-4",
        userName: "David Martinez",
        userRole: Role.ADMIN,
        action: "review",
        description: "Started reviewing application",
        timestamp: twoDaysAgo,
      },
      ...(rfis
        .filter((rfi) => rfi.applicationId === id)
        .map((rfi, index) => ({
          id: `act-rfi-${index}`,
          applicationId: id,
          userId: rfi.createdBy,
          userName: "David Martinez",
          userRole: Role.ADMIN as Role,
          action: "RFI created",
          description: `Created RFI for ${rfi.sectionKey} section`,
          timestamp: rfi.createdAt,
        }))),
    ];
  }, [id, application, rfis]);

  const handleCreateRFI = (data: {
    sectionKey: string;
    assigneeRole: Role.APPLICANT | Role.BROKER;
    message: string;
  }) => {
    const newRFI = {
      id: `rfi-${Date.now()}`,
      applicationId: id,
      sectionKey: data.sectionKey,
      status: RFIStatus.OPEN,
      assigneeRole: data.assigneeRole,
      createdBy: "user-4", // Property Manager user
      createdAt: new Date(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          authorId: "user-4",
          authorName: "David Martinez",
          authorRole: Role.ADMIN,
          message: data.message,
          createdAt: new Date(),
        } as RFIMessage,
      ],
    };

    setRfis([...rfis, newRFI]);
  };

  const handleReplyRFI = (rfiId: string, message: string) => {
    setRfis(
      rfis.map((rfi) => {
        if (rfi.id === rfiId) {
          return {
            ...rfi,
            messages: [
              ...rfi.messages,
              {
                id: `msg-${Date.now()}`,
                authorId: "user-4",
                authorName: "David Martinez",
                authorRole: Role.ADMIN,
                message,
                createdAt: new Date(),
              } as RFIMessage,
            ],
          };
        }
        return rfi;
      })
    );
  };

  const handleResolveRFI = (rfiId: string) => {
    setRfis(
      rfis.map((rfi) => {
        if (rfi.id === rfiId) {
          return {
            ...rfi,
            status: RFIStatus.RESOLVED,
            resolvedAt: new Date(),
          };
        }
        return rfi;
      })
    );
  };

  const handleDecisionSubmit = (decisionRecord: DecisionRecord) => {
    // In a real app, this would update the application status in the backend
    // Could also update local state to show the decision was recorded
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SUBMITTED":
      case "IN_REVIEW":
        return "secondary";
      case "RFI":
        return "destructive";
      case "APPROVED":
        return "default";
      case "CONDITIONAL":
        return "outline";
      case "DENIED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Review Application</h1>
            <p className="text-muted-foreground mt-2">
              {application.people[0]?.fullName || "Unknown Applicant"} •{" "}
              {application.building?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusBadgeVariant(application.status)}>
              {application.status}
            </Badge>
            <RFIComposer
              application={application}
              onCreateRFI={handleCreateRFI}
            />
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section Navigator (25%) */}
        <div className="w-1/4 min-w-[250px] max-w-[350px]">
          <ReviewNavigator
            application={{ ...application, rfis }}
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />
        </div>

        {/* Center: Data Panel (50%) */}
        <div className="flex-1 border-x">
          <DataPanel
            application={application}
            sectionKey={currentSection}
            showFullSSN={true}
          />
        </div>

        {/* Right: RFI Thread + Activity Log + Decision Panel (25%) */}
        <div className="w-1/4 min-w-[300px] max-w-[400px]">
          <Tabs defaultValue="rfis" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="rfis">RFIs</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="decision">Decision</TabsTrigger>
            </TabsList>
            <TabsContent value="rfis" className="flex-1 mt-0 overflow-hidden">
              <RFIThread
                rfis={rfis}
                applicationId={id}
                onReply={handleReplyRFI}
                onResolve={handleResolveRFI}
              />
            </TabsContent>
            <TabsContent value="activity" className="flex-1 mt-0 overflow-hidden">
              <ActivityLog activities={activityLog} />
            </TabsContent>
            <TabsContent value="decision" className="flex-1 mt-0 overflow-auto p-4">
              <DecisionPanel
                application={application}
                onDecisionSubmit={handleDecisionSubmit}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
