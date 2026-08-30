import { notFound, redirect } from "next/navigation";
import { EventList } from "@/components/event-list";
import { FollowButton } from "@/components/follow-button";
import { Nav } from "@/components/nav";
import { auth } from "@/lib/auth";
import { listFollows } from "@/lib/follows";
import { getDictionary } from "@/lib/i18n";
import { listLeagueTeams, lookupLeague, seasonEvents } from "@/lib/sports/thesportsdb";

export default async function LeaguePage({ params }: { params: Promise<{ leagueId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const { leagueId } = await params;
  const league = await lookupLeague(leagueId);
  if (!league) notFound();

  const { t, locale } = await getDictionary();
  const [teams, events, follows] = await Promise.all([
    listLeagueTeams(leagueId),
    seasonEvents(leagueId, league.sport),
    listFollows(session.user.id),
  ]);
  const following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm text-[var(--gold)]">{[league.sport, league.country].filter(Boolean).join(" · ")}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl">{league.name}</h1>
          <FollowButton
            kind="league"
            sourceId={league.id}
            label={league.name}
            sport={league.sport}
            following={following.has(`league:${league.id}`)}
            followLabel={t.follow}
            unfollowLabel={t.unfollow}
          />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.upcoming}</h2>
          <EventList events={events.slice(0, 20)} t={t} locale={locale} empty={t.emptyEvents} />
        </section>

        <section className="mt-12">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.teams}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {teams.map((team) => (
              <article key={team.id} className="card flex items-center justify-between px-4 py-4">
                <div>
                  <p>{team.name}</p>
                  <p className="text-sm text-[var(--muted)]">{team.country}</p>
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
                />
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
