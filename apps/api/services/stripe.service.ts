import Stripe from 'stripe';
import { SUBSCRIPTION_CONFIG, SubscriptionTier } from '../config/subscription.config';
import { SubscriptionService } from './subscription.service';
import db from '../lib/db';
import { usersModel } from '../models/users.model';
import { eq } from 'drizzle-orm';

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined,
});

export class StripeService {
    /**
     * Create Stripe customer for new subscriptions
     * Requirements: 2.4, 3.4, 5.1
     */
    static async createStripeCustomer(userId: number): Promise<string> {
        try {
            // Get user details from database
            const [user] = await db
                .select()
                .from(usersModel)
                .where(eq(usersModel.id, userId))
                .limit(1);

            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }

            // Create customer in Stripe
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
                metadata: {
                    userId: userId.toString(),
                    businessName: user.businessName || '',
                },
            });

            // Update subscription with Stripe customer ID
            await SubscriptionService.updateSubscriptionByUserId(userId, {
                stripeCustomerId: customer.id,
            });

            return customer.id;
        } catch (error) {
            console.error('Error creating Stripe customer:', error);
            throw new Error(`Failed to create Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieve Stripe customer ID for a user
     * Requirements: 2.4, 3.4, 5.1
     */
    static async getStripeCustomerId(userId: number): Promise<string | null> {
        try {
            const subscription = await SubscriptionService.getSubscriptionByUserId(userId);

            if (!subscription) {
                throw new Error(`Subscription not found for user ${userId}`);
            }

            // If customer ID already exists, return it
            if (subscription.stripeCustomerId) {
                return subscription.stripeCustomerId;
            }

            // If no customer ID exists, create one
            return await this.createStripeCustomer(userId);
        } catch (error) {
            console.error('Error retrieving Stripe customer ID:', error);
            throw new Error(`Failed to get Stripe customer ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get Stripe customer by ID with error handling
     * Requirements: 2.4, 3.4, 5.1
     */
    static async getStripeCustomer(customerId: string): Promise<Stripe.Customer | null> {
        try {
            const customer = await stripe.customers.retrieve(customerId);

            if (customer.deleted) {
                return null;
            }

            return customer as Stripe.Customer;
        } catch (error) {
            console.error('Error retrieving Stripe customer:', error);
            return null;
        }
    }

    /**
     * Update Stripe customer information
     * Requirements: 5.1
     */
    static async updateStripeCustomer(customerId: string, updateData: {
        email?: string;
        name?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Customer> {
        try {
            const customer = await stripe.customers.update(customerId, updateData);
            return customer;
        } catch (error) {
            console.error('Error updating Stripe customer:', error);
            throw new Error(`Failed to update Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Handle customer creation errors gracefully
     * Requirements: 2.4, 3.4, 5.1
     */
    static async ensureStripeCustomer(userId: number): Promise<string> {
        try {
            // First try to get existing customer ID
            const subscription = await SubscriptionService.getSubscriptionByUserId(userId);

            if (!subscription) {
                throw new Error(`Subscription not found for user ${userId}`);
            }

            if (subscription.stripeCustomerId) {
                // Verify customer still exists in Stripe
                const customer = await this.getStripeCustomer(subscription.stripeCustomerId);
                if (customer) {
                    return subscription.stripeCustomerId;
                }
                // If customer doesn't exist in Stripe, create a new one
            }

            // Create new customer
            return await this.createStripeCustomer(userId);
        } catch (error) {
            console.error('Error ensuring Stripe customer:', error);
            throw new Error(`Failed to ensure Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create checkout session for tier-specific pricing with trial periods
     * Requirements: 2.4, 3.4
     */
    static async createCheckoutSession(userId: number, options?: {
        successUrl?: string;
        cancelUrl?: string;
    }): Promise<{ sessionId: string; url: string }> {
        try {
            const subscription = await SubscriptionService.getSubscriptionByUserId(userId);

            if (!subscription) {
                throw new Error(`Subscription not found for user ${userId}`);
            }

            // Free tier doesn't need checkout
            if (subscription.tier === SUBSCRIPTION_CONFIG.TIERS.FREE) {
                throw new Error('Free tier users do not need to create checkout sessions');
            }

            // Ensure customer exists
            const customerId = await this.ensureStripeCustomer(userId);

            // Get price ID for the tier
            const priceId = SubscriptionService.getStripePriceId(subscription.tier as SubscriptionTier);
            if (!priceId) {
                throw new Error(`No Stripe price ID configured for tier: ${subscription.tier}`);
            }

            // Calculate trial period days
            let trialPeriodDays = subscription.tier === SUBSCRIPTION_CONFIG.TIERS.PROMOTIONAL
                ? SUBSCRIPTION_CONFIG.TRIALS.PROMOTIONAL_DAYS
                : SUBSCRIPTION_CONFIG.TRIALS.STANDARD_DAYS;

            // Add extra 30 days trial if promo code is used
            if (subscription.promoCode) {
                trialPeriodDays += 30;
                console.log(`Extended trial to ${trialPeriodDays} days for promo code: ${subscription.promoCode}`);
            }

            // Default URLs
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const successUrl = options?.successUrl || `${baseUrl}/dashboard?payment_success=true`;
            const cancelUrl = options?.cancelUrl || `${baseUrl}/profile?tab=subscription&canceled=true`;

            // Build checkout session config
            const sessionConfig: Stripe.Checkout.SessionCreateParams = {
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                subscription_data: {
                    trial_period_days: trialPeriodDays,
                    metadata: {
                        userId: userId.toString(),
                        tier: subscription.tier,
                    },
                },
                success_url: successUrl,
                cancel_url: cancelUrl,
                billing_address_collection: 'required',
                metadata: {
                    userId: userId.toString(),
                    tier: subscription.tier,
                },
            };

            // Apply promo code if stored in subscription
            if (subscription.promoCode) {
                try {
                    // Look up the promotion code in Stripe
                    const promoCodes = await stripe.promotionCodes.list({
                        code: subscription.promoCode,
                        active: true,
                        limit: 1,
                    });

                    if (promoCodes.data.length > 0) {
                        sessionConfig.discounts = [{
                            promotion_code: promoCodes.data[0].id,
                        }];
                        console.log(`Applied promo code ${subscription.promoCode} to checkout session`);
                    } else {
                        console.warn(`Promo code ${subscription.promoCode} not found or inactive in Stripe, allowing manual entry`);
                        sessionConfig.allow_promotion_codes = true;
                    }
                } catch (promoError) {
                    console.error(`Error looking up promo code ${subscription.promoCode}:`, promoError);
                    // Fall back to allowing manual promo code entry
                    sessionConfig.allow_promotion_codes = true;
                }
            } else {
                // No promo code stored, allow manual entry
                sessionConfig.allow_promotion_codes = true;
            }

            // Create checkout session
            const session = await stripe.checkout.sessions.create(sessionConfig);

            if (!session.id || !session.url) {
                throw new Error('Failed to create checkout session');
            }

            return {
                sessionId: session.id,
                url: session.url,
            };
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get checkout session details
     * Requirements: 2.4, 3.4
     */
    static async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            return session;
        } catch (error) {
            console.error('Error retrieving checkout session:', error);
            return null;
        }
    }

    /**
     * Handle successful checkout completion
     * Requirements: 2.4, 3.4
     */
    static async handleCheckoutSuccess(sessionId: string): Promise<void> {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['subscription'],
            });

            if (!session.metadata?.userId) {
                throw new Error('No user ID found in session metadata');
            }

            const userId = parseInt(session.metadata.userId);
            const stripeSubscriptionId = session.subscription as string;

            if (!stripeSubscriptionId) {
                throw new Error('No subscription ID found in checkout session');
            }

            // Update local subscription with Stripe subscription ID
            await SubscriptionService.updateSubscriptionByUserId(userId, {
                stripeSubscriptionId,
                status: SUBSCRIPTION_CONFIG.STATUS.TRIALING,
            });
        } catch (error) {
            console.error('Error handling checkout success:', error);
            throw new Error(`Failed to handle checkout success: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create customer portal session for subscription management
     * Requirements: 5.1
     */
    static async createCustomerPortalSession(userId: number, options?: {
        returnUrl?: string;
    }): Promise<{ url: string }> {
        try {
            const subscription = await SubscriptionService.getSubscriptionByUserId(userId);

            if (!subscription) {
                throw new Error(`Subscription not found for user ${userId}`);
            }

            // Free tier users don't need portal access
            if (subscription.tier === SUBSCRIPTION_CONFIG.TIERS.FREE) {
                throw new Error('Free tier users do not have access to customer portal');
            }

            // Ensure customer exists
            const customerId = await this.ensureStripeCustomer(userId);

            // Default return URL
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const returnUrl = options?.returnUrl || `${baseUrl}/profile?tab=subscription`;

            // Create portal session
            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl,
            });

            if (!session.url) {
                throw new Error('Failed to create customer portal session');
            }

            return {
                url: session.url,
            };
        } catch (error) {
            console.error('Error creating customer portal session:', error);
            throw new Error(`Failed to create customer portal session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Configure customer portal settings
     * Requirements: 5.1
     */
    static async configureCustomerPortal(): Promise<void> {
        try {
            // Configure portal settings (this is typically done once during setup)
            await stripe.billingPortal.configurations.create({
                business_profile: {
                    headline: 'Manage your subscription',
                },
                features: {
                    payment_method_update: {
                        enabled: true,
                    },
                    subscription_cancel: {
                        enabled: true,
                        mode: 'at_period_end',
                        cancellation_reason: {
                            enabled: true,
                            options: [
                                'too_expensive',
                                'missing_features',
                                'switched_service',
                                'unused',
                                'other',
                            ],
                        },
                    },

                    subscription_update: {
                        enabled: false, // Disable plan changes for now
                        default_allowed_updates: [],
                    },
                    invoice_history: {
                        enabled: true,
                    },
                },
            });
        } catch (error) {
            console.error('Error configuring customer portal:', error);
            throw new Error(`Failed to configure customer portal: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate user access to customer portal
     * Requirements: 5.1
     */
    static async validatePortalAccess(userId: number): Promise<boolean> {
        try {
            const subscription = await SubscriptionService.getSubscriptionByUserId(userId);

            if (!subscription) {
                return false;
            }

            // Free tier users don't have portal access
            if (subscription.tier === SUBSCRIPTION_CONFIG.TIERS.FREE) {
                return false;
            }

            // Must have a Stripe customer ID
            if (!subscription.stripeCustomerId) {
                return false;
            }

            // Verify customer exists in Stripe
            const customer = await this.getStripeCustomer(subscription.stripeCustomerId);
            return customer !== null;
        } catch (error) {
            console.error('Error validating portal access:', error);
            return false;
        }
    }

    /**
     * Handle portal access errors gracefully
     * Requirements: 5.1
     */
    static async safeCreateCustomerPortalSession(userId: number, options?: {
        returnUrl?: string;
    }): Promise<{ url: string } | { error: string }> {
        try {
            // Validate access first
            const hasAccess = await this.validatePortalAccess(userId);
            if (!hasAccess) {
                return { error: 'User does not have access to customer portal' };
            }

            return await this.createCustomerPortalSession(userId, options);
        } catch (error) {
            console.error('Error in safe portal session creation:', error);
            return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
        }
    }
}