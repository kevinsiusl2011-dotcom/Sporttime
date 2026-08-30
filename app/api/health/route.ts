import { getEnv, getEnvStatus } from "@/lib/env";

export async function GET() {
  const status = getEnvStatus();
  const key = getEnv().THESPORTSDB_API_KEY || "3";
  let sportsApi: "ok" | "error" = "error";
  try {
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${key}/eventsnextleague.php?id=4328`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 0 },
    });
    if (response.ok) sportsApi = "ok";
  } catch {
    sportsApi = "error";
  }

  return Response.json({
    ok: true,
    configured: status.ready,
    missing: status.missing,
    warnings: [
      ...status.warnings,
      ...(sportsApi === "error" ? ["TheSportsDB API key failed a live check."] : []),
    ],
    sportsApi,
  });
}
