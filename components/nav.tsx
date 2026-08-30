import Link from "next/link";
import { LocaleSwitch } from "@/components/locale-switch";
import { MobileNav } from "@/components/mobile-nav";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export async function Nav({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_84%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-serif)] text-xl">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_16px_rgba(124,255,178,0.55)]" />
          <span>{t.brand}</span>
          <span className="badge-accent hidden sm:inline-flex">{t.freeToolBadge}</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-[var(--muted)] md:flex">
          {[
            { href: "/browse", label: t.browse },
            { href: "/search", label: t.search },
            { href: "/follows", label: t.following },
            { href: "/preview", label: t.preview },
            { href: "/settings", label: t.settings },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition hover:bg-white/5 hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitch locale={locale} label={t.language} />
        </div>
      </div>
      <MobileNav t={t} />
    </header>
  );
}
