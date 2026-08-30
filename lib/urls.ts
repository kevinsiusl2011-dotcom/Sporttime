export function publicAppUrl() {
  const configured = process.env.AUTH_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function calendarFeedUrl(token: string) {
  return `${publicAppUrl()}/api/calendar/${token}.ics`;
}

export function googleSubscribeUrl(feedUrl: string) {
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feedUrl)}`;
}
