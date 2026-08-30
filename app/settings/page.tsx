import { CalendarSubscribe } from "@/components/calendar-subscribe";
import { Nav } from "@/components/nav";
import { SettingsForm } from "@/app/settings/settings-form";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { calendarFeedUrl, googleSubscribeUrl } from "@/lib/urls";

export default async function SettingsPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const feedUrl = calendarFeedUrl(user.feed_token!);

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.settings}</h1>
        <div className="mt-8">
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
        <SettingsForm
          reminderMinutes={user.reminder_minutes}
          saveLabel={t.save}
          remindersLabel={t.reminders}
          reminderHelp={t.reminderHelp}
          resetFeedLabel={t.resetFeed}
        />
      </main>
    </div>
  );
}
