import { artifacts } from "@/lib/artifacts";
import { normalizeOdds } from "@/lib/odds";

export function buildFeatureVector(homeTeam: string, awayTeam: string): { features: number[]; explain: Record<string, unknown> } {
  const home = artifacts.teams.teams[homeTeam as keyof typeof artifacts.teams.teams];
  const away = artifacts.teams.teams[awayTeam as keyof typeof artifacts.teams.teams];
  if (!home || !away) {
    throw new Error("Unknown team provided.");
  }
  const fixture = artifacts.fixtures.fixtures.find((item) => item.homeTeam === homeTeam && item.awayTeam === awayTeam);
  const odds = fixture?.odds ? normalizeOdds(fixture.odds.home, fixture.odds.draw, fixture.odds.away) : { pH: 0.45, pD: 0.27, pA: 0.28, overround: 1 };

  const eloDiff = home.elo - away.elo;
  const formDiff5 = home.form_points_last5 - away.form_points_last5;
  const formDiff10 = home.form_points_last10 - away.form_points_last10;

  return {
    features: [
      home.elo,
      away.elo,
      eloDiff,
      home.form_points_last5,
      away.form_points_last5,
      formDiff5,
      home.form_points_last10,
      away.form_points_last10,
      formDiff10,
      odds.pH,
      odds.pD,
      odds.pA
    ],
    explain: { eloDiff, formDiff5, formDiff10, odds }
  };
}
