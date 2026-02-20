import { NextResponse } from "next/server";
import fixtures from "@/artifacts/fixtures.json";
import { predictMatch } from "@/lib/model";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const match = (fixtures.fixtures as any[]).find((f) => f.id === params.id);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const prediction = predictMatch(match.homeTeam, match.awayTeam, match.odds);
  return NextResponse.json({ match, prediction, oddsHistory: [match.odds] });
}
