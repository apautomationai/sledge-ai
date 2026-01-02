import { invoiceController } from "@/controllers/invoice.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireSubscriptionAccess } from "@/middlewares/subscription.middleware";
import { Router } from "express";

const router = Router();

// Get dashboard metrics
router.get("/dashboard", authenticate, requireSubscriptionAccess, invoiceController.getDashboardMetrics);

// Get invoice trends
router.get("/trends", authenticate, requireSubscriptionAccess, invoiceController.getInvoiceTrends);

// Create a new invoice
router.post("/invoices", authenticate, requireSubscriptionAccess, invoiceController.insertInvoice);

// Get all invoices (paginated)
router.get("/invoices", authenticate, requireSubscriptionAccess, invoiceController.getAllInvoices);

// Get lightweight invoices list (only IDs and statuses)
router.get("/invoices-list", authenticate, requireSubscriptionAccess, invoiceController.getInvoicesList);

// Get a single invoice by its ID
router.get("/invoices/:id", authenticate, requireSubscriptionAccess, invoiceController.getInvoice);

// Update a single invoice by its ID
router.patch("/:id", authenticate, requireSubscriptionAccess, invoiceController.updateInvoice);

// Update invoice status
router.patch("/:id/status", authenticate, requireSubscriptionAccess, invoiceController.updateInvoiceStatus);

// Clone an invoice
router.post("/invoices/:id/clone", authenticate, requireSubscriptionAccess, invoiceController.cloneInvoice);

// Split an invoice with selected line items
router.post("/invoices/:id/split", authenticate, requireSubscriptionAccess, invoiceController.splitInvoice);

// Delete an invoice
router.delete("/invoices/:id", authenticate, requireSubscriptionAccess, invoiceController.deleteInvoice);

router.post("/split", authenticate, requireSubscriptionAccess, invoiceController.splitInvoices);

// Get all line items (for debugging)
router.get("/line-items", authenticate, requireSubscriptionAccess, invoiceController.getAllLineItems);

// Get line items by item name (using query parameter to handle special characters)
router.get("/line-items/search", authenticate, requireSubscriptionAccess, invoiceController.getLineItemsByName);

// Get line items by invoice ID
router.get("/line-items/invoice/:invoiceId", authenticate, requireSubscriptionAccess, invoiceController.getLineItemsByInvoiceId);

// Create a line item
router.post("/line-items", authenticate, requireSubscriptionAccess, invoiceController.createLineItem);

// Update a line item
router.patch("/line-items/:id", authenticate, requireSubscriptionAccess, invoiceController.updateLineItem);

// Delete a line item
router.delete("/line-items/:id", authenticate, requireSubscriptionAccess, invoiceController.deleteLineItem);

export default router;
