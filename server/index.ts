import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

import { dbService, pgPool } from '../src/db/index.js';
import { authRouter } from './auth.js';
import { analyzerRouter } from './analyzer.js';
import { reportsRouter } from './reports.js';
import { debugRouter } from './debug.js';
import { chatRouter } from './chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable reverse proxy trust for Render/Vercel HTTPS session cookie support
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
// Reflecting any Origin (origin: true) while credentials are enabled lets any
// site make cookie-authenticated requests to this API from a victim's browser.
// Restrict to the actual known frontends instead.
const defaultAllowedOrigins = [
  'https://landingiq.duckdns.org',
  'https://landing-iq.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultAllowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header (server-to-server, curl, same-origin navigation) - allow.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

// Session store setup
let sessionStore: any;

if (pgPool) {
  const PgSession = connectPgSimple(session);
  sessionStore = new PgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: true,
  });
  console.log('Using PostgreSQL session store (connect-pg-simple).');
} else {
  console.log('Using MemoryStore for session management.');
}

// A hardcoded fallback secret would be a real vulnerability once it's public
// (as this one now is, in git history) - anyone could forge session cookies
// for any deployment that forgets to set SESSION_SECRET. Fail fast instead.
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET must be set in production. Refusing to start with a fallback secret.'
    );
  }
  console.warn(
    '[Session] SESSION_SECRET not set - using an insecure dev-only fallback. Set SESSION_SECRET before deploying.'
  );
}

app.use(
  session({
    store: sessionStore,
    secret: sessionSecret || 'dev_only_insecure_fallback_do_not_use_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      // 'auto' marks the cookie Secure when the connection is HTTPS - including
      // behind a reverse proxy, since trust proxy (above) makes Express respect
      // X-Forwarded-Proto - while still working over plain HTTP where needed.
      secure: 'auto',
      sameSite: 'lax',
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Initialize Database Tables
dbService.initDb().catch((err) => {
  console.error('Database initialization warning:', err);
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api', analyzerRouter);
app.use('/api/reports', reportsRouter);
app.use('/api', debugRouter);
app.use('/api', chatRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LandingIQ API', timestamp: new Date().toISOString() });
});

// Serve frontend assets
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // Vite Dev Server Middleware integration for single-command start
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite dev middleware integrated successfully.');
  } catch (err) {
    console.warn('Vite dev server integration fallback:', err);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 LandingIQ Server is running on http://localhost:${PORT}`);
});
