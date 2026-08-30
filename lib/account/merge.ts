import { dbGet, dbRun, type FollowRow, type UserRow } from "@/lib/db";
import { addFollow, listFollows } from "@/lib/follows";
import type { FollowKind } from "@/lib/sports/types";

export async function mergeUserData(fromId: string, toId: string) {
  if (!fromId || !toId || fromId === toId) return;

  const fromFollows = await listFollows(fromId);
  for (const follow of fromFollows) {
    await addFollow({
      userId: toId,
      kind: follow.kind as FollowKind,
      sourceId: follow.source_id,
      label: follow.label,
      sport: follow.sport ?? undefined,
      extra: parseExtra(follow),
    });
  }

  const fromUser = await dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [fromId]);
  const toUser = await dbGet<UserRow>("SELECT * FROM users WHERE id = ?", [toId]);
  if (fromUser?.feed_token && !toUser?.feed_token) {
    const token = fromUser.feed_token;
    await dbRun("UPDATE users SET feed_token = NULL WHERE id = ?", [fromId]);
    await dbRun("UPDATE users SET feed_token = ? WHERE id = ?", [token, toId]);
  }

  await dbRun("DELETE FROM follows WHERE user_id = ?", [fromId]);
}

function parseExtra(follow: FollowRow): Record<string, unknown> | undefined {
  if (!follow.extra_json) return undefined;
  try {
    const value = JSON.parse(follow.extra_json) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
