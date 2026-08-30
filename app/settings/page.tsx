import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { auth } from "@/lib/auth";
import { dbGet } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import { SettingsForm } from "@/app/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const { t, locale } = await getDictionary();
  const user = await dbGet<{ reminder_minutes: string; timezone: string | null }>(
    "SELECT reminder_minutes, timezone FROM users WHERE id = ?",
    [session.user.id],
  );
  if (!user) redirect("/");

  return (
    <div>
      <Nav t={t} locale={locale} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.settings}</h1>
        <SettingsForm
          reminderMinutes={user.reminder_minutes}
          saveLabel={t.save}
          remindersLabel={t.reminders}
          reminderHelp={t.reminderHelp}
          disconnectLabel={t.disconnect}
        />
      </main>
    </div>
  );
}
