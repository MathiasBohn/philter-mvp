"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { storageService } from "@/lib/persistence";

interface PrivateNotesProps {
  applicationId: string;
  userId: string;
}

export function PrivateNotes({ applicationId, userId }: PrivateNotesProps) {
  const [notes, setNotes] = useState("");
  const storageKey = `board-notes-${userId}-${applicationId}`;

  // Load notes from storage on mount
  useEffect(() => {
    const savedNotes = storageService.get(storageKey, null);
    if (savedNotes) {
      const notes = typeof savedNotes === 'string' ? savedNotes : JSON.stringify(savedNotes);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotes(notes);
    }
  }, [storageKey]);

  // Save notes to storage when they change
  const handleNotesChange = (value: string) => {
    setNotes(value);
    storageService.set(storageKey, value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Label htmlFor="private-notes" className="text-base font-semibold">
            Private Notes
          </Label>
          <p className="text-sm text-muted-foreground">
            These notes are private and not shared with applicants, brokers, or
            administrators.
          </p>
        </div>
        <Lock className="h-4 w-4 text-muted-foreground" />
      </div>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Your notes are saved automatically and remain completely private.
        </AlertDescription>
      </Alert>

      <Textarea
        id="private-notes"
        placeholder="Add your private review notes here..."
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        className="min-h-[200px] resize-none"
      />

      <p className="text-xs text-muted-foreground">
        Last saved: {notes ? "Just now" : "No notes yet"}
      </p>
    </div>
  );
}
