import multer from 'multer';
import path from 'path';
import Chat from '../models/Chat.js';
import { getIO } from '../utils/socket.js';
import config from '../config/env.js';

// Multer storage
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, config.uploadDir),
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${unique}${path.extname(file.originalname)}`);
	},
});

export const upload = multer({ storage });

export const getChats = async (req, res) => {
	const chats = await Chat.find({ participants: req.user._id }).populate('participants', 'name email');
	res.json(chats);
};

export const getMessages = async (req, res) => {
	const chat = await Chat.findById(req.params.chatId);
	if (!chat || !chat.participants.some((p) => p.equals(req.user._id))) return res.status(404).json({ message: 'Chat not found' });
	res.json(chat.messages || []);
};

export const sendMessage = async (req, res) => {
	const { text } = req.body;
	const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
	let chat = await Chat.findById(req.params.chatId);
	if (!chat) {
		return res.status(404).json({ message: 'Chat not found' });
	}
	if (!chat.participants.some((p) => p.equals(req.user._id))) return res.status(403).json({ message: 'Not in this chat' });
	const message = { sender: req.user._id, text, fileUrl, createdAt: new Date() };
	chat.messages.push(message);
	chat.lastMessageAt = new Date();
	await chat.save();
	getIO().to(`chat:${chat._id}`).emit('message received', { chatId: chat._id, message });
	res.status(201).json(message);
};


