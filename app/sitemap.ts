import type { MetadataRoute } from "next";
import { publicAppUrl } from "@/lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicAppUrl();
  return ["", "/browse", "/search", "/preview", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
