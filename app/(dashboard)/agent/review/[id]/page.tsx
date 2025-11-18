"use client";

import { use, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { ReviewNavigator } from "@/components/features/agent/review-navigator";
import { DataPanel } from "@/components/features/agent/data-panel";
import { RFIThread } from "@/components/features/agent/rfi-thread";
import { RFIComposer } from "@/components/features/agent/rfi-composer";
import { ActivityLog } from "@/components/features/agent/activity-log";
import { DecisionPanel } from "@/components/features/agent/decision-panel";
import { ValidationAssistant } from "@/components/features/agent/validation-assistant";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockApplications } from "@/lib/mock-data/applications";
import { mockRFIs } from "@/lib/mock-data/rfis";
import { storage } from "@/lib/persistence";
import {
  Role,
  RFIStatus,
  ActivityLogEntry,
  RFIMessage,
  DecisionRecord,
  Decision,
  ApplicationStatus,
} from "@/lib/types";

export default function AgentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentSection, setCurrentSection] = useState("profile");
  const [rfis, setRfis] = useState(() => storage.getRFIsForApplication(id, mockRFIs));

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
      createdBy: "user-4", // Transaction Agent user
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

    // Save to storage
    storage.addRFI(newRFI, mockRFIs);
    // Update local state
    setRfis(storage.getRFIsForApplication(id, mockRFIs));
  };

  const handleReplyRFI = (rfiId: string, message: string) => {
    const targetRFI = rfis.find(rfi => rfi.id === rfiId);
    if (!targetRFI) return;

    const updatedRFI = {
      ...targetRFI,
      messages: [
        ...targetRFI.messages,
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

    // Save to storage
    storage.updateRFI(rfiId, updatedRFI, mockRFIs);
    // Update local state
    setRfis(storage.getRFIsForApplication(id, mockRFIs));
  };

  const handleResolveRFI = (rfiId: string) => {
    // Save to storage
    storage.updateRFI(rfiId, {
      status: RFIStatus.RESOLVED,
      resolvedAt: new Date(),
    }, mockRFIs);
    // Update local state
    setRfis(storage.getRFIsForApplication(id, mockRFIs));
  };

  // Adapter for ValidationAssistant to use handleCreateRFI
  const handleValidationRFI = (sectionKey: string, message: string) => {
    handleCreateRFI({
      sectionKey,
      assigneeRole: Role.APPLICANT, // Default to applicant for validation RFIs
      message,
    });
  };

  // Helper function to map Decision to ApplicationStatus
  const mapDecisionToStatus = (decision: Decision): ApplicationStatus => {
    switch (decision) {
      case Decision.APPROVE:
        return ApplicationStatus.APPROVED;
      case Decision.CONDITIONAL:
        return ApplicationStatus.CONDITIONAL;
      case Decision.DENY:
        return ApplicationStatus.DENIED;
    }
  };

  const handleDecisionSubmit = (decisionRecord: DecisionRecord) => {
    // Save decision to storage
    storage.saveDecision(decisionRecord);
    // Update application status based on decision
    storage.updateApplicationStatus(id, mapDecisionToStatus(decisionRecord.decision));
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
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-4 -my-8 sm:-mx-6 lg:-mx-8">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Review Application</h1>
            <p className="mt-2 text-muted-foreground">
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

        {/* Right: RFI Thread + Activity Log + Validation + Decision Panel (25%) */}
        <div className="w-1/4 min-w-[300px] max-w-[400px]">
          <Tabs defaultValue="validation" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
              <TabsTrigger value="validation">Validate</TabsTrigger>
              <TabsTrigger value="rfis">RFIs</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="decision">Decision</TabsTrigger>
            </TabsList>
            <TabsContent value="validation" className="flex-1 mt-0 overflow-hidden">
              <ValidationAssistant
                application={application}
                onCreateRFI={handleValidationRFI}
              />
            </TabsContent>
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
