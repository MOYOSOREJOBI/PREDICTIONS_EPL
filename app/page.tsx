import Link from "next/link";
import fixtures from "@/artifacts/fixtures.json";
import metrics from "@/artifacts/metrics.json";

export default function Page() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">EPL Prediction Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Production-oriented probabilities, value detection, and pick tracking.</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-zinc-500">Accuracy</p><p className="text-2xl font-semibold">{(metrics.accuracy*100).toFixed(1)}%</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-zinc-500">LogLoss</p><p className="text-2xl font-semibold">{metrics.logloss.toFixed(3)}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-zinc-500">Brier</p><p className="text-2xl font-semibold">{metrics.brier.toFixed(3)}</p></div>
      </section>
      <section className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Upcoming fixtures</h2><Link href="/fixtures" className="text-sm underline">View all</Link></div>
        <div className="space-y-2 text-sm">{fixtures.fixtures.slice(0,8).map((f) => <div key={f.id} className="flex justify-between border-b py-2"><span>{f.homeTeam} vs {f.awayTeam}</span><Link href={`/match/${f.id}`} className="underline">Details</Link></div>)}</div>
      </section>
    </div>
  );
}
