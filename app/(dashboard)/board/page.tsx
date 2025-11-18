"use client";

import { useState } from "react";
import { mockApplications } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, TrendingUp, Clock, CheckCircle, Building2 } from "lucide-react";
import Link from "next/link";
import { ApplicationStatus } from "@/lib/types";

export default function BoardDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter applications that are ready for board review
  const boardApplications = mockApplications.filter(
    (app) => app.status === ApplicationStatus.IN_REVIEW
  );

  // Filter based on search query
  const filteredApplications = boardApplications.filter((app) => {
    const searchLower = searchQuery.toLowerCase();
    const applicantName = app.people[0]?.fullName?.toLowerCase() || "";
    const buildingName = app.building?.name?.toLowerCase() || "";
    const unit = app.unit?.toLowerCase() || "";

    return (
      applicantName.includes(searchLower) ||
      buildingName.includes(searchLower) ||
      unit.includes(searchLower) ||
      app.id.toLowerCase().includes(searchLower)
    );
  });

  // Group applications by building
  const applicationsByBuilding = filteredApplications.reduce((acc, app) => {
    const buildingName = app.building?.name || "Unknown Building";
    if (!acc[buildingName]) {
      acc[buildingName] = [];
    }
    acc[buildingName].push(app);
    return acc;
  }, {} as Record<string, typeof filteredApplications>);

  const pendingCount = boardApplications.filter(
    (app) => app.status === ApplicationStatus.IN_REVIEW
  ).length;
  const totalApplications = mockApplications.filter(
    (app) => app.status === ApplicationStatus.IN_REVIEW ||
             app.status === ApplicationStatus.APPROVED ||
             app.status === ApplicationStatus.DENIED
  ).length;
  const approvedCount = mockApplications.filter(
    (app) => app.status === ApplicationStatus.APPROVED
  ).length;

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.IN_REVIEW:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case ApplicationStatus.SUBMITTED:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case ApplicationStatus.APPROVED:
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.IN_REVIEW:
        return "Pending Review";
      case ApplicationStatus.SUBMITTED:
        return "Submitted";
      case ApplicationStatus.APPROVED:
        return "Approved";
      default:
        return status;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Board Review Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Review and approve applications awaiting board decision
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Applications awaiting your review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              All time applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Applications approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by applicant name, building, unit, or application ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {searchQuery ? "No applications match your search" : "No applications awaiting review"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Applications for Review ({filteredApplications.length})
            </h2>
          </div>

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
                {apps.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">
                            {app.people[0]?.fullName || "Unnamed Applicant"}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {app.unit && `Unit ${app.unit} • `}
                            {app.people.length} {app.people.length === 1 ? "applicant" : "applicants"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={getStatusColor(app.status)}
                        >
                          {getStatusLabel(app.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Application ID</p>
                          <p className="text-sm font-medium">{app.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Transaction Type</p>
                          <p className="text-sm font-medium">
                            {app.transactionType.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Completion</p>
                          <p className="text-sm font-medium">{app.completionPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="text-sm font-medium">
                            {app.submittedAt
                              ? new Date(app.submittedAt).toLocaleDateString()
                              : new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Link href={`/board/summary/${app.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View Summary
                          </Button>
                        </Link>
                        <Link href={`/board/review/${app.id}`} className="flex-1">
                          <Button className="w-full">
                            Review Application
                          </Button>
                        </Link>
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
