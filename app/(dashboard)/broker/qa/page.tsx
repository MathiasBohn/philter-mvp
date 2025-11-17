"use client";

import { mockApplications } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FileCheck, Building2, Calendar, ChevronRight, Search, User } from "lucide-react";
import { getStatusLabel } from "@/lib/constants/labels";
import { useState } from "react";

export default function QAWorkspacePage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter applications that are ready for QA (submitted by applicant, not yet sent to building)
  const qaReadyApplications = mockApplications.filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.people[0]?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.building?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QA Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Review and verify applications before submission to building
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileCheck className="h-4 w-4" />
          <span>
            {qaReadyApplications.length}{" "}
            {qaReadyApplications.length === 1 ? "application" : "applications"} ready
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

      {qaReadyApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No matching applications" : "No applications ready for QA"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "Try adjusting your search query."
                : "Applications that need QA review will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {qaReadyApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {application.people[0]?.fullName || "Unknown Applicant"}
                      </CardTitle>
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
                    <span className="text-muted-foreground">
                      Completion: <span className="font-semibold">{application.completionPercentage}%</span>
                    </span>
                  </div>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/broker/${application.id}/qa`}>
                      Open QA Workspace
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
