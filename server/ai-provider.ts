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

export type AIProviderType = 'gemini' | 'groq' | 'huggingface' | 'anthropic' | 'openai';

export interface ResolvedConfig {
  provider: AIProviderType;
  apiKey: string;
}

/**
 * Classify provider type strictly by key format prefix or variable suggestion
 */
function classifyKey(key: string, suggestedProvider?: AIProviderType): ResolvedConfig | null {
  const trimmed = key.trim();
  if (!trimmed || trimmed.includes('your_') || trimmed.includes('_here')) {
    return null;
  }

  if (trimmed.startsWith('AIza')) {
    return { provider: 'gemini', apiKey: trimmed };
  }
  if (trimmed.startsWith('gsk_')) {
    return { provider: 'groq', apiKey: trimmed };
  }
  if (trimmed.startsWith('hf_')) {
    return { provider: 'huggingface', apiKey: trimmed };
  }
  if (trimmed.startsWith('sk-ant')) {
    return { provider: 'anthropic', apiKey: trimmed };
  }
  if (trimmed.startsWith('sk-')) {
    return { provider: 'openai', apiKey: trimmed };
  }

  if (suggestedProvider) {
    return { provider: suggestedProvider, apiKey: trimmed };
  }

  return { provider: 'gemini', apiKey: trimmed };
}

/**
 * Returns a list of all configured AI providers in order of execution preference.
 */
export function getAllConfiguredProviders(): ResolvedConfig[] {
  const configs: ResolvedConfig[] = [];
  const addedKeys = new Set<string>();

  const add = (config: ResolvedConfig | null) => {
    if (config && !addedKeys.has(config.apiKey)) {
      addedKeys.add(config.apiKey);
      configs.push(config);
    }
  };

  if (process.env.AI_API_KEY) {
    add(classifyKey(process.env.AI_API_KEY));
  }
  if (process.env.GEMINI_API_KEY) {
    add(classifyKey(process.env.GEMINI_API_KEY, 'gemini'));
  }
  if (process.env.GROQ_API_KEY) {
    add(classifyKey(process.env.GROQ_API_KEY, 'groq'));
  }
  if (process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY) {
    add(classifyKey((process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY)!, 'huggingface'));
  }
  if (process.env.ANTHROPIC_API_KEY) {
    add(classifyKey(process.env.ANTHROPIC_API_KEY, 'anthropic'));
  }
  if (process.env.OPENAI_API_KEY) {
    add(classifyKey(process.env.OPENAI_API_KEY, 'openai'));
  }

  return configs;
}

export function resolveAIConfig(customKey?: string): ResolvedConfig | null {
  if (customKey) {
    return classifyKey(customKey);
  }
  const all = getAllConfiguredProviders();
  return all.length > 0 ? all[0] : null;
}

/**
 * Analyze landing page using Google Gemini API
 */
async function analyzeWithGemini(apiKey: string, request: AIAnalysisRequest): Promise<any> {
  console.log('[AI Provider] Executing Landing Page Analysis via Google Gemini...');
  const genAI = new GoogleGenerativeAI(apiKey);

  const candidateModels = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];
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
      console.warn(`[AI Provider] Gemini model '${modelName}' attempt failed (${err?.message || err}). Trying next candidate model...`);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Analyze landing page using Groq Cloud API (Free Tier, Llama 3.2 Vision & Llama 3.3)
 */
