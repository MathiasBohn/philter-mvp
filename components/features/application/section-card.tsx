"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Badge variant={config.badgeVariant}>{config.badge}</Badge>
          {hasRFI && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              RFI
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={`/applications/${applicationId}${href}`}>
            {status === "complete" ? "Review" : "Continue"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
