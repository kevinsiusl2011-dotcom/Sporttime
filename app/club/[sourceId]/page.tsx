import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { CalendarSubscribe } from "@/components/calendar-subscribe";
import { EntityFanZone } from "@/components/entity-fan-zone";
import { LeadGenBanner } from "@/components/lead-gen-banner";
import { SchedulePlanner } from "@/components/schedule-planner";
import { companyBranding } from "@/lib/branding";
import { publicTeamCalendarUrl } from "@/lib/urls";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { displayName } from "@/lib/i18n/localize";
import { lookupTeam } from "@/lib/sports/thesportsdb";
import { eventsForEntity } from "@/lib/sync/engine";
import { resolveTimeZone, timeZoneClockLabel } from "@/lib/timezone";

type Params = Promise<{ sourceId: string }>;

export default async function TeamPage({ params }: { params: Params }) {
  const sourceId = (await params).sourceId;
  const team = await lookupTeam(sourceId);
  if (!team) notFound();
  const { t, locale } = await getDictionary();
  const company = companyBranding();
  const timeZone = resolveTimeZone("Asia/Hong_Kong");
  const icsUrl = publicTeamCalendarUrl(team.id);
  const events = await eventsForEntity("team", team.id, team.sport);
  const title = displayName(team.name, locale);

  return (
    <AppFrame t={t} locale={locale as Locale}>
      <header className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        {team.badge ? (
          <div className="shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-2 md:h-28 md:w-28">
              <img
                src={team.badge}
                alt={t.teamBadgeAlt}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.14em] text-[var(--gold)] uppercase">
            {displayName(team.sport || "Sport", locale)}
            {team.country ? (
              <span className="ml-2 text-[var(--muted)]">· {displayName(team.country, locale)}</span>
            ) : null}
            {team.league ? (
              <span className="ml-2 text-[var(--muted)]">· {displayName(team.league, locale)}</span>
            ) : null}
          </p>
          <h1 className="mt-2 min-w-0 font-[family-name:var(--font-serif)] text-3xl leading-tight md:text-5xl">
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/browse" className="btn-ghost rounded-full px-4 py-2 text-sm">
              ← {(t as Dictionary & { browseAllLeagues?: string }).browseAllLeagues || t.browseLeagues}
            </Link>
            {team.leagueId ? (
              <Link
                href={`/league/${encodeURIComponent(team.leagueId)}`}
                className="btn-ghost rounded-full px-4 py-2 text-sm"
              >
                🏆 {displayName(team.league ?? team.leagueId, locale)}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl">
          {t.teamCalendarTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">{t.teamCalendarBody}</p>
        <div className="mt-6">
            <CalendarSubscribe
              t={t}
              feedUrl={icsUrl}
              feeds={[
                { label: t.teamCalendarTitle, url: icsUrl },
                { label: t.feedWeekAhead, url: icsUrl },
              ]}
            />
          </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">
          {t.nextMatches}
        </h2>
        <SchedulePlanner
          events={events}
          t={t}
          locale={locale as Locale}
          timeZone={timeZone}
          timeZoneLabel={timeZoneClockLabel(timeZone, locale as Locale)}
          empty={t.noUpcoming}
        />
      </section>

      <section className="mt-14">
        <EntityFanZone t={t} kind="team" sourceId={team.id} />
      </section>

      <div className="mt-14">
        <LeadGenBanner
          t={t}
          variant="footer"
          companyName={company.name}
          companyUrl={company.url}
          companyTagline={company.tagline}
        />
      </div>
    </AppFrame>
  );
}
