import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';

export const validateReport = [
	body('reportedUser').isMongoId(),
	body('category').isIn(['fake_donor', 'spam', 'abuse', 'other']),
	body('severity').optional().isIn(['low', 'medium', 'high']),
	body('description').isLength({ min: 5 }),
];

export const createReport = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	const { reportedUser, category, severity, description } = req.body;
	const report = await Report.create({ reporter: req.user._id, reportedUser, category, severity, description });
	res.status(201).json(report);
};

export const getReports = async (_req, res) => {
	const reports = await Report.find().populate('reporter', 'name email').populate('reportedUser', 'name email');
	res.json(reports);
};

export const updateReportStatus = async (req, res) => {
	const { id } = req.params;
	const { status } = req.body;
	if (!['open', 'in_review', 'resolved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
	const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
	if (!report) return res.status(404).json({ message: 'Report not found' });
	res.json(report);
};


