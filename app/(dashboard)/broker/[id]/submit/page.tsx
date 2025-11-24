"use client";

import { use, useState } from "react";
import { useApplication, useUpdateApplication } from "@/lib/hooks/use-applications";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, FileText, Clock, Loader2 } from "lucide-react";
import { ApplicationStatus } from "@/lib/types";

export default function BrokerSubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: application, isLoading, error } = useApplication(id);
  const updateApplication = useUpdateApplication(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Application</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {error instanceof Error ? error.message : "Failed to load application. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    notFound();
  }

  const deliverables = [
    {
      label: "Profile complete",
      completed: application.sections.find((s) => s.key === "profile")?.isComplete || false,
    },
    {
      label: "Employment/income documented",
      completed: application.sections.find((s) => s.key === "income")?.isComplete || false,
    },
    {
      label: "Financials complete",
      completed: application.sections.find((s) => s.key === "financials")?.isComplete || false,
    },
    {
      label: "All required documents uploaded",
      completed: application.sections.find((s) => s.key === "documents")?.isComplete || false,
    },
    {
      label: "Disclosures acknowledged (if applicable)",
      completed:
        application.transactionType === "CONDO_LEASE" ||
        application.transactionType === "COOP_SUBLET"
          ? application.sections.find((s) => s.key === "disclosures")?.isComplete || false
          : true,
    },
  ];

  const allComplete = deliverables.every((d) => d.completed);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateApplication.mutateAsync({
        id,
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityLog = [
    {
      id: "act-1",
      action: "Application created",
      user: "Broker",
      timestamp: application.createdAt,
    },
    {
      id: "act-2",
      action: "Profile updated",
      user: "Applicant",
      timestamp: new Date(application.createdAt.getTime() + 86400000),
    },
    {
      id: "act-3",
      action: "Documents uploaded",
      user: "Applicant",
      timestamp: application.lastActivityAt,
    },
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 sm:py-12 px-4 sm:px-0">
        <Card className="border-green-600">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Application Submitted Successfully</CardTitle>
            <CardDescription className="text-sm">
              Submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Building management will review the application</li>
                <li>• You&apos;ll be notified if any additional information is needed</li>
                <li>• Typical review time is 5-10 business days</li>
                <li>• You can track the status in your pipeline</li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => router.push("/broker")}>
              Return to Pipeline
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-0">
      {/* Header - Responsive */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Submit Application</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Review deliverables and submit completed application
        </p>
      </div>

      {/* Responsive Grid: stacks on mobile, 2-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Deliverables Checklist */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deliverables Checklist</CardTitle>
              <CardDescription>All items must be complete before submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.completed ? (
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Board Package Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-5 w-5" />
                Board Package Preview
              </CardTitle>
              <CardDescription className="text-sm">Compiled application for building submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg aspect-[8.5/11] bg-muted flex items-center justify-center min-h-[300px]">
                <p className="text-sm text-muted-foreground">PDF Preview</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Audit Trail and Submit */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription className="text-sm">Recent application activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.user} • {activity.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Submit?</CardTitle>
              <CardDescription>
                This will lock the application and send it to building management for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!allComplete && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">
                    Complete all deliverables before submitting
                  </p>
                </div>
              )}
              <Button
                className="w-full"
                disabled={!allComplete || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Submitting..." : "Submit to Building"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
