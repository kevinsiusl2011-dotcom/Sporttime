import type { Metadata, Viewport } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import Script from "next/script";
import { companyBranding } from "@/lib/branding";
import { getDictionary, type Dictionary } from "@/lib/i18n";
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
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getDictionary();
  const company = companyBranding();
  const url = publicAppUrl();
  const title = `${t.brand} — ${t.tagline}`;
  const keywords = (t as Dictionary & { seoKeywords?: string }).seoKeywords || t.tagline;
  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s · ${t.brand}`,
    },
    description: t.heroBody,
    keywords,
    applicationName: t.brand,
    publisher: company.name,
    authors: [{ name: company.name, url: company.url }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: t.heroBody,
      url,
      siteName: t.brand,
      locale: locale === "en" ? "en_GB" : locale.replace("-", "_"),
      type: "website",
      emails: ["hello@daydreamprohk.ai"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.heroBody,
      creator: "@daydreamprohk",
    },
    category: "Sports,Calendar,Utilities,Hong Kong",
    classification: "Sports calendar planner",
    appleWebApp: {
      title: t.brand,
      capable: true,
      statusBarStyle: "default",
    },
    icons: {
      icon: "/icon.svg",
    },
    appleWebApp: {
      capable: true,
      title: t.brand,
      statusBarStyle: "default",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getDictionary();
  const company = companyBranding();
  const url = publicAppUrl();
  const title = `${t.brand} — ${t.tagline}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.brand,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web, iOS, Android (via calendar apps)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "HKD",
    },
    description: t.heroBody,
    headline: title,
    url,
    publisher: {
      "@type": "Organization",
      name: company.name,
      url: company.url,
      logo: {
        "@type": "ImageObject",
        url: `${url}/icon.svg`,
      },
    },
    sameAs: [company.url].filter(Boolean),
    inLanguage: locale,
    keywords: (t as Dictionary & { seoKeywords?: string }).seoKeywords || t.tagline,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
      bestRating: "5",
      worstRating: "1",
    },
  };
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
<body className="antialiased pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</body>
      <Script
        id="ld-json-sporttime"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </html>
  );
}

