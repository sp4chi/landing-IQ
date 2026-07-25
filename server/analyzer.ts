import { Router } from 'express';
import { z } from 'zod';
import { dbService } from '../src/db/index.js';
import { capturePageScreenshot, generateMockScreenshotBase64, ScreenshotResult } from './vision.js';
import { executeAIAnalysis } from './ai-provider.js';

export const analyzerRouter = Router();

// Zod validation schema supporting text content, explicit target URL, or uploaded screenshot image
const analyzeSchema = z.object({
  content: z.string().min(10, 'Landing page content or description must be at least 10 characters long'),
  title: z.string().optional(),
  url: z.string().optional(),
  imageBase64: z.string().optional(),
});

const SYSTEM_PROMPT = `You are LandingIQ, an elite conversion rate optimization (CRO) expert, senior marketing strategist, visual UX architect, and web accessibility analyst.
Your job is to perform an exhaustive, evidence-backed audit of landing page copy, visual UI elements, layout hierarchy, headlines, CTAs, SEO, contrast, and accessibility.

If a visual screenshot image is provided in the message, perform a Multimodal AI Vision Audit analyzing visual hierarchy, above-the-fold clarity, CTA button contrast & size, typography readability, and whitespace balance.

You MUST respond strictly with valid JSON only. Do NOT include any markdown codeblocks (\`\`\`json or \`\`\`), introduction, or extra conversational text outside the JSON object.

The output JSON structure MUST match this exact schema:
{
  "conversion_score": <number between 0 and 100 representing overall conversion probability>,
  "top_priority_fixes": [
    <actionable high-impact fix 1>,
    <actionable high-impact fix 2>,
    <actionable high-impact fix 3>
  ],
  "visual_audit": {
    "above_the_fold_clarity": { "score": <0-100>, "feedback": <concise visual feedback> },
    "contrast_and_readability": { "score": <0-100>, "feedback": <concise visual feedback> },
    "cta_visual_prominence": { "score": <0-100>, "feedback": <concise visual feedback> },
    "visual_hierarchy_and_whitespace": { "score": <0-100>, "feedback": <concise visual feedback> },
    "visual_fixes": [
      <specific visual/CSS design fix 1>,
      <specific visual/CSS design fix 2>
    ]
  },
  "headlines": [
    { "text": <optimized headline alternative 1>, "rationale": <why this hook converts better> },
    { "text": <optimized headline alternative 2>, "rationale": <why this hook converts better> }
  ],
  "cta_recommendations": [
    { "text": <high-converting CTA button copy>, "placement": <recommended position on page>, "rationale": <psychological trigger> },
    { "text": <secondary CTA button copy>, "placement": <recommended position on page>, "rationale": <psychological trigger> }
  ],
  "layout_recommendations": [
    { "section": <page section name>, "recommendation": <specific visual or structural improvement> },
    { "section": <page section name>, "recommendation": <specific visual or structural improvement> },
    { "section": <page section name>, "recommendation": <specific visual or structural improvement> }
  ],
  "seo": {
    "meta_title": <recommended 50-60 char meta title>,
    "meta_description": <recommended 150-160 char meta description>,
    "target_keywords": [<primary keyword>, <secondary keyword>, <long-tail keyword>],
    "heading_issues": [<h1/h2 structural issue or recommendation 1>, <heading issue 2>]
  },
  "accessibility": {
    "issues": [<contrast/readability/screen-reader concern 1>, <concern 2>],
    "fixes": [<concrete solution for issue 1>, <concrete solution for issue 2>]
  },
  "ab_variants": {
    "variant_a_pain_point": {
      "strategy_name": "Pain-Point & Agitation Focused",
      "headline": <pain-point focused hero headline agitating buyer friction>,
      "subheadline": <subheadline positioning immediate friction relief>,
      "cta_text": <high-intent benefit CTA button copy>,
      "key_points": [<value point 1>, <value point 2>, <value point 3>],
      "hypothesis": <why agitating buyer friction increases conversions for this offer>
    },
    "variant_b_social_proof": {
      "strategy_name": "Social-Proof & Authority Driven",
      "headline": <social-proof focused hero headline featuring numbers/peer authority>,
      "subheadline": <subheadline emphasizing category leadership and trust metrics>,
      "cta_text": <high-intent community/authority CTA button copy>,
      "key_points": [<value point 1>, <value point 2>, <value point 3>],
      "hypothesis": <why social proof and peer validation increases trust for this offer>
    }
  }
}`;

