import { Router } from 'express';
import { z } from 'zod';
import { dbService } from '../src/db/index.js';
import { executeAIChat, AIChatMessage } from './ai-provider.js';

export const chatRouter = Router();

/**
 * Extracts specific, checkable numeric-style claims from a reply (hex colors,
 * percentages, ratios like "4.5:1", px/rem/em sizes, and "/100" scores).
 * These are the claim types most likely to be silently fabricated by an LLM,
 * and are cheap to verify with a plain substring check against the source data.
 */
function extractNumericClaims(text: string): string[] {
  const patterns = [
    /#[0-9A-Fa-f]{3,8}\b/g, // hex colors, e.g. #F59E0B
    /\d+(\.\d+)?\s*%/g, // percentages, e.g. 45%
    /\d+(\.\d+)?\s*:\s*\d+(\.\d+)?/g, // contrast ratios, e.g. 4.5:1
    /\d+(\.\d+)?\s*(px|rem|em)\b/gi, // sizes, e.g. 52px
    /\d+(\.\d+)?\s*\/\s*100\b/g, // scores, e.g. 72/100
  ];

  const claims = new Set<string>();
  for (const pattern of patterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      claims.add(match.replace(/\s+/g, ' ').trim());
    }
  }
  return Array.from(claims);
}

/**
 * Checks each extracted claim against the report's source data (report copy +
 * full audit JSON + score). A claim "passes" if its normalized form appears
 * anywhere in the source text. This is a substring check, not semantic
 * verification - it catches fabricated numbers/colors that don't appear
 * anywhere in the report, but can't catch a real value misapplied to the
 * wrong context.
 */
function verifyNumericClaims(
  replyText: string,
  sourceText: string
): { unverified: string[] } {
  const normalizedSource = sourceText.replace(/\s+/g, ' ').toLowerCase();
  const claims = extractNumericClaims(replyText);

  const unverified = claims.filter((claim) => {
    const normalizedClaim = claim.replace(/\s+/g, ' ').toLowerCase();
    return !normalizedSource.includes(normalizedClaim);
  });

  return { unverified };
}

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
4. Be helpful, professional, and encouraging.
5. Ground every factual claim (scores, metrics, specific issues) strictly in the audit report data above. Do not invent numbers, colors, or findings that aren't present in it.
6. If the user asks about something the audit report doesn't cover, say so plainly (e.g. "The audit didn't assess that") instead of guessing or fabricating an answer. You may still offer general CRO best-practice advice in that case, but clearly label it as general guidance, not a finding from their report.`;

    const chatResult = await executeAIChat(messages as AIChatMessage[], systemPrompt);

    if (!chatResult) {
      return res.status(200).json({
        message: `I'm unable to process live requests right now because no valid AI API key is configured. However, based on your report, your conversion score is **${report.conversionScore}/100**. Focus on: ${auditJson.top_priority_fixes?.[0] || 'Optimizing CTA contrast and hero headline clarity'}.`,
        providerName: 'fallback',
      });
    }

    const sourceText = [
      report.inputContent,
      String(report.conversionScore),
      `${report.conversionScore}/100`, // matches the "/100" claim pattern verbatim
      JSON.stringify(auditJson),
    ].join(' ');
    const { unverified } = verifyNumericClaims(chatResult.text, sourceText);

    let finalMessage = chatResult.text;
    if (unverified.length > 0) {
      console.warn(
        `[Chat Copilot] Unverified numeric claim(s) in reply for report ${reportId}:`,
        unverified
      );
      finalMessage += `\n\n---\n⚠️ *Heads up: this response includes specific value(s) (${unverified.join(
        ', '
      )}) that couldn't be verified against your audit report data. Treat these as general guidance rather than a direct finding from your report.*`;
    }

    return res.status(200).json({
      message: finalMessage,
      providerName: chatResult.providerName,
    });
  } catch (err: any) {
    console.error('[Chat Copilot Error]:', err);
    return res.status(500).json({ error: err?.message || 'An error occurred while generating copilot response' });
  }
});
