import { Router } from 'express';

export const debugRouter = Router();

debugRouter.get('/debug-models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'No Gemini API key found in environment' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();

    // Return just the model names + supported methods, so it's easy to read
    const simplified = (data.models || []).map((m: any) => ({
      name: m.name,
      supportedMethods: m.supportedGenerationMethods,
    }));

    return res.status(200).json({
      keyPrefix: apiKey.slice(0, 6) + '...',
      totalModels: simplified.length,
      models: simplified,
      rawData: data.error ? data.error : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to fetch model list' });
  }
});
