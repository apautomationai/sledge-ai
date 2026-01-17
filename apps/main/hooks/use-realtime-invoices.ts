"use client";

import { useEffect, useCallback, useRef } from 'react';
import { wsClient } from '@/lib/websocket-client';
import { toast } from 'sonner';

interface UseRealtimeInvoicesProps {
    onRefreshNeeded?: () => void;
    onInvoiceCreated?: (invoiceId: number) => void;
    onInvoiceUpdated?: (invoiceId: number) => void;
    onInvoiceStatusUpdated?: (invoiceId: number, status: string) => void;
    onInvoiceDeleted?: (invoiceId: number) => void;
    onAttachmentStatusUpdated?: (attachmentId: number, status: string, attachmentData?: any) => void;
    onJobStatusUpdated?: (jobId: string, status: string, jobData?: any) => void;
    enableToasts?: boolean;
    autoConnect?: boolean;
}

export const useRealtimeInvoices = ({
    onRefreshNeeded,
    onInvoiceCreated,
    onInvoiceUpdated,
    onInvoiceStatusUpdated,
    onInvoiceDeleted,
    onAttachmentStatusUpdated,
    onJobStatusUpdated,
    enableToasts = true,
    autoConnect = true,
}: UseRealtimeInvoicesProps = {}) => {
    const isConnectedRef = useRef(false);
    const handlersRef = useRef({
        onRefreshNeeded,
        onInvoiceCreated,
        onInvoiceUpdated,
        onInvoiceStatusUpdated,
        onInvoiceDeleted,
        onAttachmentStatusUpdated,
        onJobStatusUpdated,
    });

    // Update handlers ref when props change
    useEffect(() => {
        handlersRef.current = {
            onRefreshNeeded,
            onInvoiceCreated,
            onInvoiceUpdated,
            onInvoiceStatusUpdated,
            onInvoiceDeleted,
            onAttachmentStatusUpdated,
            onJobStatusUpdated,
        };
    }, [onRefreshNeeded, onInvoiceCreated, onInvoiceUpdated, onInvoiceStatusUpdated, onInvoiceDeleted, onAttachmentStatusUpdated, onJobStatusUpdated]);

    // WebSocket notification handler
    const handleNotification = useCallback((data: any) => {
        if (enableToasts) {
            let message = '';
            let description = '';

            switch (data.type) {
                case 'INVOICE_CREATED':
                    message = 'New invoice created';
                    description = 'A new invoice has been processed';
                    break;
                case 'INVOICE_UPDATED':
                    message = 'Bill updated';
                    description = 'A bill has been updated';
                    break;
                case 'INVOICE_STATUS_UPDATED':
                    const statusText = data.status?.charAt(0).toUpperCase() + data.status?.slice(1);
                    message = `Invoice ${statusText}`;
                    description = `Invoice status changed to ${statusText?.toLowerCase()}`;
                    break;
                case 'INVOICE_DELETED':
                    message = 'Invoice deleted';
                    description = 'An invoice has been removed';
                    break;
                case 'ATTACHMENT_STATUS_UPDATED':
                    message = 'Job status updated';
                    description = `Job status changed to ${data.status}`;
                    break;
                case 'JOB_STATUS_UPDATED':
                    message = 'Job completed';
                    description = `Job status changed to ${data.status}`;
                    break;
            }

            if (message) {
                toast.success(message, { description });
            }
        }

        // Call specific handlers based on notification type
        switch (data.type) {
            case 'INVOICE_CREATED':
                handlersRef.current.onInvoiceCreated?.(data.invoiceId);
                break;
            case 'INVOICE_UPDATED':
                handlersRef.current.onInvoiceUpdated?.(data.invoiceId);
                break;
            case 'INVOICE_STATUS_UPDATED':
                handlersRef.current.onInvoiceStatusUpdated?.(data.invoiceId, data.status);
                break;
            case 'INVOICE_DELETED':
                handlersRef.current.onInvoiceDeleted?.(data.invoiceId);
                break;
            case 'ATTACHMENT_STATUS_UPDATED':
                handlersRef.current.onAttachmentStatusUpdated?.(data.attachmentId, data.status, data.attachmentData);
                break;
            case 'JOB_STATUS_UPDATED':
                handlersRef.current.onJobStatusUpdated?.(data.jobId, data.status, data.jobData);
                break;
        }

        // Always trigger general refresh as fallback for unknown types
        if (!['ATTACHMENT_STATUS_UPDATED', 'JOB_STATUS_UPDATED'].includes(data.type)) {
            handlersRef.current.onRefreshNeeded?.();
        }
    }, [enableToasts]);

    // Connect to WebSocket
    const connect = useCallback(async () => {
        try {
            if (isConnectedRef.current) {
                return;
            }

            await wsClient.connect();
            isConnectedRef.current = true;

            // Remove any existing listeners first to prevent duplicates
            wsClient.off('invoice_notification', handleNotification);
            wsClient.off('dashboard_notification', handleNotification);
            wsClient.off('invoice_list_notification', handleNotification);

            // Set up simple notification listeners - only listen to invoice_list_notification to avoid duplicates
            wsClient.on('invoice_list_notification', handleNotification);
        } catch (error) {
            isConnectedRef.current = false;
        }
    }, [handleNotification]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (!isConnectedRef.current) return;

        // Remove event listeners
        wsClient.off('invoice_list_notification', handleNotification);

        wsClient.disconnect();
        isConnectedRef.current = false;
    }, [handleNotification]);

    // Join dashboard room for dashboard-specific updates
    const joinDashboard = useCallback(async () => {
        // Ensure we're connected before joining
        if (!wsClient.isConnected()) {
            await wsClient.connect();
        }
        wsClient.joinDashboard();
    }, []);

    // Leave dashboard room
    const leaveDashboard = useCallback(() => {
        wsClient.leaveDashboard();
    }, []);

    // Join invoice list room for invoice list-specific updates
    const joinInvoiceList = useCallback(async () => {
        // Ensure we're connected before joining
        if (!wsClient.isConnected()) {
            await wsClient.connect();
        }
        wsClient.joinInvoiceList();
    }, []);

    // Leave invoice list room
    const leaveInvoiceList = useCallback(() => {
        wsClient.leaveInvoiceList();
    }, []);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        connect,
        disconnect,
        joinDashboard,
        leaveDashboard,
        joinInvoiceList,
        leaveInvoiceList,
        isConnected: () => wsClient.isConnected(),
    };
};