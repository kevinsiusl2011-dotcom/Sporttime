import { FEATURED_GROUPS } from "@/lib/sports/featured";
import { lookupLeague } from "@/lib/sports/thesportsdb";
import type { CatalogLeague } from "@/lib/sports/types";

export type FeaturedShelf = {
  id: string;
  sport: string;
  leagues: CatalogLeague[];
};

export async function loadFeaturedShelves(): Promise<FeaturedShelf[]> {
  const resolved = await Promise.all(
    FEATURED_GROUPS.flatMap((group) =>
      group.leagues.map(async (entry) => {
        try {
          const league = await lookupLeague(entry.id);
          if (league) return { groupId: group.id, sport: group.sport, league };
        } catch {
          // keep fallback
        }
        return {
          groupId: group.id,
          sport: group.sport,
          league: {
            id: entry.id,
            name: entry.fallbackName,
            sport: group.sport === "Multi" ? "Sport" : group.sport,
            country: "",
          } satisfies CatalogLeague,
        };
      }),
    ),
  );

  return FEATURED_GROUPS.map((group) => {
    const leagues = resolved
      .filter((item) => item.groupId === group.id)
      .map((item) => item.league);
    const unique = new Map(leagues.map((league) => [league.id, league]));
    return { id: group.id, sport: group.sport, leagues: [...unique.values()] };
  });
}
