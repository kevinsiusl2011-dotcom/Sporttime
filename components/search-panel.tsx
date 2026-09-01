"use client";

import { useEffect, useMemo, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { entityIsFollowed } from "@/lib/follows";
import type { SearchResults } from "@/lib/sports/types";
import { BilingualName } from "@/components/bilingual-name";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function SearchPanel({
  t,
  locale,
  followingIds,
}: {
  t: Dictionary;
  locale: Locale;
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
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.search}
        autoFocus
        autoComplete="off"
        enterKeyHint="search"
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-4 text-lg outline-none focus:border-[var(--accent)]"
      />
      {query.trim().length < 2 ? <p className="text-[var(--muted)]">{t.emptySearch}</p> : null}
      {pending ? <p className="text-[var(--muted)]">{t.loadingSearch}</p> : null}
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
              image: item.badge,
              extra: { country: item.country },
            }))}
            followed={followed}
            t={t}
            locale={locale}
          />
          <ResultGroup
            title={t.teams}
            items={teams.map((item) => ({
              id: item.id,
              kind: "team" as const,
              label: item.name,
              sport: item.sport,
              meta: item.league,
              image: item.badge,
              extra: { leagueId: item.leagueId, league: item.league },
            }))}
            followed={followed}
            t={t}
            locale={locale}
          />
          <ResultGroup
            title={t.athletes}
            items={athletes.map((item) => ({
              id: item.id,
              kind: "athlete" as const,
              label: item.name,
              sport: item.sport,
              meta: item.team,
              image: item.thumb,
              extra: { teamId: item.teamId, team: item.team },
            }))}
            followed={followed}
            t={t}
            locale={locale}
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
  locale,
}: {
  title: string;
  items: Array<{
    id: string;
    kind: "league" | "team" | "athlete";
    label: string;
    sport: string;
    meta?: string;
    image?: string;
    extra?: Record<string, unknown>;
  }>;
  followed: Set<string>;
  t: Dictionary;
  locale: Locale;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 font-[family-name:var(--font-serif)] text-2xl">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.kind}:${item.id}`} className="card flex items-center justify-between gap-4 px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-full bg-[var(--bg-elevated)] object-cover" />
              ) : null}
              <div className="min-w-0">
                <p className="text-lg">
                  <BilingualName value={item.label} locale={locale} />
                </p>
                <p className="text-sm text-[var(--muted)]">
                  <BilingualName values={[item.sport, item.meta]} locale={locale} />
                </p>
              </div>
            </div>
            <FollowButton
              kind={item.kind}
              sourceId={item.id}
              label={item.label}
              sport={item.sport}
              extra={item.extra}
              following={entityIsFollowed(followed, item.kind, item.id, item.label)}
              followLabel={t.follow}
              unfollowLabel={t.unfollow}
              errorLabel={t.followFailed}
              pendingLabel={t.followPending}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
