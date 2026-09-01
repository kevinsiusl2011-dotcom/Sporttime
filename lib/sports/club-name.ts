import { lookupName, normalizeKey } from "@/lib/i18n/names";

const CANONICAL: Record<string, string> = {
  psg: "paris saint germain",
  "paris sg": "paris saint germain",
  "man utd": "manchester united",
  "man united": "manchester united",
  "man city": "manchester city",
  spurs: "tottenham",
  "tottenham hotspur": "tottenham",
  wolves: "wolverhampton wanderers",
  inter: "inter milan",
  atletico: "atletico madrid",
  barca: "barcelona",
};

function stripClubDecorations(key: string) {
  return key
    .replace(/^(the)\s+/, "")
    .replace(/^(afc|fc|cf|ac|as|sc|ssc|rcd?|cd|ud|sd)\s+/, "")
    .replace(/\s+(u19|u21|u23|fc|cf|afc|women|wfc|basketball|football club)$/, "")
    .trim();
}

export function clubIdentity(value: string): string {
  const key = stripClubDecorations(normalizeKey(value).replace(/-/g, " "));
  return CANONICAL[key] ?? key;
}

export function clubNamesMatch(left?: string | null, right?: string | null): boolean {
  if (!left || !right) return false;
  const a = clubIdentity(left);
  const b = clubIdentity(right);
  if (!a || !b) return false;
  if (a === b) return true;

  const leftName = lookupName(left);
  const rightName = lookupName(right);
  if (leftName && rightName && leftName.hant === rightName.hant) return true;

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length >= 6 && longer.includes(shorter);
}

export function eventInvolvesClub(
  event: { home?: string; away?: string; title: string },
  label: string,
): boolean {
  if (clubNamesMatch(event.home, label) || clubNamesMatch(event.away, label)) return true;
  if (event.home || event.away) return false;
  const core = clubIdentity(label);
  return core.length >= 5 && normalizeKey(event.title).includes(core);
}
