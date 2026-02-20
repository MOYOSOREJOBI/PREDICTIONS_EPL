"use client";
import { useState } from "react";
import { Button } from "@/components/Button";
import { ProbabilityBars } from "@/components/ProbabilityBars";
import { Select } from "@/components/Select";

export function MatchForm({ teams }: { teams: string[] }) {
  const [homeTeam, setHomeTeam] = useState(teams[0] ?? "");
  const [awayTeam, setAwayTeam] = useState(teams[1] ?? "");
  const [data, setData] = useState<null | { prediction: { label: string; probs: { H: number; D: number; A: number } } }>(null);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ homeTeam, awayTeam }) });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? "Prediction failed");
      return;
    }
    setData(payload);
  }

  return <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Select value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}>{teams.map((t) => <option key={t}>{t}</option>)}</Select><Select value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}>{teams.map((t) => <option key={t}>{t}</option>)}</Select></div><Button onClick={submit}>Predict match</Button>{error ? <p className="text-sm text-zinc-600">{error}</p> : null}{data ? <ProbabilityBars probs={data.prediction.probs} /> : null}</div>;
}
