import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fanGroupsFor, platformLabel, type FanGroup } from "@/lib/sports/group-links";
import type { FollowKind } from "@/lib/sports/types";

function audienceLabel(t: Dictionary, audience: FanGroup["audience"]): string {
  switch (audience) {
    case "hk":
      return (t as Dictionary & { audienceHk: string }).audienceHk;
    case "global":
      return (t as Dictionary & { audienceGlobal: string }).audienceGlobal;
    case "tw":
      return (t as Dictionary & { audienceTw: string }).audienceTw;
    case "cn":
      return (t as Dictionary & { audienceCn: string }).audienceCn;
    case "sgmy":
      return (t as Dictionary & { audienceSgmy: string }).audienceSgmy;
    default:
      return (t as Dictionary & { audienceAll: string }).audienceAll;
  }
}

function languageLabel(t: Dictionary, language: FanGroup["language"]): string {
  switch (language) {
    case "zh-Hant":
      return (t as Dictionary & { langZhHant: string }).langZhHant;
    case "zh-Hans":
      return (t as Dictionary & { langZhHans: string }).langZhHans;
    case "en":
      return (t as Dictionary & { langEn: string }).langEn;
    case "mixed":
      return (t as Dictionary & { langMixed: string }).langMixed;
    default:
      return (t as Dictionary & { audienceAll: string }).audienceAll;
  }
}

function platformPill(platform: FanGroup["platform"]) {
  switch (platform) {
    case "whatsapp":
      return "bg-[rgba(37,211,102,0.12)] text-[#128C7E] border-[rgba(37,211,102,0.25)]";
    case "telegram":
      return "bg-[rgba(30,136,229,0.12)] text-[#1E88E5] border-[rgba(30,136,229,0.28)]";
    case "discord":
      return "bg-[rgba(88,101,242,0.12)] text-[#5865F2] border-[rgba(88,101,242,0.3)]";
    case "lihkg":
      return "bg-[rgba(234,88,12,0.12)] text-[#EA580C] border-[rgba(234,88,12,0.28)]";
    case "facebook":
      return "bg-[rgba(24,119,242,0.12)] text-[#1877F2] border-[rgba(24,119,242,0.28)]";
    case "instagram":
      return "bg-[rgba(225,48,108,0.12)] text-[#E1306C] border-[rgba(225,48,108,0.3)]";
    case "website":
      return "bg-[rgba(14,143,92,0.12)] text-[var(--accent)] border-[rgba(14,143,92,0.28)]";
    default:
      return "bg-[var(--bg-elevated)] text-[var(--text)] border-[var(--line)]";
  }
}

export function EntityFanZone({
  t,
  kind,
  sourceId,
}: {
  t: Dictionary;
  kind: FollowKind;
  sourceId: string;
}) {
  const groups = fanGroupsFor(kind, sourceId);
  return (
    <section className="card p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] text-xl md:text-2xl leading-tight">
            {t.fanZoneTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{t.fanZoneSubtitle}</p>
        </div>
      </div>
      {groups.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--muted)]">
          {t.noGroupsYet}
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {groups.map((group) => (
            <li
              key={`${group.platform}-${group.name}`}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium leading-snug">{group.name}</p>
                  {group.description ? (
                    <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                      {group.description}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${platformPill(group.platform)}`}
                >
                  {platformLabel(group.platform)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                {group.language ? (
                  <span>
                    {t.groupLanguage}
                    <span className="ml-1 text-[var(--text)]">{languageLabel(t, group.language)}</span>
                  </span>
                ) : null}
                {group.audience ? (
                  <span>
                    {t.groupAudience}
                    <span className="ml-1 text-[var(--text)]">{audienceLabel(t, group.audience)}</span>
                  </span>
                ) : null}
              </div>
              <div>
                <a
                  href={group.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost rounded-full px-4 py-2 text-sm"
                >
                  {t.joinGroup} →
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
