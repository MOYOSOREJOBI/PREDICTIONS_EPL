import { NextResponse } from "next/server";
import fixtures from "@/artifacts/fixtures.json";
import { predictAdaBoost } from "@/lib/adaboost";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const match = fixtures.fixtures.find((f) => f.id === params.id);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const featureVector = [1512,1488,24,8,6,2,16,11,5,0.45,0.25,0.3,1.05];
  const prediction = predictAdaBoost(featureVector);
  return NextResponse.json({
    match,
    prediction,
    explanation: {
      eloDiff: featureVector[2],
      form5Diff: featureVector[5],
      form10Diff: featureVector[8],
      overround: featureVector[12]
    },
    oddsHistory: [match.odds]
  });
}
