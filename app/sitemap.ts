import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/urls";
import { allCatalogLeagues } from "@/lib/sports/catalog";
import { popularTeamsForLeague } from "@/lib/sports/popular-teams";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicAppUrl();
  const staticPages = ["", "/browse", "/search", "/preview", "/privacy", "/terms"].map(
    (path) => ({
      url: `${base}${path || "/"}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const leagues = allCatalogLeagues();
  const leagueIds = Array.from(new Set(leagues.map((l) => l.id)));
  const leaguePages = leagueIds.map((id) => ({
    url: `${base}/league/${encodeURIComponent(id)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const teamIds: string[] = [];
  for (const leagueId of leagueIds) {
    for (const team of popularTeamsForLeague(leagueId)) {
      teamIds.push(team.id);
    }
  }
  const uniqueTeamIds = Array.from(new Set(teamIds));
  const clubPages = uniqueTeamIds.map((sourceId) => ({
    url: `${base}/club/${encodeURIComponent(sourceId)}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...leaguePages, ...clubPages];
}
