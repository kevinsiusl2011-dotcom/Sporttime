import { auth } from "@/lib/auth";
import { collectUpcoming } from "@/lib/sync/engine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const events = await collectUpcoming(session.user.id);
  return Response.json({ events });
}
