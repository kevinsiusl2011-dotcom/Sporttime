"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">Something broke</h1>
      <p className="mt-3 text-[var(--muted)]">{error.message}</p>
      <button className="btn-primary mt-6 rounded-full px-5 py-2" onClick={reset}>
        Retry
      </button>
    </main>
  );
}
