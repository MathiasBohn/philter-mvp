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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/lib/hooks/use-applications";
import { useRFIs, useCreateRFI } from "@/lib/hooks/use-rfis";
import { useCreateDecision } from "@/lib/hooks/use-decisions";
import {
  Role,
  ActivityLogEntry,
  DecisionRecord,
} from "@/lib/types";

export default function AgentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentSection, setCurrentSection] = useState("profile");

  // Fetch application and RFIs using React Query hooks
  const { data: application, isLoading: appLoading, error: appError } = useApplication(id);
  const { data: rfis, isLoading: rfisLoading, error: rfisError } = useRFIs(id);

  // Mutations
  const createRFI = useCreateRFI(id);
  const createDecision = useCreateDecision(id);

  // Generate mock activity log entries - must be before early returns (Rules of Hooks)
  const activityLog: ActivityLogEntry[] = useMemo(() => {
    if (!application) return [];

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
      ...((rfis || [])
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

  // Loading state
  if (appLoading || rfisLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] -mx-4 -my-8 sm:-mx-6 lg:-mx-8">
        <div className="border-b p-6">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="flex-1 flex">
          <div className="w-64 border-r p-4">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (appError || rfisError) {
    return (
      <div className="flex flex col h-[calc(100vh-4rem)] p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading application</AlertTitle>
          <AlertDescription>
            {appError?.message || rfisError?.message || "Failed to load application data."}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!application) {
    notFound();
  }

  const handleCreateRFI = async (data: {
    sectionKey: string;
    assigneeRole: Role.APPLICANT | Role.BROKER;
    message: string;
  }) => {
    await createRFI.mutateAsync({
      section_key: data.sectionKey,
      assignee_role: data.assigneeRole,
      description: data.message,
    });
  };

  const handleReplyRFI = async (rfiId: string, message: string) => {
    try {
      const response = await fetch(`/api/rfis/${rfiId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to add RFI message');
      }
    } catch (error) {
      console.error('Failed to add RFI message:', error);
      throw error;
    }
  };

  const handleResolveRFI = async (rfiId: string) => {
    try {
      const response = await fetch(`/api/rfis/${rfiId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to resolve RFI');
      }
    } catch (error) {
      console.error('Failed to resolve RFI:', error);
      throw error;
    }
  };

  // Adapter for ValidationAssistant to use handleCreateRFI
  const handleValidationRFI = (sectionKey: string, message: string) => {
    handleCreateRFI({
      sectionKey,
      assigneeRole: Role.APPLICANT, // Default to applicant for validation RFIs
      message,
    });
  };

  const handleDecisionSubmit = async (decisionRecord: DecisionRecord) => {
    await createDecision.mutateAsync(decisionRecord);
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
            application={{ ...application, rfis: rfis || [] }}
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
                rfis={rfis || []}
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
