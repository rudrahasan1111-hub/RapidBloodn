## RapidBlood Backend (Express + MongoDB)

### Setup

1. Create `.env` in `backend/` with:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rapidblood
JWT_SECRET=please_change_me
CLIENT_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

2. Install dependencies and run:

```
npm install
npm run dev
```

The server listens on `http://localhost:5000`.

### Folder structure

```
src/
  config/ (env, db)
  controllers/
  middleware/
  models/
  routes/
  utils/
uploads/
```

### Auth

- POST `/api/auth/register-donor`
- POST `/api/auth/register-recipient`
- POST `/api/auth/login`
- GET `/api/auth/me`

Authorization uses `Bearer <token>` in `Authorization` header.

### Users

- GET `/api/donors` (query: `bloodType`, `lng`, `lat`, `radius` (m))
- GET `/api/recipients`
- GET `/api/donors/:id`
- GET `/api/recipients/:id`

### Alerts

- POST `/api/alerts/sos`
  - body: `{ location: { type: 'Point', coordinates: [lng, lat], address? }, bloodType, urgencyLevel?, requiredUnits? }`
- POST `/api/alerts/:id/respond` (donor)

### Chats

- GET `/api/chats`
- GET `/api/chats/:chatId`
- POST `/api/chats/:chatId/messages` (multipart `file` optional, `text`)

Socket.IO events: `setup` (userId), `join chat` (chatId), `typing`, `stop typing`, server emits: `connected`, `message received`, `sos_alert`, `sos_response`.

### Reports (admin)

- POST `/api/reports`
- GET `/api/reports`
- PUT `/api/reports/:id/status` `{ status: 'open'|'in_review'|'resolved'|'rejected' }`


