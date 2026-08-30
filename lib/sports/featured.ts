import type { FeaturedGroup } from "@/lib/sports/types";

export const FEATURED_GROUPS: FeaturedGroup[] = [
  {
    id: "football-global",
    sport: "Soccer",
    leagues: [
      { id: "4328", fallbackName: "English Premier League" },
      { id: "4335", fallbackName: "Spanish La Liga" },
      { id: "4332", fallbackName: "Italian Serie A" },
      { id: "4331", fallbackName: "German Bundesliga" },
      { id: "4334", fallbackName: "French Ligue 1" },
      { id: "4480", fallbackName: "UEFA Champions League" },
      { id: "4481", fallbackName: "UEFA Europa League" },
      { id: "4346", fallbackName: "Major League Soccer" },
      { id: "4350", fallbackName: "Liga MX" },
      { id: "4351", fallbackName: "Brazilian Serie A" },
      { id: "4406", fallbackName: "Argentine Primera Division" },
      { id: "4337", fallbackName: "Dutch Eredivisie" },
      { id: "4344", fallbackName: "Portuguese Primeira Liga" },
    ],
  },
  {
    id: "football-asia",
    sport: "Soccer",
    leagues: [
      { id: "4422", fallbackName: "Japanese J1 League" },
      { id: "4429", fallbackName: "Korean K League 1" },
      { id: "4441", fallbackName: "Chinese Super League" },
      { id: "4356", fallbackName: "Australian A-League" },
      { id: "4628", fallbackName: "Hong Kong Premier League" },
      { id: "4689", fallbackName: "Saudi Pro League" },
    ],
  },
  {
    id: "basketball",
    sport: "Basketball",
    leagues: [
      { id: "4387", fallbackName: "NBA" },
      { id: "4388", fallbackName: "NBA G League" },
      { id: "4547", fallbackName: "WNBA" },
      { id: "4513", fallbackName: "EuroLeague Basketball" },
    ],
  },
  {
    id: "north-america",
    sport: "American Football",
    leagues: [
      { id: "4391", fallbackName: "NFL" },
      { id: "4424", fallbackName: "MLB" },
      { id: "4380", fallbackName: "NHL" },
    ],
  },
  {
    id: "motorsport",
    sport: "Motorsport",
    leagues: [
      { id: "4370", fallbackName: "Formula 1" },
      { id: "4407", fallbackName: "MotoGP" },
      { id: "4371", fallbackName: "Formula E" },
    ],
  },
  {
    id: "other",
    sport: "Multi",
    leagues: [
      { id: "4414", fallbackName: "English Premiership Rugby" },
      { id: "4433", fallbackName: "NRL" },
      { id: "4438", fallbackName: "AFL" },
      { id: "4464", fallbackName: "ATP Tour" },
      { id: "4469", fallbackName: "WTA Tour" },
      { id: "4472", fallbackName: "Indian Premier League" },
      { id: "4546", fallbackName: "UFC" },
    ],
  },
];
