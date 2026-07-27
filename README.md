# LandingIQ — Next-Gen AI Landing Page Optimizer & Visual CRO Auditor

[![AWS EC2 Production](https://img.shields.io/badge/Live_Domain-AWS_EC2_%2B_DuckDNS-orange?style=for-the-badge&logo=amazon-aws)](https://landingiq.duckdns.org/)
[![Render Cloud Backup](https://img.shields.io/badge/Live_Demo-Render_Cloud-emerald?style=for-the-badge&logo=render)](https://landing-iq.onrender.com/)
[![GenAI Engine](https://img.shields.io/badge/GenAI-Gemini_%7C_Groq_%7C_HuggingFace_%7C_Claude_%7C_OpenAI-blue?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Capture Engine](https://img.shields.io/badge/Screenshot_Engine-Playwright_%2B_Cloud_Fallback-purple?style=for-the-badge&logo=playwright)](https://playwright.dev/)

> **LandingIQ** is an advanced AI-powered Conversion Rate Optimization (CRO) platform that combines **Multimodal AI Vision**, high-converting copywriting engines, local deterministic NLP metrics, and automated UX usability auditing to evaluate and optimize landing page performance in seconds.

---

## 🌐 Production & Live Demo URLs

- **Primary AWS EC2 Production (Automated HTTPS via DuckDNS + Caddy)**:  
  👉 **[https://landingiq.duckdns.org/](https://landingiq.duckdns.org/)**
- **Render Cloud Instance**:  
  👉 **[https://landing-iq.onrender.com/](https://landing-iq.onrender.com/)**
- **AI Model Debugger API Endpoint**:  
  👉 [https://landingiq.duckdns.org/api/debug-models](https://landingiq.duckdns.org/api/debug-models)

---

## 🤖 AI Models & Deterministic NLP Layer Used

LandingIQ features a **zero-code, provider-agnostic AI layer** ([`server/ai-provider.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/ai-provider.ts)) combined with a **deterministic local ML/NLP layer** ([`server/ml-analysis.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/ml-analysis.ts)).

### 1. Generative AI LLM & Multimodal Vision Models

| GenAI Provider | Key Prefix | Primary & Fallback Candidate Models | Cost Tier | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini** | `AIza...` | **`gemini-2.0-flash`**, `gemini-2.0-flash-lite`, `gemini-1.5-flash`, `gemini-1.5-pro` | **Free Tier** | Primary multimodal vision engine + structured JSON mode |
| **Groq Cloud** | `gsk_...` | **`llama-3.2-11b-vision-preview`**, `llama-3.2-90b-vision-preview`, **`llama-3.3-70b-versatile`**, `llama3-70b-8192`, `mixtral-8x7b-32768` | **100% Free** | Sub-500ms ultra-fast Llama 3.2 Vision & 70B text inference |
| **Hugging Face** | `hf_...` | **`Qwen/Qwen2.5-Coder-32B-Instruct`**, `Qwen/Qwen2.5-72B-Instruct`, `meta-llama/Llama-3.2-3B-Instruct`, `mistralai/Mistral-7B-Instruct-v0.3` | **100% Free** | Open-source LLM serverless inference API |
| **Anthropic Claude** | `sk-ant...` | **`claude-3-5-sonnet-20241022`** | Paid | High-precision visual UX & CRO copywriting audit |
| **OpenAI** | `sk-...` | **`gpt-4o`** | Paid | Multimodal GPT-4o vision + JSON completion |

---

### 2. Local Deterministic ML/NLP Analysis Layer (Runs on Server — Zero API Key Needed)

In addition to LLMs, every landing page audit runs an independent, local deterministic NLP module ([`server/ml-analysis.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/ml-analysis.ts)) with no external API calls:

- **Readability Scoring (`text-readability`)**:
  - **Flesch Reading Ease**: Scores text readability from 0 to 100.
  - **Flesch-Kincaid Grade Level**: Evaluates US grade reading level required.
  - **Gunning Fog Index**: Calculates complexity based on sentence length and complex multi-syllable word percentage.
- **TF-IDF Keyword Extraction (`natural`)**:
  - Extracts top high-weight keywords using Term Frequency–Inverse Document Frequency algorithms.
- **WCAG Color Contrast Analysis (`sharp`)**:
  - Analyzes image pixel luminance and calculates minimum/maximum color contrast ratios against WCAG AA standards (4.5:1 ratio threshold).

---

## 💡 How Playwright & Vision AI Work Together

$$\text{Web URL} \xrightarrow[\text{Headless Browser Renderer}]{\text{Playwright / Cloud Fallback}} \text{PNG Screenshot} \xrightarrow[\text{Vision-to-Text LLM}]{\text{Google Gemini / Groq / Claude}} \text{Structured JSON CRO Audit}$$

1. **Headless Browser Renderer (Playwright Chromium + Cloud Fallback)**:
   - **Playwright Chromium** opens a browser, renders the website URL at `1280x800` viewport, and captures a high-resolution PNG screenshot.
   - **Cloud Fallback**: If running in lightweight cloud environments where Playwright binaries fail, the system automatically fetches live high-res screenshots via public **Microlink**, **Thum.io**, and **WordPress Mshots** APIs.
2. **Multimodal Vision AI Engine**:
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
- **Local ML/NLP Layer**: `text-readability` (Flesch & Gunning Fog), `natural` (TF-IDF), `sharp` (WCAG Contrast).
- **Headless Screenshot Engine**: Playwright Chromium (`playwright`) + Microlink, Thum.io & WordPress Mshots Cloud Fallback API.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons.
- **Backend**: Node.js, Express (TypeScript), Passport.js (Local bcrypt + Google OAuth 2.0).
- **Database**: PostgreSQL with Drizzle ORM (Neon / Supabase), `connect-pg-simple` session store.
- **DevOps & Infrastructure**: Docker Multi-Stage Build, AWS EC2 (Ubuntu), Caddy 2 Reverse Proxy (Automated DuckDNS Let's Encrypt HTTPS), GitHub Actions CI/CD.

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
# Multi-Provider AI API Keys (Supports Gemini, Groq, Hugging Face, Anthropic, OpenAI)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
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

## 📘 Documentation & Deployment Architecture

- 🚀 **[Enterprise AWS EC2, Docker & DuckDNS Production Deployment Guide](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/docs/PRODUCTION_DEPLOYMENT_GUIDE.md)**
- 📘 **[Technical Project Summary & Architecture Overview](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/PROJECT_SUMMARY.md)**
- 📄 **[Developer Changelog & Activity Log](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/DEV_LOG.md)**

---

## 🚢 Live Production Deployment

- **AWS EC2 Production (DuckDNS + Caddy HTTPS)**: [https://landingiq.duckdns.org/](https://landingiq.duckdns.org/)
- **Render Cloud Instance**: [https://landing-iq.onrender.com/](https://landing-iq.onrender.com/)
