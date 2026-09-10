import type { FeedQuery } from "@/lib/calendar/feed";

export function calendarEtag(builtAt: number, query: FeedQuery) {
  return `"${builtAt}:${query.sport ?? ""}:${query.horizon ?? ""}"`;
}

export function calendarFeedHeaders(builtAt: number, query: FeedQuery) {
  const generated = builtAt > 0 ? builtAt : Date.now();
  return {
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": 'inline; filename="sporttime.ics"',
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Last-Modified": new Date(generated).toUTCString(),
    ETag: calendarEtag(generated, query),
  };
}

export function ifNoneMatchHits(request: Request, etag: string) {
  const header = request.headers.get("if-none-match");
  if (!header) return false;
  return header
    .split(",")
    .map((part) => part.trim())
    .includes(etag);
}
