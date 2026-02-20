export type Outcome = "H" | "D" | "A";

export type FixtureRow = {
  id: string;
  date: string;
  season: string;
  homeTeam: string;
  awayTeam: string;
  odds: { home: number; draw: number; away: number };
};
