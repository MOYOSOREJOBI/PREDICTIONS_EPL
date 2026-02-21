import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function PicksPage() {
  const sessionKey = cookies().get("sessionKey")?.value;

  if (!sessionKey) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold">My Picks</h1>
        <p className="text-sm text-zinc-600">No picks yet for this browser session.</p>
      </div>
    );
  }

  try {
    const picks = await prisma.pick.findMany({
      where: { sessionKey },
      include: { match: true },
      orderBy: { createdAt: "desc" },
    });

    const settled = picks.filter((p) => p.profit !== null);
    const wins = settled.filter((p) => (p.profit ?? 0) > 0).length;
    const profit = settled.reduce((acc, p) => acc + (p.profit ?? 0), 0);
    const stake = settled.reduce((acc, p) => acc + (p.stake ?? 0), 0);
    const roi = stake ? profit / stake : 0;

    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold">My Picks</h1>
        <p className="mb-4 text-sm text-zinc-600">
          Profit: {profit.toFixed(2)} | ROI: {(100 * roi).toFixed(1)}% | Hit rate: {settled.length ? ((wins / settled.length) * 100).toFixed(1) : "0.0"}%
        </p>
        <ul className="space-y-2 text-sm">
          {picks.map((p) => (
            <li className="rounded border p-3" key={p.id}>
              {p.selectionLabel} @ {p.oddsAtPick} · EV {p.ev.toFixed(3)}
            </li>
          ))}
        </ul>
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold">My Picks</h1>
        <p className="text-sm text-zinc-600">Picks are temporarily unavailable. Please try again shortly.</p>
      </div>
    );
  }
}