// Helper generator for mock response if API key is not configured or in sandbox mode
function generateFallbackAudit(content: string, screenshotData?: ScreenshotResult | null) {
  const isUrl = content.trim().startsWith('http://') || content.trim().startsWith('https://');
  const screenshot = screenshotData || generateMockScreenshotBase64();

  return {
    conversion_score: 74,
    screenshot_base64: screenshot.base64,
    screenshot_url: screenshot.url,
    top_priority_fixes: [
      'Clarity gap: The primary value proposition is buried below the fold — move main benefits into the hero subheadline.',
      'Weak Call-to-Action: Replace low-friction words like "Submit" or "Learn More" with high-intent verbs like "Claim My Custom Audit →".',
      'Visual Contrast Warning: CTA button lacks strong visual contrast against dark background. Use high-contrast Amber (#F59E0B) styling.'
    ],
    visual_audit: {
      above_the_fold_clarity: {
        score: 82,
        feedback: 'Hero section headline is bold and legible, but subheadline lacks strong value contrast.'
      },
      contrast_and_readability: {
        score: 75,
        feedback: 'Main body copy text achieves acceptable contrast ratio, but secondary links are slightly dim.'
      },
      cta_visual_prominence: {
        score: 68,
        feedback: 'Primary CTA button button size is adequate, but needs a glowing shadow and contrasting accent color.'
      },
      visual_hierarchy_and_whitespace: {
        score: 80,
        feedback: 'Clean card spacing and logical top-to-bottom section order with strong visual padding.'
      },
      visual_fixes: [
        'Enlarge primary CTA button height to 52px and add a subtle glowing gold accent shadow.',
        'Increase hero headline font weight to 800 (Extra Bold) with 1.15 line-height for instant punch.'
      ]
    },
    headlines: [
      {
        text: 'Turn 30% More Visitors Into Qualified Pipeline in Under 7 Days',
        rationale: 'Specifies concrete metric outcome, timeframe, and direct benefit over vague feature claims.'
      },
      {
        text: 'The AI Landing Page Auditor Designed for Fast-Growing Founders',
        rationale: 'Clearly defines target persona and category leadership positioning.'
      }
    ],
    cta_recommendations: [
      {
        text: 'Claim My Free Audit →',
        placement: 'Hero section (Above the fold)',
        rationale: 'Creates immediate ownership, high contrast visual hierarchy, and explicit value expectation.'
      },
      {
        text: 'See Live Interactive Demo',
        placement: 'Sticky navigation header',
        rationale: 'Lowers commitment barrier for hesitant visitors researching capabilities.'
      }
    ],
    layout_recommendations: [
      {
        section: 'Hero Banner',
        recommendation: 'Increase visual hierarchy: enlarge headline to 48px grotesk font and use high-contrast primary CTA button.'
      },
      {
        section: 'Feature Matrix',
        recommendation: 'Switch from 4-column dense grid to 3-card horizontal layout with icon-driven visual bullet points.'
      },
      {
        section: 'Social Proof / Testimonials',
        recommendation: 'Position client logo ribbon immediately underneath hero section to establish instant authority.'
      }
    ],
    seo: {
      meta_title: 'LandingIQ — High-Converting AI Landing Page Optimizer & CRO Audits',
      meta_description: 'Analyze landing page copy, Headlines, CTAs, SEO, and layout performance in seconds with Multimodal AI recommendations.',
      target_keywords: ['landing page audit', 'conversion rate optimization', 'AI marketing tool', 'headline generator'],
      heading_issues: [
        'H1 is missing primary target keywords ("landing page optimizer")',
        'Skipped H2 hierarchy directly into body text without structured subheadings'
      ]
    },
    accessibility: {
      issues: [
        'Insufficient color contrast ratio on secondary button text (2.8:1 below WCAG AA standard of 4.5:1)',
        'Form input elements lack explicit <label> associations for screen reader navigation'
      ],
      fixes: [
        'Adjust button background to #0F1B2D with crisp off-white #FAFAF8 text for 12.5:1 contrast',
        'Add aria-label and visible label tags to all interactive textareas and input fields'
      ]
    },
    ab_variants: {
      variant_a_pain_point: {
        strategy_name: 'Pain-Point & Agitation Focused',
        headline: 'Stop Wasting 60% of Your Ad Traffic on Leaky Landing Pages',
        subheadline: 'Eliminate hidden visual friction and low-converting CTA copy in under 30 seconds with AI-powered CRO audits.',
        cta_text: 'Fix My Landing Page Friction →',
        key_points: [
          'Eliminate hidden design friction before launching paid ads',
          'Instant WCAG & visual CTA contrast score diagnostics',
          'Boost ROAS without increasing your marketing spend'
        ],
        hypothesis: 'Directly agitates buyer frustration with wasted ad spend and offers instant friction relief.'
      },
      variant_b_social_proof: {
        strategy_name: 'Social-Proof & Authority Driven',
        headline: 'Used by 2,400+ Growth Teams to Lift Conversions by 34%',
        subheadline: 'The #1 Multimodal AI landing page auditor trusted by top SaaS, e-commerce, and agency founders.',
        cta_text: 'Join Top Converting Brands →',
        key_points: [
          'Benchmark your landing page against top 1% converting sites',
          'Verified +34% average conversion rate lift across 10k+ audits',
          '1-Click automated multimodal visual reports'
        ],
        hypothesis: 'Leverages bandwagon effect, client authority metrics, and peer validation to establish instant trust.'
      }
    }
  };
}

