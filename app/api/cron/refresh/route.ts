import { refreshAllFeeds } from "@/lib/sync/engine";

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || expected === "change-me") return false;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === expected;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshAllFeeds();
  return Response.json(result);
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
