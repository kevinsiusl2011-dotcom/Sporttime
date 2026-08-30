import { hashPayload } from "@/lib/crypto";
import type { SportEvent } from "@/lib/sports/types";

type RawEvent = {
  idEvent?: string;
  strEvent?: string;
  strFilename?: string;
  strSport?: string;
  strLeague?: string;
  idLeague?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  dateEvent?: string;
  dateEventLocal?: string;
  strTime?: string;
  strTimeLocal?: string;
  strTimestamp?: string;
  strVenue?: string;
  strCity?: string;
  strCountry?: string;
  strThumb?: string;
  strPoster?: string;
  strStatus?: string;
  strDescriptionEN?: string;
  strTVStation?: string;
};

function padTime(raw?: string | null): string | null {
  if (!raw || raw === "00:00:00" || raw === "0" || raw.toLowerCase() === "tba") {
    return null;
  }
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}:${match[3] ?? "00"}`;
}

/** TheSportsDB `strTimestamp` is UTC and often omits the `Z` suffix. */
export function parseSportsTimestamp(raw: string): Date {
  if (/[zZ]$/.test(raw) || /[+-]\d{2}:?\d{2}$/.test(raw)) {
    return new Date(raw);
  }
  return new Date(`${raw}Z`);
}

export function normalizeEvent(raw: RawEvent): SportEvent | null {
  const sourceId = raw.idEvent;
  if (!sourceId) return null;

  const date = raw.dateEventLocal || raw.dateEvent;
  if (!date) return null;

  const localTime = padTime(raw.strTimeLocal) ?? padTime(raw.strTime);
  const timeConfirmed = Boolean(localTime || raw.strTimestamp);
  let start: Date;

  if (raw.strTimestamp) {
    start = parseSportsTimestamp(raw.strTimestamp);
  } else if (localTime) {
    start = new Date(`${date}T${localTime}Z`);
  } else {
    start = new Date(`${date}T12:00:00Z`);
  }

  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + 2.5 * 60 * 60 * 1000);
  const location = [raw.strVenue, raw.strCity, raw.strCountry].filter(Boolean).join(", ");
  const title = raw.strEvent || raw.strFilename || "Upcoming event";
  const details = [
    raw.strLeague && `Competition: ${raw.strLeague}`,
    location && `Venue: ${location}`,
    raw.strTVStation && `Broadcast: ${raw.strTVStation}`,
    !timeConfirmed && "Kickoff time is not confirmed yet.",
    raw.strDescriptionEN,
    "Synced by Sporttime. Times follow the source feed and may change.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    source: "thesportsdb",
    sourceId,
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: !timeConfirmed,
    timeConfirmed,
    location,
    description: details,
    sport: raw.strSport || "Sport",
    league: raw.strLeague || "",
    leagueId: raw.idLeague,
    home: raw.strHomeTeam || undefined,
    away: raw.strAwayTeam || undefined,
    venue: raw.strVenue || undefined,
    city: raw.strCity || undefined,
    country: raw.strCountry || undefined,
    thumb: raw.strThumb || raw.strPoster || undefined,
    status: raw.strStatus || undefined,
  };
}

export function eventFingerprint(event: SportEvent): string {
  return hashPayload(
    JSON.stringify({
      title: event.title,
      start: event.start,
      end: event.end,
      location: event.location,
      description: event.description,
    }),
  );
}

export function isUpcoming(event: SportEvent, now = new Date()): boolean {
  return new Date(event.end).getTime() >= now.getTime() - 3 * 60 * 60 * 1000;
}

export function matchesFollow(
  event: SportEvent,
  follow: { kind: string; source_id: string; label: string; sport?: string | null },
): boolean {
  if (follow.kind === "sport") {
    const sport = event.sport.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const wanted = (follow.label || follow.source_id).toLowerCase().replace(/[^a-z0-9]+/g, "");
    return sport === wanted || event.sport === follow.source_id;
  }
  if (follow.kind === "league") {
    return event.leagueId === follow.source_id;
  }
  if (follow.kind === "team") {
    const name = follow.label.toLowerCase();
    return (
      event.home?.toLowerCase() === name ||
      event.away?.toLowerCase() === name ||
      event.title.toLowerCase().includes(name)
    );
  }
  const name = follow.label.toLowerCase();
  return event.title.toLowerCase().includes(name) || event.description.toLowerCase().includes(name);
}
