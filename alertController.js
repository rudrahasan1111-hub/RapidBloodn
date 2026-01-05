import { body, validationResult } from 'express-validator';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { getIO } from '../utils/socket.js';
import { isCompatibleBloodType } from '../utils/geo.js';

export const validateCreateSOS = [
	body('location.coordinates').isArray({ min: 2 }),
	body('bloodType').notEmpty(),
	body('urgencyLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
	body('requiredUnits').optional().isInt({ min: 1 }),
];

export const createSOS = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { location, bloodType, urgencyLevel, requiredUnits } = req.body;
	const alert = await Alert.create({ type: 'SOS', recipient: req.user._id, location, bloodType, urgencyLevel, requiredUnits });

	// Notify compatible donors near the location (simple broadcast to users; in real app, use geo + compatibility)
	const donors = await User.find({ userType: 'donor', isActive: true });
	const recipientsType = bloodType;
	donors.forEach((donor) => {
		if (isCompatibleBloodType(donor.bloodType, recipientsType)) {
			getIO().to(`user:${donor._id}`).emit('sos_alert', { alertId: alert._id, location, bloodType, urgencyLevel, requiredUnits });
		}
	});

	res.status(201).json(alert);
};

export const respondToAlert = async (req, res) => {
	const { id } = req.params;
	const { message } = req.body;
	const alert = await Alert.findById(id);
	if (!alert || alert.status !== 'active') return res.status(404).json({ message: 'Alert not found or inactive' });
	alert.responses.push({ donor: req.user._id, message, status: 'pending' });
	await alert.save();
	getIO().to(`user:${alert.recipient}`).emit('sos_response', { alertId: alert._id, donorId: req.user._id, message });
	res.json({ ok: true });
};


