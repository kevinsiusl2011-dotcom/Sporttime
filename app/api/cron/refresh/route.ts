import { syncAllUsers } from "@/lib/sync/engine";

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  const vercelCron = request.headers.get("x-vercel-cron");
  return Boolean((expected && provided === expected) || vercelCron === "1");
}

async function run(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await syncAllUsers();
  return Response.json(result);
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
