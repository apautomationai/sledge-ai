"use client";

import React, { useState, useMemo } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
  CardDescription,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Search, FileText, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import type { Attachment } from "@/lib/types/invoice";
import { cn } from "@workspace/ui/lib/utils";
import PdfUploader from "./pdf-uploader";
import { formatDistanceToNow } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@workspace/ui/components/pagination"; // MODIFIED: Added Pagination imports
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import client from "@/lib/axios-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SupportStatus = ({ isSupported }: { isSupported: boolean }) => (
  <div className="flex items-center gap-1.5">
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        isSupported ? "bg-green-500" : "bg-red-500"
      )}
    />
    <span className="text-xs text-muted-foreground">
      {isSupported ? "Supported" : "Not Supported"}
    </span>
  </div>
);

export default function AttachmentsList({
  attachments,
  selectedAttachment,
  onSelectAttachment,
  onFileUpload,
  isUploading,
  currentPage,
  totalPages,
  onPageChange,
  onDeleteAttachment,
}: {
  attachments: any[] | null;
  selectedAttachment: Attachment | null;
  onSelectAttachment: (attachment: Attachment) => void;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const [isSyncing, setIsSyncing] = useState(false);

  const filteredAttachments = useMemo(() => {
    if (!attachments) return [];
    if (!searchTerm.trim()) return attachments;

    const lowercasedFilter = searchTerm.toLowerCase();
    return attachments.filter(
      (attachment) =>
        attachment.filename.toLowerCase().includes(lowercasedFilter) ||
        String(attachment.id).toLowerCase().includes(lowercasedFilter)
    );
  }, [attachments, searchTerm]);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const handleSyncEmails = async () => {
    setIsSyncing(true);
    try {
      await client.get('/api/v1/email/gmail/my');
      toast.success('Emails synced successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sync emails');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader>
        <CardTitle>Upload & Review</CardTitle>
        <CardAction>
          <Button variant={'outline'} size={'sm'}
            className={cn("cursor-pointer", {
              "opacity-50 cursor-not-allowed": isSyncing,
            })}
            onClick={handleSyncEmails}
            disabled={isSyncing}
          >
            {isSyncing ?
              <>
                <RefreshCcw className="w-4 h-4 mr-2 animate-spin " /> <span className="text-sm">Syncing Emails...</span>
              </>
              : <>
                <RefreshCcw className="w-4 h-4 mr-2" /> <span className="text-sm">Sync Emails</span>
              </>
            }
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <PdfUploader onFileUpload={onFileUpload} isUploading={isUploading} />
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 -mx-2">
          <div className="flex flex-col space-y-1 p-2">
            {filteredAttachments.length > 0 ? (
              filteredAttachments.map((attachment) => {
                const isSupported = attachment.mimeType === "application/pdf";
                const displayName =
                  attachment.filename.length > 25
                    ? `${attachment.filename.substring(0, 22)}...`
                    : attachment.filename;

                return (
                  <button
                    key={attachment.id}
                    onClick={() => onSelectAttachment(attachment)}
                    className={cn(
                      "group flex items-center gap-3 rounded-md p-2.5 text-left transition-colors hover:bg-muted relative",
                      selectedAttachment?.id === attachment.id && "bg-muted"
                    )}
                  >
                    <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="font-semibold text-sm truncate"
                          title={attachment.filename}
                        >
                          {displayName}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline"
                            className={cn("capitalize", {
                              "bg-yellow-100 text-yellow-800 border-yellow-200": attachment.status === "pending",
                              "bg-red-100 text-red-800 border-red-200": attachment.status === "failed",
                              "bg-blue-100 text-blue-800 border-blue-200": attachment.status === "processing",
                              "bg-green-100 text-green-800 border-green-200": attachment.status === "success",
                            })}
                          >{attachment.status}</Badge>
                          {onDeleteAttachment && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAttachment(attachment.id);
                              }}
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
                        <p className="truncate" title={String(attachment.id)}>
                          ID: {String(attachment.id).substring(0, 8)}...
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <SupportStatus isSupported={isSupported} />
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span
                            title={new Date(
                              attachment.created_at
                            ).toLocaleString()}
                          >
                            {formatDistanceToNow(
                              new Date(attachment.created_at),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center text-sm text-muted-foreground py-10">
                {searchTerm ? "No results found." : "No invoices found."}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* MODIFIED: Replaced custom buttons with shadcn/ui Pagination */}
      <CardFooter className="border-t p-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                aria-disabled={!hasPreviousPage}
                className={
                  !hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm font-medium text-muted-foreground">
                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                aria-disabled={!hasNextPage}
                className={
                  !hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}