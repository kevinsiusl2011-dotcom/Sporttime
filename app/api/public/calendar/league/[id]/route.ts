import { getDictionary } from "@/lib/i18n";
import { calendarBodyForEntity } from "@/lib/sync/engine";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id.replace(/\.ics$/i, "");
  if (!id) return new Response("Not found", { status: 404 });
  const { locale } = await getDictionary();

  try {
    const body = await calendarBodyForEntity("league", id, { locale });
    return new Response(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="sporttime-league-${id}.ics"`,
        "Cache-Control": "public, s-maxage=1800, max-age=900, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to build league calendar", id, error);
    return new Response("Service error", { status: 502 });
  }
}
