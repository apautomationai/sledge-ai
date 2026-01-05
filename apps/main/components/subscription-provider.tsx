"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import client from "@/lib/axios-client";
import type { SubscriptionStatus } from "@/lib/types";

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  loading: boolean;
  hasAccess: boolean;
  refreshSubscription: () => Promise<void>;
  forceReinitialize: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  hasAccess: false,
  refreshSubscription: async () => {},
  forceReinitialize: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  // Initialize paymentCanceled from sessionStorage
  const [paymentCanceled, setPaymentCanceled] = useState(() => {
    if (typeof window !== "undefined") {
      const flag = sessionStorage.getItem("payment_canceled");
      if (flag === "true") {
        // Clear the flag after reading it
        sessionStorage.removeItem("payment_canceled");
        return true;
      }
    }
    return false;
  });
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't require subscription check
  const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/forget-password",
    "/reset-password",
    "/about",
    "/contact-us",
    "/privacy-policy",
    "/terms-conditions",
    "/product",
    "/product/ai-accounts-payable",
    "/integration",
    "/pricing",
    "/industries/construction",
    "/industries/concrete",
    "/integration/quickbooks",
    "/integration/gmail",
    "/integration/outlook",
    "/test-sentry",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/auth/")
  );

  const hasValidSubscription = (sub: SubscriptionStatus): boolean => {
    if (!sub) return false;

    // Free tier has access
    if (sub.tier === "free") return true;

    // Active subscription has access
    if (sub.status === "active") return true;

    // Trialing subscription has access
    if (sub.status === "trialing") return true;

    // User with payment method but incomplete status (webhook processing)
    if (sub.hasPaymentMethod && sub.status === "incomplete") return true;

    return false;
  };

  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const fetchSubscription = async (forceRefresh: boolean = false) => {
    try {
      // Add multiple cache-busting parameters
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const cacheParams = `_t=${timestamp}&_r=${random}&_f=${forceRefresh ? "1" : "0"}`;

      const response = await client.get(
        `api/v1/subscription/status?${cacheParams}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      const subscriptionData = (response as any)?.data;

      // Check if user changed (different userId)
      const currentUserId = getCookie("userId");
      if (currentUserId && lastUserId && currentUserId !== lastUserId) {
        console.log(
          `[SUBSCRIPTION] User changed from ${lastUserId} to ${currentUserId}, resetting state`
        );
        setIsInitialized(false);
        setSubscription(null);
      }
      setLastUserId(currentUserId);

      console.log(
        `[SUBSCRIPTION] Fetched fresh subscription data:`,
        subscriptionData
      );
      setSubscription(subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      return null;
    }
  };

  const refreshSubscription = useCallback(async () => {
    console.log(`[SUBSCRIPTION] Force refreshing subscription data`);
    setLoading(true);
    // Force refresh with cache busting
    await fetchSubscription(true);
    setLoading(false);
  }, []);

  const forceReinitialize = useCallback(() => {
    console.log(`[SUBSCRIPTION] Force reinitializing subscription provider`);
    setIsInitialized(false);
    setSubscription(null);
    setLoading(true);
  }, []);

  const createCheckoutAndRedirect = async () => {
    try {
      setRedirectingToPayment(true);
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/dashboard?payment_success=true`;
      // When user clicks back on payment page, logout and redirect to login
      const cancelUrl = `${baseUrl}/payment-cancel`;

      const response = await client.post(
        "api/v1/subscription/create-checkout",
        {
          successUrl,
          cancelUrl,
        }
      );
      const checkoutData = (response as any)?.data;

      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        console.error("No checkout URL received");
        setRedirectingToPayment(false);
        // Fallback to profile page
        router.replace("/profile?tab=subscription&setup=required");
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      setRedirectingToPayment(false);
      // Fallback to profile page on error
      router.replace("/profile?tab=subscription&setup=required");
    }
  };

  useEffect(() => {
    // Only check subscription for authenticated users on protected routes
    if (isPublicRoute) {
      setLoading(false);
      setShowLoading(false);
      setRedirectingToPayment(false);
      return;
    }

    // Only initialize once per app load
    if (isInitialized) {
      return;
    }

    // Show loading indicator immediately for protected routes
    setShowLoading(true);

    // Check if user is authenticated (has token)
    const initializeSubscription = async () => {
      try {
        const subscriptionData = await fetchSubscription();

        if (subscriptionData) {
          const hasAccess = hasValidSubscription(subscriptionData);

          // If user has valid subscription
          if (hasAccess) {
            // If on onboarding page, redirect to dashboard
            if (pathname === "/onboarding") {
              router.replace("/dashboard");
            }
            // If on profile subscription tab, redirect to dashboard
            else if (
              pathname.startsWith("/profile") &&
              pathname.includes("tab=subscription")
            ) {
              router.replace("/dashboard");
            } else {
              // User has access, just render the page
            }
          } else {
            // User doesn't have valid subscription
            if (pathname.startsWith("/profile")) {
              // Allow access to profile page so they can set up payment manually
            } else {
              // Check if user needs payment setup (non-free tier without payment)
              if (
                subscriptionData.tier !== "free" &&
                subscriptionData.requiresPaymentSetup &&
                !subscriptionData.hasPaymentMethod
              ) {
                // Don't auto-redirect if user just canceled payment
                if (paymentCanceled) {
                  router.replace("/profile?tab=subscription&setup=required");
                } else {
                  // Directly create and redirect to Stripe checkout
                  setLoading(false);
                  setShowLoading(false);
                  setIsInitialized(true);
                  await createCheckoutAndRedirect();
                  return;
                }
              } else {
                // Fallback to profile page for other cases
                router.replace("/profile?tab=subscription&setup=required");
              }
            }
          }
        }
      } catch (error) {
        console.error("Subscription check failed:", error);
      } finally {
        setLoading(false);
        setShowLoading(false);
        setIsInitialized(true);
      }
    };

    initializeSubscription();
  }, [isInitialized, isPublicRoute, pathname, router, paymentCanceled]);

  // Show loading screen when checking subscription or redirecting to payment
  if ((showLoading || redirectingToPayment) && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6 p-10 rounded-2xl bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full mx-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-600 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {redirectingToPayment
                ? "Redirecting you to secure payment setup"
                : "Please wait while we verify your account"}
            </p>
          </div>
          {redirectingToPayment && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secured by Stripe</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasAccess = subscription ? hasValidSubscription(subscription) : false;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        hasAccess,
        refreshSubscription,
        forceReinitialize,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
