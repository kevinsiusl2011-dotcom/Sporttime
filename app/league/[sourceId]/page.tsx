import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { CalendarSubscribe } from "@/components/calendar-subscribe";
import { EntityFanZone } from "@/components/entity-fan-zone";
import { LeadGenBanner } from "@/components/lead-gen-banner";
import { SchedulePlanner } from "@/components/schedule-planner";
import { companyBranding } from "@/lib/branding";
import { publicLeagueCalendarUrl } from "@/lib/urls";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { displayName } from "@/lib/i18n/localize";
import { findCatalogLeague } from "@/lib/sports/catalog";
import { popularTeamsForLeague } from "@/lib/sports/popular-teams";
import { eventsForEntity } from "@/lib/sync/engine";
import { resolveTimeZone, timeZoneClockLabel } from "@/lib/timezone";

type Params = Promise<{ sourceId: string }>;

export default async function LeaguePage({ params }: { params: Params }) {
  const sourceId = (await params).sourceId;
  const league = findCatalogLeague(sourceId);
  if (!league) notFound();
  const { t, locale } = await getDictionary();
  const company = companyBranding();
  const timeZone = resolveTimeZone("Asia/Hong_Kong");
  const icsUrl = publicLeagueCalendarUrl(league.id);
  const events = await eventsForEntity("league", league.id, league.sport);
  const teams = popularTeamsForLeague(league.id).slice(0, 12);
  const title = displayName(league.name, locale);

  return (
    <AppFrame t={t} locale={locale as Locale}>
      <header className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        {league.badge ? (
          <div className="shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-2 md:h-28 md:w-28">
              <img
                src={league.badge}
                alt={t.leagueBadgeAlt}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.14em] text-[var(--gold)] uppercase">
            {displayName(league.sport, locale)}
            {league.country ? (
              <span className="ml-2 text-[var(--muted)]">
                · {displayName(league.country, locale)}
              </span>
            ) : null}
          </p>
          <h1 className="mt-2 min-w-0 font-[family-name:var(--font-serif)] text-3xl leading-tight md:text-5xl">
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/browse" className="btn-ghost rounded-full px-4 py-2 text-sm">
              ← {(t as Dictionary & { browseAllLeagues?: string }).browseAllLeagues || t.browseLeagues}
            </Link>
            <Link
              href="/"
              className="btn-ghost rounded-full px-4 py-2 text-sm"
            >
              🏠 {t.backToHome}
            </Link>
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl">
          {t.leagueCalendarTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">{t.leagueCalendarBody}</p>
        <div className="mt-6">
            <CalendarSubscribe
              t={t}
              feedUrl={icsUrl}
              feeds={[
                { label: t.leagueCalendarTitle, url: icsUrl },
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

      {teams.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl md:text-3xl">
            {t.browseTeamMatches.replace(/呢隊|該隊|this team/gi, "Popular Clubs")}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <li key={team.id}>
                <Link
                  href={`/club/${encodeURIComponent(team.id)}`}
                  className="group card flex items-center justify-between gap-3 p-4 transition hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--line))]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {team.badge ? (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-1">
                        <img
                          src={team.badge}
                          alt={t.teamBadgeAlt}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {displayName(team.name, locale)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--muted)] transition group-hover:text-[var(--accent)]">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14">
        <EntityFanZone t={t} kind="league" sourceId={league.id} />
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
