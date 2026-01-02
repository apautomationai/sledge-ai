"use client";

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh indefinitely (WebSocket handles updates)
        staleTime: Infinity,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Disable automatic refetching (WebSocket handles updates)
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        // Retry failed requests once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Clear all cached queries
 * Call this on login/logout to ensure fresh data
 */
export function clearQueryCache() {
  if (browserQueryClient) {
    browserQueryClient.clear();
  }
}
