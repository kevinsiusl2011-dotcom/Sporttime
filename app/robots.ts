import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  const base = publicAppUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/settings", "/setup"] },
    host: base,
    sitemap: [`${base}/sitemap.xml`],
  };
}
