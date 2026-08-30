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

export function formatLocalized(text: LocalizedText): string {
  if (!text.hant && !text.en) return "";
  if (text.hant === text.hans && text.hant === text.en) return text.en;
  if (text.hant === text.hans || text.hans === text.en) return `${text.hant}（${text.en}）`;
  if (text.hant === text.en) return `${text.hans}（${text.en}）`;
  return `${text.hant}（簡體：${text.hans}；${text.en}）`;
}

export function trilingual(en?: string | null): string {
  if (!en) return "";
  return formatLocalized(localizeText(en));
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
  return formatLocalized(eventHeadline(league, title));
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
  let paragraph = `繁體是${headline.hant}`;
  if (headline.hans !== headline.hant) paragraph += `，簡體是${headline.hans}`;
  if (headline.en !== headline.hant) paragraph += `，英文是 ${headline.en}`;
  paragraph += "。";
  if (venue) {
    paragraph +=
      venue.hant === venue.en ? `比賽在${venue.hant}舉行。` : `比賽在${venue.hant}舉行（${venue.en}）。`;
  }
  if (!input.timeConfirmed) {
    paragraph += "開賽時間尚未確定。";
  }
  if (input.description) paragraph += input.description.trim().endsWith("。") ? input.description : `${input.description}。`;
  paragraph += "賽程來自 Sporttime，時間或會改期。";
  return paragraph;
}
