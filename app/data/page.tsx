import metadata from "@/artifacts/metadata.json";

export default function DataPage() {
  return <div className="rounded-xl border bg-white p-6"><h1 className="mb-4 text-xl font-semibold">Data Status</h1><pre className="text-sm">{JSON.stringify(metadata, null, 2)}</pre></div>;
}
