import Link from "next/link";
import { notFound } from "next/navigation";
import { BrowseSubnav } from "@/components/browse-subnav";
import { EntityFollowGrid } from "@/components/entity-follow-grid";
import { AppFrame } from "@/components/app-frame";
import { SportChipRow } from "@/components/sport-chip-row";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { BilingualName } from "@/components/bilingual-name";
import { listCatalogSports, sportSlug } from "@/lib/sports/catalog";
import { popularTeamGroups } from "@/lib/sports/popular-teams";

export default async function SportTeamsPage({ params }: { params: Promise<{ sport: string }> }) {
  const user = await ensureUserRecord();
  const { sport: slug } = await params;
  const sports = listCatalogSports();
  const sport = sports.find((item) => sportSlug(item) === slug);
  if (!sport) notFound();

  const { t, locale } = await getDictionary();
  const groups = popularTeamGroups(sport);
  const follows = await listFollows(user.id);
  const following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));

  return (
    <AppFrame t={t} locale={locale} wide>
      <p className="text-sm text-[var(--gold)]">
        <Link href="/browse" className="hover:text-[var(--accent)]">
          {t.browse}
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-serif)] text-4xl">{t.browseTeams}</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.browseTeamsHelp}</p>
      <BrowseSubnav t={t} current="teams" sportSlug={slug} />
        <SportChipRow
          sports={sports}
          selected={sport}
          hrefFor={(item) => `/browse/sport/${item}/teams`}
          locale={locale}
        />
        <div className="mt-10 space-y-12">
          {groups.length === 0 ? (
            <p className="text-[var(--muted)]">{t.emptyTeams}</p>
          ) : (
            groups.map((group) => (
              <section key={group.league}>
                <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                  {group.leagueId ? (
                    <Link href={`/browse/${group.leagueId}`} className="hover:text-[var(--accent)]">
                      <BilingualName value={group.league} locale={locale} />
                    </Link>
                  ) : (
                    <BilingualName value={group.league} locale={locale} />
                  )}
                </h2>
                <div className="mt-5">
                  <EntityFollowGrid
                    items={group.teams.map((team) => ({
                      id: team.id,
                      name: team.name,
                      sport: team.sport || sport,
                      detail: team.country,
                      extra: { leagueId: team.leagueId, league: team.league },
                    }))}
                    kind="team"
                    following={following}
                    t={t}
                    locale={locale}
                  />
                </div>
              </section>
            ))
          )}
        </div>
    </AppFrame>
  );
}
