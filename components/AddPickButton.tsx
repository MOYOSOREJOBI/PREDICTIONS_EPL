"use client";

import { useState } from "react";

export function AddPickButton({ matchId, probs, odds }: { matchId: string; probs: { H: number; D: number; A: number }; odds?: { home?: number; draw?: number; away?: number } }) {
  const [done, setDone] = useState(false);
  async function add() {
    if (!odds?.home || !odds?.draw || !odds?.away) return;
    const selectionLabel: "H" | "D" | "A" = "H";
    await fetch("/api/picks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ matchId, selectionLabel, oddsAtPick: odds.home, probsAtPickJson: probs, edge: 0, ev: probs.H * odds.home - 1, stake: 1 })
    });
    setDone(true);
  }
  return <button className="rounded bg-black px-3 py-2 text-sm text-white" onClick={add}>{done ? "Added" : "Add to slip"}</button>;
}
