# LandingIQ — Next-Gen AI Landing Page Optimizer & Visual CRO Auditor

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-emerald?style=for-the-badge&logo=render)](https://landing-iq.onrender.com/)
[![AI Engine](https://img.shields.io/badge/GenAI-Claude_3.5_Sonnet_Vision-amber?style=for-the-badge&logo=anthropic)](https://www.anthropic.com/)
[![Browser Engine](https://img.shields.io/badge/Headless_Capture-Playwright_Chromium-blue?style=for-the-badge&logo=playwright)](https://playwright.dev/)

> **LandingIQ** is an advanced AI-powered Conversion Rate Optimization (CRO) platform that combines **Multimodal AI Vision**, high-converting copywriting engines, and automated UX usability auditing to maximize landing page conversion performance in seconds.

---

## 🌟 High-Impact Generative AI Capabilities

LandingIQ integrates state-of-the-art Generative AI models to analyze both **visual layout rendering** and **text messaging hooks** simultaneously.

### 1. 👁️ Multimodal AI Vision Audit (Playwright + Claude 3.5 Sonnet Vision)
- **Automated Headless Screenshot Capture**: When a user inputs a website URL, backend Playwright Chromium launches a headless browser, renders the page at `1280x800` viewport, and captures a high-resolution screenshot buffer.
- **Multimodal Visual UX Ingestion**: Passes the raw base64 PNG screenshot into **Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)**.
- **Visual Design Metrics Evaluated**:
  - **Above-The-Fold Clarity (0-100)**: Evaluates hero headline positioning and benefit communication before scrolling.
  - **Color Contrast & Typography Readability**: Checks WCAG color contrast ratios, font weights, and text legibility.
  - **CTA Visual Prominence**: Assesses button background colors, padding, hover states, and glowing visual accents.
  - **Visual Hierarchy & Whitespace**: Measures visual clutter, section padding, and top-to-bottom layout flow.
- **Concrete CSS Fix Recommendations**: Returns actionable code and CSS color/font weight tweaks (e.g. *"Change CTA button background to high-contrast Amber `#F59E0B` with 52px height"*).

### 2. 🎯 AI Conversion Copywriting & Headline Optimization Engine
- **Psychological Hook Generation**: Analyzes page copy for value clarity, buyer friction, and subheadline alignment.
- **High-Converting Alternatives**: Generates distinct headline options tailored to target buyer personas (e.g., Pain-Point Focused vs Outcome-Driven).
- **Strategic Rationales**: Provides psychological explanations for why each proposed headline hook increases conversion rates.

### 3. 🖱️ Smart CTA & Layout Structure Assistant
- **CTA Button Copy Transformer**: Replaces low-friction friction words (*"Submit"*, *"Learn More"*) with high-intent benefit verbs (*"Claim My Free Audit →"*).
- **Section Structural Tweaks**: Recommends visual structural improvements across Hero Banners, Feature Matrices, Social Proof Logos, and Pricing Cards.

### 4. 🔍 Automated SEO & WCAG Accessibility Audit
- **SEO Optimization**: Generates 50-60 character meta titles, 150-160 character meta descriptions, target keyword tags, and H1/H2 heading hierarchy fixes.
- **WCAG Accessibility Scanner**: Identifies screen-reader gaps, label associations, and contrast violations.

---

## 🛠️ Technology Stack & Architecture

- **AI Engine**: Anthropic Claude 3.5 Sonnet Vision API (`@anthropic-ai/sdk`, `claude-3-5-sonnet-20241022`)
- **Headless Browser Capture**: Playwright Chromium (`playwright`)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express (TypeScript), Passport.js (Local bcrypt + Google OAuth 2.0)
- **Database**: PostgreSQL with Drizzle ORM (Neon / Supabase), `connect-pg-simple` session store
- **Security & Validation**: Zod schema validation + `express-rate-limit` brute-force protection

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

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Both Express backend and Vite frontend run seamlessly together in a single process.

---

## 🚢 Live Deployment

- **Live Render App**: [https://landing-iq.onrender.com/](https://landing-iq.onrender.com/)
