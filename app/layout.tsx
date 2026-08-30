import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { AuthRedirect } from "@/components/auth-redirect";
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
  const { locale, t } = await getDictionary();
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased pb-16 md:pb-0">
        <AuthRedirect locale={locale} completingLabel={t.completingSignIn} />
        {children}
      </body>
    </html>
  );
}
