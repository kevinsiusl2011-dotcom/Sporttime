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

export function appleCalendarUrl(feedUrl: string) {
  return feedUrl.replace(/^https?:/i, "webcal:");
}

export function googleSubscribeUrl(feedUrl: string) {
  const webcalUrl = appleCalendarUrl(feedUrl);
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;
}

export function publicLeagueCalendarUrl(leagueId: string) {
  return `${publicAppUrl()}/api/public/calendar/league/${encodeURIComponent(leagueId)}.ics`;
}

export function publicTeamCalendarUrl(teamId: string) {
  return `${publicAppUrl()}/api/public/calendar/team/${encodeURIComponent(teamId)}.ics`;
}

export function leaguePageUrl(leagueId: string) {
  return `${publicAppUrl()}/league/${encodeURIComponent(leagueId)}`;
}

export function teamPageUrl(teamId: string) {
  return `${publicAppUrl()}/club/${encodeURIComponent(teamId)}`;
}
