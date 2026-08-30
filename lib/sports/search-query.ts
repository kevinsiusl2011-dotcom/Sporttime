import { NAMES, normalizeKey } from "@/lib/i18n/names";

const ATHLETE_ALIASES: Record<string, string> = {
  pogi: "Tadej Pogacar",
  pogacar: "Tadej Pogacar",
  波加查: "Tadej Pogacar",
  波加查爾: "Tadej Pogacar",
  波加查尔: "Tadej Pogacar",
  messi: "Lionel Messi",
  美斯: "Lionel Messi",
  梅西: "Lionel Messi",
  ohtani: "Shohei Ohtani",
  大谷: "Shohei Ohtani",
  大谷翔平: "Shohei Ohtani",
};

const ALIAS_INDEX = new Map(
  Object.entries(ATHLETE_ALIASES).map(([key, value]) => [normalizeKey(key), value]),
);

let localizedToEnglish: Map<string, string> | null = null;

function englishFromLocalized(needle: string): string | null {
  if (!localizedToEnglish) {
    localizedToEnglish = new Map();
    for (const [en, pair] of Object.entries(NAMES)) {
      localizedToEnglish.set(normalizeKey(pair.hant), en);
      localizedToEnglish.set(normalizeKey(pair.hans), en);
    }
  }
  return localizedToEnglish.get(needle) ?? null;
}

export function resolveSearchQuery(raw: string) {
  const catalogQuery = raw.trim();
  const key = normalizeKey(catalogQuery);
  const athlete = ALIAS_INDEX.get(key);
  if (athlete) {
    return { catalogQuery, remoteQuery: athlete, skipRemoteLeagues: true };
  }
  const fromNames = englishFromLocalized(key);
  if (fromNames && fromNames !== key) {
    return { catalogQuery, remoteQuery: fromNames, skipRemoteLeagues: false };
  }
  return { catalogQuery, remoteQuery: catalogQuery, skipRemoteLeagues: false };
}

export function asRecords(value: unknown): Array<Record<string, string>> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, string> => Boolean(item) && typeof item === "object",
  );
}
