import { Request, Response, NextFunction } from "express";
import { quickbooksService } from "@/services/quickbooks.service";
import { BadRequestError, NotFoundError } from "@/helpers/errors";
import { getStringParam, getIntParam } from "@/helpers/request-utils";

export class QuickBooksController {
  // Initiate QuickBooks OAuth flow
  auth = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Check if this is from onboarding flow
      const isOnboarding = req.query.onboarding === 'true';

      // Generate state parameter for security, include onboarding flag
      const state = Buffer.from(JSON.stringify({ userId, isOnboarding })).toString("base64");

      const authUrl = quickbooksService.generateAuthUrl(state);

      // Redirect to QuickBooks authorization page
      res.json({ url: authUrl });
      // res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  };

  // Handle OAuth callback from QuickBooks
  callback = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const code = getStringParam(req.query.code);
      const realmId = getStringParam(req.query.realmId);
      const state = getStringParam(req.query.state);
      const error = getStringParam(req.query.error);
      if (error) {
        throw new BadRequestError(`QuickBooks authorization error: ${error}`);
      }

      if (!code || !realmId) {
        throw new BadRequestError("Missing authorization code or realm ID");
      }

      // Verify state parameter
      let userId: number;
      let isOnboarding = false;
      try {
        const stateData = JSON.parse(
          Buffer.from(state as string, "base64").toString(),
        );
        userId = stateData.userId;
        isOnboarding = stateData.isOnboarding || false;
      } catch {
        throw new BadRequestError("Invalid state parameter");
      }

      // Exchange code for tokens
      const tokenData = await quickbooksService.exchangeCodeForTokens(
        code as string,
        realmId as string,
      );

      // Get company info to extract email if available
      let companyInfo: any = null;
      try {
        // Create a temporary integration object to fetch company info
        // Include metadata with realmId for API calls
        const tempIntegration = {
          id: 0,
          userId,
          name: "quickbooks",
          status: "success",
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiryDate: new Date(Date.now() + tokenData.expiresIn * 1000),
          createdAt: null,
          updatedAt: null,
          metadata: {
            realmId: tokenData.realmId, // Required for QuickBooks API calls
          },
        };
        companyInfo = await quickbooksService.getCompanyInfo(tempIntegration);
      } catch (error) {
        console.warn("Could not fetch company info:", error);
        // Continue without company info
      }

      // Removed duplicate email check - allow same email across multiple accounts

      await quickbooksService.saveIntegration(
        userId,
        tokenData,
        companyInfo,
      );

      // // Save integration to database
      // const integration = await quickbooksService.saveIntegration(
      //   userId,
      //   tokenData,
      // );

      // // Get company info for display
      // try {
      //   const companyInfo = await quickbooksService.getCompanyInfo(integration);
      //   console.log("Connected to QuickBooks company:", companyInfo);
      // } catch (error) {
      //   console.warn("Could not fetch company info:", error);
      // }

