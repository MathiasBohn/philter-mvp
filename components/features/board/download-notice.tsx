"use client";

import { Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DownloadNoticeProps {
  onDownload: () => void;
}

export function DownloadNotice({ onDownload }: DownloadNoticeProps) {
  return (
    <div className="space-y-3">
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          This download link expires soon to protect your privacy and maintain
          document security.
        </AlertDescription>
      </Alert>

      <Button onClick={onDownload} className="w-full" size="lg">
        <Download className="mr-2 h-4 w-4" />
        Download Compiled Package
      </Button>
    </div>
  );
}
