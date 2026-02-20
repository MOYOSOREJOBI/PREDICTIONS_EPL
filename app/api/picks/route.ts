import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionKey } from "@/lib/session";

export async function POST(req: NextRequest) {
  const sessionKey = await getOrCreateSessionKey();
  const session = await prisma.userSession.upsert({ where: { sessionKey }, update: {}, create: { sessionKey } });
  const body = await req.json();
  const pick = await prisma.pick.create({
    data: {
      sessionId: session.id,
      matchId: body.matchId,
      selectionLabel: body.selection,
      oddsAtPick: body.oddsAtPick,
      stake: body.stake,
      predictedProbs: body.predictedProbs,
      edge: body.edge,
      ev: body.ev
    }
  });
  return NextResponse.json({ pick });
}

export async function GET() {
  const sessionKey = await getOrCreateSessionKey();
  const session = await prisma.userSession.findUnique({ where: { sessionKey } });
  if (!session) return NextResponse.json({ picks: [], summary: { roi: 0, profit: 0, count: 0 } });
  const picks = await prisma.pick.findMany({ where: { sessionId: session.id }, include: { match: true }, orderBy: { createdAt: "desc" } });
  const settled = picks.filter((p) => p.profit !== null);
  const profit = settled.reduce((acc, p) => acc + (p.profit ?? 0), 0);
  const stake = settled.reduce((acc, p) => acc + (p.stake ?? 1), 0);
  const roi = stake > 0 ? profit / stake : 0;
  return NextResponse.json({ picks, summary: { roi, profit, count: picks.length } });
}
