"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/components/subscription-provider';

export default function OnboardingPage() {
    const { loading, hasAccess } = useSubscription();
    const router = useRouter();

    useEffect(() => {
        // Wait for subscription to load
        if (loading) return;

        // If user has access, redirect to dashboard
        if (hasAccess) {
            router.replace('/dashboard');
            return;
        }

        // If user needs payment setup, the subscription provider will handle the redirect to Stripe
        // This page just serves as a trigger point
    }, [loading, hasAccess, router]);

    // Show loading while subscription provider handles the redirect
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Preparing your workspace...
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please wait while we set up your account
                    </p>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Secured by Stripe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}