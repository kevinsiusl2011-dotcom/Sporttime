export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-5 py-10" aria-hidden>
      <div className="h-10 w-48 rounded-xl bg-[var(--line)]" />
      <div className="mt-4 h-4 w-full max-w-xl rounded-lg bg-[var(--line)]" />
      <div className="mt-8 space-y-3">
        <div className="h-20 rounded-[22px] bg-[var(--line)]" />
        <div className="h-20 rounded-[22px] bg-[var(--line)]" />
        <div className="h-20 rounded-[22px] bg-[var(--line)]" />
      </div>
    </div>
  );
}
