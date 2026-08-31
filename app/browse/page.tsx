import Link from "next/link";
import { BrowseSubnav } from "@/components/browse-subnav";
import { FollowButton } from "@/components/follow-button";
import { AppFrame } from "@/components/app-frame";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { BilingualName } from "@/components/bilingual-name";
import { listCatalogSports, loadFeaturedShelves, sportSlug } from "@/lib/sports/catalog";

export default async function BrowsePage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const follows = await listFollows(user.id);
  const shelves = loadFeaturedShelves();
  const following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));
  const sports = listCatalogSports();

  return (
    <AppFrame t={t} locale={locale} wide>
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.browse}</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.browseHelp}</p>
      <BrowseSubnav t={t} current="leagues" />

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl">{t.allSports}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {sports.map((sport) => (
            <Link
              key={sport}
              href={`/browse/sport/${sportSlug(sport)}`}
              className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-2 text-sm hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <BilingualName value={sport} locale={locale} />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 space-y-12">
        {shelves.map((shelf) => (
          <section key={shelf.id}>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl">
              {t.groups[shelf.id as keyof typeof t.groups] ?? <BilingualName value={shelf.sport} locale={locale} />}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shelf.leagues.map((league) => (
                <article key={league.id} className="card flex flex-col justify-between p-5">
                  <div>
                    <p className="text-xs tracking-[0.08em] text-[var(--gold)]">
                      <BilingualName values={[league.sport, league.country]} locale={locale} />
                    </p>
                    <h3 className="mt-2 text-xl">
                      <Link href={`/browse/${league.id}`} className="hover:text-[var(--accent)]">
                        <BilingualName value={league.name} locale={locale} />
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
                      errorLabel={t.followFailed}
                      pendingLabel={t.followPending}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppFrame>
  );
}
