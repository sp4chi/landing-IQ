/**
 * Local, deterministic ML/NLP Analysis Layer
 * No external API calls, no API keys, no rate limits.
 * Always runs locally on the server using text-readability, natural, and sharp.
 */

import rs from 'text-readability';
import natural from 'natural';
import sharp from 'sharp';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface ReadabilityResult {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  interpretation: string;
  isDegenerate?: boolean;
}

export interface ColorContrastResult {
  dominantColors: string[];
  minContrastRatio: number;
  maxContrastRatio: number;
  wcagAAPass: boolean;
  note: string;
}

export interface LocalMLResult {
  readability: ReadabilityResult | null;
  keywords: string[];
  colorContrast: ColorContrastResult | null;
}

// ────────────────────────────────────────────────────────────
// 1. Readability Analysis
// ────────────────────────────────────────────────────────────

export function computeReadability(text: string): ReadabilityResult {
  const cleaned = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const rawEase = rs.fleschReadingEase(cleaned);
  const fleschReadingEase = isNaN(rawEase) ? 0 : Math.round(rawEase * 10) / 10;

  const rawGrade = rs.fleschKincaidGrade(cleaned);
  const fleschKincaidGrade = isNaN(rawGrade) ? 0 : Math.round(rawGrade * 10) / 10;

  const rawFog = rs.gunningFog(cleaned);
  const gunningFog = isNaN(rawFog) ? 0 : Math.round(rawFog * 10) / 10;

  // Sanity check for degenerate scores or non-prose URL/short text inputs
  const isDegenerate =
    wordCount < 15 || fleschReadingEase < -20 || fleschReadingEase > 120 || isNaN(rawEase);

  let interpretation: string;
  if (isDegenerate) {
    interpretation =
      wordCount < 15
        ? 'Content extraction yielded insufficient prose text to compute reliable readability metrics.'
        : 'Readability score is non-standard due to non-prose formatting or structural layout. Consider analyzing full page copy.';
  } else if (fleschReadingEase >= 70) {
    interpretation = 'Easy to read — accessible to most visitors (age 13+).';
  } else if (fleschReadingEase >= 50) {
    interpretation = 'Moderately readable — suitable for high-school educated visitors.';
  } else if (fleschReadingEase >= 30) {
    interpretation = 'Difficult to read — consider simplifying sentence structure for broader audience reach.';
  } else {
    interpretation =
      'Very difficult to read — typically suitable only for academic or specialist audiences. Recommend simplifying sentence structure.';
  }

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
    interpretation,
    isDegenerate,
  };
}

// ────────────────────────────────────────────────────────────
// 2. TF-IDF Keyword Extraction
// ────────────────────────────────────────────────────────────

// Built-in stopwords list (superset of natural's stopwords)
const STOPWORDS = new Set([
  ...((natural as any).stopwords || []),
  'page', 'landing', 'website', 'site', 'get', 'use', 'used',
  'can', 'will', 'one', 'may', 'also', 'now', 'new', 'just', 'like',
  'make', 'take', 'good', 'well', 'way', 'need', 'want', 'see', 'say',
  'know', 'time', 'help', 'our', 'your', 'you', 'the', 'and', 'for',
  'with', 'this', 'that', 'are', 'from', 'all', 'has', 'have', 'its',
  'more', 'into', 'any', 'been', 'than', 'not', 'but', 'their', 'they',
]);

export function extractKeywords(text: string, topN = 8): string[] {
  const cleaned = text.replace(/<[^>]*>/g, ' ').replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase();

  const TfIdf = (natural as any).TfIdf;
  const tfidf = new TfIdf();
  tfidf.addDocument(cleaned);

  const scores: Array<{ term: string; tfidf: number }> = [];

  tfidf.listTerms(0).forEach((item: any) => {
    const term: string = item.term;
    if (
      term.length >= 3 &&
      !STOPWORDS.has(term) &&
      !/^\d+$/.test(term)       // filter pure numbers
    ) {
      scores.push({ term, tfidf: item.tfidf });
    }
  });

  // Sort by TF-IDF score descending, return top N
  return scores
    .sort((a, b) => b.tfidf - a.tfidf)
    .slice(0, topN)
    .map((s) => s.term);
}

