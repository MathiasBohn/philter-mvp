"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface PdfViewerProps {
  url: string;
  className?: string;
  showThumbnails?: boolean;
}

// Dynamically import the PDF viewer with SSR disabled
const PdfViewerClient = dynamic(
  () =>
    import("./pdf-viewer-client").then((mod) => ({
      default: mod.PdfViewerClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
        </div>
      </div>
    ),
  }
);

export function PdfViewer(props: PdfViewerProps) {
  return <PdfViewerClient {...props} />;
}
