import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getDictionary();
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">{t.notFoundTitle}</h1>
      <p className="mt-3 text-[var(--muted)]">{t.notFoundBody}</p>
      <Link href="/" className="btn-primary mt-6 inline-flex rounded-full px-5 py-2.5 text-sm">
        {t.backHome}
      </Link>
    </main>
  );
}
