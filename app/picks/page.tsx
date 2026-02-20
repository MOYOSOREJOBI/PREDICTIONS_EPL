import { apiGet } from "@/lib/api";

export default async function PicksPage() {
  const data = await apiGet<any>(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/picks`);
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold">My Picks</h1>
      <p className="mb-4 text-sm text-zinc-600">Profit: {data.summary.profit?.toFixed?.(2) ?? 0} | ROI: {(100*(data.summary.roi ?? 0)).toFixed(1)}%</p>
      <ul className="space-y-2 text-sm">{data.picks.map((p:any) => <li className="rounded border p-3" key={p.id}>{p.selectionLabel} @ {p.oddsAtPick} · EV {p.ev.toFixed(3)}</li>)}</ul>
    </div>
  );
}
