"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import Link from "next/link";

export type SectionStatus = "complete" | "incomplete" | "error";

export interface SectionCardProps {
  title: string;
  description: string;
  status: SectionStatus;
  href: string;
  applicationId: string;
  hasRFI?: boolean;
}

export function SectionCard({ title, description, status, href, applicationId, hasRFI }: SectionCardProps) {
  const statusConfig = {
    complete: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
      badge: "Complete",
      badgeVariant: "default" as const,
    },
    incomplete: {
      icon: Circle,
      color: "text-gray-400",
      bgColor: "bg-white dark:bg-gray-950",
      borderColor: "border-gray-200 dark:border-gray-800",
      badge: "Incomplete",
      badgeVariant: "secondary" as const,
    },
    error: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
      badge: "Needs Attention",
      badgeVariant: "destructive" as const,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor} hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3 flex-1">
          <Icon className={`h-5 w-5 ${config.color} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <CardDescription className="mt-0.5 text-sm">{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="flex flex-col gap-1.5">
            <Badge variant={config.badgeVariant} className="text-xs">{config.badge}</Badge>
            {hasRFI && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                RFI
              </Badge>
            )}
          </div>
          <Button asChild size="sm" variant={status === "complete" ? "outline" : "default"}>
            <Link href={`/applications/${applicationId}${href}`}>
              {status === "complete" ? "Review" : "Start"}
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
