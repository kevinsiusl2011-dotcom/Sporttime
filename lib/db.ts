import { createClient, type Client, type InValue } from "@libsql/client";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

type Row = Record<string, unknown>;

const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const isPostgres = Boolean(postgresUrl?.startsWith("postgres"));

let libsql: Client | null = null;
let migrated = false;

function fileUrl() {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "sporttime.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return `file:${file}`;
}

function sqliteClient() {
  if (libsql) return libsql;
  libsql = createClient({
    url: process.env.TURSO_DATABASE_URL || fileUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return libsql;
}

function toPostgres(sql: string) {
  let index = 0;
  return sql
    .replace(/datetime\('now'\)/g, "CURRENT_TIMESTAMP")
    .replace(/\?/g, () => `$${++index}`);
}

const SQLITE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      locale TEXT NOT NULL DEFAULT 'zh-Hant',
      timezone TEXT,
      reminder_minutes TEXT NOT NULL DEFAULT '60,1440',
      feed_token TEXT,
      feed_token_alias TEXT,
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
`;

async function migrate() {
  if (migrated) return;
  const statements = SQLITE_SCHEMA.split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  if (isPostgres) {
    const sql = neon(postgresUrl!);
    for (const statement of statements) {
      await sql.query(toPostgres(statement), []);
    }
  } else {
    await sqliteClient().executeMultiple(SQLITE_SCHEMA);
  }
  try {
    if (isPostgres) {
      await neon(postgresUrl!).query("ALTER TABLE users ADD COLUMN IF NOT EXISTS feed_token TEXT", []);
      await neon(postgresUrl!).query("ALTER TABLE users ADD COLUMN IF NOT EXISTS feed_token_alias TEXT", []);
      await neon(postgresUrl!).query("ALTER TABLE users ADD COLUMN IF NOT EXISTS feed_ics TEXT", []);
      await neon(postgresUrl!).query("ALTER TABLE users ADD COLUMN IF NOT EXISTS feed_events_json TEXT", []);
      await neon(postgresUrl!).query("ALTER TABLE users ADD COLUMN IF NOT EXISTS feed_built_at BIGINT", []);
    } else {
      await sqliteClient().execute("ALTER TABLE users ADD COLUMN feed_token TEXT");
    }
  } catch {
    // column already exists
  }
  if (!isPostgres) {
    for (const statement of [
      "ALTER TABLE users ADD COLUMN feed_ics TEXT",
      "ALTER TABLE users ADD COLUMN feed_events_json TEXT",
      "ALTER TABLE users ADD COLUMN feed_built_at INTEGER",
      "ALTER TABLE users ADD COLUMN feed_token_alias TEXT",
    ]) {
      try {
        await sqliteClient().execute(statement);
      } catch {
        // column already exists
      }
    }
  }
  if (isPostgres) {
    await neon(postgresUrl!).query("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_feed_token ON users(feed_token)", []);
    await neon(postgresUrl!).query(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_feed_token_alias ON users(feed_token_alias)",
      [],
    );
  } else {
    await sqliteClient().execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_feed_token ON users(feed_token)");
    await sqliteClient().execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_feed_token_alias ON users(feed_token_alias)",
    );
  }
  migrated = true;
}

export async function dbAll<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  await migrate();
  if (isPostgres) {
    const rows = (await neon(postgresUrl!).query(toPostgres(sql), args as (string | number | boolean | null)[])) as Row[];
    return rows as T[];
  }
  const result = await sqliteClient().execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function dbGet<T>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  const rows = await dbAll<T>(sql, args);
  return rows[0];
}

export async function dbRun(sql: string, args: InValue[] = []): Promise<void> {
  await dbAll(sql, args);
}

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  locale: string;
  timezone: string | null;
  reminder_minutes: string;
  feed_token: string | null;
  feed_token_alias?: string | null;
  feed_ics?: string | null;
  feed_events_json?: string | null;
  feed_built_at?: number | null;
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
