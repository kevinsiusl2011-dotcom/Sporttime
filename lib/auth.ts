import { getSession } from "@/lib/session";

export async function auth() {
  return getSession();
}

export async function signOut() {
  const { destroySession } = await import("@/lib/session");
  await destroySession();
}

export function requireUserId(userId?: string | null): string {
  if (!userId) throw new Error("UNAUTHENTICATED");
  return userId;
}
