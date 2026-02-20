import { describe, expect, it } from "vitest";
import { normalizeOdds } from "../lib/odds";

describe("normalizeOdds", () => {
  it("normalizes implied probabilities", () => {
    const out = normalizeOdds(2.0, 3.5, 4.0);
    expect(out.pH + out.pD + out.pA).toBeCloseTo(1, 8);
  });
});
