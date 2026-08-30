import { createClient, type Client, type InValue } from "@libsql/client";
import fs from "fs";
import path from "path";

let client: Client | null = null;
let migrated = false;

function databaseUrl() {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "sporttime.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return `file:${file}`;
}

export function getClient(): Client {
  if (client) return client;
  client = createClient({
    url: databaseUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return client;
}

async function migrate() {
  if (migrated) return;
  await getClient().executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      locale TEXT NOT NULL DEFAULT 'zh-Hant',
      timezone TEXT,
      reminder_minutes TEXT NOT NULL DEFAULT '60,1440',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS google_accounts (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_enc TEXT NOT NULL,
      access_token_enc TEXT,
      access_expires_at INTEGER,
      calendar_id TEXT,
      scope TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS follows (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'thesportsdb',
      source_id TEXT NOT NULL,
      label TEXT NOT NULL,
      sport TEXT,
      extra_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, kind, source, source_id)
    );

    CREATE TABLE IF NOT EXISTS fixture_cache (
      cache_key TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS synced_events (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source TEXT NOT NULL,
      source_id TEXT NOT NULL,
      calendar_event_id TEXT NOT NULL,
      last_hash TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, source, source_id)
    );

    CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id);
    CREATE INDEX IF NOT EXISTS idx_synced_user ON synced_events(user_id);
  `);
  migrated = true;
}

export async function dbAll<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  await migrate();
  const result = await getClient().execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function dbGet<T>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  const rows = await dbAll<T>(sql, args);
  return rows[0];
}

export async function dbRun(sql: string, args: InValue[] = []): Promise<void> {
  await migrate();
  await getClient().execute({ sql, args });
}

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  locale: string;
  timezone: string | null;
  reminder_minutes: string;
};

export type FollowRow = {
  id: string;
  user_id: string;
  kind: "sport" | "league" | "team" | "athlete";
  source: string;
  source_id: string;
  label: string;
  sport: string | null;
  extra_json: string | null;
};

export type GoogleAccountRow = {
  user_id: string;
  refresh_token_enc: string;
  access_token_enc: string | null;
  access_expires_at: number | null;
  calendar_id: string | null;
  scope: string | null;
};
