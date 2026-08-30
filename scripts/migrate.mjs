import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const eq = trimmed.indexOf("=");
  const key = trimmed.slice(0, eq);
  let value = trimmed.slice(eq + 1);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = value;
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = neon(url);
const statements = [
  `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      locale TEXT NOT NULL DEFAULT 'zh-Hant',
      timezone TEXT,
      reminder_minutes TEXT NOT NULL DEFAULT '60,1440',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS google_accounts (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_enc TEXT NOT NULL,
      access_token_enc TEXT,
      access_expires_at BIGINT,
      calendar_id TEXT,
      scope TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS follows (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'thesportsdb',
      source_id TEXT NOT NULL,
      label TEXT NOT NULL,
      sport TEXT,
      extra_json TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, kind, source, source_id)
    )`,
  `CREATE TABLE IF NOT EXISTS fixture_cache (
      cache_key TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      fetched_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL
    )`,
  `CREATE TABLE IF NOT EXISTS synced_events (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source TEXT NOT NULL,
      source_id TEXT NOT NULL,
      calendar_event_id TEXT NOT NULL,
      last_hash TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, source, source_id)
    )`,
  `CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_synced_user ON synced_events(user_id)`,
];

for (const statement of statements) {
  await sql.query(statement, []);
}
const tables = await sql.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
console.log("tables", tables.map((row) => row.tablename).join(", "));
