// RapidBlood Socket.IO Service
class RapidBloodSocket {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.userId = null;
        this.eventHandlers = new Map();
    }

    // Initialize Socket.IO connection
    connect(userId) {
        if (this.socket && this.isConnected) {
            return;
        }

        this.userId = userId;
        
        // Load Socket.IO from CDN if not already loaded
        if (typeof io === 'undefined') {
            this.loadSocketIO();
            return;
        }

        this.initializeSocket();
    }

    // Load Socket.IO from CDN
    loadSocketIO() {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
        script.onload = () => {
            this.initializeSocket();
        };
        document.head.appendChild(script);
    }

    // Initialize Socket.IO connection
    initializeSocket() {
        try {
            this.socket = io('http://localhost:5000', {
                transports: ['websocket', 'polling']
            });

            this.setupEventListeners();
            this.setupUser();
        } catch (error) {
            console.error('Socket.IO connection failed:', error);
        }
    }

    // Setup Socket.IO event listeners
    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Socket.IO connected');
            this.isConnected = true;
            this.setupUser();
        });

        this.socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            this.isConnected = false;
        });

        this.socket.on('connected', () => {
            console.log('User setup complete');
        });

        this.socket.on('message received', (data) => {
            this.triggerEvent('message', data);
        });

        this.socket.on('sos_alert', (data) => {
            this.triggerEvent('sos_alert', data);
        });

        this.socket.on('sos_response', (data) => {
            this.triggerEvent('sos_response', data);
        });

        this.socket.on('typing', (data) => {
            this.triggerEvent('typing', data);
        });

        this.socket.on('stop typing', (data) => {
            this.triggerEvent('stop_typing', data);
        });

        this.socket.on('pong', () => {
            this.triggerEvent('pong');
        });
    }

    // Setup user in Socket.IO
    setupUser() {
        if (this.socket && this.userId) {
            this.socket.emit('setup', this.userId);
        }
    }

    // Join a chat room
    joinChat(chatId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join chat', chatId);
        }
    }

    // Leave a chat room
    leaveChat(chatId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave chat', chatId);
        }
    }

    // Send typing indicator
    sendTyping(chatId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing', chatId);
        }
    }

    // Stop typing indicator
    stopTyping(chatId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('stop typing', chatId);
        }
    }

    // Send ping
    ping() {
        if (this.socket && this.isConnected) {
            this.socket.emit('ping');
        }
    }

    // Disconnect Socket.IO
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.userId = null;
        }
    }

    // Event handling system
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    triggerEvent(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${event} event handler:`, error);
                }
            });
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            userId: this.userId
        };
    }
}

// Create global Socket.IO instance
const socketService = new RapidBloodSocket();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RapidBloodSocket;
}
