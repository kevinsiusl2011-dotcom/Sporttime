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

const WEAK_NAME_TOKENS = new Set([
  "junior",
  "senior",
  "jr",
  "sr",
  "ii",
  "iii",
  "iv",
  "james",
  "john",
  "david",
  "michael",
  "lee",
  "kim",
]);

export function isRosterSport(sport?: string | null): boolean {
  const key = normalizeKey(sport ?? "");
  if (!key) return false;
  return ROSTER_SPORTS.some((item) => key === item || key.includes(item));
}

export function isWeakAthleteToken(value: string): boolean {
  return WEAK_NAME_TOKENS.has(normalizeKey(value));
}

export function athleteSearchTerms(label: string): string[] {
  const full = label.trim();
  if (!full) return [];
  const parts = full.split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  const terms = [full];
  if (
    last &&
    last.length >= 4 &&
    normalizeKey(last) !== normalizeKey(full) &&
    !isWeakAthleteToken(last)
  ) {
    terms.push(last);
  }
  return [...new Set(terms)];
}

export function eventMentionsAthlete(event: SportEvent, label: string): boolean {
  const full = normalizeKey(label);
  const haystack = normalizeKey(
    [event.title, event.home, event.away, event.description].filter(Boolean).join(" "),
  );
  if (!full || !haystack) return false;
  if (haystack.includes(full)) return true;
  return athleteSearchTerms(label)
    .slice(1)
    .map((term) => normalizeKey(term))
    .filter((term) => term.length >= 5)
    .some((needle) => haystack.includes(needle));
}
