export const SUBSCRIPTION_CONFIG = {
    TIERS: {
        STANDARD: 'standard'
    } as const,

    PRICING: {
        STANDARD_MONTHLY: 29900 // $299.00 in cents
    } as const,

    TRIALS: {
        STANDARD_DAYS: process.env.STRIPE_STANDARD_PRICE_TRIAL_DAYS // 30 days
    } as const,

    STRIPE_PRICE_IDS: {
        STANDARD: process.env.STRIPE_STANDARD_PRICE_ID || ''
    } as const,

    STATUS: {
        ACTIVE: 'active',
        TRIALING: 'trialing',
        PAST_DUE: 'past_due',
        CANCELED: 'canceled',
        UNPAID: 'unpaid',
        INCOMPLETE: 'incomplete'
    } as const
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_CONFIG.TIERS[keyof typeof SUBSCRIPTION_CONFIG.TIERS];
export type SubscriptionStatus = typeof SUBSCRIPTION_CONFIG.STATUS[keyof typeof SUBSCRIPTION_CONFIG.STATUS];