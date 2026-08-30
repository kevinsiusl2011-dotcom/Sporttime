export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { code?: string; message?: string };
  console.error("google-signin", body.code ?? "unknown", body.message ?? "");
  return Response.json({ ok: true });
}
