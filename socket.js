import { Server } from 'socket.io';
import config from '../config/env.js';

let ioInstance = null;

export function initSocket(server) {
	ioInstance = new Server(server, {
		cors: {
			origin: config.clientUrl,
			methods: ['GET', 'POST'],
		},
	});

	ioInstance.on('connection', (socket) => {
		// Expect client to emit 'setup' with userId
		socket.on('setup', (userId) => {
			socket.join(`user:${userId}`);
			socket.emit('connected');
		});

		// Join a chat room
		socket.on('join chat', (chatId) => {
			socket.join(`chat:${chatId}`);
		});

		// Typing indicators
		socket.on('typing', (chatId) => socket.to(`chat:${chatId}`).emit('typing'));
		socket.on('stop typing', (chatId) => socket.to(`chat:${chatId}`).emit('stop typing'));

		// Basic ping/pong
		socket.on('ping', () => socket.emit('pong'));
	});

	return ioInstance;
}

export function getIO() {
	if (!ioInstance) throw new Error('Socket.io not initialized');
	return ioInstance;
}

export default { initSocket, getIO };


