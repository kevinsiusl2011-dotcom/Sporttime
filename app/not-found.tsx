import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">404</h1>
      <p className="mt-3 text-[var(--muted)]">This page is not here.</p>
      <Link href="/" className="mt-6 inline-block text-[var(--accent)]">
        Sporttime
      </Link>
    </main>
  );
}
