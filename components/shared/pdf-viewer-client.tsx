"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamic import type for PDF.js
type PDFDocumentProxy = any;
type PDFPageProxy = any;

interface PdfViewerClientProps {
  url: string;
  className?: string;
  showThumbnails?: boolean;
}

type ZoomMode = "custom" | "fit-width" | "fit-page";

export function PdfViewerClient({
  url,
  className,
  showThumbnails = true,
}: PdfViewerClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit-width");
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageInput, setPageInput] = useState("1");

  // Load PDF document
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import PDF.js legacy build (for Node.js compatibility)
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // Configure worker to use local file
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;

        if (isMounted) {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : String(err),
          url,
          type: typeof err,
        });
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          setError(`Failed to load PDF: ${errorMessage}`);
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [url]);

  // Generate thumbnails
  useEffect(() => {
    if (!pdf || !showThumbnails) return;

    const generateThumbnails = async () => {
      const thumbs: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          thumbs.push(canvas.toDataURL());
        } catch (err) {
          console.error(`Error generating thumbnail for page ${i}:`, err);
        }
      }

      setThumbnails(thumbs);
    };

    generateThumbnails();
  }, [pdf, showThumbnails]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current || rendering) return;

    const renderPage = async () => {
      setRendering(true);
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        let scale = zoom;

        // Calculate scale based on zoom mode
        if (zoomMode === "fit-width" && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 32; // padding
          const viewport = page.getViewport({ scale: 1, rotation });
          scale = containerWidth / viewport.width;
        } else if (zoomMode === "fit-page" && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 32;
          const containerHeight = containerRef.current.clientHeight - 32;
          const viewport = page.getViewport({ scale: 1, rotation });
          const widthScale = containerWidth / viewport.width;
          const heightScale = containerHeight / viewport.height;
          scale = Math.min(widthScale, heightScale);
        }

        const viewport = page.getViewport({ scale, rotation });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setRendering(false);
      } catch (err) {
        console.error("Error rendering page:", err);
        setRendering(false);
      }
    };

    renderPage();
  }, [pdf, currentPage, zoom, zoomMode, rotation, rendering]);

  // Handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleZoomIn = () => {
    setZoomMode("custom");
    setZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoomMode("custom");
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleFitWidth = () => {
    setZoomMode("fit-width");
  };

  const handleFitPage = () => {
    setZoomMode("fit-page");
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank");
  };

  const handleThumbnailClick = (pageNum: number) => {
    setCurrentPage(pageNum);
    setPageInput(pageNum.toString());
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-muted/10",
          className
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center bg-muted/10",
          className
        )}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium">Error Loading PDF</p>
          <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col bg-muted/10", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b bg-background p-2">
        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <Input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              className="h-8 w-12 text-center text-sm"
              aria-label="Page number"
            />
            <span className="text-sm text-muted-foreground">/ {numPages}</span>
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === numPages}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[3.5rem] text-center">
            {zoomMode === "custom"
              ? `${Math.round(zoom * 100)}%`
              : zoomMode === "fit-width"
              ? "Fit W"
              : "Fit P"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3.0}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Fit Controls */}
        <Button
          variant={zoomMode === "fit-width" ? "secondary" : "ghost"}
          size="sm"
          onClick={handleFitWidth}
          title="Fit to width"
        >
          <Minimize2 className="h-4 w-4 mr-1" />
          Width
        </Button>
        <Button
          variant={zoomMode === "fit-page" ? "secondary" : "ghost"}
          size="sm"
          onClick={handleFitPage}
          title="Fit to page"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Page
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Rotate */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRotate}
          title="Rotate 90° clockwise"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Open in new tab */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenInNewTab}
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Open
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-32 border-r bg-background hidden lg:block">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-2 p-2">
                {thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index + 1)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 rounded-md border-2 p-1 transition-colors hover:border-primary/50",
                      currentPage === index + 1
                        ? "border-primary bg-primary/5"
                        : "border-transparent"
                    )}
                  >
                    <img
                      src={thumb}
                      alt={`Page ${index + 1}`}
                      className="w-full rounded"
                    />
                    <span className="text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-muted/20 p-4"
        >
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="shadow-lg"
              style={{ maxWidth: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
