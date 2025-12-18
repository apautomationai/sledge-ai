import { Request, Response, NextFunction } from "express";
import { quickbooksService } from "@/services/quickbooks.service";
import { integrationsService } from "@/services/integrations.service";
import { BadRequestError, NotFoundError } from "@/helpers/errors";

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

      // Generate state parameter for security
      const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

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
      const { code, realmId, state, error } = req.query;
      if (error) {
        throw new BadRequestError(`QuickBooks authorization error: ${error}`);
      }

      if (!code || !realmId) {
        throw new BadRequestError("Missing authorization code or realm ID");
      }

      // Verify state parameter
      let userId: number;
      try {
        const stateData = JSON.parse(
          Buffer.from(state as string, "base64").toString(),
        );
        userId = stateData.userId;
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

      // Check for duplicate email if available
      if (companyInfo?.email) {
        const emailExists = await integrationsService.checkEmailExists(companyInfo.email, userId);
        if (emailExists) {
          const frontendUrl = process.env.FRONTEND_URL || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000';
          const errorMessage = "This email is already connected to another sledge account. Please disconnect it from that account then try again.";
          const redirectUrl = `${frontendUrl}/integrations?message=${encodeURIComponent(errorMessage)}&type=error`;
          return res.redirect(redirectUrl);
        }
      }

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
      const redirectUrl = `${frontendUrl}/integrations?message=QuickBooks connected successfully&type=success`;
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
          lastSync: integration.metadata?.lastSyncAt,
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

      const integration = await quickbooksService.getUserIntegration(userId);

      if (!integration) {
        throw new NotFoundError("QuickBooks integration not found");
      }

      const customers = await quickbooksService.getCustomers(integration);

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
      const { invoiceId } = req.params;

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
      const { searchTerm } = req.query;

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
      const { searchTerm, limit } = req.query;

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
      const { searchTerm, limit } = req.query;

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
      const { email, phone, address, name } = req.query;

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
      const { searchTerm } = req.query;

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
      const { searchTerm } = req.query;

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

      // Get all customers first
      const allCustomersResponse = await quickbooksService.getCustomers(integration);
      const customers = allCustomersResponse?.QueryResponse?.Customer || [];

      // Perform vector search
      const searchResults = quickbooksService.vectorSearchCustomers(searchTerm as string, customers);

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

      res.json({
        success: true,
        data: newCustomer,
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

      res.json({
        success: true,
        data: newItem,
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
        data: newVendor,
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
      const { vendorId, lineItems, totalAmount, totalTax, dueDate, invoiceDate, discountAmount, discountDescription } = req.body;

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

      const newBill = await quickbooksService.createBill(integration, {
        vendorId,
        lineItems,
        totalAmount,
        totalTax,
        dueDate,
        invoiceDate,
        discountAmount,
        discountDescription,
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

      // Sync to database (includes embedding generation)
      const productsResult = await quickbooksService.syncProductsToDatabase(userId, [products[0]]);

      // Update lastSyncedAt in metadata after successful sync
      try {
        const currentMetadata = (integration.metadata as any) || {};
        await integrationsService.updateIntegration(integration.id, {
          metadata: {
            ...currentMetadata,
            lastSyncedAt: new Date().toISOString(),
          },
        });
      } catch (updateError: any) {
        console.error("Failed to update lastSyncedAt in metadata:", updateError);
        // Don't fail the request if metadata update fails
      }

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

      // Sync to database (includes embedding generation)
      const accountsResult = await quickbooksService.syncAccountsToDatabase(userId, accounts);

      // Update lastSyncedAt in metadata after successful sync
      try {
        const currentMetadata = (integration.metadata as any) || {};
        await integrationsService.updateIntegration(integration.id, {
          metadata: {
            ...currentMetadata,
            lastSyncedAt: new Date().toISOString(),
          },
        });
      } catch (updateError: any) {
        console.error("Failed to update lastSyncedAt in metadata:", updateError);
        // Don't fail the request if metadata update fails
      }

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

      // Sync to database (includes embedding generation)
      const vendorsResult = await quickbooksService.syncVendorsToDatabase(userId, vendors);

      // Update lastSyncedAt in metadata after successful sync
      try {
        const currentMetadata = (integration.metadata as any) || {};
        await integrationsService.updateIntegration(integration.id, {
          metadata: {
            ...currentMetadata,
            lastSyncedAt: new Date().toISOString(),
          },
        });
      } catch (updateError: any) {
        console.error("Failed to update lastSyncedAt in metadata:", updateError);
        // Don't fail the request if metadata update fails
      }

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

      // Fetch products and accounts from QuickBooks API
      const lineItemsResponse = await quickbooksService.getLineItems(integration);
      const accountsResponse = await quickbooksService.getAccounts(integration);

      // Extract items and accounts from response
      const products = lineItemsResponse?.QueryResponse?.Item || [];
      const accounts = accountsResponse?.QueryResponse?.Account || [];
      const vendorsResponse = await quickbooksService.getVendors(integration);

      // Extract vendors from response
      const vendors = vendorsResponse?.QueryResponse?.Vendor || [];      
      
      // Sync to database
      const productsResult = await quickbooksService.syncProductsToDatabase(userId, products);
      const accountsResult = await quickbooksService.syncAccountsToDatabase(userId, accounts);
      const vendorsResult = await quickbooksService.syncVendorsToDatabase(userId, vendors);

      // Update lastSyncedAt in metadata after successful sync
      try {
        const currentMetadata = (integration.metadata as any) || {};
        await integrationsService.updateIntegration(integration.id, {
          metadata: {
            ...currentMetadata,
            lastSyncedAt: new Date().toISOString(),
          },
        });
      } catch (updateError: any) {
        console.error("Failed to update lastSyncedAt in metadata:", updateError);
        // Don't fail the request if metadata update fails
      }

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
}

export const quickbooksController = new QuickBooksController();
