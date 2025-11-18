"use client";

import { useUser } from "@/lib/user-context";
import { mockApplications } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Building2, Calendar, ChevronRight } from "lucide-react";
import { getStatusLabel } from "@/lib/constants/labels";
import { Role, ApplicationStatus } from "@/lib/types";

export default function MyApplicationsPage() {
  const { user } = useUser();

  // For demo purposes, filter applications by current user's role
  const userApplications = mockApplications.filter(() => {
    if (!user) return false;
    // In a real app, we would filter by actual user ID
    // For now, show all applications for demonstration
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all your applications
          </p>
        </div>
        {user?.role === Role.BROKER && (
          <Button asChild>
            <Link href="/broker/new">
              <FileText className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        )}
      </div>

      {userApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {user?.role === Role.BROKER
                ? "Get started by creating a new application for your client."
                : "You don't have any applications at this time."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {application.people[0]?.fullName || "Unknown Applicant"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {application.building?.name || "Unknown Building"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {application.submittedAt
                          ? new Date(application.submittedAt).toLocaleDateString()
                          : new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={
                    application.status === ApplicationStatus.APPROVED ? "default" :
                    application.status === ApplicationStatus.DENIED ? "destructive" :
                    application.status === ApplicationStatus.IN_REVIEW ? "secondary" :
                    "outline"
                  }>
                    {getStatusLabel(application.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Application ID: {application.id}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/applications/${application.id}/overview`}>
                      View Details
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
