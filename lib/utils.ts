import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function absoluteUrl(path = ""): string {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export const DEFAULT_TIME_ZONE = "Asia/Hong_Kong";

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
  if (locale === "zh-Hant") return `${clock}（香港時間）`;
  if (locale === "zh-Hans") return `${clock}（香港时间）`;
  return `${clock} HKT`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
