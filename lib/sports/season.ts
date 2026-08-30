const CALENDAR_YEAR_SPORTS = new Set([
  "Motorsport",
  "Tennis",
  "Cycling",
  "Baseball",
  "Golf",
  "MMA",
  "Fighting",
  "Boxing",
]);

export function currentSeason(sport = "Soccer", now = new Date()): string {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
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
