import { NextRequest, NextResponse } from "next/server";
import fixtures from "@/artifacts/fixtures.json";
import { evTable, predictMatch } from "@/lib/model";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const team = q.get("team")?.toLowerCase();
  const from = q.get("from");
  const to = q.get("to");
  const sort = q.get("sort") ?? "kickoff";

  let rows = fixtures.fixtures.map((f: any) => {
    const p = predictMatch(f.homeTeam, f.awayTeam, f.odds);
    const rec = f.odds?.home && f.odds?.draw && f.odds?.away ? evTable(p.probs, f.odds) : null;
    return { ...f, prediction: p, recommendation: rec };
  });

  if (team) rows = rows.filter((r: any) => r.homeTeam.toLowerCase().includes(team) || r.awayTeam.toLowerCase().includes(team));
  if (from) rows = rows.filter((r: any) => r.kickoff >= from);
  if (to) rows = rows.filter((r: any) => r.kickoff <= to);
  rows = rows.sort((a: any, b: any) => {
    if (sort === "ev") return (b.recommendation?.ev?.H ?? -999) - (a.recommendation?.ev?.H ?? -999);
    if (sort === "edge") return (b.recommendation?.edge?.H ?? -999) - (a.recommendation?.edge?.H ?? -999);
    return a.kickoff.localeCompare(b.kickoff);
  });

  return NextResponse.json({ fixtures: rows });
}
