import Link from "next/link";
import { Nav } from "@/components/nav";
import { getEnvStatus } from "@/lib/env";
import { getDictionary } from "@/lib/i18n";

export default async function SetupPage() {
  const { t, locale } = await getDictionary();
  const env = getEnvStatus();

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.setupNeeded}</h1>
        <p className="mt-4 text-[var(--muted)]">{t.setupBody}</p>
        <div className="card mt-8 p-6">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--gold)]">{t.health}</p>
          <ul className="mt-4 space-y-2 text-[var(--muted)]">
            {env.missing.length === 0 ? <li>Ready.</li> : null}
            {env.missing.map((item) => (
              <li key={item} className="text-[var(--danger)]">
                Missing {item}
              </li>
            ))}
            {env.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <Link href="/browse" className="mt-8 inline-block text-[var(--accent)]">
          ← {t.browse}
        </Link>
      </main>
    </div>
  );
}
