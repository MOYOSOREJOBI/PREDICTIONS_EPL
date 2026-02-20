import { Card } from "@/components/Card";
import { MatchForm } from "@/components/MatchForm";
import { artifacts } from "@/lib/artifacts";

export default function DashboardPage() {
  const teams = Object.keys(artifacts.teams.teams);
  return <div className="grid gap-6 lg:grid-cols-2"><Card><h2 className="mb-4 text-lg font-semibold">Quick predict</h2><MatchForm teams={teams} /></Card><Card><h2 className="mb-4 text-lg font-semibold">Next fixtures</h2><ul className="space-y-2 text-sm text-zinc-600">{artifacts.fixtures.fixtures.map((f) => <li key={`${f.date}${f.homeTeam}`}>{f.date} · {f.homeTeam} vs {f.awayTeam}</li>)}</ul></Card></div>;
}
