export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-5 py-10" aria-hidden>
      <div className="h-10 w-48 rounded-xl bg-white/10" />
      <div className="mt-4 h-4 w-full max-w-xl rounded-lg bg-white/6" />
      <div className="mt-8 space-y-3">
        <div className="h-20 rounded-[22px] bg-white/5" />
        <div className="h-20 rounded-[22px] bg-white/5" />
        <div className="h-20 rounded-[22px] bg-white/5" />
      </div>
    </div>
  );
}
