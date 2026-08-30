import { FollowButton } from "@/components/follow-button";
import { Nav } from "@/components/nav";
import { UnfollowAllButton } from "@/components/unfollow-all-button";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";
import { BilingualName } from "@/components/bilingual-name";
import type { FollowKind } from "@/lib/sports/types";

export default async function FollowsPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const follows = await listFollows(user.id);

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.following}</h1>
          {follows.length > 0 ? (
            <UnfollowAllButton
              label={t.unfollowAll}
              confirmLabel={t.unfollowAllConfirm}
              pendingLabel={t.unfollowingAll}
            />
          ) : null}
        </div>
        {follows.length === 0 ? (
          <p className="mt-6 text-[var(--muted)]">{t.emptyFollows}</p>
        ) : (
          <ul className="mt-8 space-y-3">
            {follows.map((follow) => (
              <li key={follow.id} className="card flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-xs tracking-[0.16em] text-[var(--gold)]">
                    <BilingualName value={follow.kind} locale={locale} />
                  </p>
                  <p className="mt-1 text-lg">
                    <BilingualName value={follow.label} locale={locale} />
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    <BilingualName value={follow.sport} locale={locale} />
                  </p>
                </div>
                <FollowButton
                  kind={follow.kind as FollowKind}
                  sourceId={follow.source_id}
                  label={follow.label}
                  sport={follow.sport ?? undefined}
                  following
                  followLabel={t.follow}
                  unfollowLabel={t.unfollow}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
