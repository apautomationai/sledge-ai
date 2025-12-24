// @/lib/types/invoice.ts

import { VendorData } from "@/hooks/use-jobs";

export type Attachment = {
  id: string;
  userId: number;
  email: string;
  filename: string;
  mimeType: string;
  status: string; // pending, processing, success, failed
  sender: string;
  receiver: string;
  fileUrl: string;
  fileKey: string;
  provider?: string;
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
  vendorData: VendorData
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
  senderEmail?: string | null;
  vendorData?: VendorData | null;
}


export interface LineItem {
  id: number;
  invoiceId: number;
  item_name: string | null;
  description: string | null;
  quantity: string | null;
  rate: string | null;
  amount: string | null;
  itemType?: 'account' | 'product' | null;
  resourceId?: string | null;
  customerId?: string | null;
}
/**
 *
 Associated invoice details returned when deleting an attachment
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
