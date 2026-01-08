import { SUBSCRIPTION_CONFIG, SubscriptionTier, SubscriptionStatus } from '../config/subscription.config';
import db from '../lib/db';
import { subscriptionsModel } from '../models/subscriptions.model';
import { eq } from 'drizzle-orm';

export class SubscriptionService {
    /**
     * Determine tier based on registration order
     * Requirements: 1.2, 1.3, 1.4
     */
    static determineTier(registrationOrder: number): SubscriptionTier {
        if (registrationOrder <= SUBSCRIPTION_CONFIG.TIER_LIMITS.FREE_MAX) {
            return SUBSCRIPTION_CONFIG.TIERS.FREE;
        } else if (registrationOrder <= SUBSCRIPTION_CONFIG.TIER_LIMITS.PROMOTIONAL_MAX) {
            return SUBSCRIPTION_CONFIG.TIERS.PROMOTIONAL;
        } else {
            return SUBSCRIPTION_CONFIG.TIERS.STANDARD;
        }
    }

    /**
     * Calculate trial end date for each tier
     * Requirements: 1.2, 1.3, 1.4
     */
    static calculateTrialEnd(tier: SubscriptionTier, startDate: Date = new Date()): Date | null {
        switch (tier) {
            case SUBSCRIPTION_CONFIG.TIERS.FREE:
                return null; // Free tier has no trial period
            case SUBSCRIPTION_CONFIG.TIERS.PROMOTIONAL:
                return new Date(startDate.getTime() + (SUBSCRIPTION_CONFIG.TRIALS.PROMOTIONAL_DAYS * 24 * 60 * 60 * 1000));
            case SUBSCRIPTION_CONFIG.TIERS.STANDARD:
                return new Date(startDate.getTime() + (SUBSCRIPTION_CONFIG.TRIALS.STANDARD_DAYS * 24 * 60 * 60 * 1000));
            default:
                return null;
        }
    }

    /**
     * Get pricing for a tier
     */
    static getTierPricing(tier: SubscriptionTier): number {
        switch (tier) {
            case SUBSCRIPTION_CONFIG.TIERS.FREE:
                return 0;
            case SUBSCRIPTION_CONFIG.TIERS.PROMOTIONAL:
                return SUBSCRIPTION_CONFIG.PRICING.PROMOTIONAL_MONTHLY;
            case SUBSCRIPTION_CONFIG.TIERS.STANDARD:
                return SUBSCRIPTION_CONFIG.PRICING.STANDARD_MONTHLY;
            default:
                return 0;
        }
    }

    /**
     * Get Stripe price ID for a tier
     */
    static getStripePriceId(tier: SubscriptionTier): string | null {
        switch (tier) {
            case SUBSCRIPTION_CONFIG.TIERS.FREE:
                return null;
            case SUBSCRIPTION_CONFIG.TIERS.PROMOTIONAL:
                return SUBSCRIPTION_CONFIG.STRIPE_PRICE_IDS.PROMOTIONAL;
            case SUBSCRIPTION_CONFIG.TIERS.STANDARD:
                return SUBSCRIPTION_CONFIG.STRIPE_PRICE_IDS.STANDARD;
            default:
                return null;
        }
    }

    /**
     * Check if subscription has active access
     * Requirements: 1.2, 1.3, 1.4
     */
    static hasActiveAccess(subscription: {
        tier: string;
        status: string;
        trialEnd: Date | null;
    }): boolean {
        // Free tier always has access
        if (subscription.tier === SUBSCRIPTION_CONFIG.TIERS.FREE) {
            return true;
        }

        // Check if subscription is active
        if (subscription.status === SUBSCRIPTION_CONFIG.STATUS.ACTIVE) {
            return true;
        }

        // Check if in trial period
        if (subscription.status === SUBSCRIPTION_CONFIG.STATUS.TRIALING) {
            if (!subscription.trialEnd) {
                return true;
            }
            return new Date() < subscription.trialEnd;
        }

        // Incomplete subscriptions have no access until payment is set up
        if (subscription.status === SUBSCRIPTION_CONFIG.STATUS.INCOMPLETE) {
            return false;
        }

        return false;
    }

