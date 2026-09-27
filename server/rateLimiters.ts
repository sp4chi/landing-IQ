import rateLimit from 'express-rate-limit';

/**
 * Keys by the authenticated user's id rather than IP - these routes already
 * require req.isAuthenticated(), and per-user limits avoid over-throttling
 * shared/corporate IPs while still capping each account's spend.
 */
function keyByUserId(req: any): string {
  return req.user?.id ? String(req.user.id) : req.ip;
}

// /api/analyze: each request runs a Playwright render + a paid vision LLM call.
export const analyzeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many audit requests. Please wait a few minutes before analyzing another page.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserId,
});

// /api/chat-copilot: each request is a paid LLM call.
export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Too many chat requests. Please wait a few minutes before continuing the conversation.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserId,
});
