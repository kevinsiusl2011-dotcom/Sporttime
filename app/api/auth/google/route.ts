import { randomUUID } from "crypto";
import { encryptSecret } from "@/lib/crypto";
import { dbGet, dbRun, type UserRow } from "@/lib/db";
import { createSession } from "@/lib/session";

const CALENDAR_SCOPES =
  "https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar.events";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };

  if (!body.idToken) {
    return Response.json({ error: "Missing id token" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: body.idToken }),
    },
  );
  const data = (await lookup.json()) as {
    users?: Array<{ email?: string; displayName?: string; photoUrl?: string; localId?: string }>;
    error?: { message?: string };
  };
  const profile = data.users?.[0];
  const email = profile?.email || body.email;
  if (!lookup.ok || !email) {
    return Response.json({ error: data.error?.message ?? "Invalid Google session" }, { status: 401 });
  }

  const existing = await dbGet<UserRow>("SELECT * FROM users WHERE email = ?", [email]);
  const userId = existing?.id ?? randomUUID();
  const name = body.name || profile?.displayName || null;
  const image = body.image || profile?.photoUrl || null;

  await dbRun(
    `INSERT INTO users (id, email, name, image, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET name = excluded.name, image = excluded.image, updated_at = datetime('now')`,
    [userId, email, name, image],
  );

  if (body.accessToken || body.refreshToken) {
    const current = await dbGet<{ refresh_token_enc: string }>(
      "SELECT refresh_token_enc FROM google_accounts WHERE user_id = ?",
      [userId],
    );
    const refresh = body.refreshToken
      ? encryptSecret(body.refreshToken)
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
        body.accessToken ? encryptSecret(body.accessToken) : null,
        Date.now() + (body.expiresIn ?? 3600) * 1000,
        CALENDAR_SCOPES,
      ],
    );
  }

  await createSession({ id: userId, email, name, image });
  return Response.json({ ok: true });
}
