"use client";

import type { GoogleSignInPayload } from "@/lib/firebase/client";

let finishing: Promise<void> | null = null;

export async function finishSporttimeSession(payload: GoogleSignInPayload) {
  if (finishing) return finishing;
  finishing = (async () => {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Sign-in failed (${response.status})`);
    }
    window.location.href = "/follows";
  })().catch((err) => {
    finishing = null;
    throw err;
  });
  return finishing;
}
