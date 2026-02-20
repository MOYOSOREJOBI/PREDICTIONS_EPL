import { describe, expect, it } from "vitest";
import { evTable, normalizeOdds, predictMatch } from "../lib/model";

describe("model inference", () => {
  it("normalizes implied probabilities", () => {
    const p = normalizeOdds(2.2, 3.3, 3.4)!;
    expect(p.H + p.D + p.A).toBeCloseTo(1, 8);
  });

  it("scoreline probabilities are bounded and top scorelines exist", () => {
    const out = predictMatch("Arsenal", "Chelsea", { home: 2.2, draw: 3.4, away: 3.5 });
    const s = out.probs.H + out.probs.D + out.probs.A;
    expect(s).toBeCloseTo(1, 6);
    expect(out.topScorelines.length).toBe(5);
  });

  it("blending and ev are stable", () => {
    const out = predictMatch("Liverpool", "Everton", { home: 1.8, draw: 3.8, away: 4.8 });
    const ev = evTable(out.probs, { home: 1.8, draw: 3.8, away: 4.8 });
    expect(Number.isFinite(ev.ev.H)).toBe(true);
    expect(Number.isFinite(out.expectedGoals.home)).toBe(true);
  });
});