    /**
     * Check if user requires payment setup
     */
    static requiresPaymentSetup(subscription: {
        tier: string;
        status: string;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
    }): boolean {
        // Free tier never requires payment
        if (subscription.tier === SUBSCRIPTION_CONFIG.TIERS.FREE) {
            return false;
        }

        // If no Stripe subscription exists, payment setup is required
        return !subscription.stripeSubscriptionId;
    }

    /**
     * Get days remaining in trial
     */
    static getDaysRemainingInTrial(trialEnd: Date | null): number | null {
        if (!trialEnd) {
            return null;
        }

        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    }

    /**
     * Validate subscription status
     */
    static isValidStatus(status: string): status is SubscriptionStatus {
        return Object.values(SUBSCRIPTION_CONFIG.STATUS).includes(status as SubscriptionStatus);
    }

    /**
     * Validate subscription tier
     */
    static isValidTier(tier: string): tier is SubscriptionTier {
        return Object.values(SUBSCRIPTION_CONFIG.TIERS).includes(tier as SubscriptionTier);
    }

    // CRUD Operations

    /**
     * Create subscription with tier assignment
     * Requirements: 1.1, 1.5
     */
    static async createSubscription(userId: number, registrationOrder: number, promoCode?: string): Promise<any> {
        try {
            // Check if subscription already exists for this user
            const existingSubscription = await this.getSubscriptionByUserId(userId);
            if (existingSubscription) {
                console.log(`⚠️ Subscription already exists for user ${userId}, returning existing subscription`);
                return existingSubscription;
            }

            const tier = this.determineTier(registrationOrder);

            console.log(`📊 Creating subscription for user ${userId}:`, {
                registrationOrder,
                tier,
                promoCode: promoCode || 'none',
                tierLimits: {
                    FREE_MAX: SUBSCRIPTION_CONFIG.TIER_LIMITS.FREE_MAX,
                    PROMOTIONAL_MAX: SUBSCRIPTION_CONFIG.TIER_LIMITS.PROMOTIONAL_MAX
                }
            });

            // For paid tiers, users start with 'incomplete' status until they set up payment
            // Trial only starts after payment method is added
            let trialStart = null;
            let trialEnd = null;
            let status;

            if (tier === SUBSCRIPTION_CONFIG.TIERS.FREE) {
                status = SUBSCRIPTION_CONFIG.STATUS.ACTIVE;
                console.log(`✅ User ${userId} assigned to FREE tier (active)`);
            } else if (tier === SUBSCRIPTION_CONFIG.TIERS.PROMOTIONAL) {
                status = SUBSCRIPTION_CONFIG.STATUS.INCOMPLETE;
                console.log(`✅ User ${userId} assigned to PROMOTIONAL tier (incomplete - needs payment setup)`);
            } else {
                // Paid tiers start as 'incomplete' - requiring payment setup
                status = SUBSCRIPTION_CONFIG.STATUS.INCOMPLETE;
                console.log(`✅ User ${userId} assigned to STANDARD tier (incomplete - needs payment setup)`);
            }

            const subscriptionData = {
                userId,
                registrationOrder,
                tier,
                status,
                trialStart,
                trialEnd,
                stripePriceId: this.getStripePriceId(tier),
                promoCode: promoCode || null,
            };

            console.log(`💾 Inserting subscription record:`, subscriptionData);

            // Check if registration order is already taken
            const [existingOrder] = await db
                .select()
                .from(subscriptionsModel)
                .where(eq(subscriptionsModel.registrationOrder, registrationOrder))
                .limit(1);

            if (existingOrder) {
                console.error(`❌ Registration order ${registrationOrder} is already taken by user ${existingOrder.userId}`);
                throw new Error(`Registration order ${registrationOrder} is already in use. This indicates a race condition or data inconsistency.`);
            }

            const [subscription] = await db.insert(subscriptionsModel).values(subscriptionData).returning();

            console.log(`✅ Subscription created successfully:`, {
                id: subscription.id,
                userId: subscription.userId,
                tier: subscription.tier,
                status: subscription.status,
                registrationOrder: subscription.registrationOrder
            });

            return subscription;
        } catch (error: any) {
            console.error(`❌ Error creating subscription for user ${userId}:`, {
                error: error.message,
                code: error.code,
                detail: error.detail,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Get subscription by user ID
     * Requirements: 1.1, 1.5
     */
    static async getSubscriptionByUserId(userId: number): Promise<any | null> {
        const [subscription] = await db
            .select()
            .from(subscriptionsModel)
            .where(eq(subscriptionsModel.userId, userId))
            .limit(1);

        return subscription || null;
    }

    /**
     * Update subscription status
     * Requirements: 1.5
     */
    static async updateSubscriptionStatus(
        subscriptionId: number,
        status: SubscriptionStatus,
        additionalData?: {
            stripeCustomerId?: string;
            stripeSubscriptionId?: string;
            currentPeriodStart?: Date;
            currentPeriodEnd?: Date;
            cancelAtPeriodEnd?: boolean;
        }
    ): Promise<any> {
        const updateData: any = {
            status,
            updatedAt: new Date(),
            ...additionalData
        };

        const [updatedSubscription] = await db
            .update(subscriptionsModel)
            .set(updateData)
            .where(eq(subscriptionsModel.id, subscriptionId))
            .returning();

        return updatedSubscription;
    }

    /**
     * Update subscription by user ID
     */
    static async updateSubscriptionByUserId(
        userId: number,
        updateData: {
            status?: SubscriptionStatus;
            stripeCustomerId?: string;
            stripeSubscriptionId?: string;
            currentPeriodStart?: Date;
            currentPeriodEnd?: Date;
            cancelAtPeriodEnd?: boolean;
        }
    ): Promise<any> {
        const [updatedSubscription] = await db
            .update(subscriptionsModel)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(subscriptionsModel.userId, userId))
            .returning();

        return updatedSubscription;
    }

    /**
     * Start trial period after payment method is set up
     * This is called when a user with incomplete subscription sets up payment
     */
    static async startTrialPeriod(userId: number): Promise<any> {
        const subscription = await this.getSubscriptionByUserId(userId);

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Only start trial for incomplete paid tier subscriptions
        if (subscription.tier === SUBSCRIPTION_CONFIG.TIERS.FREE ||
            subscription.status !== SUBSCRIPTION_CONFIG.STATUS.INCOMPLETE) {
            return subscription;
        }

        const trialStart = new Date();
        const trialEnd = this.calculateTrialEnd(subscription.tier, trialStart);

        const [updatedSubscription] = await db
            .update(subscriptionsModel)
            .set({
                status: SUBSCRIPTION_CONFIG.STATUS.TRIALING,
                trialStart,
                trialEnd,
                updatedAt: new Date()
            })
            .where(eq(subscriptionsModel.userId, userId))
            .returning();

        return updatedSubscription;
    }



    /**
     * Get subscription by Stripe customer ID
     */
    static async getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<any | null> {
        const [subscription] = await db
            .select()
            .from(subscriptionsModel)
            .where(eq(subscriptionsModel.stripeCustomerId, stripeCustomerId))
            .limit(1);

        return subscription || null;
    }

    /**
     * Get subscription by Stripe subscription ID
     */
    static async getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<any | null> {
        const [subscription] = await db
            .select()
            .from(subscriptionsModel)
            .where(eq(subscriptionsModel.stripeSubscriptionId, stripeSubscriptionId))
            .limit(1);

        return subscription || null;
    }
}