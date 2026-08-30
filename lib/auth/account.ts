import { randomUUID } from "crypto";
import { encryptSecret } from "@/lib/crypto";
import { dbGet, dbRun, type UserRow } from "@/lib/db";
import { createSession } from "@/lib/session";

const CALENDAR_SCOPES =
  "https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar.events";

export async function completeGoogleLogin(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresIn?: number;
}) {
  const existing = await dbGet<UserRow>("SELECT * FROM users WHERE email = ?", [input.email]);
  const userId = existing?.id ?? randomUUID();

  await dbRun(
    `INSERT INTO users (id, email, name, image, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET name = excluded.name, image = excluded.image, updated_at = datetime('now')`,
    [userId, input.email, input.name ?? null, input.image ?? null],
  );

  if (input.accessToken || input.refreshToken) {
    const current = await dbGet<{ refresh_token_enc: string }>(
      "SELECT refresh_token_enc FROM google_accounts WHERE user_id = ?",
      [userId],
    );
    const refresh = input.refreshToken
      ? encryptSecret(input.refreshToken)
      : current?.refresh_token_enc || encryptSecret("access-only");

    await dbRun(
      `INSERT INTO google_accounts (user_id, refresh_token_enc, access_token_enc, access_expires_at, scope, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         refresh_token_enc = excluded.refresh_token_enc,
         access_token_enc = excluded.access_token_enc,
         access_expires_at = excluded.access_expires_at,
         scope = excluded.scope,
         updated_at = datetime('now')`,
      [
        userId,
        refresh,
        input.accessToken ? encryptSecret(input.accessToken) : null,
        Date.now() + (input.expiresIn ?? 3600) * 1000,
        CALENDAR_SCOPES,
      ],
    );
  }

  await createSession({
    id: userId,
    email: input.email,
    name: input.name,
    image: input.image,
  });
}
