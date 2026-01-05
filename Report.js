import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
	{
		reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		category: { type: String, enum: ['fake_donor', 'spam', 'abuse', 'other'], required: true },
		severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
		description: { type: String, required: true },
		status: { type: String, enum: ['open', 'in_review', 'resolved', 'rejected'], default: 'open' },
	},
	{ timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;


