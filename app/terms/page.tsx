import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { getDictionary } from "@/lib/i18n";
import { legal } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getDictionary();
  const copy = legal[locale];
  return { title: copy.termsTitle, description: copy.termsIntro };
}

export default async function TermsPage() {
  const { t, locale } = await getDictionary();
  const copy = legal[locale];
  return (
    <AppFrame t={t} locale={locale} narrow>
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{copy.termsTitle}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{copy.updated}</p>
      <p className="mt-6 max-w-2xl leading-relaxed text-[var(--muted)]">{copy.termsIntro}</p>
      <div className="mt-10 space-y-8">
        {copy.terms.map((section) => (
          <section key={section.heading}>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-relaxed text-[var(--muted)]">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </AppFrame>
  );
}
