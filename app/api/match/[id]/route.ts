import { NextResponse } from "next/server";
import { getFixtureById } from "@/lib/fixtures";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = getFixtureById(params.id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    match: {
      id: row.id,
      kickoff: row.kickoff,
      homeTeam: row.homeTeam,
      awayTeam: row.awayTeam,
      odds: row.odds,
      source: row.source,
    },
    prediction: row.prediction,
    recommendation: row.recommendation,
    oddsHistory: [row.odds],
  });
}
