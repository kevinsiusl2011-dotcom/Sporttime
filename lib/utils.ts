import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function absoluteUrl(path = ""): string {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export const DEFAULT_TIME_ZONE = "Asia/Hong_Kong";

export function formatDateTime(iso: string, locale: string, timeZone = DEFAULT_TIME_ZONE): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const clockLocale = locale === "zh-Hant" ? "zh-HK" : locale === "zh-Hans" ? "zh-CN" : "en-GB";
  const clock = new Intl.DateTimeFormat(clockLocale, {
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
