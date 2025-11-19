"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusTag } from "../status-tag";
import { Application } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MoreHorizontal, UserPlus, Eye, FileText } from "lucide-react";
import Link from "next/link";

interface ApplicationMobileCardProps {
  application: Application;
}

export const ApplicationMobileCard = memo(function ApplicationMobileCard({ application }: ApplicationMobileCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">
              {application.people.length > 0
                ? application.people.map((p) => p.fullName).join(", ")
                : "New Application"}
            </CardTitle>
            <CardDescription className="mt-1">
              {application.building?.name}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Open actions menu"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/broker/${application.id}/qa`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Open Application Workspace
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Applicant
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/applications/${application.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Type</p>
            <p className="font-medium mt-0.5">
              {application.transactionType.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Status</p>
            <div className="mt-0.5">
              <StatusTag status={application.status} />
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Completion</p>
            <div className="mt-1">
              <Progress value={application.completionPercentage} className="h-2" />
              <p className="text-xs mt-1">{application.completionPercentage}%</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Last Activity</p>
            <p className="text-sm mt-0.5">
              {formatDate(application.lastActivityAt, "relative")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
