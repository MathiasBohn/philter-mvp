"use client";

import { useState, useMemo } from "react";
import { useApplications } from "@/lib/hooks/use-applications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, Building2, Calendar, Search, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { ApplicationStatus } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BoardDecisionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch applications from API
  const { data: applications, isLoading, error } = useApplications();

  // Filter applications that are awaiting board decision
  const pendingApplications = useMemo(() => {
    if (!applications) return [];

    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        app.people[0]?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.building?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Applications in review status are awaiting board decision
      const isPending = app.status === ApplicationStatus.IN_REVIEW;

      return matchesSearch && isPending;
    });
  }, [applications, searchQuery]);

  // Group applications by building
  const applicationsByBuilding = pendingApplications.reduce((acc, app) => {
    const buildingName = app.building?.name || "Unknown Building";
    if (!acc[buildingName]) {
      acc[buildingName] = [];
    }
    acc[buildingName].push(app);
    return acc;
  }, {} as Record<string, typeof pendingApplications>);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Decisions</h1>
          <p className="mt-2 text-muted-foreground">
            Review and make approval decisions for applications
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Decisions</h1>
          <p className="mt-2 text-muted-foreground">
            Review and make approval decisions for applications
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'Failed to load applications'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Decisions</h1>
          <p className="mt-2 text-muted-foreground">
            Review and make approval decisions for applications
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>
            {pendingApplications.length}{" "}
            {pendingApplications.length === 1 ? "application" : "applications"} pending
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

      {pendingApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No matching applications" : "No applications pending decision"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "Try adjusting your search query."
                : "Applications awaiting your decision will appear here."}
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
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending Decision
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
                          <span className="text-muted-foreground">
                            Type: <span className="font-medium">{application.transactionType.replace(/_/g, " ")}</span>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/board/summary/${application.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Summary
                            </Link>
                          </Button>
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/board/review/${application.id}`}>
                              Make Decision
                            </Link>
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
