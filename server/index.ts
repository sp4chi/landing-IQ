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
app.use(
  cors({
    origin: true,
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

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'landingiq_fallback_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
