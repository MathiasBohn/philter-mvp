"use client";

import { use, useState, useEffect } from "react";
import { mockApplications } from "@/lib/mock-data";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, FileText, Clock, Loader2 } from "lucide-react";
import { Application, Role } from "@/lib/types";

export default function BrokerSubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | undefined>(() =>
    mockApplications.find((app) => app.id === id)
  );
  const [isLoading, setIsLoading] = useState(!mockApplications.find((app) => app.id === id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // If not found in mock data, try localStorage
    if (!application && isLoading) {
      try {
        const storedApp = localStorage.getItem(`application_${id}`);
        if (storedApp) {
          const parsedApp = JSON.parse(storedApp);
          // Transform localStorage format to match Application type
          const transformedApp: Application = {
            id: parsedApp.id,
            buildingId: parsedApp.buildingId || parsedApp.buildingCode,
            building: {
              id: parsedApp.buildingId || parsedApp.buildingCode,
              code: parsedApp.buildingCode || parsedApp.buildingId,
              name: parsedApp.buildingName || "Demo Building",
              type: parsedApp.buildingType || "CONDO",
              address: {
                street: "123 Main St",
                city: "New York",
                state: "NY",
                zip: "10001"
              }
            },
            unit: parsedApp.unit,
            transactionType: parsedApp.transactionType,
            status: parsedApp.status,
            createdBy: parsedApp.createdBy || "broker-user",
            createdAt: new Date(parsedApp.createdAt),
            submittedAt: parsedApp.submittedAt ? new Date(parsedApp.submittedAt) : undefined,
            lastActivityAt: new Date(parsedApp.createdAt),
            people: parsedApp.applicantName ? [{
              id: "person-1",
              fullName: parsedApp.applicantName,
              email: parsedApp.applicantEmail || "",
              phone: "",
              dob: new Date(),
              ssnLast4: "",
              addressHistory: [],
              role: Role.APPLICANT
            }] : [],
            employmentRecords: [],
            financialEntries: [],
            realEstateProperties: [],
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
            rfis: [],
            isLocked: false
          };

          // Calculate completion percentage
          const completedSections = transformedApp.sections.filter(s => s.isComplete).length;
          transformedApp.completionPercentage = transformedApp.sections.length > 0
            ? Math.round((completedSections / transformedApp.sections.length) * 100)
            : 0;

          setApplication(transformedApp);
          setSubmitted(transformedApp.status === "SUBMITTED");
        }
      } catch (error) {
        console.error("Error loading application from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (application) {
      setSubmitted(application.status === "SUBMITTED");
    }
  }, [id, application, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
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

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // In a real app, would update application status to SUBMITTED
    }, 2000);
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
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header - Responsive */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Submit to Building</h1>
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
