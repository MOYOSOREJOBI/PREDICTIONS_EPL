import Link from "next/link";
import { apiGet } from "@/lib/api";

export const revalidate = 60;

export default async function FixturesPage() {
  const data = await apiGet<{ fixtures: any[] }>(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/fixtures`);
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold">Fixtures</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-zinc-500"><th className="py-2">Kickoff</th><th>Match</th><th>Odds</th><th>W/D/L</th><th>EV(H)</th><th></th></tr></thead>
          <tbody>{data.fixtures.map((f) => <tr key={f.id} className="border-b"><td className="py-2">{new Date(f.kickoff).toLocaleString()}</td><td>{f.homeTeam} vs {f.awayTeam}</td><td>{f.odds.home ?? "-"}/{f.odds.draw ?? "-"}/{f.odds.away ?? "-"}</td><td>{(f.prediction.probs.H*100).toFixed(0)}-{(f.prediction.probs.D*100).toFixed(0)}-{(f.prediction.probs.A*100).toFixed(0)}</td><td>{f.recommendation?.ev?.H?.toFixed?.(3) ?? "-"}</td><td><Link className="underline" href={`/match/${f.id}`}>Open</Link></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
