import { sportSlug } from "@/lib/sports/catalog";
import type { CatalogTeam } from "@/lib/sports/types";

type TeamSeed = {
  id?: string;
  name: string;
  league: string;
  leagueId: string;
  country?: string;
};

const LISTS: Record<string, TeamSeed[]> = {
  Soccer: [
    { id: "133604", name: "Arsenal", league: "English Premier League", leagueId: "4328", country: "England" },
    { id: "133610", name: "Chelsea", league: "English Premier League", leagueId: "4328", country: "England" },
    { id: "133602", name: "Liverpool", league: "English Premier League", leagueId: "4328", country: "England" },
    { id: "133613", name: "Manchester City", league: "English Premier League", leagueId: "4328", country: "England" },
    { id: "133612", name: "Manchester United", league: "English Premier League", leagueId: "4328", country: "England" },
    { id: "133616", name: "Tottenham", league: "English Premier League", leagueId: "4328", country: "England" },
    { id: "134777", name: "Newcastle United", league: "English Premier League", leagueId: "4328", country: "England" },
    { id: "133739", name: "Barcelona", league: "Spanish La Liga", leagueId: "4335", country: "Spain" },
    { id: "133738", name: "Real Madrid", league: "Spanish La Liga", leagueId: "4335", country: "Spain" },
    { id: "133729", name: "Atletico Madrid", league: "Spanish La Liga", leagueId: "4335", country: "Spain" },
    { id: "133664", name: "Bayern Munich", league: "German Bundesliga", leagueId: "4331", country: "Germany" },
    { id: "133650", name: "Borussia Dortmund", league: "German Bundesliga", leagueId: "4331", country: "Germany" },
    { id: "133714", name: "Paris Saint-Germain", league: "French Ligue 1", leagueId: "4334", country: "France" },
    { id: "133681", name: "Inter", league: "Italian Serie A", leagueId: "4332", country: "Italy" },
    { id: "133667", name: "AC Milan", league: "Italian Serie A", leagueId: "4332", country: "Italy" },
    { id: "133676", name: "Juventus", league: "Italian Serie A", leagueId: "4332", country: "Italy" },
    { id: "133670", name: "Napoli", league: "Italian Serie A", leagueId: "4332", country: "Italy" },
    { id: "133772", name: "Ajax", league: "Dutch Eredivisie", leagueId: "4337", country: "Netherlands" },
    { id: "135708", name: "Sporting CP", league: "Portuguese Primeira Liga", leagueId: "4344", country: "Portugal" },
    { id: "134108", name: "Benfica", league: "Portuguese Primeira Liga", leagueId: "4344", country: "Portugal" },
    { name: "Kitchee", league: "Hong Kong Premier League", leagueId: "4825", country: "Hong Kong" },
    { name: "Lee Man", league: "Hong Kong Premier League", leagueId: "4825", country: "Hong Kong" },
    { name: "Eastern", league: "Hong Kong Premier League", leagueId: "4825", country: "Hong Kong" },
    { name: "Inter Miami", league: "Major League Soccer", leagueId: "4346", country: "USA" },
    { name: "Al-Nassr", league: "Saudi Pro League", leagueId: "4668", country: "Saudi Arabia" },
  ],
  Basketball: [
    { name: "Los Angeles Lakers", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Boston Celtics", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Golden State Warriors", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Chicago Bulls", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Miami Heat", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "New York Knicks", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Dallas Mavericks", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Denver Nuggets", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Milwaukee Bucks", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Phoenix Suns", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Oklahoma City Thunder", league: "NBA", leagueId: "4387", country: "USA" },
    { name: "Minnesota Timberwolves", league: "NBA", leagueId: "4387", country: "USA" },
  ],
  "American Football": [
    { name: "Kansas City Chiefs", league: "NFL", leagueId: "4391", country: "USA" },
    { name: "San Francisco 49ers", league: "NFL", leagueId: "4391", country: "USA" },
    { name: "Dallas Cowboys", league: "NFL", leagueId: "4391", country: "USA" },
    { name: "Philadelphia Eagles", league: "NFL", leagueId: "4391", country: "USA" },
    { name: "Buffalo Bills", league: "NFL", leagueId: "4391", country: "USA" },
    { name: "Baltimore Ravens", league: "NFL", leagueId: "4391", country: "USA" },
    { name: "Detroit Lions", league: "NFL", leagueId: "4391", country: "USA" },
    { name: "Green Bay Packers", league: "NFL", leagueId: "4391", country: "USA" },
  ],
  Baseball: [
    { name: "Los Angeles Dodgers", league: "MLB", leagueId: "4424", country: "USA" },
    { name: "New York Yankees", league: "MLB", leagueId: "4424", country: "USA" },
    { name: "Boston Red Sox", league: "MLB", leagueId: "4424", country: "USA" },
    { name: "Chicago Cubs", league: "MLB", leagueId: "4424", country: "USA" },
    { name: "San Francisco Giants", league: "MLB", leagueId: "4424", country: "USA" },
    { name: "Yomiuri Giants", league: "Nippon Baseball League", leagueId: "4591", country: "Japan" },
    { name: "Hanshin Tigers", league: "Nippon Baseball League", leagueId: "4591", country: "Japan" },
  ],
  "Ice Hockey": [
    { name: "Toronto Maple Leafs", league: "NHL", leagueId: "4380", country: "Canada" },
    { name: "Montreal Canadiens", league: "NHL", leagueId: "4380", country: "Canada" },
    { name: "Boston Bruins", league: "NHL", leagueId: "4380", country: "USA" },
    { name: "New York Rangers", league: "NHL", leagueId: "4380", country: "USA" },
    { name: "Edmonton Oilers", league: "NHL", leagueId: "4380", country: "Canada" },
    { name: "Colorado Avalanche", league: "NHL", leagueId: "4380", country: "USA" },
  ],
  Motorsport: [
    { name: "Red Bull Racing", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Mercedes", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Ferrari", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "McLaren", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Aston Martin", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Alpine", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Williams", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Racing Bulls", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Haas F1", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Kick Sauber", league: "Formula 1", leagueId: "4370", country: "World" },
    { name: "Ducati", league: "MotoGP", leagueId: "4407", country: "World" },
    { name: "Aprilia", league: "MotoGP", leagueId: "4407", country: "World" },
    { name: "Yamaha", league: "MotoGP", leagueId: "4407", country: "World" },
    { name: "Honda", league: "MotoGP", leagueId: "4407", country: "World" },
    { name: "KTM", league: "MotoGP", leagueId: "4407", country: "World" },
  ],
  Rugby: [
    { name: "Leinster", league: "United Rugby Championship", leagueId: "4446", country: "Ireland" },
    { name: "Munster", league: "United Rugby Championship", leagueId: "4446", country: "Ireland" },
    { name: "Toulouse", league: "French Top 14", leagueId: "4430", country: "France" },
    { name: "Saracens", league: "English Premiership Rugby", leagueId: "4414", country: "England" },
    { name: "Crusaders", league: "Super Rugby", leagueId: "4551", country: "New Zealand" },
    { name: "Melbourne Storm", league: "National Rugby League", leagueId: "4416", country: "Australia" },
  ],
  "Australian Football": [
    { name: "Collingwood", league: "Australian AFL", leagueId: "4456", country: "Australia" },
    { name: "Carlton", league: "Australian AFL", leagueId: "4456", country: "Australia" },
    { name: "Richmond", league: "Australian AFL", leagueId: "4456", country: "Australia" },
    { name: "Sydney Swans", league: "Australian AFL", leagueId: "4456", country: "Australia" },
    { name: "Geelong Cats", league: "Australian AFL", leagueId: "4456", country: "Australia" },
    { name: "Brisbane Lions", league: "Australian AFL", leagueId: "4456", country: "Australia" },
  ],
  Cricket: [
    { name: "Mumbai Indians", league: "Indian Premier League", leagueId: "4460", country: "India" },
    { name: "Chennai Super Kings", league: "Indian Premier League", leagueId: "4460", country: "India" },
    { name: "Royal Challengers Bengaluru", league: "Indian Premier League", leagueId: "4460", country: "India" },
    { name: "Kolkata Knight Riders", league: "Indian Premier League", leagueId: "4460", country: "India" },
    { name: "Sydney Sixers", league: "Australian Big Bash League", leagueId: "4461", country: "Australia" },
  ],
  Esports: [
    { name: "T1", league: "League of Legends Champions Korea", leagueId: "4529", country: "South Korea" },
    { name: "Gen.G", league: "League of Legends Champions Korea", leagueId: "4529", country: "South Korea" },
    { name: "JD Gaming", league: "League of Legends Pro League", leagueId: "4528", country: "China" },
    { name: "Bilibili Gaming", league: "League of Legends Pro League", leagueId: "4528", country: "China" },
    { name: "G2 Esports", league: "League of Legends EMEA Championship", leagueId: "4530", country: "Europe" },
    { name: "Natus Vincere", league: "BLAST Premier", leagueId: "5426", country: "World" },
  ],
  Volleyball: [
    { name: "Modena Volley", league: "Italian Volleyball League", leagueId: "4544", country: "Italy" },
    { name: "Trentino Volley", league: "Italian Volleyball League", leagueId: "4544", country: "Italy" },
  ],
  Handball: [
    { name: "THW Kiel", league: "German Handball-Bundesliga", leagueId: "4533", country: "Germany" },
    { name: "FC Barcelona Handball", league: "Spanish Liga ASOBAL", leagueId: "4534", country: "Spain" },
  ],
};

function toTeam(sport: string, seed: TeamSeed): CatalogTeam {
  return {
    id: seed.id || `${sportSlug(sport)}-${sportSlug(seed.name)}`,
    name: seed.name,
    sport,
    league: seed.league,
    leagueId: seed.leagueId,
    country: seed.country,
  };
}

export function popularTeamsForSport(sport: string): CatalogTeam[] {
  return (LISTS[sport] ?? []).map((seed) => toTeam(sport, seed));
}

export function popularTeamGroups(sport: string): Array<{ league: string; leagueId?: string; teams: CatalogTeam[] }> {
  const groups: Array<{ league: string; leagueId?: string; teams: CatalogTeam[] }> = [];
  for (const team of popularTeamsForSport(sport)) {
    const current = groups.find((group) => group.league === team.league);
    if (current) current.teams.push(team);
    else groups.push({ league: team.league ?? sport, leagueId: team.leagueId, teams: [team] });
  }
  return groups;
}
