import { CalendarSubscribe } from "@/components/calendar-subscribe";
import { RestoreFeedForm } from "@/components/restore-feed";
import { SignInButton } from "@/components/auth-buttons";
import { AppFrame } from "@/components/app-frame";
import { SettingsForm } from "@/app/settings/settings-form";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { calendarFeedUrl } from "@/lib/urls";

function isGuestEmail(email: string) {
  return email.endsWith("@sporttime.local") || email.startsWith("guest-");
}

export default async function SettingsPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const feedUrl = calendarFeedUrl(user.feed_token!);
  const guest = isGuestEmail(user.email);

  return (
    <AppFrame t={t} locale={locale} narrow>
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.settings}</h1>
      {guest ? (
        <div className="mt-8 card space-y-3 p-6">
          <p className="text-[var(--muted)]">{t.signInHelp}</p>
          <SignInButton label={t.signIn} pendingLabel={t.signingIn} locale={locale} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">{user.email}</p>
      )}
      <div className="mt-8">
        <CalendarSubscribe feedUrl={feedUrl} t={t} />
      </div>
      <RestoreFeedForm t={t} />
      <SettingsForm
        reminderMinutes={user.reminder_minutes}
        saveLabel={t.save}
        remindersLabel={t.reminders}
        reminderHelp={t.reminderHelp}
        resetFeedLabel={t.resetFeed}
        savedLabel={t.saved}
        saveFailedLabel={t.saveFailed}
      />
    </AppFrame>
  );
}
