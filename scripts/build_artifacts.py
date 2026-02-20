from __future__ import annotations

import csv
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


def to_float(x):
    try:
        return float(x)
    except Exception:
        return None


def main():
    model = json.loads(Path("artifacts/model_params.json").read_text())
    now = datetime.now(timezone.utc)
    horizon = now + timedelta(days=14)

    fixtures = []
    if Path("data/processed/fixtures.csv").exists():
        with open("data/processed/fixtures.csv") as f:
            for r in csv.DictReader(f):
                k = datetime.fromisoformat(r["kickoff"])
                if not (now <= k <= horizon):
                    continue
                mid = f"{r['home_team']}-{r['away_team']}-{k.date()}".lower().replace(" ", "-")
                fixtures.append({
                    "id": mid,
                    "kickoff": r["kickoff"],
                    "homeTeam": r["home_team"],
                    "awayTeam": r["away_team"],
                    "odds": {"home": to_float(r["odds_home"]), "draw": to_float(r["odds_draw"]), "away": to_float(r["odds_away"])},
                    "source": "football-data-fixtures"
                })
    if not fixtures:
        seed=[("Arsenal","Chelsea"),("Liverpool","Everton"),("Manchester City","Tottenham")]
        for i,(h,a) in enumerate(seed):
            k=(now+timedelta(days=i+1)).isoformat()
            fixtures.append({"id":f"{h}-{a}-{i}".lower().replace(" ","-"),"kickoff":k,"homeTeam":h,"awayTeam":a,"odds":{"home":2.0,"draw":3.5,"away":3.8},"source":"fallback"})

    recent = {t: [] for t in model["teams"]}
    if Path("data/processed/matches.csv").exists():
        with open("data/processed/matches.csv") as f:
            for r in csv.DictReader(f):
                recent.setdefault(r["home_team"], []).append(r)
                recent.setdefault(r["away_team"], []).append(r)
    teams_state = []
    for t in model["teams"]:
        last = sorted(recent.get(t, []), key=lambda x: x["date"])[-5:]
        pts = 0
        for m in last:
            if m["home_team"] == t:
                pts += 3 if m["result"] == "H" else (1 if m["result"] == "D" else 0)
            else:
                pts += 3 if m["result"] == "A" else (1 if m["result"] == "D" else 0)
        teams_state.append({"team": t, "attack": model["attack"][t], "defense": model["defense"][t], "formPointsLast5": pts})

    Path("artifacts/fixtures.json").write_text(json.dumps({"updatedAt": now.isoformat(), "fixtures": fixtures}, indent=2))
    Path("artifacts/teams_state.json").write_text(json.dumps({"updatedAt": now.isoformat(), "teams": teams_state}, indent=2))
    Path("artifacts/metrics.json").write_text(json.dumps({"updatedAt": now.isoformat(), **model["metrics"], "holdoutSeason": model["holdoutSeason"]}, indent=2))
    Path("artifacts/metadata.json").write_text(json.dumps({"updatedAt": now.isoformat(), "trainingSeasons": model["trainingSeasons"], "holdoutSeason": model["holdoutSeason"], "sources": ["football-data.co.uk historical CSV", "football-data.co.uk fixtures.csv"]}, indent=2))


if __name__ == "__main__":
    main()
