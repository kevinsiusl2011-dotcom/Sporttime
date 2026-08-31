import { notFound } from "next/navigation";
import { EventList } from "@/components/event-list";
import { FollowButton } from "@/components/follow-button";
import { Nav } from "@/components/nav";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { BilingualName } from "@/components/bilingual-name";
import { findCatalogLeague } from "@/lib/sports/catalog";
import { listLeagueTeams, lookupLeague, seasonEvents } from "@/lib/sports/thesportsdb";

export default async function LeaguePage({ params }: { params: Promise<{ leagueId: string }> }) {
  const user = await ensureUserRecord();
  const { leagueId } = await params;
  const league = (await lookupLeague(leagueId)) ?? findCatalogLeague(leagueId);
  if (!league) notFound();

  const { t, locale } = await getDictionary();
  const [teams, events, follows] = await Promise.all([
    listLeagueTeams(leagueId),
    seasonEvents(leagueId, league.sport),
    listFollows(user.id),
  ]);
  const following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-6xl px-5 py-10">
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
          />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.upcoming}</h2>
          <EventList events={events.slice(0, 80)} t={t} locale={locale} empty={t.emptyEvents} />
        </section>

        <section className="mt-12">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.teams}</h2>
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
                  following={following.has(`team:${team.id}`)}
                  followLabel={t.follow}
                  unfollowLabel={t.unfollow}
                  errorLabel={t.followFailed}
                />
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
