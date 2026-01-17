"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@workspace/ui/components/button";
import { ZoomIn, ZoomOut, Loader2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker - v7.7.3 uses .js instead of .mjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface InvoicePdfViewerProps {
  fileUrl: string;
  sourcePdfUrl?: string | null;
}

export default function InvoicePdfViewer({
  fileUrl,
}: InvoicePdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [key, setKey] = useState<string>(fileUrl);
  const [isMounted, setIsMounted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Memoize file and options props to prevent unnecessary reloads
  const fileConfig = useMemo(
    () => ({
      url: fileUrl,
      httpHeaders: {},
      withCredentials: false,
    }),
    [fileUrl]
  );

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  // Only set mounted state on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset state when fileUrl changes
  useEffect(() => {
    setIsLoading(true);
    setNumPages(0);
    setCurrentPage(1);
    setLoadError(null);
    setKey(fileUrl); // Force Document remount
  }, [fileUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    setIsLoading(false);
    setLoadError(error.message || "Failed to load PDF");
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const scrollToPage = (pageNumber: number) => {
    const pageElement = pageRefs.current[pageNumber - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNumber);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* Controls */}
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
        <div className="flex items-center gap-2">
          {numPages > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="h-8 w-8"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {currentPage} / {numPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className="h-8 w-8"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {numPages === 1 && (
            <span className="text-sm font-medium text-muted-foreground">
              1 page
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(fileUrl, '_blank')}
            className="h-8 w-8"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <ScrollArea className="flex-1 bg-muted/20 w-full">
        <div className="flex flex-col items-center gap-4 p-4 min-w-fit">
          {!isMounted ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Initializing PDF viewer...</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <p className="font-semibold text-red-500">Initialization Error</p>
              <p className="text-sm text-red-500">{loadError}</p>
              <p className="text-sm">Please refresh the page and try again.</p>
            </div>
          ) : fileUrl ? (
            <Document
              key={key}
              file={fileConfig}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <p className="font-semibold">Failed to load PDF</p>
                  {loadError && <p className="text-sm text-red-500">{loadError}</p>}
                  <p className="text-sm">Please try again or check the console for details.</p>
                </div>
              }
              options={pdfOptions}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`page_${index + 1}`}
                  className="mb-4"
                  ref={(el) => { pageRefs.current[index] = el; }}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    }
                    className="shadow-lg"
                  />
                  {numPages > 1 && (
                    <div className="text-center mt-2 text-sm text-muted-foreground">
                      Page {index + 1} of {numPages}
                    </div>
                  )}
                </div>
              ))}
            </Document>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground py-20">
              <p>No PDF available.</p>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
