import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { getDictionary } from "@/lib/i18n";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: `${t.brand} — ${t.tagline}`,
    description: t.heroBody,
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
