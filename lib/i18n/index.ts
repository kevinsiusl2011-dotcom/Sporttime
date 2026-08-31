import { cookies } from "next/headers";
import { dictionaries, isLocale, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

export { isLocale };

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get("sporttime_locale")?.value;
  if (isLocale(value)) return value;
  return "zh-Hant";
}

export async function getDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

export { interpolate } from "@/lib/i18n/interpolate";
export type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
