"use client";

import { useApplications } from "@/lib/hooks/use-applications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Send, Building2, Calendar, ChevronRight, Search, User, CheckCircle, Loader2 } from "lucide-react";
import { getStatusLabel } from "@/lib/constants/labels";
import { useState } from "react";

export default function SubmitApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: applications, isLoading, error } = useApplications();

  // Filter applications that are ready for submission (100% complete)
  const readyToSubmitApplications = (applications || []).filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.people[0]?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.building?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const isReadyToSubmit = app.completionPercentage === 100;

    return matchesSearch && isReadyToSubmit;
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Applications</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {error instanceof Error ? error.message : "Failed to load applications. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit Applications</h1>
          <p className="mt-2 text-muted-foreground">
            Review and submit completed applications to building management
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
                : "Applications that are 100% complete will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {readyToSubmitApplications.map((application) => (
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
                        application.status === "APPROVED" ? "default" :
                        application.status === "DENIED" ? "destructive" :
                        application.status === "IN_REVIEW" ? "secondary" :
                        "outline"
                      }>
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {application.building?.name || "Unknown Building"}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {application.people.length}{" "}
                        {application.people.length === 1 ? "applicant" : "applicants"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Created {new Date(application.createdAt).toLocaleDateString()}
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
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/broker/${application.id}/submit`}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Application
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
