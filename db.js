import mongoose from 'mongoose';
import config from './env.js';

export async function connectDatabase() {
	try {
		mongoose.set('strictQuery', true);
		await mongoose.connect(config.mongoUri, {
			serverSelectionTimeoutMS: 10000,
		});
		console.log('MongoDB connected');
	} catch (error) {
		console.error('MongoDB connection error:', error.message);
		process.exit(1);
	}
}

export default connectDatabase;


