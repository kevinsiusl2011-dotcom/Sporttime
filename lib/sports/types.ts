export type FollowKind = "sport" | "league" | "team" | "athlete";

export type SportEvent = {
  source: "thesportsdb";
  sourceId: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  timeConfirmed: boolean;
  location: string;
  description: string;
  sport: string;
  league: string;
  leagueId?: string;
  home?: string;
  away?: string;
  venue?: string;
  city?: string;
  country?: string;
  thumb?: string;
  status?: string;
};

export type CatalogLeague = {
  id: string;
  name: string;
  sport: string;
  country: string;
  badge?: string;
};

export type CatalogTeam = {
  id: string;
  name: string;
  sport: string;
  league?: string;
  leagueId?: string;
  country?: string;
  badge?: string;
};

export type CatalogAthlete = {
  id: string;
  name: string;
  sport: string;
  team?: string;
  teamId?: string;
  nationality?: string;
  thumb?: string;
};

export type SearchResults = {
  leagues: CatalogLeague[];
  teams: CatalogTeam[];
  athletes: CatalogAthlete[];
};

export type FeaturedGroup = {
  id: string;
  sport: string;
  leagueIds: string[];
};
