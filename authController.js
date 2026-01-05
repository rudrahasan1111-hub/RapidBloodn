import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import config from '../config/env.js';

function signToken(user) {
	return jwt.sign({ id: user._id, role: user.userType }, config.jwttSecret, { expiresIn: '7d' });
}

export const validateRegister = [
	body('email').isEmail(),
	body('password').isLength({ min: 6 }),
	body('name').notEmpty(),
	body('phone').notEmpty(),
	body('bloodType').notEmpty(),
	body('location.coordinates').isArray({ min: 2 }),
	body('userType').isIn(['donor', 'recipient']),
];

export const register = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { email, password, name, phone, bloodType, location, userType } = req.body;
	const exists = await User.findOne({ email });
	if (exists) return res.status(409).json({ message: 'Email already registered' });
	const user = await User.create({ email, password, name, phone, bloodType, location, userType });
	const token = signToken(user);
	res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, userType: user.userType } });
};

export const validateLogin = [
	body('email').isEmail(),
	body('password').notEmpty(),
];

export const login = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select('+password');
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const match = await user.comparePassword(password);
	if (!match) return res.status(401).json({ message: 'Invalid credentials' });
	const token = signToken(user);
	res.json({ token, user: { id: user._id, email: user.email, name: user.name, userType: user.userType } });
};

export const me = async (req, res) => {
	const user = await User.findById(req.user._id);
	res.json(user);
};


