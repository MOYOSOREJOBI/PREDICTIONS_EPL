import { NextRequest, NextResponse } from "next/server";
import fixtures from "@/artifacts/fixtures.json";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, refreshedFixtures: (fixtures as any).fixtures.length, note: "Use workflow for full retrain." });
}
