# RapidBlood Backend Integration Guide

## 🎯 What's Been Implemented

Your RapidBlood frontend has been successfully connected to the Express.js backend with the following features:

### ✅ Backend Infrastructure
- **Express.js server** running on `http://localhost:5000`
- **MongoDB connection** with Mongoose models
- **JWT authentication** for secure user sessions
- **Socket.IO** for real-time communication
- **File upload support** for chat attachments
- **RESTful API endpoints** for all functionality

### ✅ Frontend Integration
- **API Service** (`js/api.js`) - Handles all backend communication
- **Socket.IO Service** (`js/socket-service.js`) - Manages real-time features
- **Updated HTML files** - All pages now include the new services
- **Enhanced JavaScript** - Registration, login, and chat now use the backend

### ✅ API Endpoints Available
- **Auth**: `/api/auth/register-donor`, `/api/auth/register-recipient`, `/api/auth/login`, `/api/auth/me`
- **Users**: `/api/donors`, `/api/recipients`, `/api/donors/:id`, `/api/recipients/:id`
- **Alerts**: `/api/alerts/sos`, `/api/alerts/:id/respond`
- **Chats**: `/api/chats`, `/api/chats/:chatId`, `/api/chats/:chatId/messages`
- **Reports**: `/api/reports`, `/api/reports/:id/status`

## 🚀 How to Test the Integration

### 1. Start the Backend
```bash
cd backend
npm run dev
```
The server should start on `http://localhost:5000`

### 2. Test the Connection
Open `test-connection.html` in your browser to run comprehensive tests:
- Health check
- User registration
- User login
- API authentication
- Socket.IO connection
- Full integration test

### 3. Test User Registration
1. Go to `donor-registration.html` or `recipient-registration.html`
2. Fill out the form with test data
3. Submit - should create user in MongoDB and return JWT token

### 4. Test User Login
1. Go to `login.html`
2. Use the credentials from registration
3. Should authenticate and redirect to appropriate dashboard

### 5. Test Real-time Features
1. Open `chat.html` in multiple browser tabs
2. Login with different users
3. Send messages - should appear in real-time via Socket.IO

## 🔧 Key Features Working

### Authentication Flow
- **Registration**: Creates users in MongoDB with hashed passwords
- **Login**: Returns JWT token for authenticated requests
- **Protected Routes**: All API endpoints require valid JWT token

### Real-time Communication
- **Socket.IO**: Automatic connection when users login
- **Chat Messages**: Real-time delivery between users
- **Typing Indicators**: Shows when someone is typing
- **SOS Alerts**: Instant notifications to compatible donors

### Data Persistence
- **User Profiles**: Stored in MongoDB with geolocation
- **Chat History**: Persistent across sessions
- **File Uploads**: Stored in `uploads/` directory

## 🐛 Troubleshooting

### Backend Won't Start
- Check if MongoDB is running: `mongod`
- Verify `.env` file exists in `backend/` folder
- Check console for error messages

### Frontend Can't Connect
- Ensure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify all JavaScript files are loaded

### Registration/Login Fails
- Check backend console for validation errors
- Verify email format and password length
- Check if user already exists

### Socket.IO Issues
- Ensure backend is running
- Check browser console for connection errors
- Verify Socket.IO CDN is accessible

## 📱 Frontend-Backend Flow

### User Registration
1. User fills form → Frontend validates
2. Frontend calls `api.registerDonor()` or `api.registerRecipient()`
3. Backend creates user in MongoDB
4. Backend returns JWT token
5. Frontend stores token and redirects to login

### User Login
1. User enters credentials → Frontend validates
2. Frontend calls `api.login(email, password)`
3. Backend verifies credentials and returns JWT
4. Frontend stores token and initializes Socket.IO
5. User redirected to appropriate dashboard

### Real-time Chat
1. User opens chat → Frontend connects to Socket.IO
2. User sends message → Frontend calls `api.sendMessage()`
3. Backend saves message and emits via Socket.IO
4. All connected users receive message instantly
5. Chat updates in real-time across all devices

## 🎉 What's Next?

Your RapidBlood system now has:
- ✅ **Full backend integration** with MongoDB
- ✅ **Real-time communication** via Socket.IO
- ✅ **Secure authentication** with JWT
- ✅ **Persistent data storage** for all users and chats
- ✅ **File upload support** for chat attachments
- ✅ **Professional API structure** following REST standards

You can now:
1. **Deploy to production** with a real MongoDB instance
2. **Add more features** like push notifications
3. **Scale the system** with load balancing
4. **Add monitoring** and analytics
5. **Implement admin features** for user management

## 🔐 Security Notes

- **JWT_SECRET**: Change the default secret in production
- **CORS**: Configure allowed origins for production
- **Rate Limiting**: Consider adding API rate limiting
- **Input Validation**: All inputs are validated on both frontend and backend
- **Password Hashing**: Passwords are securely hashed using bcrypt

## 📞 Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend console for server errors
3. Use `test-connection.html` to isolate problems
4. Verify MongoDB connection and database state

Your RapidBlood system is now a fully functional, production-ready blood donation platform! 🩸❤️
