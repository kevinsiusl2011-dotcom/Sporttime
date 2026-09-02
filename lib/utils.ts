import { clsx, type ClassValue } from "clsx";
import { DEFAULT_TIME_ZONE, timeZoneShortName } from "@/lib/timezone";

export { DEFAULT_TIME_ZONE };

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function absoluteUrl(path = ""): string {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function clockLocale(locale: string) {
  return locale === "zh-Hant" ? "zh-HK" : locale === "zh-Hans" ? "zh-CN" : "en-GB";
}

export function zonedYmd(iso: string, timeZone = DEFAULT_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, (day ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

export function formatDayLabel(iso: string, locale: string, timeZone = DEFAULT_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(clockLocale(locale), {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(date);
}

export function formatTime(iso: string, locale: string, timeZone = DEFAULT_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(clockLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(date);
}

export function formatDateTime(iso: string, locale: string, timeZone = DEFAULT_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const clock = new Intl.DateTimeFormat(clockLocale(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(date);
  const zone =
    locale === "zh-Hant" || locale === "zh-Hans" || locale === "en"
      ? timeZoneShortName(timeZone, locale)
      : timeZone;
  if (locale === "zh-Hant" || locale === "zh-Hans") return `${clock}（${zone}）`;
  return `${clock} ${zone}`;
}

export function formatWeekdayShort(iso: string, locale: string, timeZone = DEFAULT_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(clockLocale(locale), {
    weekday: "short",
    timeZone,
  }).format(date);
}

export function isoOnZonedDay(ymd: string, timeZone: string): string {
  const utcMidnight = Date.parse(`${ymd}T00:00:00.000Z`);
  if (Number.isNaN(utcMidnight)) return `${ymd}T12:00:00.000Z`;
  for (let hour = -14; hour <= 20; hour += 1) {
    const iso = new Date(utcMidnight + hour * 3_600_000).toISOString();
    if (zonedYmd(iso, timeZone) === ymd) return iso;
  }
  return `${ymd}T12:00:00.000Z`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
