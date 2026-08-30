import { randomBytes, randomUUID } from "crypto";
import { dbGet, dbRun, type UserRow } from "@/lib/db";
import { auth } from "@/lib/auth";

export function newFeedToken() {
  return randomBytes(24).toString("base64url");
}

export async function ensureUserRecord() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }

  const existing = await dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [session.user.id]);
  if (existing?.feed_token) return existing;

  const email = session.user.email || `guest-${session.user.id}@sporttime.local`;
  const token = existing?.feed_token || newFeedToken();

  await dbRun(
    `INSERT INTO users (id, email, name, image, feed_token, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       feed_token = COALESCE(users.feed_token, excluded.feed_token),
       updated_at = datetime('now')`,
    [session.user.id, email, session.user.name ?? null, session.user.image ?? null, token],
  );

  return (await dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [session.user.id]))!;
}

export async function rotateFeedToken(userId: string) {
  const token = newFeedToken();
  await dbRun("UPDATE users SET feed_token = ?, updated_at = datetime('now') WHERE id = ?", [token, userId]);
  return token;
}
