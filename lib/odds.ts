export type OddsProbabilities = { pH: number; pD: number; pA: number; overround: number };

export function normalizeOdds(home: number, draw: number, away: number): OddsProbabilities {
  const inv = [1 / home, 1 / draw, 1 / away];
  const overround = inv[0] + inv[1] + inv[2];
  return {
    pH: inv[0] / overround,
    pD: inv[1] / overround,
    pA: inv[2] / overround,
    overround
  };
}
