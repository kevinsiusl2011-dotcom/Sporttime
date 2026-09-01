import { parseFeedToken } from "@/lib/account/token";
import { findUserByFeedToken, mergeUserData } from "@/lib/account/merge";
import { getSession, createSession } from "@/lib/session";
import { rebuildUserFeed } from "@/lib/sync/engine";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = parseFeedToken(String(body.token ?? ""));
  if (token.length < 16) {
    return Response.json({ error: "invalid_token" }, { status: 400 });
  }

  const target = await findUserByFeedToken(token);
  if (!target) return Response.json({ error: "not_found" }, { status: 404 });

  const current = await getSession();
  if (current?.user?.id && current.user.id !== target.id) {
    await mergeUserData(current.user.id, target.id);
  }

  await createSession({
    id: target.id,
    email: target.email,
    name: target.name,
    image: target.image,
  });

  try {
    await rebuildUserFeed(target.id);
  } catch (error) {
    console.error("Failed to rebuild calendar after restore", error);
  }

  return Response.json({ ok: true });
}
