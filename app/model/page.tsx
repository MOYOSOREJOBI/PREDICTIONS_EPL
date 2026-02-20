import metrics from "@/artifacts/metrics.json";

export default function ModelPage() {
  return <div className="rounded-xl border bg-white p-6"><h1 className="mb-4 text-xl font-semibold">Model Metrics</h1><pre className="text-sm">{JSON.stringify(metrics, null, 2)}</pre></div>;
}
