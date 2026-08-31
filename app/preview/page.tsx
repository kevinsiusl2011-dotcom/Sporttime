import { Suspense } from "react";
import { CalendarSubscribe } from "@/components/calendar-subscribe";
import { EventList } from "@/components/event-list";
import { Nav } from "@/components/nav";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { calendarFeedUrl } from "@/lib/urls";
import { eventsForPreview } from "@/lib/sync/engine";

export default async function PreviewPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const feedUrl = calendarFeedUrl(user.feed_token!);
  const follows = await listFollows(user.id);

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.preview}</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.autoUpdateNote}</p>
        <div className="mt-6">
          <CalendarSubscribe feedUrl={feedUrl} t={t} />
        </div>
        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.upcoming}</h2>
          <Suspense fallback={<p className="text-[var(--muted)]">{t.loadingEvents}</p>}>
            <UpcomingEvents
              userId={user.id}
              t={t}
              locale={locale}
              empty={follows.length === 0 ? t.emptyEventsNoFollows : t.emptyEvents}
              emptyHref="/browse"
              emptyCta={t.landingCta}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

async function UpcomingEvents({
  userId,
  t,
  locale,
  empty,
  emptyHref,
  emptyCta,
}: {
  userId: string;
  t: Dictionary;
  locale: Locale;
  empty: string;
  emptyHref?: string;
  emptyCta?: string;
}) {
  const events = await eventsForPreview(userId);
  return (
    <EventList
      events={events}
      t={t}
      locale={locale}
      empty={empty}
      emptyHref={emptyHref}
      emptyCta={emptyCta}
    />
  );
}
