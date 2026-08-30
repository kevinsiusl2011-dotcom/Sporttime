import { findCatalogLeague } from "@/lib/sports/catalog";
import type { CatalogLeague } from "@/lib/sports/types";

const QUICK_IDS = ["4328", "4335", "4387", "4370", "4465", "4391"];

export function quickFollowLeagues(): CatalogLeague[] {
  return QUICK_IDS.map((id) => findCatalogLeague(id)).filter((league): league is CatalogLeague => Boolean(league));
}
