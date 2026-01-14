"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { ZoomIn, ZoomOut, Loader2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

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
  const [PdfComponents, setPdfComponents] = useState<{
    Document: React.ComponentType<any>;
    Page: React.ComponentType<any>;
  } | null>(null);

  // Only load react-pdf on the client side after mount
  useEffect(() => {
    setIsMounted(true);

    const loadPdfComponents = async () => {
      const reactPdf = await import("react-pdf");

      // Configure worker only on client
      reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${reactPdf.pdfjs.version}/build/pdf.worker.min.mjs`;

      setPdfComponents({
        Document: reactPdf.Document,
        Page: reactPdf.Page,
      });
    };

    loadPdfComponents();
  }, []);

  // Reset state when fileUrl changes
  useEffect(() => {
    setIsLoading(true);
    setNumPages(0);
    setCurrentPage(1);
    setKey(fileUrl); // Force Document remount
  }, [fileUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setIsLoading(false);
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
      <ScrollArea className="flex-1 bg-muted/20">
        <div className="flex flex-col items-center gap-4 p-4">
          {!isMounted || !PdfComponents ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : fileUrl ? (
            <PdfComponents.Document
              key={key}
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
              error={
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                  <p>Failed to load PDF. Please try again.</p>
                </div>
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`page_${index + 1}`}
                  className="mb-4"
                  ref={(el) => { pageRefs.current[index] = el; }}
                >
                  <PdfComponents.Page
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
            </PdfComponents.Document>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground py-20">
              <p>No PDF available.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
