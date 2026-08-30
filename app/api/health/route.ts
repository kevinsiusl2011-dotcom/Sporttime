import { getEnvStatus } from "@/lib/env";

export async function GET() {
  const status = getEnvStatus();
  return Response.json({
    ok: true,
    configured: status.ready,
    missing: status.missing,
    warnings: status.warnings,
  });
}
