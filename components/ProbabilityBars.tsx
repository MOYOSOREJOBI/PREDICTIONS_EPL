import { pct } from "@/lib/format";

export function ProbabilityBars({ probs }: { probs: { H: number; D: number; A: number } }) {
  return <div className="space-y-3">{Object.entries(probs).map(([k, v]) => <div key={k}><div className="mb-1 flex justify-between text-xs"><span>{k}</span><span>{pct(v)}</span></div><div className="h-2 rounded bg-zinc-100"><div className="h-2 rounded bg-zinc-900" style={{ width: `${v * 100}%` }} /></div></div>)}</div>;
}
