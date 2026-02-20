import { Card } from "@/components/Card";
import { MatchForm } from "@/components/MatchForm";
import { artifacts } from "@/lib/artifacts";

export default function PredictPage() {
  return <Card><h2 className="mb-4 text-lg font-semibold">Predict Match</h2><MatchForm teams={Object.keys(artifacts.teams.teams)} /></Card>;
}
