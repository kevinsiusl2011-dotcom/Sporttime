export function parseFeedToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const fromUrl = trimmed.match(/\/api\/calendar\/([^/?#]+)/i);
  const candidate = (fromUrl?.[1] ?? trimmed).replace(/\.ics$/i, "").trim();
  return candidate;
}
