import { z } from "zod";
import { auth } from "@/lib/auth";
import { addFollow, listFollows, removeFollow } from "@/lib/follows";

const bodySchema = z.object({
  kind: z.enum(["sport", "league", "team", "athlete"]),
  sourceId: z.string().min(1),
  label: z.string().min(1),
  sport: z.string().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ follows: await listFollows(session.user.id) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });

  const follow = await addFollow({
    userId: session.user.id,
    kind: parsed.data.kind,
    sourceId: parsed.data.sourceId,
    label: parsed.data.label,
    sport: parsed.data.sport,
    extra: parsed.data.extra,
  });
  return Response.json({ follow });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = bodySchema.pick({ kind: true, sourceId: true }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  await removeFollow(session.user.id, parsed.data.kind, parsed.data.sourceId);
  return Response.json({ ok: true });
}
