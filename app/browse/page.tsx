import Link from "next/link";
import { FollowButton } from "@/components/follow-button";
import { Nav } from "@/components/nav";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { loadFeaturedShelves } from "@/lib/sports/catalog";

export default async function BrowsePage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const [shelves, follows] = await Promise.all([loadFeaturedShelves(), listFollows(user.id)]);
  const following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.browse}</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.feature1Body}</p>
        <div className="mt-10 space-y-12">
          {shelves.map((shelf) => (
            <section key={shelf.id}>
              <h2 className="font-[family-name:var(--font-serif)] text-2xl">
                {t.groups[shelf.id as keyof typeof t.groups] ?? shelf.sport}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shelf.leagues.map((league) => (
                  <article key={league.id} className="card flex flex-col justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--gold)]">
                        {[league.sport, league.country].filter(Boolean).join(" · ")}
                      </p>
                      <h3 className="mt-2 text-xl">
                        <Link href={`/browse/${league.id}`} className="hover:text-[var(--accent)]">
                          {league.name}
                        </Link>
                      </h3>
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
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
