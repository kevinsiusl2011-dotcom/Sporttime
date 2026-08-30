import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { syncUserCalendar } from "@/lib/sync/engine";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`sync:${session.user.id}`, 6, 10 * 60_000)) {
    return Response.json({ error: "Please wait before syncing again." }, { status: 429 });
  }
  const result = await syncUserCalendar(session.user.id);
  return Response.json(result);
}
