import db from '../lib/db';
import { registrationCounterModel } from '../models/subscriptions.model';
import { SubscriptionService } from './subscription.service';
import { eq, sql } from 'drizzle-orm';
import { InternalServerError } from '../helpers/errors';

export class RegistrationService {
    /**
     * Get next registration order atomically with fallback logic
     * Requirements: 1.1
     */
    static async getNextRegistrationOrder(): Promise<number> {
        try {
            // First, try to get the current counter
            let [counter] = await db
                .select()
                .from(registrationCounterModel)
                .limit(1);

            // If no counter exists, initialize it (fallback logic)
            if (!counter) {
                try {
                    [counter] = await db
                        .insert(registrationCounterModel)
                        .values({ currentCount: 0 })
                        .returning();
                } catch (insertError: any) {
                    // Handle race condition where another process might have inserted
                    if (insertError.code === '23505') { // unique_violation
                        [counter] = await db
                            .select()
                            .from(registrationCounterModel)
                            .limit(1);
                    } else {
                        throw insertError;
                    }
                }
            }

            if (!counter) {
                throw new InternalServerError('Failed to initialize registration counter');
            }

            // Atomically increment and return the new value (handles concurrent scenarios)
            const [updatedCounter] = await db
                .update(registrationCounterModel)
                .set({
                    currentCount: sql`${registrationCounterModel.currentCount} + 1`,
                    updatedAt: new Date()
                })
                .where(eq(registrationCounterModel.id, counter.id))
                .returning();

            return updatedCounter.currentCount;
        } catch (error: any) {
            throw new InternalServerError(`Failed to get registration order: ${error.message}`);
        }
    }

    /**
     * Assign subscription to user during registration
     * Requirements: 1.1
     */
    static async assignSubscriptionToUser(userId: number, useExistingOrder?: number, promoCode?: string): Promise<void> {
        try {
            // Get next registration order (or use provided one for recovery)
            const registrationOrder = useExistingOrder ?? await this.getNextRegistrationOrder();

            console.log(`📝 Assigning subscription to user ${userId} with registration order ${registrationOrder}${promoCode ? ` and promo code ${promoCode}` : ''}`);

            // Create subscription with tier assignment
            const subscription = await SubscriptionService.createSubscription(userId, registrationOrder, promoCode);

            console.log(`✅ Successfully created subscription for user ${userId}:`, {
                subscriptionId: subscription.id,
                tier: subscription.tier,
                status: subscription.status,
                registrationOrder: subscription.registrationOrder,
                promoCode: subscription.promoCode
            });

            return subscription;
        } catch (error: any) {
            // Log detailed error information
            console.error(`❌ Failed to assign subscription to user ${userId}:`, {
                error: error.message,
                stack: error.stack,
                code: error.code
            });
            throw new InternalServerError(`Subscription assignment failed: ${error.message}`);
        }
    }

    /**
     * Assign subscription to existing user (recovery/migration)
     * Uses the user's position in the database as registration order
     */
    static async assignSubscriptionToExistingUser(userId: number): Promise<void> {
        try {
            // Count how many users were created before this user
            const { usersModel } = await import('../models/users.model');

            const [result] = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(usersModel)
                .where(sql`${usersModel.id} <= ${userId}`);

            const registrationOrder = result.count;

            console.log(`🔄 Recovering subscription for existing user ${userId} with calculated order ${registrationOrder}`);

            // Use the calculated order to create subscription
            await this.assignSubscriptionToUser(userId, registrationOrder);
        } catch (error: any) {
            console.error(`❌ Failed to recover subscription for user ${userId}:`, {
                error: error.message,
                stack: error.stack,
                code: error.code
            });
            throw new InternalServerError(`Subscription recovery failed: ${error.message}`);
        }
    }

    /**
     * Get current registration count (for monitoring/debugging)
     */
    static async getCurrentRegistrationCount(): Promise<number> {
        try {
            const [counter] = await db
                .select()
                .from(registrationCounterModel)
                .limit(1);

            return counter?.currentCount || 0;
        } catch (error: any) {
            throw new InternalServerError(`Failed to get registration count: ${error.message}`);
        }
    }
}