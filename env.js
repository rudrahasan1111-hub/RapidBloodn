import dotenv from 'dotenv';

dotenv.config();

export const config = {
	port: process.env.PORT || 5000,
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rapidblood',
	jwttSecret: process.env.JWT_SECRET || 'change_me_in_production',
	clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
	uploadDir: process.env.UPLOAD_DIR || 'uploads',
};

export default config;


