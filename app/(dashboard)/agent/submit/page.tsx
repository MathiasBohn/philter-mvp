"use client";

import { useState } from "react";
import { useApplications } from "@/lib/hooks/use-applications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Send, Building2, Calendar, ChevronRight, Search, User, CheckCircle, AlertCircle } from "lucide-react";
import { getStatusLabel } from "@/lib/constants/labels";
import { ApplicationStatus } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AgentSubmitPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch applications from API
  const { data: applications, isLoading, error } = useApplications();

  // Filter applications that are ready for submission to Board
  // These are applications that Transaction Agent has reviewed and are ready to send to Board
  const readyToSubmitApplications = (applications || []).filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.people[0]?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.building?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    // In production, this would filter applications that have been reviewed by Transaction Agent
    // For now, we'll use SUBMITTED status as applications ready to be sent to Board
    const isReadyToSubmit = app.status === ApplicationStatus.SUBMITTED && app.completionPercentage === 100;

    return matchesSearch && isReadyToSubmit;
  });

  // Group applications by building
  const applicationsByBuilding = readyToSubmitApplications.reduce((acc, app) => {
    const buildingName = app.building?.name || "Unknown Building";
    if (!acc[buildingName]) {
      acc[buildingName] = [];
    }
    acc[buildingName].push(app);
    return acc;
  }, {} as Record<string, typeof readyToSubmitApplications>);

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-2 h-5 w-96" />
          </div>
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit to Board</h1>
          <p className="mt-2 text-muted-foreground">
            Review and submit applications to board members for approval
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Applications</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load applications. Please try again."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit to Board</h1>
          <p className="mt-2 text-muted-foreground">
            Review and submit applications to board members for approval
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          <span>
            {readyToSubmitApplications.length}{" "}
            {readyToSubmitApplications.length === 1 ? "application" : "applications"} ready
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by applicant name, building, or application ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {readyToSubmitApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No matching applications" : "No applications ready to submit"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "Try adjusting your search query."
                : "Applications that have been reviewed will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Group applications by building */}
          {Object.entries(applicationsByBuilding).map(([buildingName, apps]) => (
            <div key={buildingName} className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{buildingName}</h2>
                <Badge variant="secondary" className="ml-2">
                  {apps.length} {apps.length === 1 ? "application" : "applications"}
                </Badge>
              </div>

              <div className="grid gap-4">
                {apps.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">
                              {application.people[0]?.fullName || "Unknown Applicant"}
                            </CardTitle>
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready
                            </Badge>
                            <Badge variant={
                              application.status === "SUBMITTED" ? "secondary" : "outline"
                            }>
                              {getStatusLabel(application.status)}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
                            {application.unit && (
                              <span className="flex items-center gap-1">
                                Unit {application.unit}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {application.people.length}{" "}
                              {application.people.length === 1 ? "applicant" : "applicants"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Submitted {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "N/A"}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            ID: <span className="font-mono">{application.id}</span>
                          </span>
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {application.completionPercentage}% Complete
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/agent/review/${application.id}`}>
                              Review
                            </Link>
                          </Button>
                          <Button variant="default" size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Submit to Board
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
