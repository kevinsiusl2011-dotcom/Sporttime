import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun, type FollowRow } from "@/lib/db";
import { normalizeKey } from "@/lib/i18n/names";
import type { FollowKind } from "@/lib/sports/types";

export async function listFollows(userId: string): Promise<FollowRow[]> {
  return dbAll<FollowRow>("SELECT * FROM follows WHERE user_id = ? ORDER BY created_at DESC", [userId]);
}

export function followKeys(follow: { kind: string; source_id: string; label: string }): string[] {
  const keys = [`${follow.kind}:${follow.source_id}`];
  if (follow.kind === "athlete" || follow.kind === "team") {
    keys.push(`${follow.kind}:${normalizeKey(follow.label)}`);
  }
  return keys;
}

export function followedSet(follows: Array<{ kind: string; source_id: string; label: string }>): Set<string> {
  return new Set(follows.flatMap(followKeys));
}

export function entityIsFollowed(following: Set<string>, kind: string, sourceId: string, label: string): boolean {
  return following.has(`${kind}:${sourceId}`) || following.has(`${kind}:${normalizeKey(label)}`);
}

export async function isFollowing(userId: string, kind: FollowKind, sourceId: string): Promise<boolean> {
  const row = await dbGet("SELECT id FROM follows WHERE user_id = ? AND kind = ? AND source_id = ?", [
    userId,
    kind,
    sourceId,
  ]);
  return Boolean(row);
}

export async function addFollow(input: {
  userId: string;
  kind: FollowKind;
  sourceId: string;
  label: string;
  sport?: string;
  extra?: Record<string, unknown>;
}): Promise<FollowRow> {
  if (input.kind === "athlete") {
    await dbRun("DELETE FROM follows WHERE user_id = ? AND kind = 'athlete' AND lower(label) = lower(?) AND source_id != ?", [
      input.userId,
      input.label,
      input.sourceId,
    ]);
  }
  const id = randomUUID();
  await dbRun(
    `INSERT INTO follows (id, user_id, kind, source, source_id, label, sport, extra_json)
     VALUES (?, ?, ?, 'thesportsdb', ?, ?, ?, ?)
     ON CONFLICT(user_id, kind, source, source_id) DO UPDATE SET
       label = excluded.label,
       sport = excluded.sport,
       extra_json = excluded.extra_json`,
    [
      id,
      input.userId,
      input.kind,
      input.sourceId,
      input.label,
      input.sport ?? null,
      input.extra ? JSON.stringify(input.extra) : null,
    ],
  );
  return (await dbGet<FollowRow>("SELECT * FROM follows WHERE user_id = ? AND kind = ? AND source_id = ?", [
    input.userId,
    input.kind,
    input.sourceId,
  ]))!;
}

export async function removeFollow(userId: string, kind: FollowKind, sourceId: string, label?: string) {
  await dbRun("DELETE FROM follows WHERE user_id = ? AND kind = ? AND source_id = ?", [userId, kind, sourceId]);
  if (kind === "athlete" && label) {
    await dbRun("DELETE FROM follows WHERE user_id = ? AND kind = 'athlete' AND lower(label) = lower(?)", [
      userId,
      label,
    ]);
  }
}

export async function removeAllFollows(userId: string) {
  await dbRun("DELETE FROM follows WHERE user_id = ?", [userId]);
}
