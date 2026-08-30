import { z } from "zod";

const schema = z.object({
  AUTH_SECRET: z.string().min(16).optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_URL: z.string().url().optional(),
  THESPORTSDB_API_KEY: z.string().default("3"),
  CRON_SECRET: z.string().optional(),
  DATABASE_PATH: z.string().optional(),
  DEFAULT_REMINDERS: z.string().default("60,1440"),
});

export type EnvStatus = {
  ready: boolean;
  missing: string[];
  warnings: string[];
};

export function getEnv() {
  return schema.parse({
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    THESPORTSDB_API_KEY: process.env.THESPORTSDB_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    DATABASE_PATH: process.env.DATABASE_PATH,
    DEFAULT_REMINDERS: process.env.DEFAULT_REMINDERS,
  });
}

export function getEnvStatus(): EnvStatus {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
    missing.push("AUTH_SECRET");
  }
  const firebaseReady = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const googleOauthReady = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  if (!firebaseReady && !googleOauthReady) {
    missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!process.env.THESPORTSDB_API_KEY) {
    warnings.push("THESPORTSDB_API_KEY is empty; using public test key 3.");
  } else if (process.env.THESPORTSDB_API_KEY === "3") {
    warnings.push("Using TheSportsDB test key 3. Register your own key for regular use.");
  }
  if (!process.env.CRON_SECRET || process.env.CRON_SECRET === "change-me") {
    warnings.push("Set a strong CRON_SECRET before exposing the scheduler.");
  }

  return { ready: missing.length === 0, missing, warnings };
}

export function parseReminders(raw?: string): number[] {
  const source = raw ?? process.env.DEFAULT_REMINDERS ?? "60,1440";
  return source
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}
