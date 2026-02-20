import { Card } from "@/components/Card";
import { artifacts } from "@/lib/artifacts";

export default function TeamsPage() {
  return <Card><h2 className="mb-4 text-lg font-semibold">Teams</h2><div className="space-y-2 text-sm">{Object.entries(artifacts.teams.teams).map(([name, state]) => <p key={name}>{name} · ELO {state.elo} · Last5 {state.form_points_last5}</p>)}</div></Card>;
}
