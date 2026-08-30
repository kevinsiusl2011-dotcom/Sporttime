import { listLeagueTeams, lookupLeague, seasonEvents } from "@/lib/sports/thesportsdb";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const league = await lookupLeague(id);
  if (!league) return Response.json({ error: "Not found" }, { status: 404 });

  const [teams, events] = await Promise.all([listLeagueTeams(id), seasonEvents(id, league.sport)]);
  return Response.json({ league, teams, events });
}
