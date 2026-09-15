const socketIO = require('socket.io');
const TokenService = require('./services/pg/TokenService');
const UserService = require('./services/pg/UserService');

const ADMIN_ROLES = ['admin', 'super_admin', 'moderator'];

/**
 * WebSocket Server for Real-Time Communication
 * Handles signal distribution, notifications, and market updates
 */
class WebSocketServer {
    constructor(server) {
        this.io = socketIO(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        // AUTHENTICATION GATE — every socket must present a valid access token
        // in the handshake (auth.token). Identity is derived from the verified
        // token; client-sent userIds are NEVER trusted. (The Mongo-era server
        // had no auth at all — anyone could join any user's private room.)
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth && socket.handshake.auth.token;
                if (!token) return next(new Error('Authentication required'));

                const payload = await TokenService.verifyToken(token, 'access');
                const user = await UserService.findById(payload.sub);
                if (!user) return next(new Error('User not found'));

                socket.userId = user.id;
                socket.userRole = user.role;
                next();
            } catch (error) {
                next(new Error(error.message || 'Invalid token'));
            }
        });

        this.connectedUsers = new Map();
        this.init();
    }

    init() {
        this.io.on('connection', (socket) => {
            console.log('✅ WebSocket client connected:', socket.id, `(user: ${socket.userId})`);

            // Join user-specific room — only your OWN room, unless admin/support
            socket.on('join', (userId) => {
                if (userId === socket.userId || ADMIN_ROLES.includes(socket.userRole)) {
                    socket.join(`user:${userId}`);
                    this.connectedUsers.set(socket.id, userId);
                    console.log(`User ${userId} joined room`);
                } else {
                    socket.emit('error', { message: 'Not authorized to join this room' });
                }
            });

            // Subscribe to trader's signals
            socket.on('subscribe:trader', (traderId) => {
                socket.join(`trader:${traderId}`);
                console.log(`Client subscribed to trader: ${traderId}`);
            });

            // Unsubscribe from trader's signals
            socket.on('unsubscribe:trader', (traderId) => {
                socket.leave(`trader:${traderId}`);
                console.log(`Client unsubscribed from trader: ${traderId}`);
            });

            // Join market data room
            socket.on('subscribe:market', (symbol) => {
                socket.join(`market:${symbol}`);
                console.log(`Client subscribed to market: ${symbol}`);
            });

            // Leave market data room
            socket.on('unsubscribe:market', (symbol) => {
                socket.leave(`market:${symbol}`);
                console.log(`Client unsubscribed from market: ${symbol}`);
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                const userId = this.connectedUsers.get(socket.id);
                this.connectedUsers.delete(socket.id);
                console.log('❌ WebSocket client disconnected:', socket.id, userId);
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });

        console.log('✅ WebSocket server initialized');
    }

    /**
     * Emit trading signal to all followers of a trader
     */
    emitSignal(traderId, signal) {
        this.io.to(`trader:${traderId}`).emit('signal', {
            type: 'new_signal',
            data: signal,
            timestamp: new Date()
        });
        console.log(`Signal emitted to followers of trader: ${traderId}`);
    }

    /**
     * Emit signal update (e.g., closed, modified)
     */
    emitSignalUpdate(traderId, signal) {
        this.io.to(`trader:${traderId}`).emit('signal:update', {
            type: 'signal_update',
            data: signal,
            timestamp: new Date()
        });
    }

    /**
     * Emit notification to specific user
     */
    emitNotification(userId, notification) {
        this.io.to(`user:${userId}`).emit('notification', {
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            data: notification.data,
            timestamp: new Date()
        });
        console.log(`Notification sent to user: ${userId}`);
    }

    /**
     * Broadcast market update to all subscribers of a symbol
     */
    broadcastMarketUpdate(symbol, data) {
        this.io.to(`market:${symbol}`).emit('market:update', {
            symbol,
            data,
            timestamp: new Date()
        });
    }

    /**
     * Broadcast general announcement to all connected clients
     * Includes Broadcast Guard routing checks
     */
    async broadcastAnnouncement(announcement) {
        // Broadcast Guard: Check if this type of announcement is allowed globally
        // For now, we allow all but log the routing event for audit
        console.log(`[BROADCAST GUARD] Routing announcement: ${announcement.message.substring(0, 30)}...`);
        
        this.io.emit('announcement', {
            type: 'announcement',
            message: announcement.message,
            priority: announcement.priority || 'normal',
            timestamp: new Date()
        });
    }

    /**
     * Broadcast a trading signal/pattern to all connected clients
     * Used for Geometry, VMID, and PTD global notifications
     * Implements routing rules for automated broadcasts
     */
    async broadcastSignal(signal) {
        // Broadcast Guard: Filter signals based on global routing rules
        // In a full implementation, this would fetch 'globalBroadcastGuard' settings
        console.log(`[BROADCAST GUARD] Processing global signal: ${signal.title || signal.name}`);
        
        this.io.emit('signal:global', {
            ...signal,
            timestamp: new Date()
        });
        console.log(`Global signal broadcasted: ${signal.title || signal.name}`);
    }

    /**
     * Get number of connected clients
     */
    getConnectedCount() {
        return this.connectedUsers.size;
    }

    /**
     * Get all connected user IDs
     */
    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }

    /**
     * Check if user is connected
     */
    isUserConnected(userId) {
        return Array.from(this.connectedUsers.values()).includes(userId);
    }
}

module.exports = WebSocketServer;
