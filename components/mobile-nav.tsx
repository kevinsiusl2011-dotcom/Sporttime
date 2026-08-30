import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function MobileNav({ t }: { t: Dictionary }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] px-3 py-2.5 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-6xl justify-between gap-1 text-[11px] text-[var(--muted)]">
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
            className="min-w-0 flex-1 rounded-xl px-1 py-2 text-center transition hover:bg-white/5 hover:text-[var(--text)]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
