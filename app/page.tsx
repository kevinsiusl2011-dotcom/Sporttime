import Link from "next/link";
import { CalendarSubscribe } from "@/components/calendar-subscribe";
import { FollowButton } from "@/components/follow-button";
import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { companyBranding } from "@/lib/branding";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { displayName } from "@/lib/i18n/localize";
import { quickFollowLeagues } from "@/lib/sports/quick-follows";
import { calendarFeedUrl } from "@/lib/urls";

export default async function HomePage() {
  const { t, locale } = await getDictionary();
  const company = companyBranding();
  let feedUrl: string | null = null;
  let following = new Set<string>();
  try {
    const user = await ensureUserRecord();
    const follows = await listFollows(user.id);
    following = new Set(follows.map((follow) => `${follow.kind}:${follow.source_id}`));
    if (user.feed_token && follows.length > 0) {
      feedUrl = calendarFeedUrl(user.feed_token);
    }
  } catch {
    // instance without AUTH_SECRET still shows the landing page
  }
  const quick = quickFollowLeagues();

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <section className="relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(160deg,rgba(124,255,178,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent),var(--bg-card)] px-6 py-10 md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(242,193,78,0.16),transparent_68%)]" />
          <div className="relative max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-accent">{t.freeToolBadge}</span>
              <span className="text-sm text-[var(--gold)]">{t.selfHost}</span>
            </div>
            <h1 className="mt-5 font-[family-name:var(--font-serif)] text-4xl leading-[1.12] tracking-tight md:text-6xl">
              {t.tagline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
              {t.heroBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/browse" className="btn-primary rounded-full px-6 py-3 text-sm md:text-base">
                {t.landingCta}
              </Link>
              <Link href="/preview" className="btn-ghost rounded-full px-6 py-3 text-sm md:text-base">
                {t.addToGoogle}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl">{t.quickFollowsTitle}</h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">{t.homeSubscribeHint}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quick.map((league) => (
              <article key={league.id} className="card flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-xs tracking-[0.08em] text-[var(--gold)]">{displayName(league.sport, locale)}</p>
                  <h3 className="mt-1 text-lg">{displayName(league.name, locale)}</h3>
                </div>
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
              </article>
            ))}
          </div>
        </section>

        {feedUrl ? (
          <div className="mt-10">
            <CalendarSubscribe feedUrl={feedUrl} t={t} />
          </div>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-serif)] text-3xl">{t.howTitle}</h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              { title: t.how1Title, body: t.how1Body, step: "01" },
              { title: t.how2Title, body: t.how2Body, step: "02" },
              { title: t.how3Title, body: t.how3Body, step: "03" },
            ].map((item) => (
              <li key={item.step} className="card relative overflow-hidden p-6">
                <span className="text-xs tracking-[0.2em] text-[var(--gold)]">{item.step}</span>
                <h3 className="mt-3 font-[family-name:var(--font-serif)] text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-3xl rounded-2xl border border-[color-mix(in_oklab,var(--accent)_30%,var(--line))] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-5 py-4 text-sm leading-relaxed text-[var(--text)]">
            {t.autoUpdateNote}
          </p>
        </section>

        <section className="mt-14">
          <h2 className="mb-6 font-[family-name:var(--font-serif)] text-3xl">{t.featuresTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card p-6 transition hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--line))]">
              <h3 className="font-[family-name:var(--font-serif)] text-2xl">{t.feature1Title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{t.feature1Body}</p>
            </article>
            <article className="card p-6 transition hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--line))]">
              <h3 className="font-[family-name:var(--font-serif)] text-2xl">{t.feature2Title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{t.feature2Body}</p>
            </article>
            <article className="card p-6 transition hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--line))]">
              <h3 className="font-[family-name:var(--font-serif)] text-2xl">{t.feature3Title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{t.feature3Body}</p>
            </article>
          </div>
        </section>

        <SiteFooter t={t} companyName={company.name} companyUrl={company.url} />
      </main>
    </div>
  );
}
