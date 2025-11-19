"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Eye, FileText } from "lucide-react";
import { Application } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrivateNotes } from "./private-notes";
import { DownloadNotice } from "./download-notice";
import { formatDate } from "@/lib/utils";
import { createBoardWatermarkData } from "@/lib/pdf-utils";
import { storageService } from "@/lib/persistence";

interface ReadOnlyViewerProps {
  application: Application;
}

// Mock board member user ID (in a real app, this would come from auth)
const BOARD_USER_ID = "board-member-1";

export function ReadOnlyViewer({ application }: ReadOnlyViewerProps) {
  const [isReviewed, setIsReviewed] = useState(false);
  const [reviewedAt, setReviewedAt] = useState<Date | null>(null);
  const storageKey = `board-reviewed-${BOARD_USER_ID}-${application.id}`;

  // Load reviewed status from storage
  useEffect(() => {
    const savedReview = storageService.get(storageKey, null);
    if (savedReview) {
      const data = typeof savedReview === 'string' ? JSON.parse(savedReview) : savedReview;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsReviewed(data.reviewed);
      setReviewedAt(data.reviewedAt ? new Date(data.reviewedAt) : null);
    }
  }, [storageKey]);

  const handleMarkReviewed = () => {
    const now = new Date();
    const reviewData = {
      reviewed: true,
      reviewedAt: now.toISOString(),
    };
    storageService.set(storageKey, reviewData);
    setIsReviewed(true);
    setReviewedAt(now);
  };

  const handleDownload = async () => {
    try {
      // In a real app, this would fetch the actual PDF from the server
      // For now, we'll demonstrate the watermarking functionality

      // Create watermark data
      const watermarkData = createBoardWatermarkData(
        application,
        "Board Member Name" // In production, this would come from the authenticated user
      );

      // In production, you would:
      // 1. Fetch the actual PDF from the server
      // 2. Apply watermark
      // 3. Download the watermarked PDF

      // Example (would need actual PDF blob):
      // const response = await fetch(`/api/applications/${application.id}/package`);
      // const pdfBlob = await response.blob();
      // const watermarkedBlob = await watermarkPDFBlob(pdfBlob, watermarkData);
      //
      // const url = URL.createObjectURL(watermarkedBlob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `application-${application.id}-board-package.pdf`;
      // link.click();
      // URL.revokeObjectURL(url);

      // For demonstration purposes
      alert(
        `Downloading compiled package with watermark...\n\n` +
        `Watermark will include:\n` +
        `- "CONFIDENTIAL - BOARD REVIEW ONLY"\n` +
        `- Building: ${watermarkData.buildingName}\n` +
        `- Application ID: ${watermarkData.applicationId}\n` +
        `- Download Date: ${watermarkData.downloadDate}\n` +
        `- Board Member: ${watermarkData.boardMemberName || "N/A"}\n\n` +
        `Note: In production, this would download the actual watermarked board package PDF.`
      );
    } catch (error) {
      console.error("Error downloading package:", error);
      alert("Error downloading package. Please try again.");
    }
  };

  // Helper function to redact SSN
  const redactSSN = () => "••••";

  return (
    <div className="flex h-full flex-1 flex-col lg:flex-row">
      {/* Main PDF Viewer Area */}
      <div className="flex-1 border-r bg-muted/30">
        <div className="flex h-full flex-col">
          {/* Watermark/Header */}
          <div className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Board Review Copy - Read Only
                </span>
              </div>
              <Badge variant="secondary">
                {application.transactionType.replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* PDF Viewer Placeholder */}
          <div className="flex flex-1 items-center justify-center p-6">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Compiled Application Package
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    PDF Viewer Placeholder
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    In production, the full compiled package would be displayed
                    here using PDF.js
                  </p>
                </div>

                {/* Read-only Data Preview with SSN Redaction */}
                <div className="space-y-3 rounded-lg border bg-background p-4">
                  <h3 className="font-semibold">Application Summary</h3>
                  <Separator />
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Application ID:
                      </span>
                      <span className="font-medium">{application.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Building:</span>
                      <span className="font-medium">
                        {application.buildingId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">{application.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Transaction Type:
                      </span>
                      <span className="font-medium">
                        {application.transactionType.replace("_", " ")}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        SSN (Redacted):
                      </span>
                      <span className="font-mono font-medium">
                        {redactSSN()}
                      </span>
                    </div>
                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      Note: All personally identifiable information (PII) is
                      redacted in board review mode for privacy protection.
                    </div>
                  </div>
                </div>

                {/* Read-only Notice */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>Read-only Mode:</strong> This is a review-only
                    view. You cannot edit any information, create comments, or
                    submit requests for information (RFIs).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Panel - Private Notes & Actions */}
      <div className="w-full space-y-6 border-t bg-background p-6 lg:w-96 lg:border-l lg:border-t-0">
        {/* Review Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5" />
              Review Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isReviewed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Marked as Reviewed</span>
                </div>
                {reviewedAt && (
                  <p className="text-xs text-muted-foreground">
                    Reviewed on {formatDate(reviewedAt, "long")}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Mark this application as reviewed once you&apos;ve completed
                  your assessment.
                </p>
                <Button
                  onClick={handleMarkReviewed}
                  className="w-full"
                  variant="default"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Reviewed
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Download Package</CardTitle>
          </CardHeader>
          <CardContent>
            <DownloadNotice onDownload={handleDownload} />
          </CardContent>
        </Card>

        {/* Private Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Private Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <PrivateNotes
              applicationId={application.id}
              userId={BOARD_USER_ID}
            />
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            All viewing activity is logged for security and compliance
            purposes. Downloaded packages are time-limited and will expire to
            protect applicant privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
