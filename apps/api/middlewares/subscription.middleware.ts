import { Request, Response, NextFunction } from "express-serve-static-core";
import { SubscriptionService } from "@/services/subscription.service";
import { SUBSCRIPTION_CONFIG } from "@/config/subscription.config";

/**
 * Middleware to check subscription access for protected routes
 * Requirements: 2.2, 3.2
 */
export const requireSubscriptionAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Ensure user is authenticated first
        //@ts-ignore
        if (!req.user?.id) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required"
            });
        }

        // Get user's subscription
        //@ts-ignore
        const subscription = await SubscriptionService.getSubscriptionByUserId(req.user.id);

        if (!subscription) {
            return res.status(403).json({
                error: "SubscriptionRequired",
                message: "No subscription found for user",
                code: "SUBSCRIPTION_NOT_FOUND"
            });
        }

        // Check if user has active access
        const hasAccess = SubscriptionService.hasActiveAccess(subscription);

        if (hasAccess) {
            // User has valid access, continue
            return next();
        }

        // Check if user is in grace period for payment failures
        const isInGracePeriod = checkGracePeriod(subscription);

        if (isInGracePeriod) {
            // Allow access during grace period but add warning header
            res.set('X-Subscription-Warning', 'Payment required - grace period active');
            return next();
        }

        // Determine appropriate error response based on subscription state
        const errorResponse = getAccessDeniedResponse(subscription);
        return res.status(403).json(errorResponse);

    } catch (error) {
        console.error("Subscription access check error:", error);
        return res.status(500).json({
            error: "InternalError",
            message: "Failed to validate subscription access"
        });
    }
};

/**
 * Check if subscription is in grace period for payment failures
 * Grace period: 7 days after payment failure for paid tiers
 */
function checkGracePeriod(subscription: any): boolean {
    // Only apply grace period for past_due status
    if (subscription.status !== SUBSCRIPTION_CONFIG.STATUS.PAST_DUE) {
        return false;
    }

    // Check if current period end is within 7 days
    if (subscription.currentPeriodEnd) {
        const gracePeriodEnd = new Date(subscription.currentPeriodEnd);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7-day grace period

        return new Date() <= gracePeriodEnd;
    }

    return false;
}

/**
 * Generate appropriate error response based on subscription state
 */
function getAccessDeniedResponse(subscription: any) {
    const baseResponse = {
        error: "AccessDenied",
        tier: subscription.tier,
        status: subscription.status
    };

    switch (subscription.status) {
        case SUBSCRIPTION_CONFIG.STATUS.TRIALING:
            // Trial has expired
            return {
                ...baseResponse,
                message: "Trial period has expired. Please upgrade your subscription to continue.",
                code: "TRIAL_EXPIRED",
                requiresPayment: true
            };

        case SUBSCRIPTION_CONFIG.STATUS.PAST_DUE:
            // Payment failed and grace period expired
            return {
                ...baseResponse,
                message: "Payment is past due. Please update your payment method to restore access.",
                code: "PAYMENT_PAST_DUE",
                requiresPayment: true
            };

        case SUBSCRIPTION_CONFIG.STATUS.CANCELED:
            // Subscription was canceled
            return {
                ...baseResponse,
                message: "Subscription has been canceled. Please resubscribe to continue using the service.",
                code: "SUBSCRIPTION_CANCELED",
                requiresPayment: true
            };

        case SUBSCRIPTION_CONFIG.STATUS.UNPAID:
            // Payment failed
            return {
                ...baseResponse,
                message: "Payment is required. Please update your payment method.",
                code: "PAYMENT_REQUIRED",
                requiresPayment: true
            };

        case SUBSCRIPTION_CONFIG.STATUS.INCOMPLETE:
            // Subscription setup incomplete
            return {
                ...baseResponse,
                message: "Subscription setup is incomplete. Please complete the payment process.",
                code: "SETUP_INCOMPLETE",
                requiresPayment: true
            };

        default:
            // Generic access denied
            return {
                ...baseResponse,
                message: "Access denied. Please check your subscription status.",
                code: "ACCESS_DENIED",
                requiresPayment: true
            };
    }
}

/**
 * Optional middleware for routes that should be accessible during trial setup
 * This allows promotional and standard tier users to access certain routes
 * even when they haven't set up payment yet
 */
export const allowTrialSetup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //@ts-ignore
        if (!req.user?.id) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Authentication required"
            });
        }

        //@ts-ignore
        const subscription = await SubscriptionService.getSubscriptionByUserId(req.user.id);

        if (!subscription) {
            return res.status(403).json({
                error: "SubscriptionRequired",
                message: "No subscription found for user"
            });
        }

        // Allow access if user has active subscription or is in trial
        const hasAccess = SubscriptionService.hasActiveAccess(subscription);
        if (hasAccess) {
            return next();
        }

        // Allow access if user needs to set up payment (promotional/standard tier without Stripe subscription)
        const requiresPaymentSetup = SubscriptionService.requiresPaymentSetup(subscription);
        if (requiresPaymentSetup) {
            res.set('X-Subscription-Setup-Required', 'true');
            return next();
        }

        // Check grace period
        const isInGracePeriod = checkGracePeriod(subscription);
        if (isInGracePeriod) {
            res.set('X-Subscription-Warning', 'Payment required - grace period active');
            return next();
        }

        // Access denied
        const errorResponse = getAccessDeniedResponse(subscription);
        return res.status(403).json(errorResponse);

    } catch (error) {
        console.error("Trial setup access check error:", error);
        return res.status(500).json({
            error: "InternalError",
            message: "Failed to validate subscription access"
        });
    }
};