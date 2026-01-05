import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const locationSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point',
		},
		coordinates: { type: [Number], index: '2dsphere', required: true }, // [lng, lat]
		address: { type: String },
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, select: false },
		name: { type: String, required: true },
		phone: { type: String, required: true },
		bloodType: { type: String, required: true },
		location: { type: locationSchema, required: true },
		userType: { type: String, enum: ['donor', 'recipient', 'admin'], required: true },
		lastDonationDate: { type: Date },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;


