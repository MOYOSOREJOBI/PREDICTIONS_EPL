import { NextRequest, NextResponse } from "next/server";
import fixtures from "@/artifacts/fixtures.json";
import { predictAdaBoost } from "@/lib/adaboost";
import { buildRecommendation } from "@/lib/recommendation";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const team = q.get("team")?.toLowerCase();
  const sort = q.get("sort") || "date";

  let rows = fixtures.fixtures.map((f) => {
    const v = [1500,1500,0,7,7,0,14,14,0,0.42,0.28,0.30,1.06];
    const pred = predictAdaBoost(v).probs;
    const rec = buildRecommendation(pred, { home: f.odds.home, draw: f.odds.draw, away: f.odds.away });
    return { ...f, prediction: pred, recommendation: rec };
  });

  if (team) rows = rows.filter((r) => r.homeTeam.toLowerCase().includes(team) || r.awayTeam.toLowerCase().includes(team));
  rows = rows.sort((a, b) => sort === "ev" ? b.recommendation.ev.H - a.recommendation.ev.H : sort === "edge" ? b.recommendation.edge.H - a.recommendation.edge.H : a.date.localeCompare(b.date));
  return NextResponse.json({ fixtures: rows });
}
