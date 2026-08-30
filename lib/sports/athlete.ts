import { normalizeKey } from "@/lib/i18n/names";
import type { SportEvent } from "@/lib/sports/types";

const ROSTER_SPORTS = [
  "soccer",
  "football",
  "basketball",
  "american football",
  "baseball",
  "ice hockey",
  "hockey",
  "rugby",
  "cricket",
  "volleyball",
  "handball",
  "netball",
  "water polo",
  "australian football",
];

export function isRosterSport(sport?: string | null): boolean {
  const key = normalizeKey(sport ?? "");
  if (!key) return false;
  return ROSTER_SPORTS.some((item) => key === item || key.includes(item));
}

export function athleteSearchTerms(label: string): string[] {
  const full = label.trim();
  if (!full) return [];
  const parts = full.split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  const terms = [full];
  if (last && last.length >= 4 && normalizeKey(last) !== normalizeKey(full)) {
    terms.push(last);
  }
  return [...new Set(terms)];
}

export function eventMentionsAthlete(event: SportEvent, label: string): boolean {
  const needles = athleteSearchTerms(label).map((term) => normalizeKey(term)).filter((term) => term.length >= 3);
  if (needles.length === 0) return false;
  const haystack = normalizeKey(
    [event.title, event.home, event.away, event.description, event.league].filter(Boolean).join(" "),
  );
  return needles.some((needle) => haystack.includes(needle));
}
