import { NextRequest, NextResponse } from "next/server";
import fixtures from "@/artifacts/fixtures.json";
import { predictAdaBoost } from "@/lib/adaboost";
import { buildRecommendation } from "@/lib/recommendation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fixture = body.matchId ? fixtures.fixtures.find((f) => f.id === body.matchId) : null;
  const odds = body.odds ?? fixture?.odds;
  if (!odds) return NextResponse.json({ error: "odds required" }, { status: 400 });
  const prediction = predictAdaBoost([1500,1500,0,7,7,0,14,14,0,0.42,0.28,0.30,1.06]);
  const recommendation = buildRecommendation(prediction.probs, { home: odds.home, draw: odds.draw, away: odds.away });
  return NextResponse.json({ probs: prediction.probs, ...recommendation });
}
