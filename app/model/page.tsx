import { Card } from "@/components/Card";
import { artifacts } from "@/lib/artifacts";

export default function ModelPage() {
  return <Card><h2 className="mb-4 text-lg font-semibold">Model</h2><p className="text-sm text-zinc-600">Algorithm: {artifacts.model.algorithm} {artifacts.model.samme}</p><p className="text-sm text-zinc-600">Version: {artifacts.model.version}</p><p className="text-sm text-zinc-600">Accuracy: {artifacts.metrics.accuracy}</p></Card>;
}
