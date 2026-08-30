"use client";

import { useEffect, useMemo, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import type { SearchResults } from "@/lib/sports/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { trilingual } from "@/lib/i18n/localize";

export function SearchPanel({
  t,
  followingIds,
}: {
  t: Dictionary;
  followingIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const followed = useMemo(() => new Set(followingIds), [followingIds]);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults(null);
      setPending(false);
      setFailed(false);
      return;
    }

    const controller = new AbortController();
    setPending(true);
    setFailed(false);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/sports/search?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as SearchResults & { error?: string };
        if (!response.ok || data.error) {
          setResults(null);
          setFailed(true);
          return;
        }
        setResults({
          leagues: data.leagues ?? [],
          teams: data.teams ?? [],
          athletes: data.athletes ?? [],
        });
      } catch {
        if (controller.signal.aborted) return;
        setResults(null);
        setFailed(true);
      } finally {
        if (!controller.signal.aborted) setPending(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const leagues = results?.leagues ?? [];
  const teams = results?.teams ?? [];
  const athletes = results?.athletes ?? [];
  const ready = query.trim().length >= 2 && !pending;
  const empty = ready && !failed && results !== null && leagues.length + teams.length + athletes.length === 0;

  return (
    <div className="space-y-8">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t.searchPlaceholder}
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-4 text-lg outline-none focus:border-[var(--accent)]"
      />
      {query.trim().length < 2 ? <p className="text-[var(--muted)]">{t.emptySearch}</p> : null}
      {pending ? <p className="text-[var(--muted)]">…</p> : null}
      {ready && failed ? <p className="text-[var(--muted)]">{t.searchFailed}</p> : null}
      {empty ? <p className="text-[var(--muted)]">{t.searchNoResults}</p> : null}
      {results && !pending ? (
        <div className="space-y-8">
          <ResultGroup
            title={t.leagues}
            items={leagues.map((item) => ({
              id: item.id,
              kind: "league" as const,
              label: item.name,
              sport: item.sport,
              meta: item.country,
              extra: { country: item.country },
            }))}
            followed={followed}
            t={t}
          />
          <ResultGroup
            title={t.teams}
            items={teams.map((item) => ({
              id: item.id,
              kind: "team" as const,
              label: item.name,
              sport: item.sport,
              meta: item.league,
              extra: { leagueId: item.leagueId, league: item.league },
            }))}
            followed={followed}
            t={t}
          />
          <ResultGroup
            title={t.athletes}
            items={athletes.map((item) => ({
              id: item.id,
              kind: "athlete" as const,
              label: item.name,
              sport: item.sport,
              meta: item.team,
              extra: { teamId: item.teamId, team: item.team },
            }))}
            followed={followed}
            t={t}
          />
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({
  title,
  items,
  followed,
  t,
}: {
  title: string;
  items: Array<{
    id: string;
    kind: "league" | "team" | "athlete";
    label: string;
    sport: string;
    meta?: string;
    extra?: Record<string, unknown>;
  }>;
  followed: Set<string>;
  t: Dictionary;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 font-[family-name:var(--font-serif)] text-2xl">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.kind}:${item.id}`} className="card flex items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-lg">{trilingual(item.label)}</p>
              <p className="text-sm text-[var(--muted)]">
                {[trilingual(item.sport), item.meta ? trilingual(item.meta) : ""].filter(Boolean).join(" · ")}
              </p>
            </div>
            <FollowButton
              kind={item.kind}
              sourceId={item.id}
              label={item.label}
              sport={item.sport}
              extra={item.extra}
              following={followed.has(`${item.kind}:${item.id}`)}
              followLabel={t.follow}
              unfollowLabel={t.unfollow}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
