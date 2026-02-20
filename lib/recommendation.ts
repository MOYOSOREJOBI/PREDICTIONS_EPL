import { normalizeOdds } from "@/lib/odds";
import { Outcome } from "@/lib/types";

export function buildRecommendation(probs: Record<Outcome, number>, odds: { home: number; draw: number; away: number }) {
  const implied = normalizeOdds(odds.home, odds.draw, odds.away);
  const edge = {
    H: probs.H - implied.pH,
    D: probs.D - implied.pD,
    A: probs.A - implied.pA
  };
  const ev = {
    H: probs.H * (odds.home - 1) - (1 - probs.H),
    D: probs.D * (odds.draw - 1) - (1 - probs.D),
    A: probs.A * (odds.away - 1) - (1 - probs.A)
  };
  const best = (["H", "D", "A"] as Outcome[]).sort((a, b) => ev[b] - ev[a])[0];
  const maxProb = Math.max(probs.H, probs.D, probs.A);
  const confidence = maxProb > 0.55 && edge[best] > 0.08 ? "High" : maxProb > 0.45 && edge[best] > 0.03 ? "Medium" : "Low";
  return { implied, edge, ev, recommended: ev[best] > 0.02 && probs[best] > 0.25 ? best : null, confidence };
}
