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
import { popularAthletesForSport } from "@/lib/sports/popular-athletes";

export default async function SportAthletesPage({ params }: { params: Promise<{ sport: string }> }) {
  const user = await ensureUserRecord();
  const { sport: slug } = await params;
  const sports = listCatalogSports();
  const sport = sports.find((item) => sportSlug(item) === slug);
  if (!sport) notFound();

  const { t, locale } = await getDictionary();
  const athletes = popularAthletesForSport(sport);
  const follows = await listFollows(user.id);
  const following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));

  return (
    <AppFrame t={t} locale={locale} wide>
      <p className="text-sm text-[var(--gold)]">
        <Link href="/browse" className="hover:text-[var(--accent)]">
          {t.browse}
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-serif)] text-4xl">{t.browseAthletes}</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.browseAthletesHelp}</p>
        <BrowseSubnav t={t} current="athletes" sportSlug={slug} />
        <SportChipRow
          sports={sports}
          selected={sport}
          hrefFor={(item) => `/browse/sport/${item}/athletes`}
          locale={locale}
        />
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl">
            <BilingualName value={sport} locale={locale} />
            <span className="ml-2 text-lg text-[var(--muted)]">{t.topAthletes}</span>
          </h2>
          <div className="mt-5">
            {athletes.length === 0 ? (
              <p className="text-[var(--muted)]">{t.emptyAthletes}</p>
            ) : (
              <EntityFollowGrid
                items={athletes.map((athlete) => ({
                  id: athlete.id,
                  name: athlete.name,
                  sport: athlete.sport,
                  detail: athlete.team ?? athlete.nationality,
                }))}
                kind="athlete"
                following={following}
                t={t}
                locale={locale}
              />
            )}
          </div>
        </section>
    </AppFrame>
  );
}
