import { after } from "next/server";
import { findUserByFeedToken } from "@/lib/account/merge";
import { parseFeedQuery } from "@/lib/calendar/feed";
import { calendarFeedHeaders, ifNoneMatchHits } from "@/lib/calendar/http";
import { calendarBodyForUser, feedIsStale, rebuildUserFeed } from "@/lib/sync/engine";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token.replace(/\.ics$/i, "");
  if (!token || token.length < 16) {
    return new Response("Not found", { status: 404 });
  }

  const user = await findUserByFeedToken(token);
  if (!user) return new Response("Not found", { status: 404 });

  const query = parseFeedQuery(new URL(request.url));
  const refreshInBackground = Boolean(user.feed_events_json) && feedIsStale(user);
  const { ics, builtAt } = await calendarBodyForUser(user, query);
  const headers = calendarFeedHeaders(builtAt, query);

  if (refreshInBackground) {
    after(() => {
      void rebuildUserFeed(user.id).catch((error) => {
        console.error("Background calendar rebuild failed", user.id, error);
      });
    });
  }

  if (ifNoneMatchHits(request, headers.ETag)) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(ics, { headers });
}
