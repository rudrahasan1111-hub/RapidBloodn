import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';

export async function protect(req, res, next) {
	try {
		let token = null;
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
			token = req.headers.authorization.split(' ')[1];
		}
		if (!token) return res.status(401).json({ message: 'Not authorized' });
		const decoded = jwt.verify(token, config.jwttSecret);
		const user = await User.findById(decoded.id);
		if (!user) return res.status(401).json({ message: 'User not found' });
		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Token invalid' });
	}
}

export function admin(req, res, next) {
	if (req.user && req.user.userType === 'admin') return next();
	return res.status(403).json({ message: 'Admin only' });
}

export default { protect, admin };


