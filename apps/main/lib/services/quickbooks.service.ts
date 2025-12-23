import { client } from "@/lib/axios-client";

// QuickBooks Account type
export interface QuickBooksAccount {
  Id: string;
  Name: string;
  FullyQualifiedName: string;
  Active: boolean;
  Classification?: string;
  AccountType?: string;
  AccountSubType?: string;
  CurrentBalance?: number;
  CurrencyRef?: {
    value: string;
    name: string;
  };
}

// QuickBooks Product/Item type
export interface QuickBooksItem {
  Id: string;
  Name: string;
  Description?: string;
  Active: boolean;
  FullyQualifiedName: string;
  Taxable?: boolean;
  UnitPrice?: number;
  Type?: string;
  IncomeAccountRef?: {
    value: string;
    name: string;
  };
  PurchaseCost?: number;
  TrackQtyOnHand?: boolean;
}

// QuickBooks Customer type (database structure)
export interface QuickBooksCustomer {
  id: number;
  userId: number;
  quickbooksId: string;
  displayName: string | null;
  companyName: string | null;
  givenName: string | null;
  middleName: string | null;
  familyName: string | null;
  title: string | null;
  suffix: string | null;
  printOnCheckName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  mobile: string | null;
  alternatePhone: string | null;
  fax: string | null;
  website: string | null;
  billAddrLine1: string | null;
  billAddrLine2: string | null;
  billAddrLine3: string | null;
  billAddrLine4: string | null;
  billAddrLine5: string | null;
  billAddrCity: string | null;
  billAddrState: string | null;
  billAddrPostalCode: string | null;
  billAddrCountry: string | null;
  shipAddrLine1: string | null;
  shipAddrLine2: string | null;
  shipAddrLine3: string | null;
  shipAddrLine4: string | null;
  shipAddrLine5: string | null;
  shipAddrCity: string | null;
  shipAddrState: string | null;
  shipAddrPostalCode: string | null;
  shipAddrCountry: string | null;
  balance: string | null;
  balanceWithJobs: string | null;
  active: boolean | null;
  job: boolean | null;
  billWithParent: boolean | null;
  customerTypeRefValue: string | null;
  customerTypeRefName: string | null;
  parentRefValue: string | null;
  parentRefName: string | null;
  paymentMethodRefValue: string | null;
  paymentMethodRefName: string | null;
  termRefValue: string | null;
  termRefName: string | null;
  currencyRefValue: string | null;
  currencyRefName: string | null;
  salesTermRefValue: string | null;
  salesTermRefName: string | null;
  salesRepRefValue: string | null;
  salesRepRefName: string | null;
  taxable: boolean | null;
  taxExemptionReasonId: string | null;
  defaultTaxCodeRefValue: string | null;
  defaultTaxCodeRefName: string | null;
  gstin: string | null;
  businessNumber: string | null;
  gstRegistrationType: string | null;
  syncToken: string | null;
  domain: string | null;
  sparse: boolean | null;
  metaDataCreateTime: Date | null;
  metaDataLastUpdatedTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
interface QuickBooksAccountsResponse {
  success: boolean;
  data: {
    QueryResponse?: {
      Account?: QuickBooksAccount[];
    };
  };
}

interface QuickBooksItemsResponse {
  success: boolean;
  data: {
    QueryResponse?: {
      Item?: QuickBooksItem[];
    };
  };
}

interface QuickBooksCustomersResponse {
  success: boolean;
  data: QuickBooksCustomer[];
}

/**
 * Fetch all accounts from QuickBooks
 */
export async function fetchQuickBooksAccounts(): Promise<QuickBooksAccount[]> {
  try {
    const response = await client.get<QuickBooksAccountsResponse>("/api/v1/quickbooks/accounts");

    // Handle nested response structure: { success: true, data: { QueryResponse: { Account: [...] } } }
    if (response.data?.success && response.data?.data?.QueryResponse?.Account) {
      return response.data.data.QueryResponse.Account;
    }

    // Handle direct QueryResponse structure: { QueryResponse: { Account: [...] } }
    if ((response.data as any)?.QueryResponse?.Account) {
      return (response.data as any).QueryResponse.Account;
    }

    // Fallback: try direct array access
    if (Array.isArray(response.data?.data)) {
      return response.data.data as QuickBooksAccount[];
    }

    if (Array.isArray(response.data)) {
      return response.data as QuickBooksAccount[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching QuickBooks accounts:", error);
    throw error;
  }
}

/**
 * Fetch all items (products/services) from QuickBooks
 */
export async function fetchQuickBooksItems(): Promise<QuickBooksItem[]> {
  try {
    const response = await client.get<QuickBooksItemsResponse>("/api/v1/quickbooks/line-items");

    // Handle nested response structure: { success: true, data: { QueryResponse: { Item: [...] } } }
    if (response.data?.success && response.data?.data?.QueryResponse?.Item) {
      return response.data.data.QueryResponse.Item;
    }

    // Handle direct QueryResponse structure: { QueryResponse: { Item: [...] } }
    if ((response.data as any)?.QueryResponse?.Item) {
      return (response.data as any).QueryResponse.Item;
    }

    // Fallback: try direct array access
    if (Array.isArray(response.data?.data)) {
      return response.data.data as QuickBooksItem[];
    }

    if (Array.isArray(response.data)) {
      return response.data as QuickBooksItem[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching QuickBooks items:", error);
    throw error;
  }
}

/**
 * Fetch all customers from QuickBooks database
 */
export async function fetchQuickBooksCustomers(): Promise<QuickBooksCustomer[]> {
  try {
    const response = await client.get<QuickBooksCustomersResponse>("/api/v1/quickbooks/customers");

    // Handle { success: true, data: [...] } structure (new database format)
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    // Fallback: try direct array access
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("❌ Error fetching QuickBooks customers:", error);
    throw error;
  }
}

/**
 * Update a line item with account or product selection
 */
export async function updateLineItem(
  lineItemId: number,
  updateData: {
    itemType?: 'account' | 'product' | null;
    resourceId?: string | null;
  }
): Promise<any> {
  try {
    const response = await client.patch(
      `/api/v1/invoice/line-items/${lineItemId}`,
      updateData
    );
    return response;
  } catch (error) {
    console.error("Error updating line item:", error);
    throw error;
  }
}

/**
 * Sync QuickBooks products and accounts to database
 */
interface SyncResponse {
  success: boolean;
  message: string;
  data: {
    products: {
      inserted: number;
      updated: number;
      skipped: number;
      total: number;
    };
    accounts: {
      inserted: number;
      updated: number;
      skipped: number;
      total: number;
    };
    vendors: {
      inserted: number;
      updated: number;
      skipped: number;
      total: number;
    };
    customers: {
      inserted: number;
      updated: number;
      skipped: number;
      total: number;
    };
  };
}

export async function syncQuickBooksData(): Promise<SyncResponse> {
  try {
    const response = await client.post<SyncResponse>("/api/v1/quickbooks/sync");
    // @ts-ignore
    return response;
  } catch (error) {
    console.error("Error syncing QuickBooks data:", error);
    throw error;
  }
}

export async function syncQuickBooksVendors(): Promise<SyncResponse> {
  try {
    const response = await client.post<SyncResponse>("/api/v1/quickbooks/sync-vendors");
    // @ts-ignore
    return response;
  } catch (error) {
    console.error("Error syncing QuickBooks data:", error);
    throw error;
  }
}

