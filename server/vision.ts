import { chromium } from 'playwright';

export interface ScreenshotResult {
  base64: string;
  mimeType: 'image/png' | 'image/jpeg';
  url: string;
  extractedText?: string;
}

/**
 * Clean raw HTML content into plain text prose
 */
export function cleanHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|section|article|td|tr)>/gi, '. ')
    .replace(/<br\s*\/?>/gi, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch raw page text content via HTTP fetch if Playwright is unavailable
 */
export async function fetchWebpageText(cleanUrl: string): Promise<string> {
  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      const extracted = cleanHtmlToText(html);
      if (extracted.length > 50) {
        console.log(`[Vision API Fallback] Extracted ${extracted.length} chars of live webpage text via HTTP fetch`);
        return extracted;
      }
    }
  } catch (err: any) {
    console.warn(`[Vision API Fallback] HTTP text fetch failed for ${cleanUrl}: ${err?.message || err}`);
  }
  return '';
}

/**
 * Fallback cloud screenshot fetcher using public Microlink & WordPress Mshots APIs
 */
async function fetchCloudScreenshot(cleanUrl: string): Promise<ScreenshotResult | null> {
  console.log(`[Vision API Fallback] Fetching live web screenshot via Cloud Screenshot Service for: ${cleanUrl}...`);
  const pageText = await fetchWebpageText(cleanUrl);

  try {
    // 1. Try Microlink Public Screenshot API with 3.5s delay for page hydration
    const microLinkRes = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&waitForTimeout=3500&waitUntil=networkidle`);
    if (microLinkRes.ok) {
      const json = await microLinkRes.json();
      const screenshotUrl = json.data?.screenshot?.url;
      if (screenshotUrl) {
        const imgRes = await fetch(screenshotUrl);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          if (base64.length > 5000) {
            console.log(`[Vision API Fallback] Successfully captured real live screenshot via Microlink API (${Math.round(base64.length / 1024)} KB base64 data)`);
            return {
              base64,
              mimeType: 'image/png',
              url: cleanUrl,
              extractedText: pageText,
            };
          }
        }
      }
    }
  } catch (err: any) {
    console.warn(`[Vision API Fallback] Microlink screenshot attempt failed: ${err?.message || err}`);
  }

  try {
    // 2. Try WordPress mshots API fallback
    const mshotsUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=1280&h=800`;
    const mshotsRes = await fetch(mshotsUrl);
    if (mshotsRes.ok) {
      const arrayBuffer = await mshotsRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      if (base64.length > 5000) {
        console.log(`[Vision API Fallback] Successfully captured real live screenshot via WordPress Mshots (${Math.round(base64.length / 1024)} KB base64 data)`);
        return {
          base64,
          mimeType: 'image/png',
          url: cleanUrl,
          extractedText: pageText,
        };
      }
    }
  } catch (err: any) {
    console.warn(`[Vision API Fallback] WordPress Mshots screenshot attempt failed: ${err?.message || err}`);
  }

  return null;
}

/**
 * Capture a visual screenshot of a given landing page URL using Playwright Chromium with Cloud Screenshot Fallback.
 * Also extracts actual inner text of the page body.
 */
export async function capturePageScreenshot(targetUrl: string): Promise<ScreenshotResult | null> {
  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let browser = null;
  let extractedText = '';

  try {
    if (process.env.PLAYWRIGHT_BROWSERS_PATH === undefined) {
      process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
    }
    console.log(`[Vision] Launching Playwright to capture screenshot of: ${cleanUrl}`);
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    
    // Navigate with generous timeout and full load strategy
    try {
      await page.goto(cleanUrl, {
        waitUntil: 'load',
        timeout: 25000,
      });
      // Additional check to wait for network connections & fonts to settle
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    } catch (gotoErr: any) {
      console.warn(`[Vision] Navigation warning for ${cleanUrl}: ${gotoErr?.message || gotoErr}. Proceeding to capture current state...`);
    }

    // 3.5 second stabilization pause for React hydration, CSS animations, fonts, and hero images
    console.log(`[Vision] Pausing 3.5s for page rendering, fonts, and hero images to stabilize...`);
    await page.waitForTimeout(3500);

    // Extract actual page text body via Playwright page.innerText('body')
    try {
      const rawBodyText = await page.innerText('body');
      extractedText = rawBodyText.replace(/\s+/g, ' ').trim();
      console.log(`[Vision] Playwright extracted ${extractedText.length} chars of page text`);
    } catch (txtErr: any) {
      console.warn(`[Vision] Could not extract page.innerText: ${txtErr?.message}`);
    }

    const buffer = await page.screenshot({
      type: 'png',
      fullPage: false, // Capture above-the-fold hero section
    });

    const base64 = buffer.toString('base64');
    console.log(`[Vision] Playwright screenshot successfully captured (${Math.round(base64.length / 1024)} KB base64 data)`);

    return {
      base64,
      mimeType: 'image/png',
      url: cleanUrl,
      extractedText: extractedText || undefined,
    };
  } catch (err: any) {
    console.warn(`[Vision] Local Playwright screenshot capture failed for ${cleanUrl}: ${err?.message || err}. Switch to Cloud Screenshot Service fallback...`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }

  // Fall back to Cloud Screenshot Service if local Playwright fails on cloud container (e.g. Render)
  return await fetchCloudScreenshot(cleanUrl);
}

/**
 * Generates a realistic mock base64 PNG screenshot if offline or browser fails
 */
export function generateMockScreenshotBase64(): ScreenshotResult {
  // SVG placeholder converted to base64 mock image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    <rect width="1280" height="800" fill="#0b132b"/>
    <rect x="40" y="40" width="1200" height="80" rx="12" fill="#1c2541"/>
    <circle cx="80" cy="80" r="12" fill="#ff5f56"/>
    <circle cx="115" cy="80" r="12" fill="#ffbd2e"/>
    <circle cx="150" cy="80" r="12" fill="#27c93f"/>
    <text x="200" y="86" fill="#8d99ae" font-family="system-ui, sans-serif" font-size="18">https://landingiq-demo.app</text>
    
    <!-- Hero Section Mock -->
    <rect x="120" y="200" width="600" height="40" rx="6" fill="#ffffff"/>
    <rect x="120" y="260" width="480" height="24" rx="4" fill="#a0aec0"/>
    <rect x="120" y="300" width="360" height="24" rx="4" fill="#718096"/>
    
    <!-- CTA Button Mock -->
    <rect x="120" y="360" width="220" height="54" rx="27" fill="#ffc857"/>
    <text x="160" y="394" fill="#0b132b" font-family="system-ui, sans-serif" font-weight="bold" font-size="18">Claim Free Audit →</text>
    
    <!-- Feature Mock Cards -->
    <rect x="780" y="200" width="380" height="440" rx="20" fill="#1c2541" stroke="#3a506b" stroke-width="2"/>
    <circle cx="970" cy="300" r="50" fill="#3a506b"/>
    <rect x="830" y="380" width="280" height="20" rx="4" fill="#e0e1dd"/>
    <rect x="860" y="420" width="220" height="16" rx="4" fill="#718096"/>
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return {
    base64,
    mimeType: 'image/png',
    url: 'https://landingiq-demo.app',
    extractedText: 'LandingIQ Demo Application. Stop guessing why visitors do not convert. Instant multimodal visual audits and CRO recommendations.',
  };
}
