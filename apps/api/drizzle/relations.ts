import { relations } from "drizzle-orm/relations";
import { users, subscriptions } from "./schema";
import { quickbooksAccountsRelations, quickbooksAccountsModel } from "@/models/quickbooks-accounts.model";
import { quickbooksProductsRelations, quickbooksProductsModel } from "@/models/quickbooks-products.model";
import { quickbooksVendorsRelations, quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { projectsRelations, projectsModel } from "@/models/projects.model";
import { projectVendorsRelations } from "@/models/project-vendors.model";

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
	subscriptions: many(subscriptions),
	quickbooksAccounts: many(quickbooksAccountsModel),
	quickbooksProducts: many(quickbooksProductsModel),
	quickbooksVendors: many(quickbooksVendorsModel),
	projects: many(projectsModel),
}));

// Re-export model relations
export { quickbooksAccountsRelations, quickbooksProductsRelations, quickbooksVendorsRelations, projectsRelations, projectVendorsRelations };