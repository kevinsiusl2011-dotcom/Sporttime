import { ensureUserRecord } from "@/lib/guest";
import { collectUpcoming } from "@/lib/sync/engine";

export async function GET() {
  const user = await ensureUserRecord();
  const events = await collectUpcoming(user.id);
  return Response.json({ events });
}
