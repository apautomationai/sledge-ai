"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import client from "@/lib/axios-client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Calendar } from "@workspace/ui/components/calendar";
import { Label } from "@workspace/ui/components/label";

interface OnboardingFlowProps {
    integrations: Array<{
        name: string;
        status: string;
        metadata?: {
            startReading?: string;
        };
    }>;
}

export default function OnboardingFlow({ integrations }: OnboardingFlowProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isCompleting, setIsCompleting] = useState(false);
    const [showDateDialog, setShowDateDialog] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isSavingDate, setIsSavingDate] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const hasShownToast = useRef(false);
    const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

    const gmailIntegration = integrations.find((i) => i.name === "gmail");
    const outlookIntegration = integrations.find((i) => i.name === "outlook");
    const quickbooksIntegration = integrations.find((i) => i.name === "quickbooks");

    const isGmailConnected = gmailIntegration?.status === "success";
    const isGmailConfigured = gmailIntegration?.metadata?.startReading;
    const isOutlookConnected = outlookIntegration?.status === "success";
    const isOutlookConfigured = outlookIntegration?.metadata?.startReading;
    const isEmailConnected = isGmailConnected || isOutlookConnected;
    const isQuickBooksConnected = quickbooksIntegration?.status === "success";

    const canComplete = isEmailConnected && isQuickBooksConnected;

    // Auto-complete after 2 minutes when both steps are done
    useEffect(() => {
        if (canComplete && !showSuccessAnimation && !isCompleting) {
            // Clear any existing timer
            if (completionTimerRef.current) {
                clearTimeout(completionTimerRef.current);
            }

            // Start 2-minute countdown
            completionTimerRef.current = setTimeout(() => {
                handleAutoComplete();
            }, 3000); // 2 minutes

            return () => {
                if (completionTimerRef.current) {
                    clearTimeout(completionTimerRef.current);
                }
            };
        }
    }, [canComplete, showSuccessAnimation, isCompleting]);

    // Determine which email provider needs configuration
    const connectedEmailProvider = isGmailConnected ? "gmail" : isOutlookConnected ? "outlook" : null;
    const isEmailConfigured = isGmailConnected ? isGmailConfigured : isOutlookConnected ? isOutlookConfigured : false;

    // Handle OAuth callback errors and success messages
    useEffect(() => {
        const errorType = searchParams.get("type");
        const errorMessage = searchParams.get("message");

        // Store message in sessionStorage and clear URL immediately
        if (errorMessage && !hasShownToast.current) {
            console.log("� Stowring message for toast:", { errorType, errorMessage });

            sessionStorage.setItem("onboarding_toast_type", errorType || "");
            sessionStorage.setItem("onboarding_toast_message", errorMessage);

            // Clear URL immediately to prevent re-triggering
            router.replace("/dashboard", { scroll: false });
        }
    }, [searchParams, router]);

    // Show toast after component is stable (separate effect)
    useEffect(() => {
        const toastType = sessionStorage.getItem("onboarding_toast_type");
        const toastMessage = sessionStorage.getItem("onboarding_toast_message");

        if (toastMessage && !hasShownToast.current) {
            console.log("🔔 Showing toast from storage:", { toastType, toastMessage });
            hasShownToast.current = true;

            // Small delay to ensure component is fully mounted
            const timer = setTimeout(() => {
                if (toastType === "error") {
                    toast.error("Connection Failed", {
                        description: decodeURIComponent(toastMessage),
                        duration: 6000,
                    });
                } else if (toastType?.includes("integration")) {
                    toast.success("Integration Successful", {
                        description: decodeURIComponent(toastMessage),
                        duration: 4000,
                    });
                }

                // Clear from sessionStorage after showing
                sessionStorage.removeItem("onboarding_toast_type");
                sessionStorage.removeItem("onboarding_toast_message");
                hasShownToast.current = false;
            }, 300);

            return () => clearTimeout(timer);
        }
    }, []);

    // Show date configuration dialog after email connection (Gmail or Outlook)
    useEffect(() => {
        if (isEmailConnected && !isEmailConfigured) {
            setShowDateDialog(true);
        }
    }, [isEmailConnected, isEmailConfigured]);

    const handleConnectGmail = async () => {
        try {
            localStorage.setItem("onboarding_mode", "true");
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/gmail`;
            const res: any = await client.get(url);
            if (res.url) {
                window.location.href = res.url;
            }
        } catch (error) {
            toast.error("Failed to connect Gmail");
        }
    };

    const handleConnectMicrosoft = async () => {
        try {
            localStorage.setItem("onboarding_mode", "true");
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/outlook`;
            const res: any = await client.get(url);
            if (res.url) {
                window.location.href = res.url;
            }
        } catch (error) {
            toast.error("Failed to connect Microsoft");
        }
    };

    const handleConnectQuickBooks = async () => {
        if (!isEmailConnected) {
            toast.error("Please connect an email provider first");
            return;
        }
        try {
            localStorage.setItem("onboarding_mode", "true");
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/quickbooks/auth`;
            const res: any = await client.get(url);
            if (res.url) {
                window.location.href = res.url;
            }
        } catch (error) {
            toast.error("Failed to connect QuickBooks");
        }
    };

    const handleSaveEmailDate = async () => {
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        if (!connectedEmailProvider) {
            toast.error("No email provider connected");
            return;
        }

        setIsSavingDate(true);
        try {
            const dateString = date.toISOString().split("T")[0];
            await client.patch("api/v1/settings/update-start", {
                name: connectedEmailProvider,
                startReading: dateString,
            });
            toast.success("Start date saved successfully!");
            setShowDateDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to save date");
        } finally {
            setIsSavingDate(false);
        }
    };

    const handleAutoComplete = async () => {
        // Show success animation
        setShowSuccessAnimation(true);

        // Wait 2-3 seconds then complete onboarding
        setTimeout(async () => {
            setIsCompleting(true);
            try {
                await client.post("api/v1/users/complete-onboarding");
                router.push("/dashboard");
                router.refresh();
            } catch (error) {
                toast.error("Failed to complete onboarding");
                setIsCompleting(false);
                setShowSuccessAnimation(false);
            }
        }, 2500);
    };

    const handleCompleteOnboarding = async () => {
        if (!canComplete) {
            toast.error("Please complete all integrations first");
            return;
        }

        // Clear the auto-complete timer if user manually completes
        if (completionTimerRef.current) {
            clearTimeout(completionTimerRef.current);
        }

        handleAutoComplete();
    };

    return (
        <div className="min-h-screen  flex items-center justify-center p-4">
            {/* Success Animation Overlay */}
            {showSuccessAnimation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm">
                    <div className="animate-in zoom-in-50 duration-500">
                        <CheckCircle2 className="h-48 w-48 text-green-500 animate-pulse" strokeWidth={2} />
                    </div>
                </div>
            )}

            <Card className="w-full max-w-3xl border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-3">Welcome to Sledge</h1>
                        <p className="text-gray-400 text-lg">Complete these steps to activate autonomous AP</p>
                    </div>

                    {/* Email Connection Section */}
                    <div className="mb-10">
                        <h2 className="text-gray-300 text-lg mb-6">Connect your email you receive invoices at</h2>
                        <div className="flex items-center gap-6">
                            {/* Gmail Button */}
                            <button
                                onClick={handleConnectGmail}
                                disabled={isGmailConnected}
                                className="flex-1 bg-gray-800/50 h-36 hover:bg-gray-800 border border-gray-700 rounded-2xl p-8 transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group focus:outline-none focus:ring-0"
                            >
                                <div className="flex items-center justify-center">
                                    <Image
                                        src="/images/logos/gmail.png"
                                        alt="Gmail"
                                        width={80}
                                        height={80}

                                        className="group-hover:scale-110 transition-transform duration-200"
                                    />
                                </div>
                            </button>

                            {/* Microsoft/Outlook Button */}
                            <button
                                onClick={handleConnectMicrosoft}
                                disabled={isOutlookConnected}
                                className="flex-1 bg-gray-800/50 h-36 hover:bg-gray-800 border border-gray-700 rounded-2xl p-8 transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group focus:outline-none focus:ring-0"
                            >
                                <div className="flex items-center justify-center">
                                    <Image
                                        src="/images/logos/microsoft.png"
                                        alt="Microsoft"
                                        width={80}
                                        height={80}
                                        className="group-hover:scale-110 transition-transform duration-200"
                                    />
                                </div>
                            </button>

                            {/* Status Indicator */}
                            <div className="flex-shrink-0">
                                {isEmailConnected ? (
                                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                                ) : (
                                    <Circle className="h-16 w-16 text-gray-600" strokeWidth={3} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* QuickBooks Connection Section */}
                    <div className="mb-10">
                        <h2 className="text-gray-300 text-lg mb-6">Connect your accounting platform</h2>
                        <div className="flex items-center gap-6">
                            {/* QuickBooks Button */}
                            <button
                                onClick={handleConnectQuickBooks}
                                disabled={isQuickBooksConnected || !isEmailConnected}
                                className="flex-1 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-2xl p-8 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-0"
                            >
                                <div className="flex items-center justify-center">
                                    <Image
                                        src="/images/logos/quickbooks.png"
                                        alt="QuickBooks"
                                        width={80}
                                        height={80}
                                        className="group-hover:scale-110 transition-transform duration-200"
                                    />
                                </div>
                            </button>

                            {/* Empty space to match layout */}
                            <div className="flex-1"></div>

                            {/* Status Indicator */}
                            <div className="flex-shrink-0">
                                {isQuickBooksConnected ? (
                                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                                ) : (
                                    <Circle className="h-16 w-16 text-gray-600" strokeWidth={3} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Complete Button - Only show when all integrations are connected */}
                    {canComplete && !showSuccessAnimation && (
                        <div className="mt-12 flex justify-center">
                            <Button
                                size="lg"
                                onClick={handleCompleteOnboarding}
                                disabled={isCompleting}
                                className="px-12 py-6 text-lg bg-gray-700 hover:bg-gray-600 text-white rounded-xl focus:outline-none focus:ring-0"
                            >
                                {isCompleting ? "Setting up..." : "Go to Dashboard"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Email Date Configuration Dialog */}
            <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            Configure {connectedEmailProvider === "gmail" ? "Gmail" : "Outlook"} Start Date
                        </DialogTitle>
                        <DialogDescription>
                            Select the date from which to start processing emails. We'll only process invoices received on or after this date.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="mb-2 block">Start Date</Label>
                        <div className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                                disabled={(date) => date > new Date()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDateDialog(false)}
                            disabled={isSavingDate}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveEmailDate}
                            disabled={!date || isSavingDate}
                        >
                            {isSavingDate ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save & Continue"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