      // Redirect to frontend integrations page with success
      const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
      const redirectPath = isOnboarding ? '/dashboard' : '/integrations';
      const redirectUrl = `${frontendUrl}${redirectPath}?message=QuickBooks connected successfully&type=success`;
      res.redirect(redirectUrl);
    } catch (error: any) {
      // Redirect to frontend integrations page with error
      const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
      const errorMessage = error.message || "Failed to connect QuickBooks";
      const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
      res.redirect(redirectUrl);
    }
  };

  // Get integration status
  // @ts-ignore
  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        res.json({
          success: true,
          data: {
            connected: false,
            status: "not_connected",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          connected: true,
          status: "success",
          companyName: integration.metadata?.companyName || "Unknown Company",
          connectedAt: integration.createdAt,
          lastSync: integration.metadata?.lastSyncedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get company information
  // @ts-ignore
  getCompanyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const companyInfo = await quickbooksService.getCompanyInfo(integration);

      res.json({
        success: true,
        data: companyInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get customers
  // @ts-ignore
  getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Fetch customers from database
      const customers = await quickbooksService.getCustomersFromDatabase(userId);

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get vendors
  // @ts-ignore
  getVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const vendors = await quickbooksService.getVendors(integration);

      res.json({
        success: true,
        data: vendors,
      });
    } catch (error) {
      next(error);
    }
  };



  // Get vendors
  getAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Fetch accounts from database instead of QuickBooks API
      const accounts = await quickbooksService.getAccountsFromDatabase(userId);

      // Transform to match QuickBooks API format
      const formattedAccounts = {
        QueryResponse: {
          Account: accounts.map(account => ({
            Id: account.quickbooksId,
            Name: account.name,
            FullyQualifiedName: account.fullyQualifiedName,
            Active: account.active,
            Classification: account.classification,
            AccountType: account.accountType,
            AccountSubType: account.accountSubType,
            CurrentBalance: account.currentBalance,
            CurrencyRef: account.currencyRefValue ? {
              value: account.currencyRefValue,
              name: account.currencyRefName
            } : undefined
          }))
        }
      };

      res.json({
        success: true,
        data: formattedAccounts,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get invoices
  // @ts-ignore
  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const invoices = await quickbooksService.getInvoices(integration);

      res.json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get line items
  getLineItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Fetch products from database instead of QuickBooks API
      const products = await quickbooksService.getProductsFromDatabase(userId);

      // Transform to match QuickBooks API format
      const formattedProducts = {
        QueryResponse: {
          Item: products.map(product => ({
            Id: product.quickbooksId,
            Name: product.name,
            Description: product.description,
            Active: product.active,
            FullyQualifiedName: product.fullyQualifiedName,
            Taxable: product.taxable,
            UnitPrice: product.unitPrice,
            Type: product.type,
            IncomeAccountRef: product.incomeAccountValue ? {
              value: product.incomeAccountValue,
              name: product.incomeAccountName
            } : undefined,
            PurchaseCost: product.purchaseCost,
            TrackQtyOnHand: product.trackQtyOnHand
          }))
        }
      };

      res.json({
        success: true,
        data: formattedProducts,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get specific invoice line items
  getInvoiceLineItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const invoiceId = getStringParam(req.params.invoiceId);

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!invoiceId) {
        throw new BadRequestError("Invoice ID is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const invoiceLineItems = await quickbooksService.getInvoiceLineItems(integration, invoiceId);

      res.json({
        success: true,
        data: invoiceLineItems,
      });
    } catch (error) {
      next(error);
    }
  };

  // Vector search for items
  searchItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const searchTerm = getStringParam(req.query.searchTerm);

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!searchTerm) {
        throw new BadRequestError("Search term is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      // Get all items first
      const allItemsResponse = await quickbooksService.getLineItems(integration);
      const items = allItemsResponse?.QueryResponse?.Item || [];

      // Perform vector search
      const searchResults = quickbooksService.vectorSearchItems(searchTerm as string, items);

      res.json({
        success: true,
        data: {
          searchTerm,
          totalResults: searchResults.length,
          results: searchResults,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Hybrid search for stored QuickBooks products
  searchProductsHybrid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const searchTerm = getStringParam(req.query.searchTerm);
      const limit = getIntParam(req.query.limit);

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
        throw new BadRequestError("Search term is required");
      }

      const matchCount = limit ? Number(limit) : undefined;
      const results = await quickbooksService.hybridSearchProducts(
        userId,
        searchTerm,
        Number.isNaN(matchCount) ? undefined : matchCount,
      );

      res.json({
        success: true,
        data: {
          searchTerm,
          totalResults: results.length,
          results,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Hybrid search for stored QuickBooks accounts
  searchAccountsHybrid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const searchTerm = getStringParam(req.query.searchTerm);
      const limit = getIntParam(req.query.limit);

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
        throw new BadRequestError("Search term is required");
      }

      const matchCount = limit ? Number(limit) : undefined;
      const results = await quickbooksService.hybridSearchAccounts(
        userId,
        searchTerm,
        Number.isNaN(matchCount) ? undefined : matchCount,
      );

      res.json({
        success: true,
        data: {
          searchTerm,
          totalResults: results.length,
          results,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Hierarchical vendor search: email → phone → address → name
  hierarchicalVendorSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const email = getStringParam(req.query.email);
      const phone = getStringParam(req.query.phone);
      const address = getStringParam(req.query.address);
      const name = getStringParam(req.query.name);

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!email && !phone && !address && !name) {
        throw new BadRequestError("At least one search parameter (email, phone, address, or name) is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      // Get all vendors first
      const allVendorsResponse = await quickbooksService.getVendors(integration);
      const vendors = allVendorsResponse?.QueryResponse?.Vendor || [];

      // Perform hierarchical search
      const searchResult = quickbooksService.hierarchicalVendorSearch({
        email: email as string,
        phone: phone as string,
        address: address as string,
        name: name as string,
      }, vendors);

      res.json({
        success: true,
        data: {
          vendor: searchResult.vendor,
          matchType: searchResult.matchType,
          found: searchResult.vendor !== null,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Vector search for vendors
  searchVendors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const searchTerm = getStringParam(req.query.searchTerm);

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!searchTerm) {
        throw new BadRequestError("Search term is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      // Get all vendors first
      const allVendorsResponse = await quickbooksService.getVendors(integration);
      const vendors = allVendorsResponse?.QueryResponse?.Vendor || [];

      // Perform vector search
      const searchResults = quickbooksService.vectorSearchVendors(searchTerm as string, vendors);

      res.json({
        success: true,
        data: {
          searchTerm,
          totalResults: searchResults.length,
          results: searchResults,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Vector search for customers
  searchCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const searchTerm = getStringParam(req.query.searchTerm);

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!searchTerm) {
        throw new BadRequestError("Search term is required");
      }

      // Get all customers from database
      const customers = await quickbooksService.getCustomersFromDatabase(userId);

      // Simple text-based search on customer fields
      const searchResults = customers.filter(customer => {
        const searchLower = (searchTerm as string).toLowerCase();
        return (
          customer.displayName?.toLowerCase().includes(searchLower) ||
          customer.companyName?.toLowerCase().includes(searchLower) ||
          customer.givenName?.toLowerCase().includes(searchLower) ||
          customer.familyName?.toLowerCase().includes(searchLower) ||
          customer.primaryEmail?.toLowerCase().includes(searchLower) ||
          customer.primaryPhone?.includes(searchTerm as string)
        );
      });

      res.json({
        success: true,
        data: {
          searchTerm,
          totalResults: searchResults.length,
          results: searchResults,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Create customer in QuickBooks
  createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const { name } = req.body;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!name) {
        throw new BadRequestError("Customer name is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const newCustomer = await quickbooksService.createCustomer(integration, {
        name,
      });

      // Extract the customer data from the QuickBooks response
      const customerData = newCustomer?.Customer || newCustomer?.data?.Customer || newCustomer;

      res.json({
        success: true,
        data: customerData,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create new item in QuickBooks
  createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const { name, description, unitPrice, type, lineItemData } = req.body;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!name) {
        throw new BadRequestError("Item name is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const newItem = await quickbooksService.createItem(integration, {
        name,
        description,
        unitPrice,
        type,
      }, lineItemData);

      // Extract the item data from the QuickBooks response
      const itemData = newItem?.Item || newItem?.data?.Item || newItem;

      res.json({
        success: true,
        data: itemData,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create account in QuickBooks
  createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const { name, accountType, accountSubType } = req.body;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!name) {
        throw new BadRequestError("Account name is required");
      }

      if (!accountType) {
        throw new BadRequestError("Account type is required");
      }

      if (!accountSubType) {
        throw new BadRequestError("Account sub-type is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const newAccount = await quickbooksService.createAccount(integration, {
        name,
        accountType,
        accountSubType,
      });

      // Extract the account data from the QuickBooks response
      const accountData = newAccount?.Account || newAccount?.data?.Account || newAccount;

      res.json({
        success: true,
        data: accountData,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create vendor in QuickBooks
  createVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const { name, email, phone, address } = req.body;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!name) {
        throw new BadRequestError("Vendor name is required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const newVendor = await quickbooksService.createVendor(integration, {
        name,
        email,
        phone,
        address,
      });

      res.json({
        success: true,
        vendor: newVendor,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create bill in QuickBooks
  createBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;
      const {
        vendorId,
        lineItems,
        totalAmount,
        totalTax,
        dueDate,
        invoiceDate,
        discountAmount,
        discountDescription,
        attachmentUrl,
        invoiceNumber
      } = req.body;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!vendorId || !lineItems) {
        throw new BadRequestError("Vendor ID and line items are required");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const newBill = await quickbooksService.createBillWithAttachment(integration, {
        vendorId,
        lineItems,
        totalAmount,
        totalTax,
        dueDate,
        invoiceDate,
        discountAmount,
        discountDescription,
        attachmentUrl,
        invoiceNumber,
      });

      res.json({
        success: true,
        data: newBill,
      });
    } catch (error) {
      next(error);
    }
  };

  // Sync products and accounts from QuickBooks to database
  // Sync only QuickBooks products
  syncProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      // Fetch products from QuickBooks API
      const lineItemsResponse = await quickbooksService.getLineItems(integration);

      // Extract products from response
      const products = lineItemsResponse?.QueryResponse?.Item || [];

      // Sync to database (includes embedding generation and lastSyncedAt update)
      const productsResult = await quickbooksService.syncProductsToDatabase(userId, [products[0]]);

      res.json({
        success: true,
        message: "Products sync completed successfully",
        data: {
          products: {
            inserted: productsResult.inserted,
            updated: productsResult.updated,
            skipped: productsResult.skipped,
            total: products.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Sync only QuickBooks accounts
  syncAccounts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      // Fetch accounts from QuickBooks API
      const accountsResponse = await quickbooksService.getAccounts(integration);

      // Extract accounts from response
      const accounts = accountsResponse?.QueryResponse?.Account || [];

      // Sync to database (includes embedding generation and lastSyncedAt update)
      const accountsResult = await quickbooksService.syncAccountsToDatabase(userId, accounts);

      res.json({
        success: true,
        message: "Accounts sync completed successfully",
        data: {
          accounts: {
            inserted: accountsResult.inserted,
            updated: accountsResult.updated,
            skipped: accountsResult.skipped,
            total: accounts.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Sync only QuickBooks vendors
  syncVendors = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      // Fetch vendors from QuickBooks API
      const vendorsResponse = await quickbooksService.getVendors(integration);

      // Extract vendors from response
      const vendors = vendorsResponse?.QueryResponse?.Vendor || [];

      // Sync to database (includes embedding generation and lastSyncedAt update)
      const vendorsResult = await quickbooksService.syncVendorsToDatabase(userId, vendors);

      res.json({
        success: true,
        message: "Vendors sync completed successfully",
        data: {
          vendors: {
            inserted: vendorsResult.inserted,
            updated: vendorsResult.updated,
            skipped: vendorsResult.skipped,
            total: vendors.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  syncAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      // Fetch data from QuickBooks API
      const lineItemsResponse = await quickbooksService.getLineItems(integration);
      const accountsResponse = await quickbooksService.getAccounts(integration);
      const vendorsResponse = await quickbooksService.getVendors(integration);
      const customersResponse = await quickbooksService.getCustomers(integration);

      // Extract data from responses
      const products = lineItemsResponse?.QueryResponse?.Item || [];
      const accounts = accountsResponse?.QueryResponse?.Account || [];
      const vendors = vendorsResponse?.QueryResponse?.Vendor || [];
      const customers = customersResponse?.QueryResponse?.Customer || [];

      // Sync to database (each method updates lastSyncedAt)
      const productsResult = await quickbooksService.syncProductsToDatabase(userId, products);
      const accountsResult = await quickbooksService.syncAccountsToDatabase(userId, accounts);
      const vendorsResult = await quickbooksService.syncVendorsToDatabase(userId, vendors);
      const customersResult = await quickbooksService.syncCustomersToDatabase(userId, customers);

      res.json({
        success: true,
        message: "Sync completed successfully",
        data: {
          products: {
            inserted: productsResult.inserted,
            updated: productsResult.updated,
            skipped: productsResult.skipped,
            total: products.length,
          },
          accounts: {
            inserted: accountsResult.inserted,
            updated: accountsResult.updated,
            skipped: accountsResult.skipped,
            total: accounts.length,
          },
          vendors: {
            inserted: vendorsResult.inserted,
            updated: vendorsResult.updated,
            skipped: vendorsResult.skipped,
            total: vendors.length,
          },
          customers: {
            inserted: customersResult.inserted,
            updated: customersResult.updated,
            skipped: customersResult.skipped,
            total: customers.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Disconnect QuickBooks integration
  disconnect = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      await quickbooksService.disconnectIntegration(userId);

      res.json({
        success: true,
        message: "QuickBooks integration disconnected successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Get accounts from database (raw structure)
  getAccountsFromDB = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Fetch accounts from database with raw structure
      const accounts = await quickbooksService.getAccountsFromDatabase(userId);

      res.json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get products from database (raw structure)
  getProductsFromDB = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - user is added by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      // Fetch products from database with raw structure
      const products = await quickbooksService.getProductsFromDatabase(userId);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const quickbooksController = new QuickBooksController();
