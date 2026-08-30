import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbGet, dbRun } from "@/lib/db";
import { isLocale } from "@/lib/i18n";

const schema = z.object({
  reminderMinutes: z.string().regex(/^[\d,\s]+$/).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = await dbGet("SELECT locale, timezone, reminder_minutes FROM users WHERE id = ?", [session.user.id]);
  return Response.json({ user });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  if (parsed.data.locale && !isLocale(parsed.data.locale)) {
    return Response.json({ error: "Invalid locale" }, { status: 400 });
  }

  await dbRun(
    `UPDATE users SET
      reminder_minutes = COALESCE(?, reminder_minutes),
      timezone = COALESCE(?, timezone),
      locale = COALESCE(?, locale),
      updated_at = datetime('now')
     WHERE id = ?`,
    [parsed.data.reminderMinutes ?? null, parsed.data.timezone ?? null, parsed.data.locale ?? null, session.user.id],
  );
  return Response.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await dbRun("DELETE FROM google_accounts WHERE user_id = ?", [session.user.id]);
  await dbRun("DELETE FROM synced_events WHERE user_id = ?", [session.user.id]);
  return Response.json({ ok: true });
}
