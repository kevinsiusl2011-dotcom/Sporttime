import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${publicAppUrl()}/sitemap.xml`,
  };
}
