import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function MobileNav({ t }: { t: Dictionary }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--bg)] px-4 py-3 md:hidden">
      <div className="mx-auto flex max-w-6xl justify-between text-xs text-[var(--muted)]">
        <Link href="/browse">{t.browse}</Link>
        <Link href="/search">{t.search}</Link>
        <Link href="/follows">{t.following}</Link>
        <Link href="/preview">{t.preview}</Link>
        <Link href="/settings">{t.settings}</Link>
      </div>
    </nav>
  );
}
