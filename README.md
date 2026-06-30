# SEGi Community Hub
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

A full-stack student community platform built for SEGi University, Kota Damansara. Community Hub helps students discover clubs and societies, stay updated on campus events, get instant answers from an AI assistant, and receive notifications from the clubs they follow.

## Features

- **Club Directory** — browse, search, and filter all registered clubs and societies by category
- **Club Profiles** — each club has its own page with description, contact info, membership link, and event history
- **Events** — view upcoming and past events campus-wide, filterable by category, with full event details
- **Hub Assistant** — an AI-powered chatbot (built on the Groq API) that answers student questions about clubs, events, and registration
- **Notifications** — students receive updates from clubs they follow, with a real-time unread badge
- **Campus Highlights & Club Gallery** — admins can upload and feature photos that showcase campus life on the homepage and club directory
- **Admin Dashboard** — full management interface for clubs, events, notifications, and the photo gallery
- **Authentication** — secure registration, login, and password reset (via email) with JWT-based sessions

## Tech Stack

**Frontend**
- React.js (React Router for navigation)
- Axios for API requests

**Backend**
- Node.js with Express.js
- MySQL (via `mysql2`)
- JWT authentication with bcrypt password hashing
- Groq SDK for the AI chatbot
- Nodemailer for password reset emails

**Other**
- Cloudinary for image uploads and storage

## Project Structure

```
community-hub/
├── backend/
│   ├── config/         # Database connection
│   ├── middleware/      # Auth middleware (JWT verification, role checks)
│   ├── routes/           # API routes (auth, clubs, events, gallery, notifications, chatbot)
│   └── server.js
└── frontend/
    └── src/
        ├── pages/        # Page-level components (Home, ClubDirectory, Events, Chatbot, AdminDashboard, etc.)
        ├── components/   # Shared components (Navbar)
        └── services/     # API service layer
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server
- A Groq API key
- A Gmail account with an App Password (for password reset emails)
- A Cloudinary account (for image uploads)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=community_hub
DB_PORT=3306
JWT_SECRET=your_random_secret
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

Run the server:

```bash
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will run at `http://localhost:3000` by default, connecting to the backend at `http://localhost:5000`.

## Database

The schema includes six core tables: `users`, `clubs`, `events`, `club_gallery`, `notifications`, and `follows`, along with `chatbot_logs` for tracking AI conversations. Run the SQL setup scripts in MySQL Workbench (or your preferred client) before starting the backend.

## License

This project was built as part of an academic Final Year Project at SEGi University.

## Author

Built by **Lydia Tolulope Omosofe**
