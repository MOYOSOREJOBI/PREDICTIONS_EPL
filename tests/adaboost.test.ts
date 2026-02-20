import { describe, expect, it } from "vitest";
import { predictAdaBoost, softmax } from "../lib/adaboost";

describe("adaboost inference", () => {
  it("returns probabilities summing to 1", () => {
    const probs = softmax([1, 2, 3]);
    expect(probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
  });

  it("is deterministic and numerically stable", () => {
    const vec = [1520, 1490, 30, 8, 5, 3, 16, 10, 6, 0.48, 0.24, 0.28, 1.06];
    const a = predictAdaBoost(vec);
    const b = predictAdaBoost(vec);
    expect(a.probs.H + a.probs.D + a.probs.A).toBeCloseTo(1, 8);
    expect(Number.isNaN(a.probs.H)).toBe(false);
    expect(a.probs.H).toBeCloseTo(b.probs.H, 12);
    expect(a.label).toBe(b.label);
  });
});
