import { Card } from "@/components/Card";

async function getHistory() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/history`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()).items as Array<{ id: string; homeTeam: string; awayTeam: string; predictedLabel: string }>;
}

export default async function HistoryPage() {
  const rows = await getHistory();
  return <Card><h2 className="mb-4 text-lg font-semibold">History</h2><div className="space-y-2 text-sm text-zinc-700">{rows.map((r) => <p key={r.id}>{r.homeTeam} vs {r.awayTeam} · {r.predictedLabel}</p>)}</div></Card>;
}
