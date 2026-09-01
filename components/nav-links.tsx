"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (href === "/browse") return pathname === "/browse" || pathname.startsWith("/browse/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, variant }: { items: NavItem[]; variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] px-3 py-2.5 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-6xl justify-between gap-1 text-[11px] text-[var(--muted)]">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "min-w-0 flex-1 rounded-xl px-1 py-2 text-center transition",
                  active
                    ? "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] font-semibold text-[var(--accent)]"
                    : "hover:bg-[color-mix(in_oklab,var(--text)_6%,transparent)] hover:text-[var(--text)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="hidden items-center gap-1 text-sm text-[var(--muted)] md:flex">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 transition",
              active
                ? "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] font-medium text-[var(--text)]"
                : "hover:bg-[color-mix(in_oklab,var(--text)_6%,transparent)] hover:text-[var(--text)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
