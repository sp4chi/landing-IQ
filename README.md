# LandingIQ — AI Landing Page Optimizer & Conversion Auditor

**LandingIQ** is a full-stack web application built for marketers and founders to perform instant, evidence-backed conversion rate optimization (CRO) audits on landing pages using Anthropic Claude (`claude-sonnet-4-6`).

---

## Live Demo

https://landing-iq.onrender.com/


---

## 🚀 Tech Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL with Drizzle ORM (Supports Neon / Supabase)
- **Auth**: Passport.js (Local bcrypt hashing + Google OAuth2 strategy) + `connect-pg-simple` session store
- **AI Engine**: Anthropic Claude API (`@anthropic-ai/sdk`, model `claude-sonnet-4-6`)
- **Validation & Security**: Zod for request body validation + `express-rate-limit` brute-force protection

---

## 🗄️ Setting Up a Free PostgreSQL Database (Neon / Supabase)

If you do not have a PostgreSQL database connection string yet, follow these 2-minute steps:

### Option A: Neon (Recommended for zero-config Serverless Postgres)
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Click **Create Project**, select a region, and name your project `landingiq-db`.
3. In your dashboard, copy the **Connection String** (starts with `postgresql://...`).
4. Paste it as `DATABASE_URL` in your `.env` file.

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and set a database password.
3. Navigate to **Project Settings** -> **Database** -> **Connection String (URI)**.
4. Copy the connection string and paste it as `DATABASE_URL` in your `.env` file.

> **Note**: For local demonstration without a Postgres database, LandingIQ also includes a built-in zero-config fallback storage driver!

---

## ⚡ Quick Local Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials in `.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DATABASE_URL=postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=supersecret_session_key_landingiq
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
PORT=3000
```

### 3. Push Database Migrations (Drizzle ORM)
```bash
npm run db:push
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Both Express backend and Vite frontend run seamlessly together in a single process.

---

## 🚢 Deployment Guide (Live Hackathon Demo)

For hosting both the Express backend and React frontend with zero cost and maximum reliability:

### Recommended Option: Render / Railway (Single Node Service)

1. **Push your code to GitHub**.
2. **Log into Render** ([render.com](https://render.com)) or **Railway** ([railway.app](https://railway.app)).
3. Click **New Web Service** and select your GitHub repository.
4. Set the following build settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables**: Add all variables from your local `.env` file into the platform's Dashboard environment settings (`ANTHROPIC_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`).
6. Click **Deploy Web Service**. Render/Railway will build the React assets and serve the Express backend under a single URL!

---

## 📋 API Reference

- `POST /api/auth/signup` - Register with email & password (min 8 chars, hashed with bcrypt)
- `POST /api/auth/login` - Authenticate user session
- `POST /api/auth/logout` - Destroy session & clear cookies
- `GET /api/auth/google` & `GET /api/auth/google/callback` - Passport Google OAuth2
- `GET /api/auth/me` - Rehydrate logged-in user
- `DELETE /api/auth/account` - Delete user account & associated audits
- `POST /api/analyze` - Perform AI conversion audit (Claude `claude-sonnet-4-6`)
- `GET /api/reports` - List all past reports for current user
- `GET /api/reports/:id` - Fetch single audit report breakdown
- `DELETE /api/reports/:id` - Delete saved audit report
