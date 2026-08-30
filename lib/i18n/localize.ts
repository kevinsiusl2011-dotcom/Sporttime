import { NAMES, normalizeKey, type NamePair } from "@/lib/i18n/names";

export type LocalizedText = {
  hant: string;
  hans: string;
  en: string;
};

function lookup(value?: string | null): NamePair | null {
  if (!value) return null;
  return NAMES[normalizeKey(value)] ?? null;
}

function translateOne(value: string, script: "hant" | "hans"): string {
  const exact = lookup(value);
  if (exact) return exact[script];

  const versus = value.split(/\s+vs\.?\s+|\s+v\s+/i);
  if (versus.length === 2) {
    const left = translateOne(versus[0].trim(), script);
    const right = translateOne(versus[1].trim(), script);
    return `${left}${script === "hant" ? "對" : "对"}${right}`;
  }

  const parts = value.split(/(\s+vs\.?\s+|\s+v\s+|: )/i);
  if (parts.length > 1) {
    return parts
      .map((part) => {
        if (/^\s*vs\.?\s*$/i.test(part)) return script === "hant" ? "對" : "对";
        if (part === ": ") return "：";
        return translateOne(part.trim(), script) || part;
      })
      .join("");
  }

  return value;
}

export function localizeText(en: string): LocalizedText {
  const source = en.trim();
  if (!source) return { hant: "", hans: "", en: "" };
  return {
    hant: translateOne(source, "hant"),
    hans: translateOne(source, "hans"),
    en: source,
  };
}

export function trilingual(en?: string | null): string {
  if (!en) return "";
  const text = localizeText(en);
  if (text.hant === text.hans && text.hant === text.en) return text.en;
  if (text.hant === text.hans) return `${text.hant} / ${text.en}`;
  if (text.hant === text.en) return `${text.hans} / ${text.en}`;
  return `${text.hant} / ${text.hans} / ${text.en}`;
}

export function eventHeadline(league: string, title: string): LocalizedText {
  const localizedTitle = localizeText(title);
  const localizedLeague = league ? localizeText(league) : null;
  if (!localizedLeague) return localizedTitle;
  return {
    hant: `${localizedLeague.hant}：${localizedTitle.hant}`,
    hans: `${localizedLeague.hans}：${localizedTitle.hans}`,
    en: `${localizedLeague.en}: ${localizedTitle.en}`,
  };
}

export function eventSummary(league: string, title: string): string {
  const headline = eventHeadline(league, title);
  const parts = [headline.hant];
  if (headline.hans !== headline.hant) parts.push(headline.hans);
  if (headline.en !== headline.hant && headline.en !== headline.hans) parts.push(headline.en);
  return parts.join(" / ");
}

export function eventDescription(input: {
  league: string;
  title: string;
  location?: string;
  description?: string;
  timeConfirmed: boolean;
}): string {
  const headline = eventHeadline(input.league, input.title);
  const venue = input.location ? localizeText(input.location) : null;
  const lines = [
    `繁：${headline.hant}`,
    `简：${headline.hans}`,
    `EN: ${headline.en}`,
  ];
  if (venue) {
    lines.push(`場地：${venue.hant}`, `场地：${venue.hans}`, `Venue: ${venue.en}`);
  }
  if (!input.timeConfirmed) {
    lines.push("開賽時間未定", "开赛时间未定", "Kickoff time is not confirmed yet.");
  }
  if (input.description) lines.push(input.description);
  lines.push("賽程來自 Sporttime，時間或會改期。", "赛程来自 Sporttime，时间可能会改期。", "Times follow the source feed and may change.");
  return lines.join("\n");
}
