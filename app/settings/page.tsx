import { CalendarSubscribe, type CalendarFeedOption } from "@/components/calendar-subscribe";
import { RestoreFeedForm } from "@/components/restore-feed";
import { SignInButton, SignOutButton } from "@/components/auth-buttons";
import { AppFrame } from "@/components/app-frame";
import { SettingsForm } from "@/app/settings/settings-form";
import { horizonFeedUrl, sportFeedUrl, uniqueEventSports } from "@/lib/calendar/feed";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary, interpolate } from "@/lib/i18n";
import { displayName } from "@/lib/i18n/localize";
import { eventsForPreview } from "@/lib/sync/engine";
import {
  resolveTimeZone,
  TIME_ZONES,
  timeZoneCity,
  timeZoneClockLabel,
  timeZoneGroupLabel,
} from "@/lib/timezone";
import { ticketmasterConfigured } from "@/lib/sports/ticketmaster";
import { calendarFeedUrl } from "@/lib/urls";
import { formatDateTime } from "@/lib/utils";

function isGuestEmail(email: string) {
  return email.endsWith("@sporttime.local") || email.startsWith("guest-");
}

export default async function SettingsPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const feedUrl = calendarFeedUrl(user.feed_token!);
  const guest = isGuestEmail(user.email);
  const timeZone = resolveTimeZone(user.timezone);
  const events = await eventsForPreview(user.id).catch(() => []);
  const feeds: CalendarFeedOption[] = [
    { label: t.feedWeekAhead, url: horizonFeedUrl(user.feed_token!, 7) },
    ...uniqueEventSports(events).map((sport) => ({
      label: displayName(sport, locale),
      url: sportFeedUrl(user.feed_token!, sport),
    })),
  ];
  const timezones = TIME_ZONES.map((item) => ({
    ...item,
    label: `${timeZoneCity(item.id, locale)} · ${timeZoneClockLabel(item.id, locale)}`,
    groupLabel: timeZoneGroupLabel(item.group, locale),
  }));

  return (
    <AppFrame t={t} locale={locale} narrow>
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.settings}</h1>
      {guest ? (
        <div className="mt-8 card space-y-3 p-6">
          <p className="text-[var(--muted)]">{t.signInHelp}</p>
          <SignInButton label={t.signIn} pendingLabel={t.signingIn} locale={locale} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
          <SignOutButton label={t.signOut} />
        </div>
      )}
      <section className="mt-8 card space-y-2 p-6">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl">{t.feedHealthTitle}</h2>
        <p className="text-sm text-[var(--muted)]">{interpolate(t.feedEventCount, { count: events.length })}</p>
        {user.feed_built_at ? (
          <p className="text-sm text-[var(--muted)]">
            {interpolate(t.feedBuiltAt, { time: formatDateTime(new Date(Number(user.feed_built_at)).toISOString(), locale, timeZone) })}
          </p>
        ) : null}
      </section>
      <div className="mt-8">
        <CalendarSubscribe feedUrl={feedUrl} t={t} feeds={feeds} />
      </div>
      <RestoreFeedForm t={t} />
      <SettingsForm
        reminderMinutes={user.reminder_minutes}
        timezone={timeZone}
        timezones={timezones}
        includeAppearances={Boolean(user.include_appearances)}
        appearancesAvailable={ticketmasterConfigured()}
        saveLabel={t.save}
        remindersLabel={t.reminders}
        reminderHelp={t.reminderHelp}
        timezoneLabel={t.timezone}
        timezoneHelp={t.timezoneHelp}
        includeAppearancesLabel={t.includeAppearances}
        includeAppearancesHelp={t.includeAppearancesHelp}
        resetFeedLabel={t.resetFeed}
        savedLabel={t.saved}
        saveFailedLabel={t.saveFailed}
      />
    </AppFrame>
  );
}
