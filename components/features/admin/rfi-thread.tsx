"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { RFI, RFIStatus, Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Send, CheckCircle2 } from "lucide-react";

type RFIThreadProps = {
  rfis: RFI[];
  applicationId: string;
  onReply?: (rfiId: string, message: string) => void;
  onResolve?: (rfiId: string) => void;
};

export function RFIThread({
  rfis,
  applicationId,
  onReply,
  onResolve,
}: RFIThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const handleSendReply = (rfiId: string) => {
    if (replyMessage.trim() && onReply) {
      onReply(rfiId, replyMessage);
      setReplyMessage("");
      setReplyingTo(null);
    }
  };

  const handleResolve = (rfiId: string) => {
    if (onResolve) {
      onResolve(rfiId);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "default";
      case Role.BROKER:
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredRFIs = rfis.filter((rfi) => rfi.applicationId === applicationId);
  const openRFIs = filteredRFIs.filter((rfi) => rfi.status === RFIStatus.OPEN);
  const resolvedRFIs = filteredRFIs.filter(
    (rfi) => rfi.status === RFIStatus.RESOLVED
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">RFI Threads</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {openRFIs.length} open, {resolvedRFIs.length} resolved
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Open RFIs */}
          {openRFIs.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Open Requests</h4>
              {openRFIs.map((rfi) => (
                <Card key={rfi.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Open</Badge>
                      <span className="text-sm text-muted-foreground">
                        {rfi.sectionKey}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(rfi.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 mb-3">
                    {rfi.messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(msg.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {msg.authorName}
                            </span>
                            <Badge
                              variant={getRoleBadgeVariant(msg.authorRole)}
                              className="text-xs"
                            >
                              {msg.authorRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(msg.createdAt, "relative")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Section */}
                  {replyingTo === rfi.id ? (
                    <div className="space-y-2 pt-3 border-t">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSendReply(rfi.id)}
                          disabled={!replyMessage.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyMessage("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={() => setReplyingTo(rfi.id)}
                    >
                      Reply
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Resolved RFIs */}
          {resolvedRFIs.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Resolved Requests</h4>
              {resolvedRFIs.map((rfi) => (
                <Card key={rfi.id} className="p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Resolved</Badge>
                      <span className="text-sm text-muted-foreground">
                        {rfi.sectionKey}
                      </span>
                    </div>
                    {rfi.resolvedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(rfi.resolvedAt, "relative")}
                      </span>
                    )}
                  </div>

                  {/* Messages (collapsed view) */}
                  <div className="space-y-2">
                    {rfi.messages.slice(0, 1).map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(msg.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                    {rfi.messages.length > 1 && (
                      <p className="text-xs text-muted-foreground pl-9">
                        +{rfi.messages.length - 1} more{" "}
                        {rfi.messages.length - 1 === 1 ? "message" : "messages"}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredRFIs.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No RFIs for this application
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
