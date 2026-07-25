import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

const { Pool } = pg;

export let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
export let pgPool: pg.Pool | null = null;

const connectionString = process.env.DATABASE_URL;

if (connectionString && connectionString.trim() !== '') {
  try {
    pgPool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
    });
    db = drizzle(pgPool, { schema });
    console.log('Connected to PostgreSQL database with Drizzle ORM.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err);
  }
} else {
  console.warn('DATABASE_URL is not set. Using in-memory database store for local demonstration mode.');
}

// In-memory fallback storage
const memoryUsers: Array<{
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  createdAt: Date;
}> = [];

const memoryReports: Array<{
  id: string;
  userId: string;
  title: string;
  inputContent: string;
  resultJson: any;
  conversionScore: number;
  createdAt: Date;
}> = [];

export const dbService = {
  async initDb() {
    if (db && pgPool) {
      try {
        // Create tables if they don't exist automatically for convenience
        await pgPool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            google_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
          CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            input_content TEXT NOT NULL,
            result_json JSONB NOT NULL,
            conversion_score INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
          CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL
          )
          WITH (OIDS=FALSE);
          ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
          ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
          CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
        `);
        console.log('Database tables ensured successfully.');
      } catch (err) {
        console.error('Error creating database tables:', err);
      }
    }
  },

  async findUserByEmail(email: string) {
    if (db) {
      const res = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
      return res[0] || null;
    }
    const user = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async findUserById(id: string) {
    if (db) {
      const res = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      return res[0] || null;
    }
    const user = memoryUsers.find((u) => u.id === id);
    return user || null;
  },

  async findUserByGoogleId(googleId: string) {
    if (db) {
      const res = await db.select().from(schema.users).where(eq(schema.users.googleId, googleId)).limit(1);
      return res[0] || null;
    }
    const user = memoryUsers.find((u) => u.googleId === googleId);
    return user || null;
  },

  async createUser(data: { email: string; passwordHash?: string | null; googleId?: string | null }) {
    const emailLower = data.email.toLowerCase();
    if (db) {
      const res = await db
        .insert(schema.users)
        .values({
          email: emailLower,
          passwordHash: data.passwordHash || null,
          googleId: data.googleId || null,
        })
        .returning();
      return res[0];
    }
    const newUser = {
      id: crypto.randomUUID(),
      email: emailLower,
      passwordHash: data.passwordHash || null,
      googleId: data.googleId || null,
      createdAt: new Date(),
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async deleteUser(id: string) {
    if (db) {
      await db.delete(schema.users).where(eq(schema.users.id, id));
      return true;
    }
    const uIndex = memoryUsers.findIndex((u) => u.id === id);
    if (uIndex !== -1) memoryUsers.splice(uIndex, 1);
    for (let i = memoryReports.length - 1; i >= 0; i--) {
      if (memoryReports[i].userId === id) memoryReports.splice(i, 1);
    }
    return true;
  },

  async createReport(data: {
    userId: string;
    title: string;
    inputContent: string;
    resultJson: any;
    conversionScore: number;
  }) {
    if (db) {
      const res = await db
        .insert(schema.reports)
        .values({
          userId: data.userId,
          title: data.title,
          inputContent: data.inputContent,
          resultJson: data.resultJson,
          conversionScore: data.conversionScore,
        })
        .returning();
      return res[0];
    }
    const newReport = {
      id: crypto.randomUUID(),
      userId: data.userId,
      title: data.title,
      inputContent: data.inputContent,
      resultJson: data.resultJson,
      conversionScore: data.conversionScore,
      createdAt: new Date(),
    };
    memoryReports.push(newReport);
    return newReport;
  },

  async getReportsByUserId(userId: string) {
    if (db) {
      return await db
        .select()
        .from(schema.reports)
        .where(eq(schema.reports.userId, userId))
        .orderBy(desc(schema.reports.createdAt));
    }
    return memoryReports
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getReportById(id: string, userId: string) {
    if (db) {
      const res = await db
        .select()
        .from(schema.reports)
        .where(eq(schema.reports.id, id))
        .limit(1);
      const report = res[0];
      if (report && report.userId === userId) return report;
      return null;
    }
    const report = memoryReports.find((r) => r.id === id && r.userId === userId);
    return report || null;
  },

  async deleteReport(id: string, userId: string) {
    if (db) {
      await db.delete(schema.reports).where(eq(schema.reports.id, id));
      return true;
    }
    const idx = memoryReports.findIndex((r) => r.id === id && r.userId === userId);
    if (idx !== -1) memoryReports.splice(idx, 1);
    return true;
  }
};
