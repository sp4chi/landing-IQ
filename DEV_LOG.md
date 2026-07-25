# LandingIQ — Developer Activity Log & Technical Changelog

## 📅 Log Overview
- **Project**: LandingIQ (Landing Page Conversion Rate Optimizer & Visual CRO Auditor)
- **Date**: July 25, 2026
- **Repository**: [sp4chi/landing-IQ](https://github.com/sp4chi/landing-IQ)

---

## 🛠️ Key Technical Modules & Debugging Log

### 1. Hardcoded Score Investigation
- **Issue**: Conversion score was defaulting to `74`.
- **Root Cause**:
  - Found fallback function [`generateFallbackAudit()`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/analyzer.ts#L68) hardcoded `conversion_score: 74` when API calls failed or key was missing.
  - Anthropic API key had `0 credit balance` (`400 Invalid Request Error`), causing runtime API calls to fall into the fallback block.

### 2. Generic Multi-Provider AI Engine Architecture ([`server/ai-provider.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/ai-provider.ts))
- **Objective**: Eliminate hardcoded provider dependencies so the user can switch between free and paid LLM providers without code modifications.
- **Providers Implemented**:
  1. **Google Gemini** (`@google/generative-ai`): Candidate models `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-flash`, `gemini-1.5-pro`.
  2. **Groq Cloud** (`openai` SDK with `https://api.groq.com/openai/v1`): Models `llama-3.2-11b-vision-instruct`, `llama-3.2-90b-vision-instruct`, `llama-3.3-70b-versatile`.
  3. **Hugging Face Serverless Inference** (`https://router.huggingface.co/hf-inference/v1`): Models `Qwen/Qwen2.5-VL-72B-Instruct`, `meta-llama/Llama-3.2-11B-Vision-Instruct`.
  4. **Anthropic Claude** (`@anthropic-ai/sdk`): `claude-3-5-sonnet-20241022`.
  5. **OpenAI** (`openai`): `gpt-4o`.
- **Smart Prefix Classification**:
  - `AIza...` $\rightarrow$ Google Gemini
  - `gsk_...` $\rightarrow$ Groq Cloud
  - `hf_...` $\rightarrow$ Hugging Face
  - `sk-ant...` $\rightarrow$ Anthropic Claude
  - `sk-...` $\rightarrow$ OpenAI
- **Automatic Multi-Provider Fallback Loop**:
  - If a primary key hits `429 Quota Exceeded` or `400 Bad Request`, `executeAIAnalysis()` automatically attempts the next configured key in `.env` sequentially.

### 3. Dual-Engine Screenshot Capture System ([`server/vision.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/vision.ts))
- **Issue**: Playwright Chromium failed to launch on Render Linux containers (`browserType.launch: Executable doesn't exist` or missing Linux shared libraries).
- **Solution**:
  - Primary: Playwright Chromium (`--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`).
  - Automatic Cloud Fallback: `fetchCloudScreenshot()` automatically fetches live high-res screenshots via public **Microlink** and **WordPress Mshots** APIs, converting live images to base64 for vision model ingestion.

### 4. UI & Metadata Generic AI Refactoring
- Replaced hardcoded "Claude 3.5 Sonnet" and "Anthropic" labels across frontend components and backend fallbacks:
  - [`src/pages/DashboardPage.tsx`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/src/pages/DashboardPage.tsx): Updated header badges, loading stage strings, and skeletons to `Multimodal AI + Playwright Vision Engine`.
  - [`src/pages/ResultsPage.tsx`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/src/pages/ResultsPage.tsx): Updated benchmark card text and section header to `Playwright + Multimodal AI Vision Audit`.
  - [`src/pages/LandingPage.tsx`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/src/pages/LandingPage.tsx): Updated hero description and process step titles to `Multimodal AI Analysis`.
  - [`src/App.tsx`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/src/App.tsx): Updated footer credits to `React, Express, Drizzle ORM & Multi-Model Generative AI`.
  - [`server/analyzer.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/analyzer.ts): Updated fallback SEO meta description.

### 5. Render Deployment & Build Fixes
- **Render Build Fix**: Removed `--with-deps` from `package.json` build script to prevent `su: Authentication failure` on non-root cloud containers.
- **Debug Model Inspector**: Created `/api/debug-models` endpoint ([`server/debug.ts`](file:///Users/kaushikgohainbora/Desktop/hackathon4.0/server/debug.ts)) to list available Gemini models for any API key.

---

## 🔬 Commit History Summary

| Commit | Summary |
| :--- | :--- |
| `4067958` | `feat: implement generic multi-provider AI engine supporting Gemini, Claude, and OpenAI` |
| `5ed8952` | `fix: remove --with-deps from playwright install in build script for Render` |
| `cc21ab5` | `fix: add gemini candidate model fallback and set PLAYWRIGHT_BROWSERS_PATH=0` |
| `e57be72` | `feat: add /api/debug-models endpoint to list available Gemini models` |
| `493c0c5` | `feat: add automatic multi-provider fallback loop and smart key prefix classifier` |
| `0486b7e` | `feat: add HuggingFace (hf_...) and Groq (gsk_...) free vision model providers to multi-model engine` |
| `75aec9c` | `refactor: update UI and metadata strings to generic Multimodal AI Vision Engine` |
| `baeaacb` | `feat: add cloud screenshot service fallback to vision.ts for 100% real webpage screenshot capture on Render` |
