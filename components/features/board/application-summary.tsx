"use client";

import { Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  TrendingUp,
  Home,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ApplicationSummaryProps {
  application: Application;
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  colorClass?: string;
  badge?: React.ReactNode;
}

function MetricCard({ icon: Icon, label, value, subtitle, colorClass, badge }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${colorClass || ""}`}>{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationSummary({ application }: ApplicationSummaryProps) {
  const [isQuickViewExpanded, setIsQuickViewExpanded] = useState(false);

  // Calculate metrics (mock data - in production, this would come from the application)
  const annualIncome = 250000; // Mock data
  const monthlyDebt = 3500; // Mock data
  const monthlyIncome = annualIncome / 12;
  const dtiRatio = (monthlyDebt / monthlyIncome) * 100;
  const netWorth = 1500000; // Mock data
  const yearsAtCurrentResidence = 5; // Mock data
  const personalReferences = 3; // Mock data
  const professionalReferences = 2; // Mock data
  const employmentTenure = 8; // Mock data (years)

  // DTI color coding
  const getDTIColor = (dti: number) => {
    if (dti < 30) return "text-green-600 dark:text-green-400";
    if (dti <= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getDTIBadge = (dti: number) => {
    if (dti < 30) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Excellent</Badge>;
    if (dti <= 40) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Needs Review</Badge>;
  };

  // Timeline events
  const timelineEvents = [
    {
      label: "Application Started",
      date: application.createdAt,
      icon: Calendar,
      status: "completed",
    },
    {
      label: "Application Submitted",
      date: application.submittedAt,
      icon: CheckCircle2,
      status: application.submittedAt ? "completed" : "pending",
    },
    {
      label: "Last Activity",
      date: application.lastActivityAt,
      icon: Clock,
      status: "completed",
    },
    {
      label: "Current Status",
      date: new Date(),
      icon: TrendingUp,
      status: "current",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={DollarSign}
          label="Annual Income"
          value={`$${annualIncome.toLocaleString()}`}
          subtitle="Verified"
          colorClass="text-primary"
        />

        <MetricCard
          icon={TrendingUp}
          label="DTI Ratio"
          value={`${dtiRatio.toFixed(1)}%`}
          subtitle="Debt-to-Income"
          colorClass={getDTIColor(dtiRatio)}
          badge={getDTIBadge(dtiRatio)}
        />

        <MetricCard
          icon={DollarSign}
          label="Net Worth"
          value={`$${(netWorth / 1000000).toFixed(1)}M`}
          subtitle="Total Assets"
          colorClass="text-primary"
        />

        <MetricCard
          icon={Briefcase}
          label="Employment"
          value={`${employmentTenure} years`}
          subtitle="Current Employer"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Home}
          label="Residence History"
          value={`${yearsAtCurrentResidence} years`}
          subtitle="Current Residence"
        />

        <MetricCard
          icon={Users}
          label="Personal References"
          value={personalReferences}
          subtitle="Provided"
        />

        <MetricCard
          icon={Users}
          label="Professional References"
          value={professionalReferences}
          subtitle="Provided"
        />
      </div>

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5" />
            Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const isCompleted = event.status === "completed";
              const isCurrent = event.status === "current";
              const isPending = event.status === "pending";

              return (
                <div key={index} className="flex items-start gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : isCurrent
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-300 bg-gray-50 dark:bg-gray-900"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    {index < timelineEvents.length - 1 && (
                      <div
                        className={`h-12 w-0.5 ${
                          isCompleted ? "bg-green-300" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.date
                            ? formatDate(event.date, "long")
                            : "Not yet"}
                        </p>
                      </div>
                      {isCompleted && (
                        <Badge variant="outline" className="text-green-600">
                          Completed
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="outline" className="text-blue-600">
                          Current
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="outline" className="text-gray-600">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick View Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Quick View</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsQuickViewExpanded(!isQuickViewExpanded)}
            >
              {isQuickViewExpanded ? (
                <>
                  Collapse <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Always Visible */}
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicants:</span>
                <span className="font-medium">
                  {application.people.map((p) => p.fullName).join(", ") || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Building:</span>
                <span className="font-medium">{application.building?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit:</span>
                <span className="font-medium">{application.unit || "N/A"}</span>
              </div>
            </div>

            {/* Expandable Content */}
            {isQuickViewExpanded && (
              <>
                <Separator />
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Type:</span>
                    <span className="font-medium">
                      {application.transactionType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Application ID:</span>
                    <span className="font-mono text-xs">{application.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">{application.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completion:</span>
                    <span className="font-medium">{application.completionPercentage}%</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Financial Summary</p>
                    <div className="rounded-lg bg-muted p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Monthly Income:</span>
                        <span className="font-medium">${monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Monthly Debt:</span>
                        <span className="font-medium">${monthlyDebt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Remaining (after debt):</span>
                        <span className="font-medium text-green-600">
                          ${(monthlyIncome - monthlyDebt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
