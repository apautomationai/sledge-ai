"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchQuickBooksAccounts, fetchQuickBooksItems, fetchQuickBooksCustomers } from "@/lib/services/quickbooks.service";
import type { QuickBooksAccount, QuickBooksItem, QuickBooksCustomer } from "@/lib/services/quickbooks.service";

interface QuickBooksDataContextType {
    accounts: QuickBooksAccount[];
    items: QuickBooksItem[];
    customers: QuickBooksCustomer[];
    isLoadingAccounts: boolean;
    isLoadingItems: boolean;
    isLoadingCustomers: boolean;
    loadAccounts: () => Promise<void>;
    loadItems: () => Promise<void>;
    loadCustomers: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

const QuickBooksDataContext = createContext<QuickBooksDataContextType | undefined>(undefined);

export function useQuickBooksData() {
    const context = useContext(QuickBooksDataContext);
    if (!context) {
        throw new Error('useQuickBooksData must be used within QuickBooksDataProvider');
    }
    return context;
}

interface QuickBooksDataProviderProps {
    children: ReactNode;
    autoLoad?: boolean; // Auto-load data on mount
}

export function QuickBooksDataProvider({ children, autoLoad = true }: QuickBooksDataProviderProps) {
    const [accounts, setAccounts] = useState<QuickBooksAccount[]>([]);
    const [items, setItems] = useState<QuickBooksItem[]>([]);
    const [customers, setCustomers] = useState<QuickBooksCustomer[]>([]);

    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    const loadAccounts = async () => {
        if (accounts.length > 0 || isLoadingAccounts) return; // Skip if already loaded or loading

        setIsLoadingAccounts(true);
        try {
            const data = await fetchQuickBooksAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('❌ Error loading accounts:', error);
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const loadItems = async () => {
        if (items.length > 0 || isLoadingItems) return; // Skip if already loaded or loading

        setIsLoadingItems(true);
        try {
            const data = await fetchQuickBooksItems();
            setItems(data);
        } catch (error) {
            console.error('❌ Error loading items:', error);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const loadCustomers = async () => {
        if (customers.length > 0 || isLoadingCustomers) return; // Skip if already loaded or loading

        setIsLoadingCustomers(true);
        try {
            const data = await fetchQuickBooksCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('❌ Error loading customers:', error);
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const refreshAll = async () => {
        // Force reload all data
        setAccounts([]);
        setItems([]);
        setCustomers([]);
        await Promise.all([loadAccounts(), loadItems(), loadCustomers()]);
    };

    // Auto-load on mount if enabled
    useEffect(() => {
        if (autoLoad) {
            loadCustomers(); // Load customers first as they're most commonly used
            // Accounts and items will be loaded on-demand
        }
    }, [autoLoad]);

    return (
        <QuickBooksDataContext.Provider
            value={{
                accounts,
                items,
                customers,
                isLoadingAccounts,
                isLoadingItems,
                isLoadingCustomers,
                loadAccounts,
                loadItems,
                loadCustomers,
                refreshAll,
            }}
        >
            {children}
        </QuickBooksDataContext.Provider>
    );
}
