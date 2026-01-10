import { Request, Response } from 'express';
import { SubscriptionService } from '@/services/subscription.service';
import { StripeService } from '@/services/stripe.service';
import { WebhookService } from '@/services/webhook.service';
import { SUBSCRIPTION_CONFIG } from '@/config/subscription.config';
import { BadRequestError, InternalServerError, NotFoundError } from '@/helpers/errors';

export class SubscriptionController {
    /**
     * Get subscription status endpoint
     * Requirements: 4.1, 4.2, 4.3, 4.4
     */
    getSubscriptionStatus = async (req: Request, res: Response) => {
        try {
            //@ts-ignore
            const userId = req.user.id;

            if (!userId) {
                throw new BadRequestError('User ID is required');
            }

            // Get subscription from database
            let subscription = await SubscriptionService.getSubscriptionByUserId(userId);

            // If subscription doesn't exist, try to create one (recovery mechanism)
            if (!subscription) {
                console.warn(`⚠️ Subscription not found for user ${userId}, attempting to create one`);

                try {
                    // Import RegistrationService
                    const { RegistrationService } = await import('@/services/registration.service');

                    // Attempt to assign subscription using recovery method
                    await RegistrationService.assignSubscriptionToExistingUser(userId);

                    // Try to fetch again
                    subscription = await SubscriptionService.getSubscriptionByUserId(userId);

                    if (!subscription) {
                        throw new NotFoundError('Failed to create subscription for user');
                    }

                    console.log(`✅ Successfully recovered and created subscription for user ${userId}`);
                } catch (recoveryError: any) {
                    console.error(`❌ Failed to recover subscription for user ${userId}:`, recoveryError);
                    throw new NotFoundError('Subscription not found for user and recovery failed');
                }
            }

            // Calculate days remaining in trial
            const daysRemaining = SubscriptionService.getDaysRemainingInTrial(subscription.trialEnd);

            // Determine if payment setup is required
            const requiresPaymentSetup = SubscriptionService.requiresPaymentSetup(subscription);

            // Check if user has payment method on file
            const hasPaymentMethod = Boolean(subscription.stripeCustomerId && subscription.stripeSubscriptionId);

            // Get monthly price for the tier
            const monthlyPrice = SubscriptionService.getTierPricing(subscription.tier);

            // Build response
            const subscriptionStatus = {
                tier: subscription.tier,
                status: subscription.status,
                registrationOrder: subscription.registrationOrder,
                trialStart: subscription.trialStart?.toISOString() || null,
                trialEnd: subscription.trialEnd?.toISOString() || null,
                daysRemaining,
                monthlyPrice,
                requiresPaymentSetup,
                hasPaymentMethod,
                stripeCustomerId: subscription.stripeCustomerId || null,
                stripeSubscriptionId: subscription.stripeSubscriptionId || null,
                currentPeriodStart: subscription.currentPeriodStart?.toISOString() || null,
                currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
                createdAt: subscription.createdAt?.toISOString(),
                updatedAt: subscription.updatedAt?.toISOString()
            };

            // Set no-cache headers to prevent caching
            res.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });

            return res.status(200).json({
                success: true,
                data: subscriptionStatus,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error('Error getting subscription status:', error);

            if (error instanceof BadRequestError || error instanceof NotFoundError) {
                throw error;
            }

            throw new InternalServerError(
                error.message || 'Unable to retrieve subscription status'
            );
        }
    };

