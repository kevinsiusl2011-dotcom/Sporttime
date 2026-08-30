import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function BrowseSubnav({
  t,
  current,
  sportSlug,
}: {
  t: Dictionary;
  current: "leagues" | "teams" | "athletes";
  sportSlug?: string;
}) {
  const items = [
    {
      key: "leagues" as const,
      href: sportSlug ? `/browse/sport/${sportSlug}` : "/browse",
      label: t.browseLeagues,
    },
    {
      key: "teams" as const,
      href: sportSlug ? `/browse/sport/${sportSlug}/teams` : "/browse/teams",
      label: t.browseTeams,
    },
    {
      key: "athletes" as const,
      href: sportSlug ? `/browse/sport/${sportSlug}/athletes` : "/browse/athletes",
      label: t.browseAthletes,
    },
  ];

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`rounded-full px-4 py-2 text-sm ${
            current === item.key
              ? "bg-[var(--accent)] font-semibold text-[#082015]"
              : "border border-[var(--line)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
