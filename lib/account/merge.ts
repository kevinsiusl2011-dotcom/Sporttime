import { dbGet, dbRun, type FollowRow, type UserRow } from "@/lib/db";
import { addFollow, listFollows } from "@/lib/follows";
import type { FollowKind } from "@/lib/sports/types";

export async function findUserByFeedToken(token: string): Promise<UserRow | undefined> {
  return dbGet<UserRow>("SELECT * FROM users WHERE feed_token = ? OR feed_token_alias = ?", [token, token]);
}

/** Keep both calendar URLs working: primary is the one the user is acting on, the other becomes an alias. */
export function resolveFeedTokens(
  fromToken: string | null | undefined,
  toToken: string | null | undefined,
  prefer: "from" | "to",
): { feedToken: string | null; alias: string | null } {
  const from = fromToken || null;
  const to = toToken || null;
  if (from && to && from !== to) {
    return prefer === "from" ? { feedToken: from, alias: to } : { feedToken: to, alias: from };
  }
  return { feedToken: from || to, alias: null };
}

export async function mergeUserData(fromId: string, toId: string, prefer: "from" | "to" = "to") {
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
  const { feedToken, alias } = resolveFeedTokens(fromUser?.feed_token, toUser?.feed_token, prefer);
  await dbRun("UPDATE users SET feed_token = NULL, feed_token_alias = NULL WHERE id = ?", [fromId]);
  await dbRun("UPDATE users SET feed_token = ?, feed_token_alias = ?, updated_at = datetime('now') WHERE id = ?", [
    feedToken,
    alias,
    toId,
  ]);

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
