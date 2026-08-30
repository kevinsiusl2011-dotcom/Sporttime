"use client";

import { useState } from "react";
import { interpolate } from "@/lib/i18n/interpolate";

type Result = {
  scanned: number;
  created: number;
  updated: number;
  removed: number;
  errors: string[];
};

export function SyncPanel({
  syncLabel,
  syncingLabel,
  resultTemplate,
  errorsLabel,
}: {
  syncLabel: string;
  syncingLabel: string;
  resultTemplate: string;
  errorsLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const data = (await response.json()) as Result & { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Sync failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Sync failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card p-5">
      <button className="btn-primary rounded-full px-5 py-2.5" onClick={run} disabled={pending}>
        {pending ? syncingLabel : syncLabel}
      </button>
      {result ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {interpolate(resultTemplate, {
            scanned: result.scanned,
            created: result.created,
            updated: result.updated,
            removed: result.removed,
          })}
        </p>
      ) : null}
      {result?.errors.length ? (
        <div className="mt-3 text-sm text-[var(--danger)]">
          <p>{errorsLabel}</p>
          <ul className="list-disc pl-5">
            {result.errors.slice(0, 8).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
