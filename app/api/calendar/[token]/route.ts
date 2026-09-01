import { findUserByFeedToken } from "@/lib/account/merge";
import { calendarBodyForUser } from "@/lib/sync/engine";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token.replace(/\.ics$/i, "");
  if (!token || token.length < 16) {
    return new Response("Not found", { status: 404 });
  }

  const user = await findUserByFeedToken(token);
  if (!user) return new Response("Not found", { status: 404 });

  const body = await calendarBodyForUser(user);

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="sporttime.ics"',
      // Short browser/CDN cache; source of truth refreshes on FEED_TTL / cron.
      "Cache-Control": "private, max-age=900",
    },
  });
}
