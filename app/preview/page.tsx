import { redirect } from "next/navigation";
import { EventList } from "@/components/event-list";
import { Nav } from "@/components/nav";
import { SyncPanel } from "@/components/sync-panel";
import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { collectUpcoming } from "@/lib/sync/engine";

export default async function PreviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const { t, locale } = await getDictionary();
  const events = await collectUpcoming(session.user.id);

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.preview}</h1>
        <div className="mt-6">
          <SyncPanel
            syncLabel={t.sync}
            syncingLabel={t.syncing}
            resultTemplate={t.syncResult}
            errorsLabel={t.errors}
          />
        </div>
        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-serif)] text-2xl">{t.upcoming}</h2>
          <EventList events={events} t={t} locale={locale} empty={t.emptyEvents} />
        </section>
      </main>
    </div>
  );
}
