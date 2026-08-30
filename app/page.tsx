import Link from "next/link";
import { Nav } from "@/components/nav";
import { getDictionary } from "@/lib/i18n";

export default async function HomePage() {
  const { t, locale } = await getDictionary();

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <section className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--gold)]">{t.selfHost}</p>
          <h1 className="mt-4 font-[family-name:var(--font-serif)] text-5xl leading-tight md:text-6xl">
            {t.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">{t.heroBody}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/browse" className="btn-primary rounded-full px-5 py-3">
              {t.landingCta}
            </Link>
            <Link href="/preview" className="btn-ghost rounded-full px-5 py-3">
              {t.addToGoogle}
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-5 md:grid-cols-3">
          <article className="card p-6">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl">{t.feature1Title}</h2>
            <p className="mt-3 text-[var(--muted)]">{t.feature1Body}</p>
          </article>
          <article className="card p-6">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl">{t.feature2Title}</h2>
            <p className="mt-3 text-[var(--muted)]">{t.feature2Body}</p>
          </article>
          <article className="card p-6">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl">{t.feature3Title}</h2>
            <p className="mt-3 text-[var(--muted)]">{t.feature3Body}</p>
          </article>
        </section>
        <p className="mt-16 text-sm text-[var(--muted)]">{t.footer}</p>
      </main>
    </div>
  );
}
