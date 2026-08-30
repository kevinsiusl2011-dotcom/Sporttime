import type { CatalogLeague, FeaturedGroup } from "@/lib/sports/types";

export type CatalogEntry = CatalogLeague & { aliases?: string[] };

export const CATALOG: CatalogEntry[] = [
  { id: "4328", name: "English Premier League", sport: "Soccer", country: "England", aliases: ["Premier League", "EPL"] },
  { id: "4329", name: "English League Championship", sport: "Soccer", country: "England", aliases: ["Championship", "EFL"] },
  { id: "4330", name: "Scottish Premiership", sport: "Soccer", country: "Scotland", aliases: ["Scottish Premier League"] },
  { id: "4331", name: "German Bundesliga", sport: "Soccer", country: "Germany" },
  { id: "4332", name: "Italian Serie A", sport: "Soccer", country: "Italy" },
  { id: "4334", name: "French Ligue 1", sport: "Soccer", country: "France" },
  { id: "4335", name: "Spanish La Liga", sport: "Soccer", country: "Spain" },
  { id: "4337", name: "Dutch Eredivisie", sport: "Soccer", country: "Netherlands" },
  { id: "4338", name: "Belgian Pro League", sport: "Soccer", country: "Belgium" },
  { id: "4339", name: "Turkish Super Lig", sport: "Soccer", country: "Turkey" },
  { id: "4344", name: "Portuguese Primeira Liga", sport: "Soccer", country: "Portugal" },
  { id: "4346", name: "Major League Soccer", sport: "Soccer", country: "USA", aliases: ["MLS"] },
  { id: "4347", name: "Danish Superliga", sport: "Soccer", country: "Denmark" },
  { id: "4350", name: "Liga MX", sport: "Soccer", country: "Mexico" },
  { id: "4351", name: "Brazilian Serie A", sport: "Soccer", country: "Brazil" },
  { id: "4356", name: "Australian A-League", sport: "Soccer", country: "Australia" },
  { id: "4359", name: "Chinese Super League", sport: "Soccer", country: "China", aliases: ["CSL"] },
  { id: "4406", name: "Argentine Primera Division", sport: "Soccer", country: "Argentina" },
  { id: "4429", name: "FIFA World Cup", sport: "Soccer", country: "World" },
  { id: "4480", name: "UEFA Champions League", sport: "Soccer", country: "Europe" },
  { id: "4481", name: "UEFA Europa League", sport: "Soccer", country: "Europe" },
  { id: "4482", name: "FA Cup", sport: "Soccer", country: "England" },
  { id: "4483", name: "Copa del Rey", sport: "Soccer", country: "Spain" },
  { id: "4490", name: "UEFA Nations League", sport: "Soccer", country: "Europe" },
  { id: "4499", name: "Copa America", sport: "Soccer", country: "South America" },
  { id: "4501", name: "Copa Libertadores", sport: "Soccer", country: "South America" },
  { id: "4502", name: "UEFA European Championship", sport: "Soccer", country: "Europe", aliases: ["Euros"] },
  { id: "4503", name: "FIFA Club World Cup", sport: "Soccer", country: "World" },
  { id: "4512", name: "UEFA Super Cup", sport: "Soccer", country: "Europe" },
  { id: "4521", name: "NWSL", sport: "Soccer", country: "USA" },
  { id: "4633", name: "Japanese J1 League", sport: "Soccer", country: "Japan", aliases: ["J1"] },
  { id: "4668", name: "Saudi Pro League", sport: "Soccer", country: "Saudi Arabia" },
  { id: "4689", name: "South Korean K League 1", sport: "Soccer", country: "South Korea", aliases: ["K League"] },
  { id: "4719", name: "AFC Champions League", sport: "Soccer", country: "Asia" },
  { id: "4825", name: "Hong Kong Premier League", sport: "Soccer", country: "Hong Kong" },
  { id: "5071", name: "UEFA Conference League", sport: "Soccer", country: "Europe" },

  { id: "4387", name: "NBA", sport: "Basketball", country: "USA" },
  { id: "4388", name: "NBA G League", sport: "Basketball", country: "USA" },
  { id: "4408", name: "Spanish Liga ACB", sport: "Basketball", country: "Spain" },
  { id: "4434", name: "Australian NBL", sport: "Basketball", country: "Australia" },
  { id: "4441", name: "German BBL", sport: "Basketball", country: "Germany" },
  { id: "4442", name: "Chinese CBA", sport: "Basketball", country: "China", aliases: ["CBA"] },
  { id: "4516", name: "WNBA", sport: "Basketball", country: "USA" },
  { id: "4546", name: "EuroLeague Basketball", sport: "Basketball", country: "Europe" },
  { id: "4547", name: "EuroCup Basketball", sport: "Basketball", country: "Europe" },
  { id: "4549", name: "FIBA Basketball World Cup", sport: "Basketball", country: "World" },

  { id: "4391", name: "NFL", sport: "American Football", country: "USA" },
  { id: "4479", name: "NCAA Division 1", sport: "American Football", country: "USA", aliases: ["College Football"] },

  { id: "4424", name: "MLB", sport: "Baseball", country: "USA" },
  { id: "4591", name: "Nippon Baseball League", sport: "Baseball", country: "Japan", aliases: ["NPB"] },
  { id: "4830", name: "Korean KBO League", sport: "Baseball", country: "South Korea", aliases: ["KBO"] },

  { id: "4380", name: "NHL", sport: "Ice Hockey", country: "USA" },
  { id: "4419", name: "Swedish Hockey League", sport: "Ice Hockey", country: "Sweden" },

  { id: "4370", name: "Formula 1", sport: "Motorsport", country: "World", aliases: ["F1"] },
  { id: "4371", name: "Formula E", sport: "Motorsport", country: "World" },
  { id: "4373", name: "IndyCar Series", sport: "Motorsport", country: "USA" },
  { id: "4393", name: "NASCAR Cup Series", sport: "Motorsport", country: "USA" },
  { id: "4407", name: "MotoGP", sport: "Motorsport", country: "World" },
  { id: "4409", name: "WRC", sport: "Motorsport", country: "World", aliases: ["World Rally Championship"] },
  { id: "4486", name: "Formula 2", sport: "Motorsport", country: "World" },
  { id: "4489", name: "V8 Supercars", sport: "Motorsport", country: "Australia" },

  { id: "4464", name: "ATP World Tour", sport: "Tennis", country: "World", aliases: ["ATP"] },
  { id: "4517", name: "WTA Tour", sport: "Tennis", country: "World", aliases: ["WTA"] },

  { id: "4425", name: "PGA Tour", sport: "Golf", country: "USA" },
  { id: "4426", name: "European Tour", sport: "Golf", country: "Europe", aliases: ["DP World Tour"] },
  { id: "4553", name: "LPGA Tour", sport: "Golf", country: "USA" },
  { id: "5329", name: "LIV Golf", sport: "Golf", country: "World" },

  { id: "4465", name: "UCI World Tour", sport: "Cycling", country: "World", aliases: ["Tour de France", "Giro", "Vuelta"] },
  { id: "5312", name: "UCI Womens World Tour", sport: "Cycling", country: "World" },

  { id: "4414", name: "English Premiership Rugby", sport: "Rugby", country: "England" },
  { id: "4415", name: "English Super League", sport: "Rugby", country: "England" },
  { id: "4416", name: "National Rugby League", sport: "Rugby", country: "Australia", aliases: ["NRL"] },
  { id: "4430", name: "French Top 14", sport: "Rugby", country: "France" },
  { id: "4446", name: "United Rugby Championship", sport: "Rugby", country: "World", aliases: ["URC"] },
  { id: "4550", name: "European Rugby Champions Cup", sport: "Rugby", country: "Europe" },
  { id: "4551", name: "Super Rugby", sport: "Rugby", country: "World" },

  { id: "4456", name: "Australian AFL", sport: "Australian Football", country: "Australia", aliases: ["AFL"] },

  { id: "4460", name: "Indian Premier League", sport: "Cricket", country: "India", aliases: ["IPL"] },
  { id: "4461", name: "Australian Big Bash League", sport: "Cricket", country: "Australia", aliases: ["BBL"] },
  { id: "4463", name: "English t20 Blast", sport: "Cricket", country: "England" },

  { id: "4443", name: "UFC", sport: "Fighting", country: "USA" },
  { id: "4445", name: "Boxing", sport: "Fighting", country: "World" },
  { id: "4495", name: "ONE Championship", sport: "Fighting", country: "Asia", aliases: ["ONE"] },
  { id: "5430", name: "Professional Fighters League", sport: "Fighting", country: "USA", aliases: ["PFL"] },

  { id: "4514", name: "League of Legends World Championship", sport: "Esports", country: "World", aliases: ["Worlds"] },
  { id: "4528", name: "League of Legends Pro League", sport: "Esports", country: "China", aliases: ["LPL"] },
  { id: "4529", name: "League of Legends Champions Korea", sport: "Esports", country: "South Korea", aliases: ["LCK"] },
  { id: "4530", name: "League of Legends EMEA Championship", sport: "Esports", country: "Europe", aliases: ["LEC"] },
  { id: "5425", name: "ESL Pro League", sport: "Esports", country: "World" },
  { id: "5426", name: "BLAST Premier", sport: "Esports", country: "World" },

  { id: "4544", name: "Italian Volleyball League", sport: "Volleyball", country: "Italy" },
  { id: "4533", name: "German Handball-Bundesliga", sport: "Handball", country: "Germany" },

  { id: "4554", name: "PDC Darts", sport: "Darts", country: "World" },
  { id: "4555", name: "World Snooker", sport: "Snooker", country: "World" },
  { id: "4558", name: "Mens FIH Pro League", sport: "Field Hockey", country: "World" },
  { id: "5282", name: "Diamond League", sport: "Athletics", country: "World" },
  { id: "5007", name: "World Athletics Championships", sport: "Athletics", country: "World" },
];

