# TechBuddy — Backend

REST + Socket.IO API for **TechBuddy**, a "Tinder for developers": discover developers, connect, and chat in real time.

The React frontend lives here: [Dev-yadav2003/techbuddy-Frontend](https://github.com/Dev-yadav2003/techbuddy-Frontend).

## Tech stack

Node.js · Express · MongoDB + Mongoose · JWT (httpOnly cookie) · Socket.IO · Multer (image uploads) · bcryptjs

## Quick start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A MongoDB database: [install it locally](https://www.mongodb.com/try/download/community) or create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### Setup

```bash
git clone https://github.com/Dev-yadav2003/techbuddy.git
cd techbuddy
npm install
cp .env.example .env      # Windows (cmd): copy .env.example .env
```

Edit `.env`:

| Variable       | Required | Description                                                   | Example                                    |
| -------------- | -------- | ------------------------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL` | yes      | MongoDB connection string                                     | `mongodb://127.0.0.1:27017/techbuddy`      |
| `JWT_PASSWORD` | yes      | Secret used to sign login tokens (any long random string)     | `9f8a7c...`                                |
| `PORT`         | no       | Port to listen on (default `3000`)                            | `3000`                                     |
| `CORS_ORIGINS` | no       | Comma-separated frontend URLs (default `http://localhost:5173`) | `http://localhost:5173,https://my.app`   |
| `NODE_ENV`     | no       | `production` enables secure cross-site cookies                | `development`                              |

Run it:

```bash
npm run dev     # with auto-reload (nodemon)
# or
npm start
```

You should see `DB connected successfully` and `Server started on port 3000`. Check `http://localhost:3000/health`, which should return `{"status":"ok"}`.

Then start the [frontend](https://github.com/Dev-yadav2003/techbuddy-Frontend#quick-start-frontend--backend-locally).

## API

All routes except signup/login/logout/health require the `token` cookie set by login/signup. Errors are returned as `{ "error": "message" }`.

| Method | Route                                  | Description                                                         |
| ------ | -------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/health`                              | Health check                                                        |
| POST   | `/signUp`                              | Body: `firstName, lastName, emailId, password` (8+ chars)           |
| POST   | `/login`                               | Body: `emailId, password`                                           |
| POST   | `/logout`                              | Clears the cookie                                                   |
| GET    | `/profile/view`                        | Current user                                                        |
| PATCH  | `/profile/edit`                        | `multipart/form-data`: `firstName, lastName, age, gender, about, skills` (comma-separated), `profileImage` (image ≤ 5 MB) |
| GET    | `/user/feed?page=1&limit=10`           | Users you haven't interacted with yet (max 50 per page)             |
| POST   | `/request/send/:status/:toUserId`      | `status` = `intrested` or `ignored`                                 |
| GET    | `/user/request`                        | Pending requests sent to you                                        |
| POST   | `/request/review/:status/:requestId`   | `status` = `accepted` or `rejected`                                 |
| GET    | `/user/connection`                     | Your accepted connections                                           |
| GET    | `/chat/:targetUserId`                  | Chat partner + last 100 messages (connections only)                 |

> The status value is spelled `intrested` for compatibility with existing data.

### Socket.IO events

The socket authenticates with the same `token` cookie (connect with `withCredentials: true`).

| Direction       | Event             | Payload                                              |
| --------------- | ----------------- | ---------------------------------------------------- |
| client → server | `joinChat`        | `{ targetUserId }`                                   |
| client → server | `sendMessage`     | `{ targetUserId, text }`                             |
| server → client | `messageReceived` | `{ _id, senderId, firstName, text, timestamp }`      |
| server → client | `chatError`       | `{ error }`                                          |

Messages are saved in MongoDB, and only accepted connections can chat.

## Project structure

```
src/
├── app.js                  # Express app, CORS, routes, error handling
├── config/
│   ├── env.js              # Loads and validates .env
│   └── database.js
├── middlewares/checkAuth.js
├── models/                 # User, Connection, Chat
├── routes/                 # auth, profile, request, user, chat
└── utils/                  # auth cookie helpers, socket, multer, validation
```

## Deployment notes (Render / Railway / etc.)

- Set `NODE_ENV=production`, `CORS_ORIGINS=https://your-frontend.vercel.app`, `DATABASE_URL` and `JWT_PASSWORD`.
- In production, cookies are `SameSite=None; Secure`, so the backend must be served over **HTTPS**.
- Uploaded profile photos are stored on local disk in `upload/`. Many free hosts wipe the disk on redeploy, so photos can disappear. For a permanent setup, move uploads to a service like Cloudinary or S3.
