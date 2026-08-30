import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/follow-button";
import { Nav } from "@/components/nav";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { BilingualName } from "@/components/bilingual-name";
import { leaguesForSport, listCatalogSports, sportSlug } from "@/lib/sports/catalog";

export default async function SportBrowsePage({ params }: { params: Promise<{ sport: string }> }) {
  const user = await ensureUserRecord();
  const { sport: slug } = await params;
  const sport = listCatalogSports().find((item) => sportSlug(item) === slug);
  if (!sport) notFound();

  const { t, locale } = await getDictionary();
  const leagues = leaguesForSport(sport);
  const follows = await listFollows(user.id);
  const following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm text-[var(--gold)]">
          <Link href="/browse" className="hover:text-[var(--accent)]">
            {t.browse}
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl">
            <BilingualName value={sport} locale={locale} />
          </h1>
          <FollowButton
            kind="sport"
            sourceId={sport}
            label={sport}
            sport={sport}
            following={following.has(`sport:${sport}`)}
            followLabel={t.follow}
            unfollowLabel={t.unfollow}
          />
        </div>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.browseSportHelp}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <article key={league.id} className="card flex flex-col justify-between p-5">
              <div>
                <p className="text-xs tracking-[0.08em] text-[var(--gold)]">
                  <BilingualName value={league.country} locale={locale} />
                </p>
                <h2 className="mt-2 text-xl">
                  <Link href={`/browse/${league.id}`} className="hover:text-[var(--accent)]">
                    <BilingualName value={league.name} locale={locale} />
                  </Link>
                </h2>
              </div>
              <div className="mt-5">
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
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
