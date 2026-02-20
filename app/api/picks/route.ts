import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionKey } from "@/lib/session";

export async function POST(req: NextRequest) {
  const sessionKey = getOrCreateSessionKey();
  const body = await req.json();
  const pick = await prisma.pick.create({
    data: {
      sessionKey,
      matchId: body.matchId,
      selectionLabel: body.selectionLabel,
      oddsAtPick: body.oddsAtPick,
      stake: body.stake ?? 1,
      probsAtPickJson: body.probsAtPickJson,
      edge: body.edge,
      ev: body.ev
    }
  });
  return NextResponse.json({ pick });
}

export async function GET() {
  const sessionKey = getOrCreateSessionKey();
  const picks = await prisma.pick.findMany({ where: { sessionKey }, include: { match: true }, orderBy: { createdAt: "desc" } });
  const settled = picks.filter((p) => p.profit !== null);
  const wins = settled.filter((p) => (p.profit ?? 0) > 0).length;
  const profit = settled.reduce((acc, p) => acc + (p.profit ?? 0), 0);
  const stake = settled.reduce((acc, p) => acc + (p.stake ?? 0), 0);
  return NextResponse.json({
    picks,
    summary: {
      count: picks.length,
      hitRate: settled.length ? wins / settled.length : 0,
      profit,
      roi: stake ? profit / stake : 0
    }
  });
}
