import { z } from "zod";
import { ensureUserRecord, rotateFeedToken } from "@/lib/guest";
import { dbRun } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import { calendarFeedUrl, googleSubscribeUrl } from "@/lib/urls";

const schema = z.object({
  reminderMinutes: z.string().regex(/^[\d,\s]+$/).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  rotateFeed: z.boolean().optional(),
});

export async function GET() {
  const user = await ensureUserRecord();
  const feedUrl = calendarFeedUrl(user.feed_token!);
  return Response.json({
    user,
    feedUrl,
    googleUrl: googleSubscribeUrl(feedUrl),
  });
}

export async function PATCH(request: Request) {
  const user = await ensureUserRecord();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  if (parsed.data.locale && !isLocale(parsed.data.locale)) {
    return Response.json({ error: "Invalid locale" }, { status: 400 });
  }

  if (parsed.data.rotateFeed) {
    const token = await rotateFeedToken(user.id);
    const feedUrl = calendarFeedUrl(token);
    return Response.json({ ok: true, feedUrl, googleUrl: googleSubscribeUrl(feedUrl) });
  }

  await dbRun(
    `UPDATE users SET
      reminder_minutes = COALESCE(?, reminder_minutes),
      timezone = COALESCE(?, timezone),
      locale = COALESCE(?, locale),
      updated_at = datetime('now')
     WHERE id = ?`,
    [parsed.data.reminderMinutes ?? null, parsed.data.timezone ?? null, parsed.data.locale ?? null, user.id],
  );
  if (parsed.data.reminderMinutes) {
    try {
      const { rebuildUserFeed } = await import("@/lib/sync/engine");
      await rebuildUserFeed(user.id);
    } catch (error) {
      console.error("Failed to rebuild calendar after settings change", error);
    }
  }
  return Response.json({ ok: true });
}
