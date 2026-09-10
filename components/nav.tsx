import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
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
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_94%,white)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2 font-[family-name:var(--font-serif)] text-xl leading-none"
          >
            <BrandLogo size={32} />
            <span className="truncate">{t.brand}</span>
            <span className="badge-accent hidden md:inline-flex">{t.freeToolBadge}</span>
          </Link>
          <NavLinks items={items} variant="desktop" />
          <div className="flex min-w-0 items-center justify-end">
            <LocaleSwitch locale={locale} label={t.language} />
          </div>
        </div>
      </header>
      <NavLinks items={items} variant="mobile" />
    </>
  );
}
