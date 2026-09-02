"use client";

import { useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { formatKickoffRelative } from "@/lib/sports/schedule";

export function KickoffWhen({
  start,
  end,
  timeConfirmed,
  locale,
  t,
  timeZone,
}: {
  start: string;
  end: string;
  timeConfirmed: boolean;
  locale: Locale;
  timeZone?: string;
  t: Pick<
    Dictionary,
    | "timeTbd"
    | "inProgress"
    | "kickoffInMinutes"
    | "kickoffInHours"
    | "kickoffInDays"
    | "kickoffToday"
    | "kickoffTomorrow"
  >;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const label = formatKickoffRelative(start, end, timeConfirmed, locale, t, new Date(now), timeZone);
  if (!label) return null;
  return (
    <span className="text-sm font-medium text-[var(--accent)]" suppressHydrationWarning>
      {label}
    </span>
  );
}
