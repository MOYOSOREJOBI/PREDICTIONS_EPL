import { NextRequest, NextResponse } from "next/server";
import { predictSchema } from "@/lib/validate";
import { buildFeatureVector } from "@/lib/features";
import { predictAdaBoost } from "@/lib/adaboost";
import { artifacts } from "@/lib/artifacts";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = predictSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const { homeTeam, awayTeam } = parsed.data;
    const validTeams = Object.keys(artifacts.teams.teams);
    if (!validTeams.includes(homeTeam) || !validTeams.includes(awayTeam)) {
      return NextResponse.json({ ok: false, error: `Unknown team. Valid teams: ${validTeams.join(", ")}` }, { status: 400 });
    }

    const { features, explain } = buildFeatureVector(homeTeam, awayTeam);
    const prediction = predictAdaBoost(features);

    try {
      await prisma.prediction.create({
        data: {
          homeTeam,
          awayTeam,
          probsH: prediction.probs.H,
          probsD: prediction.probs.D,
          probsA: prediction.probs.A,
          predictedLabel: prediction.label,
          modelVersion: artifacts.model.version,
          featuresJson: explain as Prisma.InputJsonValue,
          userAgent: req.headers.get("user-agent") ?? undefined
        }
      });
    } catch {
      // DB optional in local smoke runs
    }

    return NextResponse.json({
      ok: true,
      prediction,
      explain,
      modelVersion: artifacts.model.version,
      updatedAt: artifacts.teams.updatedAt
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to process prediction request." }, { status: 500 });
  }
}