// ────────────────────────────────────────────────────────────
// 3. Color Contrast Analysis via Sharp
// ────────────────────────────────────────────────────────────

function sRGBtoLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export async function analyzeColorContrast(imageBase64: string): Promise<ColorContrastResult | null> {
  if (!imageBase64 || imageBase64.length < 100) return null;

  try {
    const buffer = Buffer.from(imageBase64, 'base64');

    // Resize to 40x40 for fast pixel processing
    const { data, info } = await sharp(buffer)
      .resize(40, 40, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels; // 3 (RGB) or 4 (RGBA)
    const histogram: Map<string, number> = new Map();

    for (let i = 0; i < data.length; i += channels) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      histogram.set(key, (histogram.get(key) || 0) + 1);
    }

    // Find top 5 dominant colors
    const sorted = [...histogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const dominantRGB = sorted.map(([key]) => key.split(',').map(Number) as [number, number, number]);
    const dominantHex = dominantRGB.map(([r, g, b]) => rgbToHex(r, g, b));

    if (dominantRGB.length < 2) return null;

    // Compute all pairwise contrast ratios
    const luminances = dominantRGB.map(([r, g, b]) => relativeLuminance(r, g, b));
    let minRatio = Infinity;
    let maxRatio = -Infinity;

    for (let i = 0; i < luminances.length; i++) {
      for (let j = i + 1; j < luminances.length; j++) {
        const ratio = contrastRatio(luminances[i], luminances[j]);
        if (ratio < minRatio) minRatio = ratio;
        if (ratio > maxRatio) maxRatio = ratio;
      }
    }

    minRatio = Math.round(minRatio * 100) / 100;
    maxRatio = Math.round(maxRatio * 100) / 100;
    const wcagAAPass = maxRatio >= 4.5;

    const note = wcagAAPass
      ? `Palette-level analysis: highest contrast ratio ${maxRatio}:1 meets WCAG AA (4.5:1) threshold for normal text. Note: this reflects dominant palette colors, not verified text-vs-background pairs.`
      : `Palette-level analysis: highest contrast ratio ${maxRatio}:1 does NOT meet WCAG AA (4.5:1) threshold for normal text across dominant palette colors. Review text and background color pairs carefully.`;

    return {
      dominantColors: dominantHex,
      minContrastRatio: minRatio,
      maxContrastRatio: maxRatio,
      wcagAAPass,
      note,
    };
  } catch (err: any) {
    console.warn('[Local ML] Color contrast analysis failed:', err?.message || err);
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// 4. Combined Runner
// ────────────────────────────────────────────────────────────

export async function runLocalMLAnalysis({
  content,
  screenshotBase64,
}: {
  content: string;
  screenshotBase64?: string | null;
}): Promise<LocalMLResult> {
  let readability: ReadabilityResult | null = null;
  let keywords: string[] = [];
  let colorContrast: ColorContrastResult | null = null;

  try {
    readability = computeReadability(content);
  } catch (err: any) {
    console.warn('[Local ML] Readability analysis failed:', err?.message || err);
  }

  try {
    keywords = extractKeywords(content, 8);
  } catch (err: any) {
    console.warn('[Local ML] Keyword extraction failed:', err?.message || err);
  }

  try {
    if (screenshotBase64 && screenshotBase64.length > 100) {
      colorContrast = await analyzeColorContrast(screenshotBase64);
    }
  } catch (err: any) {
    console.warn('[Local ML] Color contrast analysis failed:', err?.message || err);
  }

  return { readability, keywords, colorContrast };
}