    /**
     * Create checkout session endpoint
     * Requirements: 2.4, 3.4
     */
    createCheckoutSession = async (req: Request, res: Response) => {
        try {
            //@ts-ignore
            const userId = req.user.id;
            const { successUrl, cancelUrl } = req.body;

            if (!userId) {
                throw new BadRequestError('User ID is required');
            }

            // Get subscription to validate tier
            const subscription = await SubscriptionService.getSubscriptionByUserId(userId);

            if (!subscription) {
                throw new NotFoundError('Subscription not found for user');
            }

            // Check if user already has an active subscription
            if (subscription.stripeSubscriptionId && subscription.status === SUBSCRIPTION_CONFIG.STATUS.ACTIVE) {
                throw new BadRequestError('User already has an active subscription');
            }

            // Create checkout session
            const checkoutSession = await StripeService.createCheckoutSession(userId, {
                successUrl,
                cancelUrl
            });

            return res.status(200).json({
                success: true,
                data: {
                    sessionId: checkoutSession.sessionId,
                    url: checkoutSession.url
                },
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error('Error creating checkout session:', error);

            if (error instanceof BadRequestError || error instanceof NotFoundError) {
                throw error;
            }

            throw new InternalServerError(
                error.message || 'Unable to create checkout session'
            );
        }
    };

    /**
     * Create customer portal session endpoint
     * Requirements: 5.1
     */
    createCustomerPortal = async (req: Request, res: Response) => {
        try {
            //@ts-ignore
            const userId = req.user.id;
            const { returnUrl } = req.body;

            if (!userId) {
                throw new BadRequestError('User ID is required');
            }

            // Validate user access to portal
            const hasAccess = await StripeService.validatePortalAccess(userId);

            if (!hasAccess) {
                throw new BadRequestError('User does not have access to customer portal');
            }

            // Create customer portal session
            const portalSession = await StripeService.createCustomerPortalSession(userId, {
                returnUrl
            });

            return res.status(200).json({
                success: true,
                data: {
                    url: portalSession.url
                },
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error('Error creating customer portal session:', error);

            if (error instanceof BadRequestError) {
                throw error;
            }

            throw new InternalServerError(
                error.message || 'Unable to create customer portal session'
            );
        }
    };

    /**
     * Handle Stripe webhook events
     * Requirements: 5.2, 5.3, 5.4, 5.5
     */
    handleStripeWebhook = async (req: Request, res: Response) => {
        try {
            console.log('🔍 Webhook received');

            const sig = req.headers['stripe-signature'] as string;
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!endpointSecret) {
                console.error('❌ Stripe webhook secret not configured');
                throw new InternalServerError('Stripe webhook secret not configured');
            }

            if (!sig) {
                console.error('❌ Missing Stripe signature');
                throw new BadRequestError('Missing Stripe signature');
            }

            // Get raw body for signature verification
            const payload = req.body;
            if (!payload) {
                console.error('❌ Missing request body');
                throw new BadRequestError('Missing request body');
            }

            // Ensure payload is a Buffer or string for Stripe signature verification
            if (!Buffer.isBuffer(payload) && typeof payload !== 'string') {
                console.error('❌ Body is not Buffer or string:', typeof payload);
                throw new BadRequestError('Webhook payload must be raw body (Buffer or string)');
            }

            let event;
            try {
                // Validate webhook signature and construct event
                event = WebhookService.validateWebhookSignature(
                    payload,
                    sig,
                    endpointSecret
                );
            } catch (sigError: any) {
                console.error('❌ Signature verification failed:', sigError.message);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid webhook signature',
                    details: sigError.message
                });
            }

            console.log(`📋 Processing webhook event: ${event.type} (${event.id})`);

            try {
                // Process webhook event with retry logic
                await WebhookService.processWebhookWithRetry(event);

                return res.status(200).json({
                    success: true,
                    message: 'Webhook processed successfully'
                });
            } catch (processError: any) {
                console.error('❌ Webhook processing failed:', processError.message);

                // Return 500 for processing errors to trigger Stripe retries
                return res.status(500).json({
                    success: false,
                    error: 'Webhook processing failed',
                    details: processError.message
                });
            }

        } catch (error: any) {
            console.error('❌ Unexpected error handling Stripe webhook:', error);

            return res.status(500).json({
                success: false,
                error: 'Webhook processing failed',
                details: error.message
            });
        }
    };


}

export const subscriptionController = new SubscriptionController();