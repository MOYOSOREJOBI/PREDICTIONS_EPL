import { apiGet } from "@/lib/api";

export default async function MatchPage({ params }: { params: { id: string } }) {
  const data = await apiGet<any>(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/match/${params.id}`);
  return (
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <h1 className="text-xl font-semibold">{data.match.homeTeam} vs {data.match.awayTeam}</h1>
      <p className="text-sm text-zinc-600">Probability H/D/A: {(data.prediction.probs.H*100).toFixed(1)} / {(data.prediction.probs.D*100).toFixed(1)} / {(data.prediction.probs.A*100).toFixed(1)}</p>
      <div className="grid gap-3 md:grid-cols-4 text-sm">
        <div className="rounded border p-3">ELO diff: {data.explanation.eloDiff}</div>
        <div className="rounded border p-3">Form5 diff: {data.explanation.form5Diff}</div>
        <div className="rounded border p-3">Form10 diff: {data.explanation.form10Diff}</div>
        <div className="rounded border p-3">Overround: {data.explanation.overround}</div>
      </div>
    </div>
  );
}
