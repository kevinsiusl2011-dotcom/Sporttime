import { z } from "zod";
import { addFollow, listFollows, removeFollow } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { rebuildUserFeed } from "@/lib/sync/engine";

const bodySchema = z.object({
  kind: z.enum(["sport", "league", "team", "athlete"]),
  sourceId: z.string().min(1),
  label: z.string().min(1),
  sport: z.string().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

async function refreshFeed(userId: string) {
  try {
    await rebuildUserFeed(userId);
  } catch (error) {
    console.error("Failed to rebuild calendar feed", error);
  }
}

export async function GET() {
  const user = await ensureUserRecord();
  return Response.json({ follows: await listFollows(user.id) });
}

export async function POST(request: Request) {
  const user = await ensureUserRecord();
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const follow = await addFollow({
    userId: user.id,
    kind: parsed.data.kind,
    sourceId: parsed.data.sourceId,
    label: parsed.data.label,
    sport: parsed.data.sport,
    extra: parsed.data.extra,
  });
  await refreshFeed(user.id);
  return Response.json({ follow });
}

export async function DELETE(request: Request) {
  const user = await ensureUserRecord();
  const parsed = bodySchema.pick({ kind: true, sourceId: true }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  await removeFollow(user.id, parsed.data.kind, parsed.data.sourceId);
  await refreshFeed(user.id);
  return Response.json({ ok: true });
}
