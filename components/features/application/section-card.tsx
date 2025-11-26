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
      color: "text-primary",
      bgColor: "bg-primary/5 dark:bg-primary/10",
      borderColor: "border-primary/20 dark:border-primary/30",
      badge: "Complete",
      badgeVariant: "default" as const,
    },
    incomplete: {
      icon: Circle,
      color: "text-muted-foreground",
      bgColor: "bg-card",
      borderColor: "border-border",
      badge: "Incomplete",
      badgeVariant: "secondary" as const,
    },
    error: {
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/5 dark:bg-destructive/10",
      borderColor: "border-destructive/20 dark:border-destructive/30",
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
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                RFI
              </Badge>
            )}
          </div>
          <Link href={`/applications/${applicationId}${href}`}>
            <Button size="sm" variant={status === "complete" ? "outline" : "default"}>
              {status === "complete" ? "Review" : "Start"}
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}
