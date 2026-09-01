import { z } from "zod";
import { addFollow, listFollows, removeAllFollows, removeFollow } from "@/lib/follows";
import { ensureUserRecord } from "@/lib/guest";
import { resolveAthleteId } from "@/lib/sports/thesportsdb";
import { rebuildUserFeed } from "@/lib/sync/engine";

const bodySchema = z.object({
  kind: z.enum(["sport", "league", "team", "athlete"]),
  sourceId: z.string().min(1),
  label: z.string().min(1),
  sport: z.string().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

const deleteSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({
    kind: z.enum(["sport", "league", "team", "athlete"]),
    sourceId: z.string().min(1),
    label: z.string().optional(),
  }),
]);

async function userOr401() {
  try {
    return await ensureUserRecord();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return null;
    throw error;
  }
}

async function refreshFeed(userId: string) {
  try {
    await rebuildUserFeed(userId);
  } catch (error) {
    console.error("Failed to rebuild calendar feed", error);
  }
}

export async function GET() {
  const user = await userOr401();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });
  return Response.json({ follows: await listFollows(user.id) });
}

export async function POST(request: Request) {
  const user = await userOr401();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  let sourceId = parsed.data.sourceId;
  let extra = parsed.data.extra;
  if (parsed.data.kind === "athlete" && !/^\d+$/.test(sourceId)) {
    const playerId = await resolveAthleteId(parsed.data.label, parsed.data.sport);
    if (playerId) {
      extra = { ...extra, playerId };
      sourceId = playerId;
    }
  }

  const follow = await addFollow({
    userId: user.id,
    kind: parsed.data.kind,
    sourceId,
    label: parsed.data.label,
    sport: parsed.data.sport,
    extra,
  });
  await refreshFeed(user.id);
  return Response.json({ follow });
}

export async function DELETE(request: Request) {
  const user = await userOr401();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  if ("all" in parsed.data) {
    await removeAllFollows(user.id);
  } else {
    await removeFollow(user.id, parsed.data.kind, parsed.data.sourceId, parsed.data.label);
  }
  await refreshFeed(user.id);
  return Response.json({ ok: true });
}
