import db from "@/lib/db";
import { quickbooksCustomersModel } from "@/models/quickbooks-customers.model";
import { eq, and, ilike, or } from "drizzle-orm";
const { v4: uuidv4 } = require("uuid");

interface CustomerData {
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
}

class CustomersService {
    /**
     * Find existing customer by name or create a new one
     * Similar to vendor findOrCreate functionality
     * @param userId - The user ID who owns the customer
     * @param customerData - Customer data from invoice
     * @returns Customer ID (existing or newly created)
     */
    async findOrCreateCustomer(
        userId: number,
        customerData: CustomerData
    ): Promise<number> {
        // Trim customer name for consistent matching
        const trimmedCustomerName = customerData.customer_name.trim();
        
        // Search for existing customer by displayName or companyName (case-insensitive)
        const existingCustomers = await db
            .select()
            .from(quickbooksCustomersModel)
            .where(
                and(
                    eq(quickbooksCustomersModel.userId, userId),
                    or(
                        ilike(quickbooksCustomersModel.displayName, trimmedCustomerName),
                        ilike(quickbooksCustomersModel.companyName, trimmedCustomerName)
                    )
                )
            )
            .limit(1);

        if (existingCustomers.length > 0) {
            return existingCustomers[0].id;
        }

        // Customer not found, create a new one
        // Generate a shorter unique ID that fits in varchar(50)
        // Format: LOCAL_<timestamp>_<short-uuid> (max 50 chars)
        const shortUuid = uuidv4().replace(/-/g, '').substring(0, 20); // 20 chars
        const quickbooksId = `LOCAL_${Date.now()}_${shortUuid}`; // ~35 chars total
        
        try {
            const [newCustomer] = await db
                .insert(quickbooksCustomersModel)
                .values({
                    userId: userId,
                    quickbooksId: quickbooksId,
                    displayName: trimmedCustomerName,
                    companyName: trimmedCustomerName,
                    primaryEmail: customerData.customer_email || null,
                    primaryPhone: customerData.customer_phone || null,
                    billAddrLine1: customerData.customer_address || null,
                    active: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return newCustomer.id;
        } catch (error: any) {
            // If insert fails (likely due to race condition), query again to get the existing customer
            // This handles the case where another concurrent request created the customer
            const retryCustomers = await db
                .select()
                .from(quickbooksCustomersModel)
                .where(
                    and(
                        eq(quickbooksCustomersModel.userId, userId),
                        or(
                            ilike(quickbooksCustomersModel.displayName, trimmedCustomerName),
                            ilike(quickbooksCustomersModel.companyName, trimmedCustomerName)
                        )
                    )
                )
                .limit(1);

            if (retryCustomers.length > 0) {
                return retryCustomers[0].id;
            }

            // If still not found, rethrow the original error
            throw error;
        }
    }
}

export const customersService = new CustomersService();
