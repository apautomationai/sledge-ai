import db from "@/lib/db";
import { quickbooksCustomersModel } from "@/models/quickbooks-customers.model";
import { eq, and, ilike, or } from "drizzle-orm";
import { QuickBooksService } from "@/services/quickbooks.service";

interface CustomerData {
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
}

class CustomersService {
    /**
     * Find existing customer by name or create a new one in QuickBooks
     * Requires QuickBooks integration to be connected
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

        // Customer not found, create in QuickBooks
        const quickbooksService = new QuickBooksService();
        const integration = await quickbooksService.getUserIntegration(userId);

        if (!integration) {
            throw new Error("QuickBooks integration not found. Please connect your QuickBooks account.");
        }

        // Create customer in QuickBooks
        const qbResult = await quickbooksService.createCustomer(integration, {
            name: trimmedCustomerName
        });

        // Extract the created customer data
        const newCustomer = qbResult?.Customer || qbResult?.QueryResponse?.Customer?.[0];

        if (!newCustomer || !newCustomer.Id) {
            throw new Error("Failed to create customer in QuickBooks");
        }

        // Find the synced customer in our database
        const syncedCustomers = await db
            .select()
            .from(quickbooksCustomersModel)
            .where(
                and(
                    eq(quickbooksCustomersModel.userId, userId),
                    eq(quickbooksCustomersModel.quickbooksId, newCustomer.Id.toString())
                )
            )
            .limit(1);

        if (syncedCustomers.length > 0) {
            return syncedCustomers[0].id;
        }

        throw new Error("Customer was created in QuickBooks but failed to sync to database");
    }
}

export const customersService = new CustomersService();
