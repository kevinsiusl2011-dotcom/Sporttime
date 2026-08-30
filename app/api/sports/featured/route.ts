import { loadFeaturedShelves } from "@/lib/sports/catalog";

export async function GET() {
  const shelves = await loadFeaturedShelves();
  return Response.json({ shelves });
}
