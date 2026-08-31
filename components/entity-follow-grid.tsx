import { BilingualName } from "@/components/bilingual-name";
import { FollowButton } from "@/components/follow-button";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import type { FollowKind } from "@/lib/sports/types";

export type FollowEntity = {
  id: string;
  name: string;
  sport: string;
  detail?: string;
  extra?: Record<string, unknown>;
};

export function EntityFollowGrid({
  items,
  kind,
  following,
  t,
  locale,
}: {
  items: FollowEntity[];
  kind: FollowKind;
  following: Set<string>;
  t: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={`${kind}:${item.id}`} className="card flex items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0">
            <p className="text-lg">
              <BilingualName value={item.name} locale={locale} />
            </p>
            {item.detail ? (
              <p className="text-sm text-[var(--muted)]">
                <BilingualName value={item.detail} locale={locale} />
              </p>
            ) : null}
          </div>
                <FollowButton
                  kind={kind}
                  sourceId={item.id}
                  label={item.name}
                  sport={item.sport}
                  extra={item.extra}
                  following={following.has(`${kind}:${item.id}`)}
                  followLabel={t.follow}
                  unfollowLabel={t.unfollow}
                  errorLabel={t.followFailed}
                  pendingLabel={t.followPending}
                />
        </article>
      ))}
    </div>
  );
}
