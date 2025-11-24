"use client";

import { use, useState } from "react";
import { useApplication } from "@/lib/hooks/use-applications";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QAPanel } from "@/components/features/broker/qa-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Eye, Loader2 } from "lucide-react";

export default function BrokerQAPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: application, isLoading, error } = useApplication(id);
  const [selectedSection, setSelectedSection] = useState("profile");

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

  const isReadyForSubmit = application.completionPercentage === 100;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header - Responsive */}
      <div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Review Application</h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                {application.building?.name} - {application.people[0]?.fullName || "New Application"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/broker/${id}/submit`}>
                <Button disabled={!isReadyForSubmit} className="w-full sm:w-auto">
                  {isReadyForSubmit ? (
                    <>
                      <span className="hidden sm:inline">Ready to Submit</span>
                      <span className="sm:hidden">Submit</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Complete All Sections First</span>
                      <span className="sm:hidden">Incomplete</span>
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout - Responsive: stacks on mobile, 2-col on tablet, 3-col on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Left: Section Navigator */}
        <div className="md:col-span-2 lg:col-span-3 space-y-2">
          <h2 className="font-semibold mb-3">Sections</h2>
          <div className="space-y-2">
            {application.sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setSelectedSection(section.key)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selectedSection === section.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-accent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm sm:text-base">{section.label}</span>
                  <Badge variant={section.isComplete ? "default" : "secondary"} className="shrink-0">
                    {section.isComplete ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Form/Document View */}
        <div className="md:col-span-2 lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {application.sections.find((s) => s.key === selectedSection)?.label}
              </CardTitle>
              <CardDescription>
                Review and verify applicant information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="data">
                <TabsList>
                  <TabsTrigger value="data">Application Data</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="data" className="space-y-4 mt-4">
                  {selectedSection === "profile" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-base">{application.people[0]?.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-base">{application.people[0]?.email || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-base">{application.people[0]?.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">SSN (Last 4)</label>
                        <p className="text-base">***-**-{application.people[0]?.ssnLast4 || "****"}</p>
                      </div>
                    </div>
                  )}
                  {selectedSection === "income" && (
                    <div className="space-y-3">
                      {application.employmentRecords.map((emp, idx) => (
                        <div key={emp.id} className="border-b pb-3 last:border-0">
                          <h3 className="font-medium mb-2">Employer {idx + 1}</h3>
                          <div className="space-y-2">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Employer</label>
                              <p className="text-base">{emp.employer}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Title</label>
                              <p className="text-base">{emp.title}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Annual Income</label>
                              <p className="text-base">${emp.annualIncome.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {application.employmentRecords.length === 0 && (
                        <p className="text-muted-foreground">No employment records provided</p>
                      )}
                    </div>
                  )}
                  {selectedSection === "financials" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Assets</h3>
                        {application.financialEntries.filter((e) => e.entryType === "ASSET").length > 0 ? (
                          <div className="space-y-2">
                            {application.financialEntries
                              .filter((e) => e.entryType === "ASSET")
                              .map((entry) => (
                                <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                                  <span className="text-sm">{entry.category}</span>
                                  <span className="text-sm font-medium">${entry.amount.toLocaleString()}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No assets listed</p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Liabilities</h3>
                        {application.financialEntries.filter((e) => e.entryType === "LIABILITY").length > 0 ? (
                          <div className="space-y-2">
                            {application.financialEntries
                              .filter((e) => e.entryType === "LIABILITY")
                              .map((entry) => (
                                <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                                  <span className="text-sm">{entry.category}</span>
                                  <span className="text-sm font-medium">${entry.amount.toLocaleString()}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No liabilities listed</p>
                        )}
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Net Worth</span>
                          <span>
                            $
                            {(
                              application.financialEntries
                                .filter((e) => e.entryType === "ASSET")
                                .reduce((sum, e) => sum + e.amount, 0) -
                              application.financialEntries
                                .filter((e) => e.entryType === "LIABILITY")
                                .reduce((sum, e) => sum + e.amount, 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {!["profile", "income", "financials"].includes(selectedSection) && (
                    <p className="text-muted-foreground">Section data will display here</p>
                  )}
                </TabsContent>
                <TabsContent value="documents" className="mt-4">
                  {application.documents.length === 0 ? (
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {application.documents.map((doc) => (
                        <div key={doc.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xl">
                            📄
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{doc.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.category} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {doc.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Review Panel - Full width on mobile, stacks below on tablet */}
        <div className="md:col-span-4 lg:col-span-3">
          <QAPanel application={application} applicationId={id} />
        </div>
      </div>
    </div>
  );
}
