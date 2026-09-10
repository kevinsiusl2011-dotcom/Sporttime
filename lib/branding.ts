export function companyBranding() {
  const name = process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "Day Dream Production HK";
  const url = process.env.NEXT_PUBLIC_COMPANY_URL?.trim() || "https://daydreamprohk.ai";
  const tagline =
    process.env.NEXT_PUBLIC_COMPANY_TAGLINE?.trim() ||
    "企業級 AI 客服 · 自動化商戶營運 · RAG 知識庫";
  return { name, url, tagline };
}
