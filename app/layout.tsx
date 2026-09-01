import type { Metadata, Viewport } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { getDictionary } from "@/lib/i18n";
import { publicAppUrl } from "@/lib/urls";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  themeColor: "#f3f6f4",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getDictionary();
  const url = publicAppUrl();
  const title = `${t.brand} — ${t.tagline}`;
  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s · ${t.brand}`,
    },
    description: t.heroBody,
    applicationName: t.brand,
    openGraph: {
      title,
      description: t.heroBody,
      url,
      siteName: t.brand,
      locale: locale === "en" ? "en_GB" : locale.replace("-", "_"),
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: t.heroBody,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getDictionary();
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased pb-16 md:pb-0">{children}</body>
    </html>
  );
}
