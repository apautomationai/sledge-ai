"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function OnboardingRedirectHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check if we're on the integrations page with success/error params
        const hasMessage = searchParams.get("message");
        const hasType = searchParams.get("type");

        if (hasMessage || hasType) {
            // Check if we're in onboarding mode
            const isOnboarding = localStorage.getItem("onboarding_mode") === "true";

            if (isOnboarding) {
                console.log("🔄 Onboarding mode detected, redirecting to dashboard");
                // Clear the flag
                localStorage.removeItem("onboarding_mode");

                // Preserve error/success messages when redirecting
                const redirectUrl = new URL("/dashboard", window.location.origin);
                if (hasType) {
                    redirectUrl.searchParams.set("type", hasType);
                }
                if (hasMessage) {
                    redirectUrl.searchParams.set("message", hasMessage);
                }

                // Redirect to dashboard with params
                router.replace(redirectUrl.pathname + redirectUrl.search);
            }
        }
    }, [searchParams, router]);

    return null;
}
