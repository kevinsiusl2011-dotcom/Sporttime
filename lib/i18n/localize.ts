import type { Locale } from "@/lib/i18n/dictionaries";
import { lookupName } from "@/lib/i18n/names";
import { formatDateTime } from "@/lib/utils";

export type LocalizedText = {
  hant: string;
  hans: string;
  en: string;
};

function joinVersus(left: string, right: string, vs: string): string {
  const leftGap = /[A-Za-z0-9)]$/.test(left) ? " " : "";
  const rightGap = /^[A-Za-z0-9(]/.test(right) ? " " : "";
  return `${left}${leftGap}${vs}${rightGap}${right}`;
}

function translateOne(value: string, script: "hant" | "hans"): string {
  const exact = lookupName(value);
  if (exact) return exact[script];

  const versus = value.split(/\s+vs\.?\s+|\s+v\s+/i);
  if (versus.length === 2) {
    const leftRaw = versus[0].trim();
    const rightRaw = versus[1].trim();
    const left = translateOne(leftRaw, script);
    const right = translateOne(rightRaw, script);
    if (left === leftRaw && right === rightRaw) return value;
    return joinVersus(left, right, script === "hant" ? "對" : "对");
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

function chineseLine(text: LocalizedText, locale: Locale): string {
  if (locale === "zh-Hans") return text.hans || text.hant || text.en;
  return text.hant || text.en;
}

export function pickLocalized(text: LocalizedText, locale: Locale = "zh-Hant"): string {
  if (locale === "en") return text.en;
  return chineseLine(text, locale);
}

export type NameLines = { primary: string; secondary?: string };

export function nameLines(en?: string | null, locale: Locale = "zh-Hant"): NameLines {
  if (!en) return { primary: "" };
  const text = localizeText(en);
  if (locale === "en") return { primary: text.en };
  const zh = chineseLine(text, locale);
  if (zh === text.en) return { primary: text.en };
  return { primary: zh, secondary: text.en };
}

export function joinedNameLines(
  values: Array<string | null | undefined>,
  locale: Locale,
  separator = " · ",
): NameLines {
  const texts = values.filter((value): value is string => Boolean(value?.trim())).map((value) => localizeText(value));
  if (texts.length === 0) return { primary: "" };
  if (locale === "en") return { primary: texts.map((text) => text.en).join(separator) };
  const zh = texts.map((text) => chineseLine(text, locale)).join(separator);
  const en = texts.map((text) => text.en).join(separator);
  if (zh === en) return { primary: en };
  return { primary: zh, secondary: en };
}

export function displayName(en?: string | null, locale: Locale = "zh-Hant"): string {
  return nameLines(en, locale).primary;
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
  return pickLocalized(eventHeadline(league, title), "zh-Hant");
}

export function eventDescription(input: {
  league: string;
  title: string;
  location?: string;
  timeConfirmed: boolean;
  start?: string;
  home?: string;
  away?: string;
}): string {
  const headline = eventHeadline(input.league, input.title);
  const lines: string[] = [headline.hant];
  if (headline.en !== headline.hant) lines.push(headline.en);
  lines.push("");

  if (input.start && input.timeConfirmed) {
    lines.push(`開波：${formatDateTime(input.start, "zh-Hant")}`);
    lines.push(`Kickoff: ${formatDateTime(input.start, "en")}`);
  } else {
    lines.push("開賽時間尚未確定。Kickoff time is not confirmed.");
  }

  if (input.home) {
    const home = localizeText(input.home);
    lines.push(home.hant === home.en ? `主隊：${home.en}` : `主隊：${home.hant} / ${home.en}`);
  }
  if (input.away) {
    const away = localizeText(input.away);
    lines.push(away.hant === away.en ? `客隊：${away.en}` : `客隊：${away.hant} / ${away.en}`);
  }
  if (input.location) {
    const venue = localizeText(input.location);
    lines.push(venue.hant === venue.en ? `地點：${venue.en}` : `地點：${venue.hant} / ${venue.en}`);
  }

  lines.push("");
  lines.push("用嚟排程，唔提供即時比分。時間或會改期。");
  lines.push("For planning your week — not live scores. Times may change.");
  return lines.join("\n");
}
