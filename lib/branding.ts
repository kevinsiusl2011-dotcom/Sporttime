export function companyBranding() {
  const name = process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "Day Dream Production HK";
  const url = process.env.NEXT_PUBLIC_COMPANY_URL?.trim() || "";
  return { name, url };
}
