import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { FollowButton } from "@/components/follow-button";
import { UnfollowAllButton } from "@/components/unfollow-all-button";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary, interpolate } from "@/lib/i18n";
import { BilingualName } from "@/components/bilingual-name";
import { isRosterSport } from "@/lib/sports/athlete";
import type { FollowKind } from "@/lib/sports/types";

export default async function FollowsPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const follows = await listFollows(user.id);

  return (
    <AppFrame t={t} locale={locale}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.following}</h1>
          {follows.length > 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {interpolate(t.followingCount, { count: follows.length })}
            </p>
          ) : null}
        </div>
        {follows.length > 0 ? (
          <UnfollowAllButton
            label={t.unfollowAll}
            confirmLabel={t.unfollowAllConfirm}
            pendingLabel={t.unfollowingAll}
          />
        ) : null}
      </div>
      {follows.length === 0 ? (
        <div className="mt-6 space-y-4">
          <p className="text-[var(--muted)]">{t.emptyFollows}</p>
          <Link href="/browse" className="btn-primary inline-flex rounded-full px-5 py-2.5 text-sm">
            {t.landingCta}
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-4">
            <Link href="/preview" className="text-sm text-[var(--accent)] hover:underline">
              {t.goToPreview}
            </Link>
          </p>
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
                  {follow.kind === "athlete" ? (
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-[var(--muted)]">
                      {isRosterSport(follow.sport) ? t.athleteClubNote : t.athletePersonalNote}
                    </p>
                  ) : null}
                </div>
                <FollowButton
                  kind={follow.kind as FollowKind}
                  sourceId={follow.source_id}
                  label={follow.label}
                  sport={follow.sport ?? undefined}
                  following
                  followLabel={t.follow}
                  unfollowLabel={t.unfollow}
                  errorLabel={t.followFailed}
                  pendingLabel={t.followPending}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </AppFrame>
  );
}
