import { CalendarSubscribe } from "@/components/calendar-subscribe";
import { EventList } from "@/components/event-list";
import { Nav } from "@/components/nav";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { collectUpcoming } from "@/lib/sync/engine";
import { calendarFeedUrl, googleSubscribeUrl } from "@/lib/urls";

export default async function PreviewPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const events = await collectUpcoming(user.id);
  const feedUrl = calendarFeedUrl(user.feed_token!);

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.preview}</h1>
        <div className="mt-6">
          <CalendarSubscribe
            feedUrl={feedUrl}
            googleUrl={googleSubscribeUrl(feedUrl)}
            title={t.subscribeTitle}
            help={t.calendarHelp}
            copyLabel={t.copyLink}
            copiedLabel={t.copied}
            addGoogleLabel={t.addToGoogle}
          />
        </div>
        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.upcoming}</h2>
          <EventList events={events} t={t} locale={locale} empty={t.emptyEvents} />
        </section>
      </main>
    </div>
  );
}
