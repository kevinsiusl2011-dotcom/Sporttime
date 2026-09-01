import { normalizeKey } from "@/lib/i18n/names";

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
