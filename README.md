# LandingIQ — Next-Gen AI Landing Page Optimizer & Visual CRO Auditor

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-emerald?style=for-the-badge&logo=render)](https://landing-iq.onrender.com/)
[![GenAI Engine](https://img.shields.io/badge/GenAI-Gemini_%7C_Groq_%7C_HuggingFace_%7C_Claude_%7C_OpenAI-blue?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Capture Engine](https://img.shields.io/badge/Screenshot_Engine-Playwright_%2B_Cloud_Fallback-purple?style=for-the-badge&logo=playwright)](https://playwright.dev/)

> **LandingIQ** is an advanced AI-powered Conversion Rate Optimization (CRO) platform that combines **Multimodal AI Vision**, high-converting copywriting engines, and automated UX usability auditing to evaluate and optimize landing page performance in seconds.

---

## 🤖 Generative AI Tools & Multimodal Vision Models Used

LandingIQ features a **zero-code, provider-agnostic AI layer** ([`server/ai-provider.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/ai-provider.ts)). It ingests both **rendered webpage screenshot buffers** and **text copy** simultaneously using state-of-the-art **Vision-to-Text Generative AI models**.

### Supported GenAI Providers & Models:

| GenAI Provider | Key Prefix | Primary Models Used | Cost Tier | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini** | `AIza...` | `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-flash` | **Free Tier Available** | Multimodal Vision + Structured JSON Generation |
| **Groq Cloud** | `gsk_...` | `llama-3.2-11b-vision-preview`, `llama-3.2-90b-vision-preview`, `llama-3.3-70b-versatile` | **100% Free** | Ultra-Fast Llama 3.2 Vision & Copy Analysis |
| **Hugging Face** | `hf_...` | `Qwen/Qwen2.5-Coder-32B-Instruct`, `Qwen/Qwen2.5-72B-Instruct`, `Llama-3.2-3B` | **100% Free** | Open-Source LLM Serverless Inference |
| **Anthropic Claude** | `sk-ant...` | `claude-3-5-sonnet-20241022` | Paid | Multimodal Claude 3.5 Vision UX Audit |
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o` | Paid | GPT-4o Vision JSON Mode Audit |

---

## 💡 How Playwright & Vision AI Work Together

It is important to distinguish between the **Browser Renderer** and the **Vision AI Engine**:

$$\text{Web URL} \xrightarrow[\text{Headless Browser Renderer}]{\text{Playwright / Cloud Fallback}} \text{PNG Screenshot} \xrightarrow[\text{Vision-to-Text LLM}]{\text{Google Gemini / Groq / Claude}} \text{Structured JSON CRO Audit}$$

1. **Headless Browser Renderer (Playwright Chromium + Cloud Fallback)**:
   - **Playwright Chromium** opens an invisible browser, renders the target website URL at `1280x800` viewport, and captures a high-resolution PNG screenshot.
   - **Cloud Screenshot Fallback**: If running in a cloud container (like Render) where Playwright Chromium binaries fail, the system automatically fetches live high-res screenshots via public **Microlink** and **WordPress Mshots** APIs.
2. **Multimodal Vision-to-Text AI Engine**:
   - The base64 PNG screenshot buffer is passed directly into the active Vision AI model.
   - The model **"sees"** the visual image like a human UX expert, evaluating visual contrast, typography legibility, CTA button prominence, and above-the-fold benefit clarity.

---

## 🛡️ Smart Key Auto-Detection & Real-Time Multi-Provider Fallback

You can set a single universal API key (`AI_API_KEY`) or provider-specific keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `HF_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).

### Key Prefix Classification:
- `AIza...` $\rightarrow$ Routes automatically to **Google Gemini**
- `gsk_...` $\rightarrow$ Routes automatically to **Groq Cloud**
- `hf_...` $\rightarrow$ Routes automatically to **Hugging Face**
- `sk-ant...` $\rightarrow$ Routes automatically to **Anthropic Claude**
- `sk-...` $\rightarrow$ Routes automatically to **OpenAI**

### Automatic Multi-Provider Fallback:
If a primary provider encounters rate limits (`429 Quota Exceeded`), credit issues, or server errors, **the engine automatically catches the error and attempts your secondary configured API keys in real time** before generating a fallback response.

---

## 🌟 Core System Features

### 1. 👁️ Multimodal AI Vision Audit
- **Above-The-Fold Clarity (0-100)**: Evaluates hero headline positioning and benefit communication before scrolling.
- **Color Contrast & Typography Readability**: Checks WCAG color contrast ratios, font weights, and text legibility.
- **CTA Visual Prominence**: Assesses button background colors, padding, hover states, and glowing visual accents.
- **Visual Hierarchy & Whitespace**: Measures visual clutter, section padding, and top-to-bottom layout flow.
- **Concrete CSS Fix Recommendations**: Returns actionable code and CSS tweaks (e.g. *"Change CTA button background to high-contrast Amber `#F59E0B` with 52px height"*).

### 2. 🎯 AI Copywriting & Headline Optimization Engine
- **Psychological Hook Generation**: Analyzes page copy for value clarity, buyer friction, and subheadline alignment.
- **High-Converting Alternatives**: Generates distinct headline options tailored to target buyer personas (Pain-Point Focused vs Outcome-Driven).
- **Strategic Rationales**: Provides psychological explanations for why each proposed hook increases conversion rates.

### 3. 🖱️ Smart CTA & Structural Layout Transformer
- **CTA Button Copy Transformer**: Replaces low-friction words (*"Submit"*, *"Learn More"*) with high-intent benefit verbs (*"Claim My Free Audit →"*).
- **Section Structural Tweaks**: Recommends visual structural improvements across Hero Banners, Feature Matrices, Social Proof Logos, and Pricing Cards.

### 4. 🔍 Automated SEO & WCAG Accessibility Audit
- **SEO Optimization**: Generates 50-60 character meta titles, 150-160 character meta descriptions, target keyword tags, and H1/H2 heading hierarchy fixes.
- **WCAG Accessibility Scanner**: Identifies screen-reader gaps, label associations, and contrast violations.

---

## 🛠️ Technology Stack & Architecture

- **Generative AI Engine**: Multi-Provider Generic Engine supporting Google Gemini (`@google/generative-ai`), Groq Cloud, Hugging Face, Anthropic Claude (`@anthropic-ai/sdk`), and OpenAI (`openai`).
- **Headless Screenshot Engine**: Playwright Chromium (`playwright`) + Microlink & WordPress Mshots Cloud Fallback API.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons.
- **Backend**: Node.js, Express (TypeScript), Passport.js (Local bcrypt + Google OAuth 2.0).
- **Database**: PostgreSQL with Drizzle ORM (Neon / Supabase), `connect-pg-simple` session store.
- **Security & Validation**: Zod schema validation + `express-rate-limit` brute-force protection.

---

## ⚡ Quick Setup Guide

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
# Multi-Provider AI API Key (Supports Google Gemini, Groq, Hugging Face, Anthropic, OpenAI)
AI_API_KEY=your_ai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
HF_API_KEY=your_huggingface_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# PostgreSQL Database & Session Secret
DATABASE_URL=postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=supersecret_session_key_landingiq
PORT=3000
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Both Express backend and Vite frontend run seamlessly together.

---

## 📄 Developer Documentation

- 📘 **[Technical Project Summary & Architecture Overview](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/PROJECT_SUMMARY.md)**
- 📄 **[Developer Changelog & Activity Log](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/DEV_LOG.md)**

---

## 🚢 Live Deployment

- **Live Application**: [https://landing-iq.onrender.com/](https://landing-iq.onrender.com/)
- **Model Debugger Endpoint**: [https://landing-iq.onrender.com/api/debug-models](https://landing-iq.onrender.com/api/debug-models)
