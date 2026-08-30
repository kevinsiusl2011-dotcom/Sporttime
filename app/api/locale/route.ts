import { isLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: string };
  if (!isLocale(body.locale)) {
    return Response.json({ error: "Invalid locale" }, { status: 400 });
  }
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `sporttime_locale=${body.locale}; Path=/; Max-Age=31536000; SameSite=Lax`,
  );
  return response;
}
