import Link from "next/link";
import { LocaleSwitch } from "@/components/locale-switch";
import { NavLinks } from "@/components/nav-links";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function Nav({ t, locale }: { t: Dictionary; locale: Locale }) {
  const items = [
    { href: "/browse", label: t.browse },
    { href: "/search", label: t.search },
    { href: "/follows", label: t.following },
    { href: "/preview", label: t.preview },
    { href: "/settings", label: t.settings },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_84%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-serif)] text-xl">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_16px_rgba(14,143,92,0.35)]" />
          <span>{t.brand}</span>
          <span className="badge-accent hidden sm:inline-flex">{t.freeToolBadge}</span>
        </Link>
        <NavLinks items={items} variant="desktop" />
        <div className="flex items-center gap-3">
          <LocaleSwitch locale={locale} label={t.language} />
        </div>
      </div>
      <NavLinks items={items} variant="mobile" />
    </header>
  );
}
