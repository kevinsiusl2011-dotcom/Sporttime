import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { EventList } from "@/components/event-list";
import { FollowButton } from "@/components/follow-button";
import { BilingualName } from "@/components/bilingual-name";
import { entityIsFollowed, followedSet, listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { findCatalogLeague } from "@/lib/sports/catalog";
import { listLeagueTeams, lookupLeague, seasonEvents } from "@/lib/sports/thesportsdb";
import type { CatalogLeague } from "@/lib/sports/types";

export default async function LeaguePage({ params }: { params: Promise<{ leagueId: string }> }) {
  const user = await ensureUserRecord();
  const { leagueId } = await params;
  const league = (await lookupLeague(leagueId)) ?? findCatalogLeague(leagueId);
  if (!league) notFound();

  const { t, locale } = await getDictionary();
  const follows = await listFollows(user.id);
  const following = followedSet(follows);
  const followingIds = [...following];

  return (
    <AppFrame t={t} locale={locale} wide>
      <p className="text-sm text-[var(--gold)]">
        <BilingualName values={[league.sport, league.country]} locale={locale} />
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">
          <BilingualName value={league.name} locale={locale} />
        </h1>
        <FollowButton
          kind="league"
          sourceId={league.id}
          label={league.name}
          sport={league.sport}
          following={following.has(`league:${league.id}`)}
          followLabel={t.follow}
          unfollowLabel={t.unfollow}
          errorLabel={t.followFailed}
          pendingLabel={t.followPending}
        />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.upcoming}</h2>
        <Suspense fallback={<p className="text-[var(--muted)]">{t.loadingEvents}</p>}>
          <LeagueUpcoming leagueId={leagueId} sport={league.sport} t={t} locale={locale} />
        </Suspense>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.teams}</h2>
        <Suspense fallback={<p className="text-[var(--muted)]">{t.loadingPage}</p>}>
          <LeagueTeams league={league} followingIds={followingIds} t={t} locale={locale} />
        </Suspense>
      </section>
    </AppFrame>
  );
}

async function LeagueUpcoming({
  leagueId,
  sport,
  t,
  locale,
}: {
  leagueId: string;
  sport: string;
  t: Dictionary;
  locale: Locale;
}) {
  const events = await seasonEvents(leagueId, sport);
  return <EventList events={events.slice(0, 80)} t={t} locale={locale} empty={t.emptyEvents} />;
}

async function LeagueTeams({
  league,
  followingIds,
  t,
  locale,
}: {
  league: CatalogLeague;
  followingIds: string[];
  t: Dictionary;
  locale: Locale;
}) {
  const teams = await listLeagueTeams(league.id);
  const following = new Set(followingIds);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {teams.map((team) => (
        <article key={team.id} className="card flex items-center justify-between px-4 py-4">
          <div>
            <p>
              <BilingualName value={team.name} locale={locale} />
            </p>
            <p className="text-sm text-[var(--muted)]">
              <BilingualName value={team.country} locale={locale} />
            </p>
          </div>
          <FollowButton
            kind="team"
            sourceId={team.id}
            label={team.name}
            sport={team.sport}
            extra={{ leagueId: league.id, league: league.name }}
            following={entityIsFollowed(following, "team", team.id, team.name)}
            followLabel={t.follow}
            unfollowLabel={t.unfollow}
            errorLabel={t.followFailed}
            pendingLabel={t.followPending}
          />
        </article>
      ))}
    </div>
  );
}
