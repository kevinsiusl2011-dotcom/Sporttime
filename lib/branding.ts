export function companyBranding() {
  const name = process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "Day Dream Production HK Limited";
  const url = process.env.NEXT_PUBLIC_COMPANY_URL?.trim() || "https://daydreamprohk.ai";
  const tagline =
    process.env.NEXT_PUBLIC_COMPANY_TAGLINE?.trim() ||
    "SportTime 業務由 Day Dream Production HK Limited 營運及持有（香港商業登記號碼：81197323）。";
  return { name, url, tagline };
}
