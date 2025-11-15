"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { Application, ApplicationSection } from "@/lib/types";
import { cn } from "@/lib/utils";

type ReviewNavigatorProps = {
  application: Application;
  currentSection: string;
  onSectionChange: (sectionKey: string) => void;
};

export function ReviewNavigator({
  application,
  currentSection,
  onSectionChange,
}: ReviewNavigatorProps) {
  const getSectionIcon = (section: ApplicationSection) => {
    if (section.isComplete) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }

    // Check if section has RFIs
    const hasOpenRFI = application.rfis.some(
      (rfi) => rfi.sectionKey === section.key && rfi.status === "OPEN"
    );

    if (hasOpenRFI) {
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }

    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getSectionBadge = (section: ApplicationSection) => {
    const openRFIs = application.rfis.filter(
      (rfi) => rfi.sectionKey === section.key && rfi.status === "OPEN"
    );

    if (openRFIs.length > 0) {
      return (
        <Badge variant="destructive" className="ml-auto">
          {openRFIs.length} RFI
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Application Sections</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Review each section
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {application.sections.map((section) => (
            <Button
              key={section.key}
              variant={currentSection === section.key ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-auto py-3 px-3",
                currentSection === section.key && "bg-secondary"
              )}
              onClick={() => onSectionChange(section.key)}
            >
              <div className="flex items-center gap-3 flex-1">
                {getSectionIcon(section)}
                <div className="flex flex-col items-start flex-1">
                  <span className="text-sm font-medium">{section.label}</span>
                </div>
                {getSectionBadge(section)}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-orange-600" />
            <span className="text-muted-foreground">Needs attention</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Not reviewed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
