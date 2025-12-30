"use client";

import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate } from "./integration-utils";

interface IntegrationMetadataSectionProps {
  metadata?: Record<string, any>;
  backendName?: string;
  className?: string;
}

/**
 * Formats a key to uppercase with spaces between words
 */
const formatKeyToUppercase = (key: string): string => {
  // Convert camelCase/PascalCase to UPPERCASE with spaces
  return key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .trim()
    // .toUpperCase();
};

/**
 * Checks if a value should be displayed (not null, undefined, or empty string)
 */
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined || value === "") {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (typeof value === "object" && Object.keys(value).length === 0) {
    return false;
  }
  return true;
};

export function IntegrationMetadataSection({
  metadata,
  backendName,
  className,
}: IntegrationMetadataSectionProps) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  // Filter metadata based on integration type
  const displayMetadata: Record<string, any> = {};
  
  if (backendName === "gmail" || backendName === "outlook") {
    // For Gmail/Outlook: show lastReadAt, startRead (from startReading), lastProcessedAt
    // Support both lastReadAt (new) and lastRead (legacy) for backward compatibility
    if (hasValue(metadata.lastReadAt)) {
      displayMetadata.lastReadAt = metadata.lastReadAt;
    } else if (hasValue(metadata.lastRead)) {
      displayMetadata.lastReadAt = metadata.lastRead;
    }
    if (hasValue(metadata.startReading)) {
      displayMetadata.startRead = metadata.startReading;
    }
    if (hasValue(metadata.lastProcessedAt)) {
      displayMetadata.lastProcessedAt = metadata.lastProcessedAt;
    }
  } else if (backendName === "quickbooks") {
    // For QuickBooks: show only lastSyncedAt
    if (hasValue(metadata.lastSyncedAt)) {
      displayMetadata.lastSyncedAt = metadata.lastSyncedAt;
    }
  }

  // Don't show section if there's no metadata to display
  if (Object.keys(displayMetadata).length === 0) {
    return null;
  }

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) {
      if (value.length === 0) return "No items";
      // For arrays, show first few items or count
      if (value.length <= 3) {
        return value.join(", ");
      }
      return `${value.slice(0, 3).join(", ")} ... (+${value.length - 3} more)`;
    }
    if (typeof value === "object") {
      // For nested objects, show as formatted JSON
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    // Check if it's a date string
    if (typeof value === "string") {
      const dateValue = formatDate(value);
      if (dateValue) {
        return dateValue;
      }
    }
    return String(value);
  };

  // Field name mapping for display
  const getDisplayName = (key: string): string => {
    const displayMap: Record<string, string> = {
      lastReadAt: "Last Read At",
      startRead: "Start Read",
      lastProcessedAt: "Last Processed At",
      lastSyncedAt: "Last Synced At",
    };
    return displayMap[key] || formatKeyToUppercase(key);
  };

  return (
    <div className={cn("border-t pt-2 sm:pt-3 mt-2 sm:mt-3", className)}>
      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        {Object.entries(displayMetadata).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 py-1"
          >
            <span className="font-medium text-muted-foreground sm:min-w-[120px] shrink-0">
              {getDisplayName(key)}:
            </span>
            <span className="text-foreground break-words flex-1 min-w-0">
              {renderValue(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

