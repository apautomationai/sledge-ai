/**
 * A generic shape for standardized API responses from your backend.
 * This helps in consistently handling data and errors.
 */
export interface ApiResponse<T> {
  status: string;
  data: T;
}

/**
 * Defines the structure for a single user object.
 * This is used for displaying user information like name and avatar.
 */
export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  businessName: string | null;
  avatarUrl: string | null;
  onboardingCompleted?: boolean;
  // Add any other fields that might be in the response
}

/**
 * Defines the structure for a single invoice attachment object.
 */
export type Attachment = {
  id: string;
  userId: number;
  email: string;
  filename: string;
  mimeType: string;
  sender: string;
  receiver: string;
  fileUrl: string;
  fileKey: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceStatus = "pending" | "approved" | "rejected" | "failed" | "not_connected";

export type InvoiceListItem = {
  id: number;
  invoiceNumber: string;
  totalAmount: string | null;
  status: InvoiceStatus | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
};

export interface InvoiceDetails {
  id: number;
  userId: number;
  attachmentId: number;
  invoiceNumber: string;
  vendorId?: number | null;
  vendorAddress: string | null;
  vendorPhone: string | null;
  vendorEmail: string | null;
  customerName: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  totalAmount: string | null;
  currency: string | null;
  totalTax: string | null;
  lineItems: string | null;
  costCode: string | null;
  quantity: string | null;
  rate: string | null;
  description: string | null;
  status: InvoiceStatus | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
  sourcePdfUrl: string | null;
}

export interface DashboardMetrics {
  invoicesThisMonth: number;
  pendingThisMonth: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  totalOutstanding: number;
}

export interface DashboardData {
  recentInvoices: InvoiceDetails[];
  metrics: DashboardMetrics;
}

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  // Add other fields as needed
}

/**
 * Associated invoice details returned when deleting an attachment
 * that has a linked invoice
 */
export interface AssociatedInvoiceDetails {
  id: number;
  invoiceNumber: string;
}

/**
 * Response from DELETE /api/invoices/:id
 */
export interface DeleteInvoiceResponse {
  success: boolean;
  message: string;
}

/**
 * Response from DELETE /api/attachments/:id
 */
export interface DeleteAttachmentResponse {
  success: boolean;
  message: string;
  deletedInvoice?: AssociatedInvoiceDetails | null;
}

// Re-export subscription types
export type { SubscriptionStatus, CheckoutSession, CustomerPortal } from './subscription';