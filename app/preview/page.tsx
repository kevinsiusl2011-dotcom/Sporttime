import { Suspense } from "react";
import { CalendarSubscribe, type CalendarFeedOption } from "@/components/calendar-subscribe";
import { SchedulePlanner } from "@/components/schedule-planner";
import { AppFrame } from "@/components/app-frame";
import { horizonFeedUrl, sportFeedUrl } from "@/lib/calendar/feed";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { displayName } from "@/lib/i18n/localize";
import { eventsForPreview } from "@/lib/sync/engine";
import { resolveTimeZone, timeZoneClockLabel } from "@/lib/timezone";
import { calendarFeedUrl } from "@/lib/urls";

export default async function PreviewPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const feedUrl = calendarFeedUrl(user.feed_token!);
  const follows = await listFollows(user.id);
  const timeZone = resolveTimeZone(user.timezone);
  const sports = [...new Set(follows.map((follow) => follow.sport).filter((sport): sport is string => Boolean(sport)))];
  const feeds: CalendarFeedOption[] = [
    { label: t.feedWeekAhead, url: horizonFeedUrl(user.feed_token!, 7) },
    ...sports.map((sport) => ({
      label: displayName(sport, locale),
      url: sportFeedUrl(user.feed_token!, sport),
    })),
  ];

  return (
    <AppFrame t={t} locale={locale}>
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.preview}</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.previewHelp}</p>
      <div className="mt-6">
        <CalendarSubscribe feedUrl={feedUrl} t={t} feeds={feeds} />
      </div>
      <section className="mt-10">
        <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.upcoming}</h2>
        <Suspense fallback={<p className="text-[var(--muted)]">{t.loadingEvents}</p>}>
          <UpcomingEvents
            userId={user.id}
            t={t}
            locale={locale}
            timeZone={timeZone}
            timeZoneLabel={timeZoneClockLabel(timeZone, locale)}
            empty={follows.length === 0 ? t.emptyEventsNoFollows : t.emptyEvents}
            emptyHref="/browse"
            emptyCta={t.landingCta}
          />
        </Suspense>
      </section>
    </AppFrame>
  );
}

async function UpcomingEvents({
  userId,
  t,
  locale,
  timeZone,
  timeZoneLabel,
  empty,
  emptyHref,
  emptyCta,
}: {
  userId: string;
  t: Dictionary;
  locale: Locale;
  timeZone: string;
  timeZoneLabel: string;
  empty: string;
  emptyHref?: string;
  emptyCta?: string;
}) {
  const events = await eventsForPreview(userId);
  return (
    <SchedulePlanner
      events={events}
      t={t}
      locale={locale}
      timeZone={timeZone}
      timeZoneLabel={timeZoneLabel}
      empty={empty}
      emptyHref={emptyHref}
      emptyCta={emptyCta}
    />
  );
}
