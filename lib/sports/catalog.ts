import { NAMES, normalizeKey } from "@/lib/i18n/names";
import { CATALOG, FEATURED_GROUPS, type CatalogEntry } from "@/lib/sports/featured";
import type { CatalogLeague } from "@/lib/sports/types";

export type FeaturedShelf = {
  id: string;
  sport: string;
  leagues: CatalogLeague[];
};

const byId = new Map(CATALOG.map((league) => [league.id, league]));

export function findCatalogLeague(id: string): CatalogLeague | null {
  return byId.get(id) ?? null;
}

export function allCatalogLeagues(): CatalogEntry[] {
  return CATALOG;
}

export function sportSlug(sport: string) {
  return sport.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function leaguesForSport(sport: string): CatalogEntry[] {
  const slug = sportSlug(sport);
  return CATALOG.filter((league) => sportSlug(league.sport) === slug);
}

export function listCatalogSports(): string[] {
  const seen = new Set<string>();
  const sports: string[] = [];
  for (const league of CATALOG) {
    if (seen.has(league.sport)) continue;
    seen.add(league.sport);
    sports.push(league.sport);
  }
  return sports;
}

function catalogBlob(league: CatalogEntry) {
  const parts = [league.name, league.sport, league.country, ...(league.aliases ?? [])];
  const localized = parts.flatMap((part) => {
    const pair = NAMES[normalizeKey(part)];
    return pair ? [pair.hant, pair.hans] : [];
  });
  return normalizeKey([...parts, ...localized].join(" "));
}

export function searchCatalogLeagues(query: string): CatalogLeague[] {
  const needle = normalizeKey(query);
  if (needle.length < 2) return [];
  return CATALOG.filter(
    (league) => catalogBlob(league).includes(needle) || league.id === query.trim(),
  ).slice(0, 16);
}

export function loadFeaturedShelves(): FeaturedShelf[] {
  return FEATURED_GROUPS.map((group) => ({
    id: group.id,
    sport: group.sport,
    leagues: group.leagueIds
      .map((id) => byId.get(id))
      .filter((league): league is CatalogEntry => Boolean(league)),
  }));
}
