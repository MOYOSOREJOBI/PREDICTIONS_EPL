import { notFound } from "next/navigation";
import { AddPickButton } from "@/components/AddPickButton";
import { getFixtureById } from "@/lib/fixtures";

export default async function MatchPage({ params }: { params: { id: string } }) {
  const row = getFixtureById(params.id);
  if (!row) notFound();

  return (
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <h1 className="text-xl font-semibold">
        {row.homeTeam} vs {row.awayTeam}
      </h1>
      <p className="text-sm text-zinc-600">
        Probability H/D/A: {(row.prediction.probs.H * 100).toFixed(1)} / {(row.prediction.probs.D * 100).toFixed(1)} /{" "}
        {(row.prediction.probs.A * 100).toFixed(1)}
      </p>
      <p className="text-sm text-zinc-600">
        Expected goals: {row.prediction.expectedGoals.home.toFixed(2)} - {row.prediction.expectedGoals.away.toFixed(2)}
      </p>
      <div className="rounded border p-3 text-sm">
        Top scorelines: {row.prediction.topScorelines.map((s) => `${s.homeGoals}-${s.awayGoals} (${(s.probability * 100).toFixed(1)}%)`).join(", ")}
      </div>
      <AddPickButton matchId={row.id} probs={row.prediction.probs} odds={row.odds} />
    </div>
  );
}
