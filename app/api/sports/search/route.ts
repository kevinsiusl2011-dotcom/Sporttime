import { rateLimit } from "@/lib/rate-limit";
import { searchAll } from "@/lib/sports/thesportsdb";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return Response.json({ error: "Too many searches" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ leagues: [], teams: [], athletes: [] });

  const results = await searchAll(q);
  return Response.json(results);
}
