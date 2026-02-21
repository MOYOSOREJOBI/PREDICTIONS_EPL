import { NextRequest, NextResponse } from "next/server";
import { getFixtures } from "@/lib/fixtures";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const rows = getFixtures({
    team: q.get("team") ?? undefined,
    from: q.get("from") ?? undefined,
    to: q.get("to") ?? undefined,
    sort: (q.get("sort") as "kickoff" | "ev" | "edge" | null) ?? "kickoff",
    includePast: q.get("includePast") === "true",
  });

  return NextResponse.json({ fixtures: rows, total: rows.length });
}
