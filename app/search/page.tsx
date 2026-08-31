import { AppFrame } from "@/components/app-frame";
import { SearchPanel } from "@/components/search-panel";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";

export default async function SearchPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const followingIds = (await listFollows(user.id)).map((follow) => `${follow.kind}:${follow.source_id}`);

  return (
    <AppFrame t={t} locale={locale}>
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.search}</h1>
      <div className="mt-8">
        <SearchPanel t={t} locale={locale} followingIds={followingIds} />
      </div>
    </AppFrame>
  );
}
