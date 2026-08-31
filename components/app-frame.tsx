import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { companyBranding } from "@/lib/branding";
import { cn } from "@/lib/utils";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function AppFrame({
  t,
  locale,
  children,
  wide = false,
  narrow = false,
}: {
  t: Dictionary;
  locale: Locale;
  children: React.ReactNode;
  wide?: boolean;
  narrow?: boolean;
}) {
  const company = companyBranding();
  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className={cn("mx-auto px-5 py-10", wide ? "max-w-6xl" : narrow ? "max-w-3xl" : "max-w-4xl")}>
        {children}
        <SiteFooter t={t} companyName={company.name} companyUrl={company.url} />
      </main>
    </div>
  );
}
