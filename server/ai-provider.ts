import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export interface ScreenshotData {
  base64: string;
  mimeType: string;
}

export interface AIAnalysisRequest {
  content: string;
  systemPrompt: string;
  screenshot?: ScreenshotData | null;
}

export interface AIProviderResult {
  providerName: string;
  data: any;
}

export type AIProviderType = 'gemini' | 'anthropic' | 'openai';

/**
 * Detect provider type and active API key from environment variables or key string prefix.
 */
export function resolveAIConfig(customKey?: string): { provider: AIProviderType; apiKey: string } | null {
  const explicitProvider = process.env.AI_PROVIDER?.toLowerCase() as AIProviderType | undefined;

  // 1. Check unified or custom API key first
  const unifiedKey = customKey || process.env.AI_API_KEY;
  if (unifiedKey && unifiedKey.trim() !== '') {
    const key = unifiedKey.trim();
    if (key.startsWith('AIza')) {
      return { provider: 'gemini', apiKey: key };
    }
    if (key.startsWith('sk-ant')) {
      return { provider: 'anthropic', apiKey: key };
    }
    if (key.startsWith('sk-')) {
      return { provider: 'openai', apiKey: key };
    }
    // If provider is explicitly specified along with universal key
    if (explicitProvider && ['gemini', 'anthropic', 'openai'].includes(explicitProvider)) {
      return { provider: explicitProvider, apiKey: key };
    }
    // Default prefix fallback for unknown universal key format
    return { provider: 'gemini', apiKey: key };
  }

  // 2. Check provider-specific environment keys
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here') {
    return { provider: 'gemini', apiKey: geminiKey.trim() };
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && anthropicKey.trim() !== '' && anthropicKey !== 'your_anthropic_api_key_here') {
    return { provider: 'anthropic', apiKey: anthropicKey.trim() };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.trim() !== '' && openaiKey !== 'your_openai_api_key_here') {
    return { provider: 'openai', apiKey: openaiKey.trim() };
  }

  return null;
}

/**
 * Analyze landing page using Google Gemini API
 */
async function analyzeWithGemini(apiKey: string, request: AIAnalysisRequest): Promise<any> {
  console.log('[AI Provider] Executing Landing Page Analysis via Google Gemini...');
  const genAI = new GoogleGenerativeAI(apiKey);

  const candidateModels = ['gemini-1.5-flash-latest', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro-latest'];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: request.systemPrompt,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const contents: any[] = [];
      if (request.screenshot && request.screenshot.base64) {
        contents.push({
          inlineData: {
            data: request.screenshot.base64,
            mimeType: request.screenshot.mimeType || 'image/png',
          },
        });
        contents.push(
          `Above is the actual rendered visual screenshot of the landing page captured via Playwright.\nAnalyze both this visual screenshot image AND the text copy provided below for conversion optimization.\n\nLanding Page Content / URL Context:\n${request.content}`
        );
      } else {
        contents.push(`Please perform a detailed conversion audit on the following landing page content:\n\n${request.content}`);
      }

      const result = await model.generateContent(contents);
      const text = result.response.text();
      const cleanJsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleanJsonStr);
    } catch (err: any) {
      console.warn(`[AI Provider] Gemini model '${modelName}' attempt failed (${err?.message || err}). Trying next model variant...`);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Analyze landing page using Anthropic Claude Vision API
 */
async function analyzeWithAnthropic(apiKey: string, request: AIAnalysisRequest): Promise<any> {
  console.log('[AI Provider] Executing Landing Page Analysis via Anthropic Claude (claude-3-5-sonnet)...');
  const anthropic = new Anthropic({ apiKey });
  const userContent: any[] = [];

  if (request.screenshot && request.screenshot.base64) {
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: request.screenshot.mimeType || 'image/png',
        data: request.screenshot.base64,
      },
    });
    userContent.push({
      type: 'text',
      text: `Above is the actual rendered visual screenshot of the landing page captured via Playwright.\nAnalyze both this visual screenshot image AND the text copy provided below for conversion optimization.\n\nLanding Page Content / URL Context:\n${request.content}`,
    });
  } else {
    userContent.push({
      type: 'text',
      text: `Please perform a detailed conversion audit on the following landing page content:\n\n${request.content}`,
    });
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000,
    temperature: 0.2,
    system: request.systemPrompt,
    messages: [
      {
        role: 'user',
        content: userContent,
      },
    ],
  });

  const rawContent = message.content[0]?.type === 'text' ? message.content[0].text : '';
  const cleanJsonStr = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleanJsonStr);
}

/**
 * Analyze landing page using OpenAI GPT-4o Vision API
 */
async function analyzeWithOpenAI(apiKey: string, request: AIAnalysisRequest): Promise<any> {
  console.log('[AI Provider] Executing Landing Page Analysis via OpenAI (gpt-4o)...');
  const openai = new OpenAI({ apiKey });
  const userContent: any[] = [];

  if (request.screenshot && request.screenshot.base64) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${request.screenshot.mimeType || 'image/png'};base64,${request.screenshot.base64}`,
      },
    });
    userContent.push({
      type: 'text',
      text: `Above is the actual rendered visual screenshot of the landing page captured via Playwright.\nAnalyze both this visual screenshot image AND the text copy provided below for conversion optimization.\n\nLanding Page Content / URL Context:\n${request.content}`,
    });
  } else {
    userContent.push({
      type: 'text',
      text: `Please perform a detailed conversion audit on the following landing page content:\n\n${request.content}`,
    });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: userContent },
    ],
  });

  const rawContent = response.choices[0]?.message?.content || '';
  return JSON.parse(rawContent);
}

/**
 * Execute AI Analysis across the auto-detected provider
 */
export async function executeAIAnalysis(request: AIAnalysisRequest): Promise<AIProviderResult | null> {
  const config = resolveAIConfig();
  if (!config) {
    console.log('[AI Provider] No valid AI API key detected (AI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY). Using fallback audit.');
    return null;
  }

  const { provider, apiKey } = config;
  let data: any = null;

  if (provider === 'gemini') {
    data = await analyzeWithGemini(apiKey, request);
  } else if (provider === 'anthropic') {
    data = await analyzeWithAnthropic(apiKey, request);
  } else if (provider === 'openai') {
    data = await analyzeWithOpenAI(apiKey, request);
  }

  return {
    providerName: provider,
    data,
  };
}
