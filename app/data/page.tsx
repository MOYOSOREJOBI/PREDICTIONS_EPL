import { Card } from "@/components/Card";
import { artifacts } from "@/lib/artifacts";

export default function DataPage() {
  return <Card><h2 className="mb-4 text-lg font-semibold">Data</h2><p className="text-sm text-zinc-600">Source: {artifacts.metadata.dataSource}</p><p className="text-sm text-zinc-600">Updated: {artifacts.metadata.updatedAt}</p></Card>;
}
