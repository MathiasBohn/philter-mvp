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
        <AlertDescription className="space-y-2">
          <p>
            This download link expires soon to protect your privacy and maintain
            document security.
          </p>
          <p className="text-xs">
            <strong>Note:</strong> All downloads are watermarked with confidential
            markings including your name, download date, and building information
            for security tracking.
          </p>
        </AlertDescription>
      </Alert>

      <Button onClick={onDownload} className="w-full" size="lg">
        <Download className="mr-2 h-4 w-4" />
        Download Compiled Package
      </Button>
    </div>
  );
}
