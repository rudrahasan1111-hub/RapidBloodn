import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		text: { type: String },
		fileUrl: { type: String },
		createdAt: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const chatSchema = new mongoose.Schema(
	{
		participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
		messages: [messageSchema],
		lastMessageAt: { type: Date },
	},
	{ timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;


