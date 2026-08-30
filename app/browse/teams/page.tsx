import { redirect } from "next/navigation";
import { listCatalogSports, sportSlug } from "@/lib/sports/catalog";

export default function TeamsBrowseIndexPage() {
  const first = listCatalogSports()[0];
  redirect(`/browse/sport/${sportSlug(first ?? "Soccer")}/teams`);
}
