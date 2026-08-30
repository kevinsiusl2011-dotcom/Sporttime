import Link from "next/link";
import { LocaleSwitch } from "@/components/locale-switch";
import { MobileNav } from "@/components/mobile-nav";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export async function Nav({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_84%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-serif)] text-xl">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
          {t.brand}
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] md:flex">
          <Link href="/browse">{t.browse}</Link>
          <Link href="/search">{t.search}</Link>
          <Link href="/follows">{t.following}</Link>
          <Link href="/preview">{t.preview}</Link>
          <Link href="/settings">{t.settings}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitch locale={locale} label={t.language} />
        </div>
      </div>
      <MobileNav t={t} />
    </header>
  );
}
