import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import connectDatabase from './config/db.js';
import { initSocket } from './utils/socket.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads (serve from backend/uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Start server
async function start() {
	await connectDatabase();
	initSocket(server);
	server.listen(config.port, () => {
		console.log(`Server running on port ${config.port}`);
	});
}

start();