async function analyzeWithGroq(apiKey: string, request: AIAnalysisRequest): Promise<any> {
  console.log('[AI Provider] Executing Landing Page Analysis via Groq Cloud...');
  const groq = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const hasScreenshot = Boolean(request.screenshot && request.screenshot.base64);
  const candidateModels = hasScreenshot
    ? ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview', 'llama-3.3-70b-versatile']
    : ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768'];

  let lastError: any = null;
  for (const modelName of candidateModels) {
    try {
      const isVisionModel = modelName.includes('vision');
      let userContent: any;

      if (hasScreenshot && isVisionModel) {
        userContent = [
          {
            type: 'image_url',
            image_url: {
              url: `data:${request.screenshot!.mimeType || 'image/png'};base64,${request.screenshot!.base64}`,
            },
          },
          {
            type: 'text',
            text: `Above is the actual rendered visual screenshot of the landing page captured via Playwright.\nAnalyze both this visual screenshot image AND the text copy provided below for conversion optimization.\n\nLanding Page Content / URL Context:\n${request.content}`,
          },
        ];
      } else {
        userContent = `Please perform a detailed conversion audit on the following landing page content:\n\n${request.content}`;
      }

      const response = await groq.chat.completions.create({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: userContent },
        ],
      });

      const rawContent = response.choices[0]?.message?.content || '';
      const cleanJsonStr = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleanJsonStr);
    } catch (err: any) {
      console.warn(`[AI Provider] Groq model '${modelName}' attempt failed (${err?.message || err}). Trying next model...`);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Analyze landing page using Hugging Face Serverless Inference API (Qwen 2.5 / Llama 3.2)
 */
async function analyzeWithHuggingFace(apiKey: string, request: AIAnalysisRequest): Promise<any> {
  console.log('[AI Provider] Executing Landing Page Analysis via Hugging Face Inference API...');
  const hf = new OpenAI({
    apiKey,
    baseURL: 'https://router.huggingface.co/hf-inference/v1',
  });

  const candidateModels = [
    'Qwen/Qwen2.5-Coder-32B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'meta-llama/Llama-3.2-3B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
  ];

  let lastError: any = null;
  for (const modelName of candidateModels) {
    try {
      const userText = `Please perform a detailed conversion audit on the following landing page content:\n\n${request.content}`;

      const response = await hf.chat.completions.create({
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: userText },
        ],
      });

      const rawContent = response.choices[0]?.message?.content || '';
      const cleanJsonStr = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleanJsonStr);
    } catch (err: any) {
      console.warn(`[AI Provider] Hugging Face model '${modelName}' attempt failed (${err?.message || err}). Trying next model...`);
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
 * Execute AI Analysis with automatic multi-provider fallback
 */
export async function executeAIAnalysis(request: AIAnalysisRequest): Promise<AIProviderResult | null> {
  const configs = getAllConfiguredProviders();
  if (configs.length === 0) {
    console.log('[AI Provider] No valid AI API key detected (AI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, HF_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY). Using fallback audit.');
    return null;
  }

  let lastErr: any = null;
  for (const config of configs) {
    const { provider, apiKey } = config;
    try {
      let data: any = null;
      if (provider === 'gemini') {
        data = await analyzeWithGemini(apiKey, request);
      } else if (provider === 'groq') {
        data = await analyzeWithGroq(apiKey, request);
      } else if (provider === 'huggingface') {
        data = await analyzeWithHuggingFace(apiKey, request);
      } else if (provider === 'anthropic') {
        data = await analyzeWithAnthropic(apiKey, request);
      } else if (provider === 'openai') {
        data = await analyzeWithOpenAI(apiKey, request);
      }

      if (data) {
        return {
          providerName: provider,
          data,
        };
      }
    } catch (err: any) {
      console.warn(`[AI Provider] Provider '${provider}' failed: ${err?.message || err}. Attempting next available provider...`);
      lastErr = err;
    }
  }

  throw lastErr;
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatResult {
  providerName: string;
  text: string;
}

/**
 * Chat completion helper for Google Gemini
 */
async function chatWithGemini(apiKey: string, messages: AIChatMessage[], systemPrompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
  let lastErr: any = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const result = await model.generateContent({ contents });
      return result.response.text();
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr;
}

/**
 * Chat completion helper for Groq Cloud
 */
async function chatWithGroq(apiKey: string, messages: AIChatMessage[], systemPrompt: string): Promise<string> {
  const groq = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
  const candidateModels = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama-3.2-11b-vision-preview'];
  let lastErr: any = null;

  for (const modelName of candidateModels) {
    try {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];
      const response = await groq.chat.completions.create({
        model: modelName,
        messages: formattedMessages as any,
      });
      return response.choices[0]?.message?.content || '';
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr;
}

/**
 * Chat completion helper for Hugging Face
 */
async function chatWithHuggingFace(apiKey: string, messages: AIChatMessage[], systemPrompt: string): Promise<string> {
  const hf = new OpenAI({ apiKey, baseURL: 'https://router.huggingface.co/hf-inference/v1' });
  const candidateModels = ['Qwen/Qwen2.5-72B-Instruct', 'Qwen/Qwen2.5-Coder-32B-Instruct', 'meta-llama/Llama-3.2-3B-Instruct'];
  let lastErr: any = null;

  for (const modelName of candidateModels) {
    try {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];
      const response = await hf.chat.completions.create({
        model: modelName,
        messages: formattedMessages as any,
      });
      return response.choices[0]?.message?.content || '';
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr;
}

/**
 * Chat completion helper for Anthropic Claude
 */
async function chatWithAnthropic(apiKey: string, messages: AIChatMessage[], systemPrompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  const userMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
    content: m.content,
  }));
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    system: systemPrompt,
    messages: userMessages,
  });
  return message.content[0]?.type === 'text' ? message.content[0].text : '';
}

/**
 * Chat completion helper for OpenAI
 */
async function chatWithOpenAI(apiKey: string, messages: AIChatMessage[], systemPrompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
  });
  return response.choices[0]?.message?.content || '';
}

/**
 * Execute interactive chat completion with multi-provider fallback
 */
export async function executeAIChat(messages: AIChatMessage[], systemPrompt: string): Promise<AIChatResult | null> {
  const configs = getAllConfiguredProviders();
  if (configs.length === 0) {
    return null;
  }

  let lastErr: any = null;
  for (const config of configs) {
    const { provider, apiKey } = config;
    try {
      let text = '';
      if (provider === 'gemini') {
        text = await chatWithGemini(apiKey, messages, systemPrompt);
      } else if (provider === 'groq') {
        text = await chatWithGroq(apiKey, messages, systemPrompt);
      } else if (provider === 'huggingface') {
        text = await chatWithHuggingFace(apiKey, messages, systemPrompt);
      } else if (provider === 'anthropic') {
        text = await chatWithAnthropic(apiKey, messages, systemPrompt);
      } else if (provider === 'openai') {
        text = await chatWithOpenAI(apiKey, messages, systemPrompt);
      }

      if (text) {
        return {
          providerName: provider,
          text,
        };
      }
    } catch (err: any) {
      console.warn(`[AI Chat Copilot] Provider '${provider}' failed: ${err?.message || err}. Trying next provider...`);
      lastErr = err;
    }
  }

  throw lastErr;
}
