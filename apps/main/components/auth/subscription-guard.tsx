"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/components/subscription-provider';

interface SubscriptionGuardProps {
    children: React.ReactNode;
    requiresAccess?: boolean;
    loadingType?: 'fullscreen' | 'skeleton';
}

export function SubscriptionGuard({ children, requiresAccess = true, loadingType = 'fullscreen' }: SubscriptionGuardProps) {
    const { subscription, loading, hasAccess } = useSubscription();
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // If access is not required, grant immediately
        if (!requiresAccess) {
            setIsChecking(false);
            return;
        }

        // Wait for subscription provider to finish loading
        if (loading) {
            return;
        }

        // Check access based on subscription provider's state
        if (hasAccess) {
            console.log('✅ Access granted via subscription provider');
            setIsChecking(false);
        } else {
            console.log('❌ Access denied, redirecting to subscription setup');
            router.replace('/profile?tab=subscription&setup=required');
        }
    }, [loading, hasAccess, requiresAccess]);

    // Show loading while checking or while subscription provider is loading
    if (isChecking || loading) {
        if (loadingType === 'skeleton') {
            return (
                <div className="space-y-6 p-6 bg-white dark:bg-gray-900 min-h-screen">
                    <div className="space-y-2">
                        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                                <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4 p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-600 border-t-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Block access if required but not granted
    if (requiresAccess && !hasAccess) {
        return null;
    }

    // Render children
    return <>{children}</>;
}