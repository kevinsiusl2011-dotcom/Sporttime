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
  cr7: "Cristiano Ronaldo",
  ronaldo: "Cristiano Ronaldo",
  朗拿度: "Cristiano Ronaldo",
  罗纳尔多: "Cristiano Ronaldo",
  羅納爾多: "Cristiano Ronaldo",
  haaland: "Erling Haaland",
  夏蘭特: "Erling Haaland",
  哈兰德: "Erling Haaland",
  mbappe: "Kylian Mbappe",
  麥巴比: "Kylian Mbappe",
  姆巴佩: "Kylian Mbappe",
  salah: "Mohamed Salah",
  沙拉: "Mohamed Salah",
  萨拉赫: "Mohamed Salah",
  neymar: "Neymar",
  內馬爾: "Neymar",
  内马尔: "Neymar",
  bellingham: "Jude Bellingham",
  貝寧咸: "Jude Bellingham",
  贝林厄姆: "Jude Bellingham",
  vinicius: "Vinicius Junior",
  雲尼修斯: "Vinicius Junior",
  维尼修斯: "Vinicius Junior",
  kane: "Harry Kane",
  凱恩: "Harry Kane",
  哈里凯恩: "Harry Kane",
  孫興慜: "Son Heung-min",
  孙兴慜: "Son Heung-min",
  ohtani: "Shohei Ohtani",
  大谷: "Shohei Ohtani",
  大谷翔平: "Shohei Ohtani",
  vingegaard: "Jonas Vingegaard",
  雲高達爾: "Jonas Vingegaard",
  温格高: "Jonas Vingegaard",
  evenepoel: "Remco Evenepoel",
  伊雲尼浦: "Remco Evenepoel",
  verstappen: "Max Verstappen",
  韋斯塔潘: "Max Verstappen",
  维斯塔潘: "Max Verstappen",
  hamilton: "Lewis Hamilton",
  咸美頓: "Lewis Hamilton",
  汉密尔顿: "Lewis Hamilton",
  norris: "Lando Norris",
  leclerc: "Charles Leclerc",
  alcaraz: "Carlos Alcaraz",
  阿爾卡拉斯: "Carlos Alcaraz",
  sinner: "Jannik Sinner",
  辛納: "Jannik Sinner",
  djokovic: "Novak Djokovic",
  祖高域: "Novak Djokovic",
  德约科维奇: "Novak Djokovic",
  curry: "Stephen Curry",
  居里: "Stephen Curry",
  库里: "Stephen Curry",
  lebron: "LeBron James",
  占士: "LeBron James",
  詹姆斯: "LeBron James",
  丁俊暉: "Ding Junhui",
  丁俊晖: "Ding Junhui",
  奧蘇利雲: "Ronnie O'Sullivan",
  奥沙利文: "Ronnie O'Sullivan",
  jokic: "Nikola Jokic",
  約基奇: "Nikola Jokic",
  doncic: "Luka Doncic",
  唐西奇: "Luka Doncic",
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
