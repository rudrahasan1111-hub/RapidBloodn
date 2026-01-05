import User from '../models/User.js';
import { buildGeoNearFilter } from '../utils/geo.js';

export const listDonors = async (req, res) => {
	const { bloodType, lng, lat, radius } = req.query;
	const filter = { userType: 'donor', isActive: true };
	if (bloodType) filter.bloodType = bloodType;
	if (lng && lat) Object.assign(filter, buildGeoNearFilter(Number(lng), Number(lat), Number(radius) || 20000));
	const donors = await User.find(filter).select('-password');
	res.json(donors);
};

export const listRecipients = async (_req, res) => {
	const recipients = await User.find({ userType: 'recipient', isActive: true }).select('-password');
	res.json(recipients);
};

export const getDonor = async (req, res) => {
	const donor = await User.findOne({ _id: req.params.id, userType: 'donor' }).select('-password');
	if (!donor) return res.status(404).json({ message: 'Donor not found' });
	res.json(donor);
};

export const getRecipient = async (req, res) => {
	const recipient = await User.findOne({ _id: req.params.id, userType: 'recipient' }).select('-password');
	if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
	res.json(recipient);
};


