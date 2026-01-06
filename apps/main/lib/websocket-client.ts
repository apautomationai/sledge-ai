"use client";

import { io, Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';

export interface WebSocketEvents {
    invoice_notification: (data: any) => void;
    dashboard_notification: (data: any) => void;
    invoice_list_notification: (data: any) => void;
}

class WebSocketClient {
    private socket: Socket | null = null;
    private static instance: WebSocketClient;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private joinedRooms: Set<string> = new Set();

    private constructor() { }

    public static getInstance(): WebSocketClient {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }

    public connect(): Promise<Socket> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve(this.socket);
                return;
            }

            // Get auth token from cookies or localStorage as fallback
            let token = getCookie('token') as string | null;

            // Fallback to localStorage if cookie is not available
            if (!token && typeof window !== 'undefined') {
                token = localStorage.getItem('token');
            }

            if (!token) {
                reject(new Error('No authentication token found'));
                return;
            }

            const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

            this.socket = io(serverUrl, {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'],
                timeout: 20000,
                forceNew: false,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                // Handle HTTPS/WSS automatically
                secure: serverUrl.startsWith('https://'),
                upgrade: true,
                rememberUpgrade: true
            });

            this.socket.on('connect', () => {
                this.reconnectAttempts = 0;

                // Rejoin all previously joined rooms after reconnection
                if (this.joinedRooms.size > 0) {
                    console.log('🔄 Rejoining rooms:', Array.from(this.joinedRooms));
                    this.joinedRooms.forEach(room => {
                        if (room === 'dashboard') {
                            this.socket?.emit('join_dashboard');
                        } else if (room === 'invoice_list') {
                            this.socket?.emit('join_invoice_list');
                        }
                    });
                }

                resolve(this.socket!);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('🔌 Socket.IO disconnected:', reason);
            });

            this.socket.on('connect_error', (error) => {
                // Check if it's an authentication error
                if (error.message.includes('Authentication error')) {
                    reject(new Error('Authentication failed: ' + error.message));
                    return;
                }

                this.reconnectAttempts++;

                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts: ${error.message}`));
                }
            });
            this.socket.on('reconnect', (attemptNumber) => {
                this.reconnectAttempts = 0;
            });
            this.socket.on('reconnect_error', (error) => {
                // Handle reconnection error
            });

            this.socket.on('reconnect_failed', () => {
                reject(new Error('Failed to reconnect to WebSocket server'));
            });
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            // Clear joined rooms on explicit disconnect
            this.joinedRooms.clear();
        }
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    public joinDashboard(): void {
        if (this.socket?.connected) {
            this.socket.emit('join_dashboard');
            this.joinedRooms.add('dashboard');
        } else {
            console.warn('⚠️ Cannot join dashboard: socket not connected');
        }
    }

    public leaveDashboard(): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_dashboard');
            this.joinedRooms.delete('dashboard');
        }
    }

    public joinInvoiceList(): void {
        if (this.socket?.connected) {
            this.socket.emit('join_invoice_list');
            this.joinedRooms.add('invoice_list');
        } else {
            console.warn('⚠️ Cannot join invoice_list: socket not connected');
        }
    }

    public leaveInvoiceList(): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_invoice_list');
            this.joinedRooms.delete('invoice_list');
        }
    }

    public on(event: string, callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    public off(event: string, callback?: (data: any) => void): void {
        if (this.socket) {
            if (callback) {
                this.socket.off(event, callback);
            } else {
                this.socket.off(event);
            }
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }
}

// Export singleton instance
export const wsClient = WebSocketClient.getInstance();

// Hook for React components
export const useWebSocket = () => {
    return wsClient;
};