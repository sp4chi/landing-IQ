# LandingIQ — Technical Project Summary & Architecture Overview

> **LandingIQ** is a next-generation AI-powered Conversion Rate Optimization (CRO) platform. It combines **Multimodal AI Vision**, automated headless web page rendering, copywriting optimization engines, and WCAG accessibility auditing to evaluate landing page conversion performance in seconds.

---

## 🏗️ Architecture Overview

```
[ Frontend (React 18 + Vite + Tailwind CSS) ]
                   │
                   ▼
  [ Express Backend API (TypeScript) ]
        │          │          │
        ▼          ▼          ▼
   [ Playwright / ] [ PostgreSQL ] [ Multi-Provider AI Engine ]
   [ Cloud Vision ] [ (Drizzle)  ] ┌─────────────────────────┐
                                   │ - Google Gemini         │
                                   │ - Groq Cloud (Free)     │
                                   │ - HuggingFace (Free)    │
                                   │ - Anthropic Claude      │
                                   │ - OpenAI GPT-4o         │
                                   └─────────────────────────┘
```

---

## 🌟 Core System Features

### 1. 👁️ Multimodal Visual UX & Design Audit
- **Dual-Engine Screenshot Capture**:
  - **Local Browser**: Playwright Chromium renders above-the-fold hero section (`1280x800`).
  - **Cloud Container Fallback**: Automatic fallback to Microlink & WordPress Mshots APIs guarantees 100% real webpage screenshots on Render cloud hosting without requiring root Linux container permissions.
- **Visual Metrics Evaluated**: Above-The-Fold Clarity, Color Contrast & Readability, CTA Visual Prominence, Visual Hierarchy & Whitespace Balance.
- **Actionable CSS Fixes**: Returns concrete font weight, line-height, CTA padding, and HSL/HEX color contrast tweaks.

### 2. 🎯 AI Conversion Copywriting & Headline Optimization
- Evaluates buyer friction, value clarity, and subheadline alignment.
- Generates high-converting headline alternatives tailored to target personas with strategic psychological rationales.

### 3. 🖱️ Smart CTA & Structural Layout Recommendations
- Replaces passive friction words (*"Submit"*, *"Learn More"*) with high-intent benefit verbs (*"Claim My Free Audit →"*).
- Suggests structural improvements across Hero Banners, Feature Matrices, Client Logo Ribbons, and Pricing Cards.

### 4. 🔍 Automated SEO & WCAG Accessibility Audit
- Generates optimized meta titles (50-60 chars), meta descriptions (150-160 chars), target keywords, H1/H2 heading hierarchy fixes, and WCAG contrast/label associations.

---

## 🤖 Multi-Provider AI Engine (`server/ai-provider.ts`)

LandingIQ features a **zero-code, provider-agnostic AI layer**. Users can switch between AI models simply by updating their API key format in `.env`:

| Provider | Key Variable | Prefix | Model Engine | Cost / Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini** | `GEMINI_API_KEY` | `AIza...` | `gemini-2.0-flash` / `gemini-1.5-flash` | Free Tier Available |
| **Groq Cloud** | `GROQ_API_KEY` | `gsk_...` | `llama-3.2-11b-vision-instruct` | 100% Free |
| **Hugging Face** | `HF_API_KEY` | `hf_...` | `Qwen/Qwen2.5-VL-72B-Instruct` | 100% Free |
| **Anthropic Claude** | `ANTHROPIC_API_KEY` | `sk-ant...` | `claude-3-5-sonnet-20241022` | Paid |
| **OpenAI** | `OPENAI_API_KEY` | `sk-...` | `gpt-4o` | Paid |

### Automatic Fallback Hierarchy
If a primary key encounters rate limits (`429 Quota Exceeded`), `executeAIAnalysis()` automatically iterates through all configured providers in `.env` sequentially until a successful response is returned.

---

## ⚡ Quick Setup & Environment Variables

Copy `.env.example` to `.env`:

```env
# Multi-Provider AI API Key (Supports Gemini, Groq, Hugging Face, Anthropic, OpenAI)
AI_API_KEY=your_ai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
HF_API_KEY=your_huggingface_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# PostgreSQL Database Connection
DATABASE_URL=postgresql://user:password@ep-sample-1234.neon.tech/neondb?sslmode=require
SESSION_SECRET=supersecret_session_key_landingiq
PORT=3000
```

### Local Development Commands
```bash
# Install dependencies
npm install

# Start development server (Frontend + Backend)
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## 🚀 Live Deployment
- **Platform**: Render Web Service
- **Live URL**: [https://landing-iq.onrender.com](https://landing-iq.onrender.com)
- **Model Debugger**: [https://landing-iq.onrender.com/api/debug-models](https://landing-iq.onrender.com/api/debug-models)
