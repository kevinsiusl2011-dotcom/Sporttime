import { dbGet, dbRun } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { nearbySeasons } from "@/lib/sports/season";
import { isUpcoming, normalizeEvent } from "@/lib/sports/normalize";
import type { CatalogLeague, CatalogTeam, SearchResults, SportEvent } from "@/lib/sports/types";

const BASE = "https://www.thesportsdb.com/api/v1/json";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

type CacheRow = { payload_json: string; expires_at: number };

async function request<T>(path: string, cacheKey: string, ttl = CACHE_TTL_MS): Promise<T> {
  const now = Date.now();
  const cached = await dbGet<CacheRow>(
    "SELECT payload_json, expires_at FROM fixture_cache WHERE cache_key = ?",
    [cacheKey],
  );
  if (cached && cached.expires_at > now) {
    return JSON.parse(cached.payload_json) as T;
  }

  const key = getEnv().THESPORTSDB_API_KEY || "3";
  const url = `${BASE}/${key}/${path}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    if (cached) return JSON.parse(cached.payload_json) as T;
    throw new Error(`TheSportsDB ${response.status} for ${path}`);
  }

  const data = (await response.json()) as T;
  await dbRun(
    `INSERT INTO fixture_cache (cache_key, payload_json, fetched_at, expires_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET payload_json = excluded.payload_json, fetched_at = excluded.fetched_at, expires_at = excluded.expires_at`,
    [cacheKey, JSON.stringify(data), now, now + ttl],
  );

  return data;
}

export async function lookupLeague(id: string): Promise<CatalogLeague | null> {
  const data = await request<{ leagues?: Array<Record<string, string>> }>(
    `lookupleague.php?id=${encodeURIComponent(id)}`,
    `league:${id}`,
    24 * 60 * 60 * 1000,
  );
  const raw = data.leagues?.[0];
  if (!raw?.idLeague) return null;
  return {
    id: raw.idLeague,
    name: raw.strLeague,
    sport: raw.strSport,
    country: raw.strCountry || "",
    badge: raw.strBadge || raw.strLogo,
  };
}

export async function lookupTeam(id: string): Promise<CatalogTeam | null> {
  const data = await request<{ teams?: Array<Record<string, string>> }>(
    `lookupteam.php?id=${encodeURIComponent(id)}`,
    `team:${id}`,
    24 * 60 * 60 * 1000,
  );
  const raw = data.teams?.[0];
  if (!raw?.idTeam) return null;
  return {
    id: raw.idTeam,
    name: raw.strTeam,
    sport: raw.strSport,
    league: raw.strLeague,
    leagueId: raw.idLeague,
    country: raw.strCountry,
    badge: raw.strBadge || raw.strTeamBadge,
  };
}

export async function searchAll(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) return { leagues: [], teams: [], athletes: [] };

  const [teamsData, playersData, leagueSoccer, leagueAny] = await Promise.all([
    request<{ teams?: Array<Record<string, string>> }>(
      `searchteams.php?t=${encodeURIComponent(q)}`,
      `search:team:${q.toLowerCase()}`,
      30 * 60 * 1000,
    ),
    request<{ player?: Array<Record<string, string>> }>(
      `searchplayers.php?p=${encodeURIComponent(q)}`,
      `search:player:${q.toLowerCase()}`,
      30 * 60 * 1000,
    ),
    request<{ countries?: Array<Record<string, string>> }>(
      `search_all_leagues.php?s=Soccer`,
      "leagues:soccer",
      24 * 60 * 60 * 1000,
    ).catch(() => ({ countries: [] })),
    request<{ countries?: Array<Record<string, string>> }>(
      `search_all_leagues.php?l=${encodeURIComponent(q)}`,
      `search:league:${q.toLowerCase()}`,
      30 * 60 * 1000,
    ).catch(() => ({ countries: [] })),
  ]);

  const needle = q.toLowerCase();
  const leaguePool = [...(leagueAny.countries ?? []), ...(leagueSoccer.countries ?? [])];
  const leagues = uniqueBy(
    leaguePool
      .filter((item) => item.strLeague?.toLowerCase().includes(needle) || item.idLeague === q)
      .map((item) => ({
        id: item.idLeague,
        name: item.strLeague,
        sport: item.strSport,
        country: item.strCountry || "",
        badge: item.strBadge,
      })),
    (item) => item.id,
  ).slice(0, 12);

  const teams = uniqueBy(
    (teamsData.teams ?? []).map((item) => ({
      id: item.idTeam,
      name: item.strTeam,
      sport: item.strSport,
      league: item.strLeague,
      leagueId: item.idLeague,
      country: item.strCountry,
      badge: item.strBadge || item.strTeamBadge,
    })),
    (item) => item.id,
  ).slice(0, 12);

  const athletes = uniqueBy(
    (playersData.player ?? []).map((item) => ({
      id: item.idPlayer,
      name: item.strPlayer,
      sport: item.strSport,
      team: item.strTeam,
      teamId: item.idTeam,
      nationality: item.strNationality,
      thumb: item.strThumb || item.strCutout,
    })),
    (item) => item.id,
  ).slice(0, 12);

  return { leagues, teams, athletes };
}

export async function listLeagueTeams(leagueId: string): Promise<CatalogTeam[]> {
  const data = await request<{ teams?: Array<Record<string, string>> }>(
    `lookup_all_teams.php?id=${encodeURIComponent(leagueId)}`,
    `league-teams:${leagueId}`,
    24 * 60 * 60 * 1000,
  );
  return (data.teams ?? []).map((item) => ({
    id: item.idTeam,
    name: item.strTeam,
    sport: item.strSport,
    league: item.strLeague,
    leagueId: item.idLeague || leagueId,
    country: item.strCountry,
    badge: item.strBadge || item.strTeamBadge,
  }));
}

export async function seasonEvents(leagueId: string, sport = "Soccer"): Promise<SportEvent[]> {
  const events: SportEvent[] = [];
  for (const season of nearbySeasons(sport)) {
    const data = await request<{ events?: Array<Record<string, string>> }>(
      `eventsseason.php?id=${encodeURIComponent(leagueId)}&s=${encodeURIComponent(season)}`,
      `season:${leagueId}:${season}`,
    );
    for (const raw of data.events ?? []) {
      const event = normalizeEvent(raw);
      if (event) events.push(event);
    }
    if (events.length > 0) break;
  }
  return uniqueBy(events, (event) => event.sourceId).filter((event) => isUpcoming(event));
}

export async function upcomingForFollow(follow: {
  kind: string;
  source_id: string;
  label: string;
  sport: string | null;
  extra_json: string | null;
}): Promise<SportEvent[]> {
  if (follow.kind === "league") {
    return seasonEvents(follow.source_id, follow.sport ?? "Soccer");
  }

  if (follow.kind === "team") {
    const extra = safeJson(follow.extra_json);
    const leagueId = extra.leagueId as string | undefined;
    if (leagueId) {
      return (await seasonEvents(leagueId, follow.sport ?? "Soccer")).filter((event) =>
        [event.home, event.away, event.title].some((value) =>
          value?.toLowerCase().includes(follow.label.toLowerCase()),
        ),
      );
    }
    const team = await lookupTeam(follow.source_id);
    if (team?.leagueId) {
      return (await seasonEvents(team.leagueId, team.sport)).filter((event) =>
        [event.home, event.away].some((value) => value?.toLowerCase() === team.name.toLowerCase()),
      );
    }
  }

  if (follow.kind === "athlete") {
    const extra = safeJson(follow.extra_json);
    const teamId = extra.teamId as string | undefined;
    if (teamId) {
      return upcomingForFollow({
        kind: "team",
        source_id: teamId,
        label: String(extra.team ?? follow.label),
        sport: follow.sport,
        extra_json: JSON.stringify({ leagueId: extra.leagueId }),
      });
    }
    const data = await request<{ event?: Array<Record<string, string>> }>(
      `searchevents.php?e=${encodeURIComponent(follow.label)}`,
      `search-events:${follow.label.toLowerCase()}`,
      60 * 60 * 1000,
    );
    return (data.event ?? [])
      .map((raw) => normalizeEvent(raw))
      .filter((event): event is SportEvent => Boolean(event && isUpcoming(event)));
  }

  if (follow.kind === "sport") {
    return [];
  }

  return [];
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const id = key(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }
  return result;
}

function safeJson(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}