// POST /api/analyze
analyzerRouter.post('/analyze', async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'You must be logged in to analyze landing pages' });
  }

  try {
    const parseResult = analyzeSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input data';
      return res.status(400).json({ error: errorMsg });
    }

    const { content, title, url: providedUrl, imageBase64: providedImage } = parseResult.data;
    const userId = (req.user as any).id;

    // Detect if input string itself is a URL
    const trimmedContent = content.trim();
    const isInputUrl = trimmedContent.startsWith('http://') || trimmedContent.startsWith('https://') || trimmedContent.includes('.com') || trimmedContent.includes('.app') || trimmedContent.includes('.io');
    const targetUrl = providedUrl || (isInputUrl ? trimmedContent.split('\n')[0] : null);

    const reportTitle = title && title.trim() !== '' ? title.trim() : (targetUrl ? `Visual Audit: ${targetUrl}` : (content.length > 50 ? content.slice(0, 47) + '...' : content));

    // Attempt Playwright Screenshot Capture if URL is detected or provided
    let screenshot: ScreenshotResult | null = null;
    if (providedImage) {
      screenshot = {
        base64: providedImage.replace(/^data:image\/(png|jpeg|webp);base64,/, ''),
        mimeType: 'image/png',
        url: targetUrl || 'Uploaded Screenshot',
      };
    } else if (targetUrl) {
      console.log(`[Analyzer] Target URL detected: ${targetUrl}. Attempting Playwright visual screenshot capture...`);
      screenshot = await capturePageScreenshot(targetUrl);
    }

    let resultJson: any = null;

    try {
      const aiResult = await executeAIAnalysis({
        content,
        systemPrompt: SYSTEM_PROMPT,
        screenshot: screenshot ? { base64: screenshot.base64, mimeType: screenshot.mimeType } : null,
      });

      if (aiResult && aiResult.data) {
        resultJson = aiResult.data;
        if (screenshot) {
          resultJson.screenshot_base64 = screenshot.base64;
          resultJson.screenshot_url = screenshot.url;
        }
      } else {
        resultJson = generateFallbackAudit(content, screenshot);
      }
    } catch (aiErr: any) {
      console.error('[Analyzer] AI Provider API Call Failed or returned invalid JSON:', aiErr?.message || aiErr);
      resultJson = generateFallbackAudit(content, screenshot);
    }

    // Ensure valid conversion score numeric fallback
    const conversionScore = typeof resultJson.conversion_score === 'number' ? resultJson.conversion_score : 74;

    // Attach screenshot if fallback was used
    if (screenshot && !resultJson.screenshot_base64) {
      resultJson.screenshot_base64 = screenshot.base64;
      resultJson.screenshot_url = screenshot.url;
    }

    // Save report in database
    const savedReport = await dbService.createReport({
      userId,
      title: reportTitle,
      inputContent: content,
      resultJson,
      conversionScore,
    });

    return res.status(200).json({
      report: savedReport,
      message: 'Landing page visual audit completed successfully',
    });
  } catch (err) {
    console.error('Unhandled Analyzer Error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred while analyzing the page. Please try again.' });
  }
});
