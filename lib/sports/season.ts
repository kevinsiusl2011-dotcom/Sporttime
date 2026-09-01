import { DEFAULT_TIME_ZONE } from "@/lib/utils";

const CALENDAR_YEAR_SPORTS = new Set([
  "Motorsport",
  "Tennis",
  "Cycling",
  "Baseball",
  "Golf",
  "MMA",
  "Fighting",
  "Boxing",
  "Esports",
  "ESports",
  "Athletics",
  "Darts",
  "Snooker",
  "Australian Football",
  "American Football",
  "Field Hockey",
  "Badminton",
  "Table Tennis",
  "Netball",
  "Skiing",
  "Skating",
  "Wintersports",
  "Watersports",
  "Multi Sports",
  "Gaelic",
]);

function hongKongYearMonth(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
  };
}

export function currentSeason(sport = "Soccer", now = new Date()): string {
  const { year, month } = hongKongYearMonth(now);
  if (CALENDAR_YEAR_SPORTS.has(sport)) return String(year);
  if (month >= 7) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

export function nearbySeasons(sport = "Soccer", now = new Date()): string[] {
  const current = currentSeason(sport, now);
  if (!current.includes("-")) {
    const year = Number(current);
    return [String(year), String(year - 1), String(year + 1)];
  }
  const [start] = current.split("-").map(Number);
  return [
    `${start}-${start + 1}`,
    `${start - 1}-${start}`,
    `${start + 1}-${start + 2}`,
  ];
}
