import model from "@/artifacts/model_params.json";
import teamsState from "@/artifacts/teams_state.json";

export type Probs = { H: number; D: number; A: number };

type TeamStateRow = { team: string; attack: number; defense: number; formPointsLast5: number };

const teamStateMap = new Map((teamsState.teams as TeamStateRow[]).map((row) => [row.team, row]));

function fact(n: number) {
  let v = 1;
  for (let i = 2; i <= n; i++) v *= i;
  return v;
}
function poisson(k: number, lambda: number) {
  return Math.exp(-lambda) * (lambda ** k) / fact(k);
}

export function normalizeOdds(home?: number | null, draw?: number | null, away?: number | null): Probs | null {
  if (!home || !draw || !away || home <= 1 || draw <= 1 || away <= 1) return null;
  const inv = [1 / home, 1 / draw, 1 / away];
  const s = inv[0] + inv[1] + inv[2];
  return { H: inv[0] / s, D: inv[1] / s, A: inv[2] / s };
}

function getFormBoost(team: string): number {
  const points = teamStateMap.get(team)?.formPointsLast5 ?? 0;
  return Math.max(-0.12, Math.min(0.12, (points - 7.5) * 0.01));
}

export function predictMatch(
  homeTeam: string,
  awayTeam: string,
  odds?: { home?: number | null; draw?: number | null; away?: number | null },
) {
  const atk = (model.attack as Record<string, number>)[homeTeam] ?? 0;
  const defA = (model.defense as Record<string, number>)[awayTeam] ?? 0;
  const atkA = (model.attack as Record<string, number>)[awayTeam] ?? 0;
  const defH = (model.defense as Record<string, number>)[homeTeam] ?? 0;

  const homeFormBoost = getFormBoost(homeTeam);
  const awayFormBoost = getFormBoost(awayTeam);
  const lambdaHome = Math.exp(model.homeAdvantage + atk - defA + homeFormBoost - awayFormBoost * 0.5);
  const lambdaAway = Math.exp(atkA - defH + awayFormBoost - homeFormBoost * 0.5);
  const maxGoals = model.maxGoals ?? 8;

  const rows: { homeGoals: number; awayGoals: number; probability: number }[] = [];
  let H = 0,
    D = 0,
    A = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = poisson(h, lambdaHome) * poisson(a, lambdaAway);
      rows.push({ homeGoals: h, awayGoals: a, probability: p });
      if (h > a) H += p;
      else if (h === a) D += p;
      else A += p;
    }
  }
  const s = H + D + A;
  let probs = { H: H / s, D: D / s, A: A / s };

  const implied = normalizeOdds(odds?.home, odds?.draw, odds?.away);
  if (implied) {
    const b = model.blend;
    const logit = {
      H: b.wModel * Math.log(probs.H) + b.wMarket * Math.log(implied.H) + b.bias[0],
      D: b.wModel * Math.log(probs.D) + b.wMarket * Math.log(implied.D) + b.bias[1],
      A: b.wModel * Math.log(probs.A) + b.wMarket * Math.log(implied.A) + b.bias[2],
    };
    const ex = { H: Math.exp(logit.H), D: Math.exp(logit.D), A: Math.exp(logit.A) };
    const z = ex.H + ex.D + ex.A;
    probs = { H: ex.H / z, D: ex.D / z, A: ex.A / z };
  }

  return {
    probs,
    expectedGoals: { home: lambdaHome, away: lambdaAway },
    topScorelines: rows.sort((a, b) => b.probability - a.probability).slice(0, 5),
    explanation: {
      homeTeam,
      awayTeam,
      usedOddsBlend: Boolean(implied),
      modelUpdatedAt: model.updatedAt,
      featureContributions: {
        homeAttack: atk,
        awayAttack: atkA,
        homeDefense: defH,
        awayDefense: defA,
        homeFormBoost,
        awayFormBoost,
      },
    },
  };
}

export function evTable(probs: Probs, odds: { home: number; draw: number; away: number }) {
  const implied = normalizeOdds(odds.home, odds.draw, odds.away);
  const ev = {
    H: probs.H * odds.home - 1,
    D: probs.D * odds.draw - 1,
    A: probs.A * odds.away - 1,
  };
  const edge = implied
    ? { H: probs.H - implied.H, D: probs.D - implied.D, A: probs.A - implied.A }
    : { H: 0, D: 0, A: 0 };
  return { implied, ev, edge };
}
