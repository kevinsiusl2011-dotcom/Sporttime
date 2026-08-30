import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { searchAll } from "@/lib/sports/thesportsdb";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!rateLimit(`search:${session.user.id}`, 30, 60_000)) {
    return Response.json({ error: "Too many searches" }, { status: 429 });
  }
  if (q.length < 2) return Response.json({ leagues: [], teams: [], athletes: [] });

  const results = await searchAll(q);
  return Response.json(results);
}
