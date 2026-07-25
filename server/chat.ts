import { Router } from 'express';
import { z } from 'zod';
import { dbService } from '../src/db/index.js';
import { executeAIChat, AIChatMessage } from './ai-provider.js';

export const chatRouter = Router();

const chatSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1, 'Message content cannot be empty'),
    })
  ).min(1, 'At least one message is required'),
});

chatRouter.post('/chat-copilot', async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'You must be logged in to chat with the CRO Copilot' });
  }

  try {
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || 'Invalid chat payload';
      return res.status(400).json({ error: errorMsg });
    }

    const { reportId, messages } = parseResult.data;
    const userId = (req.user as any).id;

    // Fetch report context from database
    const report = await dbService.getReportById(reportId, userId);
    if (!report) {
      return res.status(404).json({ error: 'Audit report not found or access denied' });
    }

    const auditJson = report.resultJson || {};

    const systemPrompt = `You are LandingIQ Chat Copilot, an elite Conversion Rate Optimization (CRO) expert, visual UX architect, and senior direct-response copywriter.
You are consulting live with a user on their landing page audit report titled: "${report.title}".

=== LANDING PAGE ORIGINAL INPUT COPY / CONTEXT ===
${report.inputContent}

=== AUDIT REPORT RESULTS (FULL CONTEXT) ===
Overall Conversion Score: ${report.conversionScore}/100
Highest Impact Fixes: ${JSON.stringify(auditJson.top_priority_fixes || [])}
Visual Audit Scores & Feedback: ${JSON.stringify(auditJson.visual_audit || {})}
Optimized Headlines & Hooks: ${JSON.stringify(auditJson.headlines || [])}
CTA Button Recommendations: ${JSON.stringify(auditJson.cta_recommendations || [])}
Layout Recommendations: ${JSON.stringify(auditJson.layout_recommendations || [])}
SEO Recommendations: ${JSON.stringify(auditJson.seo || {})}
Accessibility Audit: ${JSON.stringify(auditJson.accessibility || {})}

=== INSTRUCTIONS FOR CHAT RESPONSES ===
1. Answer the user's question directly using the specific context of their audit report above.
2. Provide concrete copy rewrites, CSS styling code snippets (Tailwind or CSS), or strategic CRO advice when asked.
3. Keep responses clear, concise, actionable, and formatted using clean GitHub markdown.
4. Be helpful, professional, and encouraging.`;

    const chatResult = await executeAIChat(messages as AIChatMessage[], systemPrompt);

    if (!chatResult) {
      return res.status(200).json({
        message: `I'm unable to process live requests right now because no valid AI API key is configured. However, based on your report, your conversion score is **${report.conversionScore}/100**. Focus on: ${auditJson.top_priority_fixes?.[0] || 'Optimizing CTA contrast and hero headline clarity'}.`,
        providerName: 'fallback',
      });
    }

    return res.status(200).json({
      message: chatResult.text,
      providerName: chatResult.providerName,
    });
  } catch (err: any) {
    console.error('[Chat Copilot Error]:', err);
    return res.status(500).json({ error: err?.message || 'An error occurred while generating copilot response' });
  }
});
