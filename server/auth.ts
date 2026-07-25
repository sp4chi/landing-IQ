import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { dbService } from '../src/db/index.js';

dotenv.config();

export const authRouter = Router();

// Rate limiter for auth endpoints (max 10 requests per 15 mins per IP)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many login/signup attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await dbService.findUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        if (!user.passwordHash) {
          return done(null, false, { message: 'Account was registered using Google Sign-In' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

let isGoogleStrategyRegistered = false;

export const isGoogleOauthConfigured = () => {
  dotenv.config();
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  const isConfigured = Boolean(
    id &&
    secret &&
    !id.includes('your_') &&
    !secret.includes('your_')
  );

  if (isConfigured && !isGoogleStrategyRegistered) {
    try {
      const callbackURL =
        process.env.GOOGLE_CALLBACK_URL &&
        !process.env.GOOGLE_CALLBACK_URL.includes('your_') &&
        process.env.GOOGLE_CALLBACK_URL.trim() !== ''
          ? process.env.GOOGLE_CALLBACK_URL
          : '/api/auth/google/callback';

      passport.use(
        new GoogleStrategy(
          {
            clientID: id!,
            clientSecret: secret!,
            callbackURL,
          },
          async (_accessToken, _refreshToken, profile, done) => {
            try {
              const googleId = profile.id;
              const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
              if (!email) {
                return done(new Error('No email found in Google account profile'));
              }

              let user = await dbService.findUserByGoogleId(googleId);
              if (!user) {
                user = await dbService.findUserByEmail(email);
                if (user) {
                  const updated = await dbService.updateUserGoogleId(user.id, googleId);
                  if (updated) user = updated;
                } else {
                  user = await dbService.createUser({ email, googleId });
                }
              }
              return done(null, user);
            } catch (err) {
              return done(err);
            }
          }
        )
      );
      isGoogleStrategyRegistered = true;
    } catch (err) {
      console.error('Failed to register GoogleStrategy:', err);
    }
  }

  return isGoogleStrategyRegistered;
};

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await dbService.findUserById(id);
    if (!user) return done(null, false);
    // Omit passwordHash before attaching to req.user
    const { passwordHash, ...safeUser } = user;
    done(null, safeUser);
  } catch (err) {
    done(err);
  }
});

// Zod schemas
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Routes
// POST /api/auth/signup
authRouter.post('/signup', authRateLimiter, async (req, res, next) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || 'Invalid input parameters';
      return res.status(400).json({ error: errorMsg });
    }

    const { email, password } = parseResult.data;

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await dbService.createUser({
      email,
      passwordHash,
    });

    const safeUser = { id: newUser.id, email: newUser.email, createdAt: newUser.createdAt };

    req.login(safeUser, (err) => {
      if (err) return next(err);
      return res.status(201).json({ user: safeUser, message: 'Account created successfully' });
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/login', authRateLimiter, (req, res, next) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid email or password';
    return res.status(400).json({ error: errorMsg });
  }

  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid email or password' });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      const safeUser = { id: user.id, email: user.email, createdAt: user.createdAt };
      return res.json({ user: safeUser, message: 'Logged in successfully' });
    });
  })(req, res, next);
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  });
});

// GET /api/auth/me
authRouter.get('/me', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(200).json({ user: null });
  }
  const user: any = req.user;
  return res.json({ user: { id: user.id, email: user.email, createdAt: user.createdAt } });
});

export function getCallbackUrl(req: any): string {
  const envCallback = process.env.GOOGLE_CALLBACK_URL;
  if (
    envCallback &&
    !envCallback.includes('your_') &&
    !envCallback.includes('localhost') &&
    envCallback.trim() !== ''
  ) {
    return envCallback.trim();
  }

  if (req) {
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
    const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
    if (host) {
      return `${proto}://${host}/api/auth/google/callback`;
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
  }

  return envCallback || 'http://localhost:3000/api/auth/google/callback';
}

// Google OAuth routes
authRouter.get('/google', (req, res, next) => {
  if (!isGoogleOauthConfigured()) {
    return res.status(501).json({
      error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env',
    });
  }
  const callbackURL = getCallbackUrl(req);
  passport.authenticate('google', { scope: ['profile', 'email'], callbackURL } as any)(req, res, next);
});

authRouter.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleOauthConfigured()) {
      return res.redirect('/#login?error=google_not_configured');
    }
    const callbackURL = getCallbackUrl(req);
    passport.authenticate('google', { failureRedirect: '/#login?error=google_failed', callbackURL } as any)(req, res, next);
  },
  (req, res) => {
    req.session.save((err) => {
      if (err) {
        console.error('Session save error post Google auth:', err);
      }
      res.redirect('/');
    });
  }
);

// DELETE /api/auth/account
authRouter.delete('/account', async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  try {
    const userId = (req.user as any).id;
    await dbService.deleteUser(userId);
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.json({ message: 'Account deleted successfully' });
      });
    });
  } catch (err) {
    next(err);
  }
});
