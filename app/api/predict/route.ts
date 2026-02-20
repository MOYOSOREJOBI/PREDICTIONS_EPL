import { NextRequest, NextResponse } from "next/server";
import fixtures from "@/artifacts/fixtures.json";
import { evTable, predictMatch } from "@/lib/model";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fixture = body.matchId ? (fixtures.fixtures as any[]).find((f) => f.id === body.matchId) : null;
  const homeTeam = body.homeTeam ?? fixture?.homeTeam;
  const awayTeam = body.awayTeam ?? fixture?.awayTeam;
  if (!homeTeam || !awayTeam) return NextResponse.json({ error: "homeTeam and awayTeam are required" }, { status: 400 });
  const odds = body.odds ?? fixture?.odds;
  const prediction = predictMatch(homeTeam, awayTeam, odds);
  const recommendation = odds?.home && odds?.draw && odds?.away ? evTable(prediction.probs, odds) : null;
  return NextResponse.json({ ...prediction, recommendation });
}
