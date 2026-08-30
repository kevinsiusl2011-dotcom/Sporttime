import { Nav } from "@/components/nav";
import { SearchPanel } from "@/components/search-panel";
import { listFollows } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { getDictionary } from "@/lib/i18n";

export default async function SearchPage() {
  const user = await ensureUserRecord();
  const { t, locale } = await getDictionary();
  const followingIds = (await listFollows(user.id)).map(
    (follow) => `${follow.kind}:${follow.source_id}`,
  );

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.search}</h1>
        <div className="mt-8">
          <SearchPanel t={t} followingIds={followingIds} />
        </div>
      </main>
    </div>
  );
}
