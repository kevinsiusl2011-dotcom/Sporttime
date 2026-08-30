import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun, type FollowRow } from "@/lib/db";
import type { FollowKind } from "@/lib/sports/types";

export async function listFollows(userId: string): Promise<FollowRow[]> {
  return dbAll<FollowRow>("SELECT * FROM follows WHERE user_id = ? ORDER BY created_at DESC", [userId]);
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

export async function removeFollow(userId: string, kind: FollowKind, sourceId: string) {
  await dbRun("DELETE FROM follows WHERE user_id = ? AND kind = ? AND source_id = ?", [userId, kind, sourceId]);
}
