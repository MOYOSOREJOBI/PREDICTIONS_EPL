import { Card } from "@/components/Card";
import { artifacts } from "@/lib/artifacts";

export default function FixturesPage() {
  return <Card><h2 className="mb-4 text-lg font-semibold">Fixtures</h2><div className="space-y-2 text-sm">{artifacts.fixtures.fixtures.map((f) => <p key={`${f.date}-${f.homeTeam}`}>{f.date} · {f.homeTeam} vs {f.awayTeam}</p>)}</div></Card>;
}