export const FEATURED_GROUPS: FeaturedGroup[] = [
  {
    id: "football-global",
    sport: "Soccer",
    leagueIds: ["4328", "4335", "4332", "4331", "4334", "4480", "4481", "5071", "4346", "4351", "4406", "4337", "4344", "4429", "4502"],
  },
  {
    id: "football-cups",
    sport: "Soccer",
    leagueIds: ["4482", "4483", "4329", "4330", "4338", "4339", "4501", "4499", "4521"],
  },
  {
    id: "football-asia",
    sport: "Soccer",
    leagueIds: ["4633", "4689", "4359", "4356", "4825", "4668", "4719"],
  },
  {
    id: "basketball",
    sport: "Basketball",
    leagueIds: ["4387", "4516", "4546", "4442", "4408", "4434", "4441", "4549"],
  },
  {
    id: "north-america",
    sport: "American Football",
    leagueIds: ["4391", "4424", "4380", "4479"],
  },
  {
    id: "baseball-hockey",
    sport: "Baseball",
    leagueIds: ["4591", "4830", "4419"],
  },
  {
    id: "motorsport",
    sport: "Motorsport",
    leagueIds: ["4370", "4407", "4371", "4373", "4393", "4409", "4489"],
  },
  {
    id: "racket-golf",
    sport: "Tennis",
    leagueIds: ["4464", "4517", "4425", "4426", "4553"],
  },
  {
    id: "cycling",
    sport: "Cycling",
    leagueIds: ["4465", "5312"],
  },
  {
    id: "rugby-afl",
    sport: "Rugby",
    leagueIds: ["4414", "4416", "4456", "4430", "4446", "4551"],
  },
  {
    id: "cricket",
    sport: "Cricket",
    leagueIds: ["4460", "4461", "4463"],
  },
  {
    id: "combat",
    sport: "Fighting",
    leagueIds: ["4443", "4495", "4445", "5430"],
  },
  {
    id: "esports",
    sport: "Esports",
    leagueIds: ["4514", "4528", "4529", "4530", "5425", "5426"],
  },
  {
    id: "other",
    sport: "Multi",
    leagueIds: ["5282", "4554", "4555", "4544", "4533", "4558"],
  },
];
