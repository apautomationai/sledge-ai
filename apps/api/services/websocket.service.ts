import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export class WebSocketService {
    private io: SocketIOServer;
    private static instance: WebSocketService;

    constructor(server: HTTPServer) {
        // Configure allowed origins for different environments
        const getAllowedOrigins = () => {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            const allowedOrigins = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || frontendUrl;

            // Parse comma-separated origins
            const origins = allowedOrigins.split(',').map(origin => origin.trim());

            // Add common production domains if not already included
            const productionDomains = [
                "https://getsledge.com",
                "https://www.getsledge.com",
                "https://dev.getsledge.com"
            ];

            productionDomains.forEach(domain => {
                if (!origins.includes(domain)) {
                    origins.push(domain);
                }
            });

            return origins;
        };

        this.io = new SocketIOServer(server, {
            cors: {
                origin: getAllowedOrigins(),
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true,
                allowedHeaders: ["Content-Type", "Authorization"]
            },
            allowEIO3: true, // Support older clients
            transports: ['websocket', 'polling'], // Allow fallback to polling
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.setupMiddleware();
        this.setupEventHandlers();
    }

    public static getInstance(server?: HTTPServer): WebSocketService {
        if (!WebSocketService.instance && server) {
            WebSocketService.instance = new WebSocketService(server);
        }
        return WebSocketService.instance;
    }

    private setupMiddleware() {
        // Authentication middleware
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }

                if (!process.env.JWT_SECRET) {
                    return next(new Error('Authentication error: Server configuration error'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
                socket.data.userId = decoded.id;
                socket.data.user = decoded;

                next();
            } catch (error: any) {
                if (error.name === 'TokenExpiredError') {
                    next(new Error('Authentication error: Token expired'));
                } else if (error.name === 'JsonWebTokenError') {
                    next(new Error('Authentication error: Invalid token format'));
                } else {
                    next(new Error('Authentication error: Invalid token'));
                }
            }
        });
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket) => {
            const userId = socket.data.userId;

            // Join user to their personal room for targeted updates
            socket.join(`user_${userId}`);

            // Handle disconnection
            socket.on('disconnect', () => {
                // Connection cleanup handled automatically
            });

            // Handle joining specific rooms
            socket.on('join_dashboard', () => {
                socket.join(`dashboard_${userId}`);
            });

            socket.on('join_invoice_list', () => {
                socket.join(`invoice_list_${userId}`);
            });

            socket.on('leave_dashboard', () => {
                socket.leave(`dashboard_${userId}`);
            });

            socket.on('leave_invoice_list', () => {
                socket.leave(`invoice_list_${userId}`);
            });
        });
    }

    public emitInvoiceCreated(userId: number, invoice: any) {
        const notification = {
            type: 'INVOICE_CREATED',
            invoiceId: invoice.id,
            timestamp: new Date().toISOString()
        };

        this.io.to(`user_${userId}`).emit('invoice_notification', notification);
        this.io.to(`dashboard_${userId}`).emit('dashboard_notification', notification);
        this.io.to(`invoice_list_${userId}`).emit('invoice_list_notification', notification);
    }

    public emitInvoiceStatusUpdated(userId: number, invoiceId: number, status: string) {
        const notification = {
            type: 'INVOICE_STATUS_UPDATED',
            invoiceId: invoiceId,
            status: status,
            timestamp: new Date().toISOString()
        };

        this.io.to(`user_${userId}`).emit('invoice_notification', notification);
        this.io.to(`dashboard_${userId}`).emit('dashboard_notification', notification);
        this.io.to(`invoice_list_${userId}`).emit('invoice_list_notification', notification);
    }

    public emitInvoiceUpdated(userId: number, invoice: any) {
        const notification = {
            type: 'INVOICE_UPDATED',
            invoiceId: invoice.id,
            timestamp: new Date().toISOString()
        };

        this.io.to(`user_${userId}`).emit('invoice_notification', notification);
        this.io.to(`dashboard_${userId}`).emit('dashboard_notification', notification);
        this.io.to(`invoice_list_${userId}`).emit('invoice_list_notification', notification);
    }

    // Emit invoice deleted to user
    public emitInvoiceDeleted(userId: number, invoiceId: number) {
        const updateData = {
            type: 'INVOICE_DELETED',
            data: { id: invoiceId },
            timestamp: new Date().toISOString()
        };

        this.io.to(`user_${userId}`).emit('invoice_deleted', updateData);
        this.io.to(`dashboard_${userId}`).emit('dashboard_update', updateData);
        this.io.to(`invoice_list_${userId}`).emit('invoice_list_update', updateData);
    }

    // Emit attachment status updated
    public emitAttachmentStatusUpdated(userId: number, attachmentId: number, status: string, attachmentData?: any) {
        const notification = {
            type: 'ATTACHMENT_STATUS_UPDATED',
            attachmentId: attachmentId,
            status: status,
            attachmentData: attachmentData, // Include full attachment data
            timestamp: new Date().toISOString()
        };

        this.io.to(`user_${userId}`).emit('invoice_notification', notification);
        this.io.to(`dashboard_${userId}`).emit('dashboard_notification', notification);
        this.io.to(`invoice_list_${userId}`).emit('invoice_list_notification', notification);
    }

    // Emit job status updated (for direct job status changes)
    public emitJobStatusUpdated(userId: number, jobId: string, status: string, jobData?: any) {
        const notification = {
            type: 'JOB_STATUS_UPDATED',
            jobId: jobId,
            status: status,
            jobData: jobData, // Include full job data
            timestamp: new Date().toISOString()
        };

        this.io.to(`user_${userId}`).emit('invoice_notification', notification);
        this.io.to(`dashboard_${userId}`).emit('dashboard_notification', notification);
        this.io.to(`invoice_list_${userId}`).emit('invoice_list_notification', notification);
    }

    // Get Socket.IO instance for direct use if needed
    public getIO(): SocketIOServer {
        return this.io;
    }
}

export const getWebSocketService = (server?: HTTPServer) => {
    return WebSocketService.getInstance(server);
};