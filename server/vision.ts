import { chromium } from 'playwright';

export interface ScreenshotResult {
  base64: string;
  mimeType: 'image/png' | 'image/jpeg';
  url: string;
}

/**
 * Capture a visual screenshot of a given landing page URL using Playwright Chromium.
 */
export async function capturePageScreenshot(targetUrl: string): Promise<ScreenshotResult | null> {
  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let browser = null;
  try {
    console.log(`[Vision] Launching Playwright to capture screenshot of: ${cleanUrl}`);
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    
    // Navigate with a generous timeout and domcontentloaded strategy
    await page.goto(cleanUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Short pause for CSS/animations to stabilize
    await page.waitForTimeout(1000);

    const buffer = await page.screenshot({
      type: 'png',
      fullPage: false, // Capture above-the-fold hero section
    });

    const base64 = buffer.toString('base64');
    console.log(`[Vision] Screenshot successfully captured (${Math.round(base64.length / 1024)} KB base64 data)`);

    return {
      base64,
      mimeType: 'image/png',
      url: cleanUrl,
    };
  } catch (err: any) {
    console.warn(`[Vision] Playwright screenshot capture failed for ${cleanUrl}:`, err?.message || err);
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
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
  };
}
