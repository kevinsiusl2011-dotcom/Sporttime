import type { Locale } from "@/lib/i18n/dictionaries";

export const DEFAULT_TIME_ZONE = "Asia/Hong_Kong";

export type TimeZoneOption = {
  id: string;
  group: "asia" | "oceania" | "europe" | "americas";
};

export const TIME_ZONES: TimeZoneOption[] = [
  { id: "Asia/Hong_Kong", group: "asia" },
  { id: "Asia/Taipei", group: "asia" },
  { id: "Asia/Shanghai", group: "asia" },
  { id: "Asia/Tokyo", group: "asia" },
  { id: "Asia/Seoul", group: "asia" },
  { id: "Asia/Singapore", group: "asia" },
  { id: "Asia/Bangkok", group: "asia" },
  { id: "Asia/Kuala_Lumpur", group: "asia" },
  { id: "Asia/Kolkata", group: "asia" },
  { id: "Asia/Dubai", group: "asia" },
  { id: "Australia/Sydney", group: "oceania" },
  { id: "Australia/Melbourne", group: "oceania" },
  { id: "Pacific/Auckland", group: "oceania" },
  { id: "Europe/London", group: "europe" },
  { id: "Europe/Paris", group: "europe" },
  { id: "Europe/Berlin", group: "europe" },
  { id: "Europe/Madrid", group: "europe" },
  { id: "Europe/Rome", group: "europe" },
  { id: "Europe/Amsterdam", group: "europe" },
  { id: "America/New_York", group: "americas" },
  { id: "America/Chicago", group: "americas" },
  { id: "America/Denver", group: "americas" },
  { id: "America/Los_Angeles", group: "americas" },
  { id: "America/Toronto", group: "americas" },
  { id: "America/Sao_Paulo", group: "americas" },
  { id: "UTC", group: "europe" },
];

const CITY_LABELS: Record<string, { hant: string; hans: string; en: string }> = {
  "Asia/Hong_Kong": { hant: "香港", hans: "香港", en: "Hong Kong" },
  "Asia/Taipei": { hant: "台北", hans: "台北", en: "Taipei" },
  "Asia/Shanghai": { hant: "上海", hans: "上海", en: "Shanghai" },
  "Asia/Tokyo": { hant: "東京", hans: "东京", en: "Tokyo" },
  "Asia/Seoul": { hant: "首爾", hans: "首尔", en: "Seoul" },
  "Asia/Singapore": { hant: "新加坡", hans: "新加坡", en: "Singapore" },
  "Asia/Bangkok": { hant: "曼谷", hans: "曼谷", en: "Bangkok" },
  "Asia/Kuala_Lumpur": { hant: "吉隆坡", hans: "吉隆坡", en: "Kuala Lumpur" },
  "Asia/Kolkata": { hant: "印度", hans: "印度", en: "India" },
  "Asia/Dubai": { hant: "杜拜", hans: "迪拜", en: "Dubai" },
  "Australia/Sydney": { hant: "悉尼", hans: "悉尼", en: "Sydney" },
  "Australia/Melbourne": { hant: "墨爾本", hans: "墨尔本", en: "Melbourne" },
  "Pacific/Auckland": { hant: "奧克蘭", hans: "奥克兰", en: "Auckland" },
  "Europe/London": { hant: "倫敦", hans: "伦敦", en: "London" },
  "Europe/Paris": { hant: "巴黎", hans: "巴黎", en: "Paris" },
  "Europe/Berlin": { hant: "柏林", hans: "柏林", en: "Berlin" },
  "Europe/Madrid": { hant: "馬德里", hans: "马德里", en: "Madrid" },
  "Europe/Rome": { hant: "羅馬", hans: "罗马", en: "Rome" },
  "Europe/Amsterdam": { hant: "阿姆斯特丹", hans: "阿姆斯特丹", en: "Amsterdam" },
  "America/New_York": { hant: "紐約", hans: "纽约", en: "New York" },
  "America/Chicago": { hant: "芝加哥", hans: "芝加哥", en: "Chicago" },
  "America/Denver": { hant: "丹佛", hans: "丹佛", en: "Denver" },
  "America/Los_Angeles": { hant: "洛杉磯", hans: "洛杉矶", en: "Los Angeles" },
  "America/Toronto": { hant: "多倫多", hans: "多伦多", en: "Toronto" },
  "America/Sao_Paulo": { hant: "聖保羅", hans: "圣保罗", en: "São Paulo" },
  UTC: { hant: "世界協調時間", hans: "世界协调时间", en: "UTC" },
};

export const TIME_ZONE_GROUPS: Record<TimeZoneOption["group"], { hant: string; hans: string; en: string }> = {
  asia: { hant: "亞洲", hans: "亚洲", en: "Asia" },
  oceania: { hant: "大洋洲", hans: "大洋洲", en: "Oceania" },
  europe: { hant: "歐洲／UTC", hans: "欧洲／UTC", en: "Europe / UTC" },
  americas: { hant: "美洲", hans: "美洲", en: "Americas" },
};

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function resolveTimeZone(value?: string | null): string {
  if (value && isValidTimeZone(value)) return value;
  return DEFAULT_TIME_ZONE;
}

function pickLabel(entry: { hant: string; hans: string; en: string }, locale: Locale) {
  if (locale === "en") return entry.en;
  if (locale === "zh-Hans") return entry.hans;
  return entry.hant;
}

export function timeZoneCity(timeZone: string, locale: Locale): string {
  const entry = CITY_LABELS[timeZone];
  if (entry) return pickLabel(entry, locale);
  const city = timeZone.split("/").at(-1)?.replaceAll("_", " ") ?? timeZone;
  return city;
}

export function timeZoneGroupLabel(group: TimeZoneOption["group"], locale: Locale): string {
  return pickLabel(TIME_ZONE_GROUPS[group], locale);
}

export function timeZoneShortName(timeZone: string, locale: Locale, at = new Date()): string {
  if (timeZone === "Asia/Hong_Kong") {
    return locale === "en" ? "HKT" : locale === "zh-Hans" ? "香港时间" : "香港時間";
  }
  if (timeZone === "UTC") return "UTC";
  const parts = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale === "zh-Hans" ? "zh-CN" : "zh-HK", {
    timeZone,
    timeZoneName: "shortGeneric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  return parts.find((part) => part.type === "timeZoneName")?.value || timeZoneCity(timeZone, locale);
}

export function timeZoneClockLabel(timeZone: string, locale: Locale): string {
  const city = timeZoneCity(timeZone, locale);
  if (timeZone === "Asia/Hong_Kong") {
    return locale === "en" ? "Hong Kong time" : locale === "zh-Hans" ? "香港时间" : "香港時間";
  }
  if (locale === "en") return `${city} time`;
  if (locale === "zh-Hans") return `${city}时间`;
  return `${city}時間`;
}

export function zonedHour(iso: string, timeZone: string): number {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 0;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Number(parts.find((part) => part.type === "hour")?.value ?? 0);
}
