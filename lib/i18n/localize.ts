import type { Locale } from "@/lib/i18n/dictionaries";
import { lookupName } from "@/lib/i18n/names";

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
  description?: string;
  timeConfirmed: boolean;
}): string {
  const headline = eventHeadline(input.league, input.title);
  const venue = input.location ? localizeText(input.location) : null;
  let paragraph = `${headline.hant}。`;
  if (headline.en !== headline.hant) paragraph += `${headline.en}. `;
  if (venue) {
    paragraph += venue.hant === venue.en ? `地點：${venue.en}。` : `比賽在${venue.hant}舉行。`;
  }
  if (!input.timeConfirmed) {
    paragraph += "開賽時間尚未確定。";
  }
  if (input.description) {
    paragraph += input.description.trim().endsWith("。") ? input.description : `${input.description}。`;
  }
  paragraph += "賽程來自 Sporttime，時間或會改期。";
  return paragraph;
}
