from __future__ import annotations

import csv
import json
import math
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

MAX_GOALS = 8


def f(x: str) -> float | None:
    try:
        v = float(x)
        return v if v > 0 else None
    except Exception:
        return None


def load_matches(path="data/processed/matches.csv"):
    rows = []
    with open(path) as fp:
        for r in csv.DictReader(fp):
            rows.append(r)
    return rows


def poisson(k, lam):
    return math.exp(-lam) * (lam ** k) / math.factorial(k)


def outcome_probs(lh, la):
    ph = pd = pa = 0.0
    for h in range(MAX_GOALS + 1):
        for a in range(MAX_GOALS + 1):
            p = poisson(h, lh) * poisson(a, la)
            if h > a: ph += p
            elif h == a: pd += p
            else: pa += p
    s = ph + pd + pa
    return [ph / s, pd / s, pa / s]


def odds_probs(r):
    h, d, a = f(r.get("odds_home", "")), f(r.get("odds_draw", "")), f(r.get("odds_away", ""))
    if not h or not d or not a or min(h, d, a) <= 1:
        return None
    inv = [1 / h, 1 / d, 1 / a]
    s = sum(inv)
    return [x / s for x in inv]


def fit_strength(rows, teams):
    atk = {t: 0.0 for t in teams}
    deff = {t: 0.0 for t in teams}
    home_adv = 0.15
    for _ in range(200):
        ga = defaultdict(float); gd = defaultdict(float); gh = 0.0
        for r in rows:
            h, a = r["home_team"], r["away_team"]
            y_h, y_a = float(r["home_goals"]), float(r["away_goals"])
            lh = math.exp(home_adv + atk[h] - deff[a])
            la = math.exp(atk[a] - deff[h])
            ga[h] += y_h - lh; gd[a] += lh - y_h
            ga[a] += y_a - la; gd[h] += la - y_a
            gh += y_h - lh
        for t in teams:
            atk[t] += 0.003 * ga[t]
            deff[t] += 0.003 * gd[t]
        m1 = sum(atk.values()) / len(teams)
        m2 = sum(deff.values()) / len(teams)
        for t in teams:
            atk[t] -= m1; deff[t] -= m2
        home_adv += 0.003 * gh / max(1, len(rows))
    return atk, deff, home_adv


def fit_blend(rows, atk, deff, home_adv):
    w1, w2, b = 1.0, 1.0, [0.0, 0.0, 0.0]
    for _ in range(200):
        gw1 = gw2 = 0.0
        gb = [0.0, 0.0, 0.0]
        n = 0
        for r in rows:
            imp = odds_probs(r)
            if not imp:
                continue
            lh = math.exp(home_adv + atk[r["home_team"]] - deff[r["away_team"]])
            la = math.exp(atk[r["away_team"]] - deff[r["home_team"]])
            mp = outcome_probs(lh, la)
            lg = [w1 * math.log(max(mp[i], 1e-9)) + w2 * math.log(max(imp[i], 1e-9)) + b[i] for i in range(3)]
            ex = [math.exp(x - max(lg)) for x in lg]; s = sum(ex); p = [x / s for x in ex]
            y = [1.0 if r["result"] == c else 0.0 for c in ["H", "D", "A"]]
            g = [p[i] - y[i] for i in range(3)]
            gw1 += sum(g[i] * math.log(max(mp[i], 1e-9)) for i in range(3))
            gw2 += sum(g[i] * math.log(max(imp[i], 1e-9)) for i in range(3))
            gb = [gb[i] + g[i] for i in range(3)]
            n += 1
        if n == 0:
            break
        w1 -= 0.03 * gw1 / n; w2 -= 0.03 * gw2 / n
        b = [b[i] - 0.03 * gb[i] / n for i in range(3)]
    return {"wModel": w1, "wMarket": w2, "bias": b}


def evaluate(rows, atk, deff, home_adv, blend):
    losses = []; briers = []; correct = 0
    conf_bins = [[] for _ in range(10)]
    for r in rows:
        lh = math.exp(home_adv + atk[r["home_team"]] - deff[r["away_team"]])
        la = math.exp(atk[r["away_team"]] - deff[r["home_team"]])
        p = outcome_probs(lh, la)
        imp = odds_probs(r)
        if imp:
            lg = [blend["wModel"] * math.log(max(p[i], 1e-9)) + blend["wMarket"] * math.log(max(imp[i], 1e-9)) + blend["bias"][i] for i in range(3)]
            ex = [math.exp(x - max(lg)) for x in lg]; s = sum(ex); p = [x / s for x in ex]
        y = [1.0 if r["result"] == c else 0.0 for c in ["H", "D", "A"]]
        pred = p.index(max(p)); true = y.index(1.0)
        if pred == true: correct += 1
        losses.append(-sum(y[i] * math.log(max(p[i], 1e-9)) for i in range(3)))
        briers.append(sum((p[i] - y[i]) ** 2 for i in range(3)))
        c = max(p); bi = min(9, int(c * 10)); conf_bins[bi].append((1.0 if pred == true else 0.0, c))
    ece = 0.0
    n = len(rows)
    for b in conf_bins:
        if not b: continue
        acc = sum(x[0] for x in b) / len(b); conf = sum(x[1] for x in b) / len(b)
        ece += abs(acc - conf) * len(b) / n
    return {"accuracy": correct / n, "logloss": sum(losses) / n, "brier": sum(briers) / n, "ece": ece}


def main():
    rows = load_matches() if Path("data/processed/matches.csv").exists() else []
    teams = sorted({r["home_team"] for r in rows} | {r["away_team"] for r in rows}) if rows else ["Arsenal","Chelsea","Liverpool","Manchester City","Tottenham","Manchester United"]
    seasons = sorted({r["season"] for r in rows}) if rows else ["2024-2025","2025-2026"]
    holdout = seasons[-1]
    train = [r for r in rows if r["season"] != holdout] if rows else []
    valid = [r for r in rows if r["season"] == holdout] if rows else []
    atk, deff, home_adv = fit_strength(train, teams)
    blend = fit_blend(valid, atk, deff, home_adv)
    metrics = evaluate(valid, atk, deff, home_adv, blend) if valid else {"accuracy":0.0,"logloss":0.0,"brier":0.0,"ece":0.0}
    out = {
        "teams": teams,
        "attack": atk,
        "defense": deff,
        "homeAdvantage": home_adv,
        "blend": blend,
        "trainingSeasons": seasons[:-1],
        "holdoutSeason": holdout,
        "metrics": metrics,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "maxGoals": MAX_GOALS,
    }
    Path("artifacts").mkdir(exist_ok=True)
    Path("artifacts/model_params.json").write_text(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
