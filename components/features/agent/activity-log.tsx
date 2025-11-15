"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ActivityLogEntry, Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  FileUp,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  User,
  Send,
} from "lucide-react";

type ActivityLogProps = {
  activities: ActivityLogEntry[];
};

export function ActivityLog({ activities }: ActivityLogProps) {
  const getActivityIcon = (action: string) => {
    if (action.includes("upload") || action.includes("document")) {
      return <FileUp className="h-4 w-4" />;
    }
    if (action.includes("submit")) {
      return <Send className="h-4 w-4" />;
    }
    if (action.includes("RFI") || action.includes("message")) {
      return <MessageSquare className="h-4 w-4" />;
    }
    if (action.includes("complete") || action.includes("approve")) {
      return <CheckCircle className="h-4 w-4" />;
    }
    if (action.includes("flag") || action.includes("issue")) {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (action.includes("profile") || action.includes("user")) {
      return <User className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "default";
      case Role.BROKER:
        return "secondary";
      case Role.APPLICANT:
      case Role.CO_APPLICANT:
      case Role.GUARANTOR:
        return "outline";
      default:
        return "outline";
    }
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Activity Timeline</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {activities.length} {activities.length === 1 ? "activity" : "activities"}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {sortedActivities.length > 0 ? (
            <div className="space-y-4">
              {sortedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0 last:pb-0"
                >
                  {/* Icon */}
                  <div className="absolute -left-[9px] top-0 bg-background p-1 rounded-full border-2 border-muted">
                    {getActivityIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.userName}</p>
                      <Badge
                        variant={getRoleBadgeVariant(activity.userRole)}
                        className="text-xs"
                      >
                        {activity.userRole}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp, "relative")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No activity recorded yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
