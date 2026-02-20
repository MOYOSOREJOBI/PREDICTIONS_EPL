import { apiGet } from "@/lib/api";
import { AddPickButton } from "@/components/AddPickButton";

export default async function MatchPage({ params }: { params: { id: string } }) {
  const data = await apiGet<any>(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/match/${params.id}`);
  return (
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <h1 className="text-xl font-semibold">{data.match.homeTeam} vs {data.match.awayTeam}</h1>
      <p className="text-sm text-zinc-600">Probability H/D/A: {(data.prediction.probs.H * 100).toFixed(1)} / {(data.prediction.probs.D * 100).toFixed(1)} / {(data.prediction.probs.A * 100).toFixed(1)}</p>
      <p className="text-sm text-zinc-600">Expected goals: {data.prediction.expectedGoals.home.toFixed(2)} - {data.prediction.expectedGoals.away.toFixed(2)}</p>
      <div className="rounded border p-3 text-sm">Top scorelines: {data.prediction.topScorelines.map((s: any) => `${s.homeGoals}-${s.awayGoals} (${(s.probability * 100).toFixed(1)}%)`).join(", ")}</div>
      <AddPickButton matchId={data.match.id} probs={data.prediction.probs} odds={data.match.odds} />
    </div>
  );
}
