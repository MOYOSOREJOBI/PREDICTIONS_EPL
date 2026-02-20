import { describe, expect, it } from "vitest";
import { softmax } from "@/lib/adaboost";

describe("softmax", () => {
  it("returns probabilities summing to 1", () => {
    const probs = softmax([1, 2, 3]);
    expect(probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
  });
});
