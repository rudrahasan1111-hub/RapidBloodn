import mongoose from 'mongoose';

const alertResponseSchema = new mongoose.Schema(
	{
		donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		message: { type: String },
		status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
		respondedAt: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const alertSchema = new mongoose.Schema(
	{
		type: { type: String, enum: ['SOS'], default: 'SOS' },
		recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		location: {
			type: { type: String, enum: ['Point'], default: 'Point' },
			coordinates: { type: [Number], index: '2dsphere', required: true }, // [lng, lat]
			address: { type: String },
		},
		bloodType: { type: String, required: true },
		urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
		requiredUnits: { type: Number, default: 1 },
		status: { type: String, enum: ['active', 'fulfilled', 'cancelled'], default: 'active' },
		responses: [alertResponseSchema],
	},
	{ timestamps: true }
);

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;


