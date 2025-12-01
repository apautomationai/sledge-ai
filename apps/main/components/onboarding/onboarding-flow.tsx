"use client";

import React, { useState, useEffect } from "react";
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

    // Determine which email provider needs configuration
    const connectedEmailProvider = isGmailConnected ? "gmail" : isOutlookConnected ? "outlook" : null;
    const isEmailConfigured = isGmailConnected ? isGmailConfigured : isOutlookConnected ? isOutlookConfigured : false;

    // Handle OAuth callback errors and success messages
    useEffect(() => {
        const errorType = searchParams.get("type");
        const errorMessage = searchParams.get("message");

        if (errorMessage) {
            if (errorType === "error") {
                // Show error toast
                toast.error("Connection Failed", {
                    description: decodeURIComponent(errorMessage),
                    duration: 5000,
                });
            } else if (errorType?.includes("integration")) {
                // Show success toast for integrations
                toast.success("Integration Successful", {
                    description: decodeURIComponent(errorMessage),
                    duration: 3000,
                });
            }

            // Clear the params from URL after a short delay to ensure toast is shown
            const timer = setTimeout(() => {
                router.replace("/dashboard", { scroll: false });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    // Show date configuration dialog after email connection (Gmail or Outlook)
    useEffect(() => {
        if (isEmailConnected && !isEmailConfigured) {
            setShowDateDialog(true);
        }
    }, [isEmailConnected, isEmailConfigured]);

    const handleConnectGmail = async () => {
        try {
            localStorage.setItem("onboarding_mode", "true");
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google/auth`;
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
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/outlook/auth`;
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

    const handleCompleteOnboarding = async () => {
        if (!canComplete) {
            toast.error("Please complete all integrations first");
            return;
        }
        setIsCompleting(true);
        try {
            await client.post("api/v1/users/complete-onboarding");
            toast.success("Welcome! Your account is all set up.");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            toast.error("Failed to complete onboarding");
            setIsCompleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
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
                                className="flex-1 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-2xl p-8 transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group"
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
                                className="flex-1 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-2xl p-8 transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group"
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
                                className="flex-1 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-2xl p-8 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                    {canComplete && (
                        <div className="mt-12 flex justify-center">
                            <Button
                                size="lg"
                                onClick={handleCompleteOnboarding}
                                disabled={isCompleting}
                                className="px-12 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
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
