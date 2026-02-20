from __future__ import annotations

from pathlib import Path
import io
import json
import os
import re
from datetime import datetime, timezone

import pandas as pd
import requests

SEASONS = [
    "1516","1617","1718","1819","1920","2021","2122","2223","2324","2425","2526"
]
BASE_URL = "https://www.football-data.co.uk/mmz4281"
OUT_RAW = Path("data/raw")
OUT_PROCESSED = Path("data/processed/matches.csv")

TEAM_NORMALIZATION = {
    "Man City": "Manchester City",
    "Man United": "Manchester United",
    "Spurs": "Tottenham",
    "Wolves": "Wolverhampton",
    "Newcastle": "Newcastle United",
    "Nott'm Forest": "Nottingham Forest",
    "Brighton": "Brighton and Hove Albion",
    "West Brom": "West Bromwich Albion",
    "Leicester": "Leicester City",
}


def normalize_team(name: str) -> str:
    clean = re.sub(r"\s+", " ", str(name).strip())
    return TEAM_NORMALIZATION.get(clean, clean)


def download_season(season: str) -> Path:
    OUT_RAW.mkdir(parents=True, exist_ok=True)
    target = OUT_RAW / f"epl_{season}.csv"
    url = f"{BASE_URL}/{season}/E0.csv"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    target.write_bytes(resp.content)
    return target


def load_and_clean(path: Path, season: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    required = ["Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"{path} missing columns {missing}")

    odds_candidates = [
        ("B365H", "B365D", "B365A"),
        ("AvgH", "AvgD", "AvgA"),
        ("PSH", "PSD", "PSA"),
    ]

    odds_triplet = None
    for cand in odds_candidates:
        if all(c in df.columns for c in cand):
            odds_triplet = cand
            break
    if odds_triplet is None:
        raise ValueError(f"No supported odds columns in {path}")

    df = df.copy()
    df["date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
    df["season"] = f"20{season[:2]}-20{season[2:]}"
    df["home_team"] = df["HomeTeam"].map(normalize_team)
    df["away_team"] = df["AwayTeam"].map(normalize_team)
    df["home_goals"] = pd.to_numeric(df["FTHG"], errors="coerce")
    df["away_goals"] = pd.to_numeric(df["FTAG"], errors="coerce")
    df["result"] = df["FTR"].astype(str).str.upper().str.strip()

    h, d, a = odds_triplet
    df["odds_home"] = pd.to_numeric(df[h], errors="coerce")
    df["odds_draw"] = pd.to_numeric(df[d], errors="coerce")
    df["odds_away"] = pd.to_numeric(df[a], errors="coerce")

    canonical = df[[
        "date", "season", "home_team", "away_team", "home_goals", "away_goals", "result", "odds_home", "odds_draw", "odds_away"
    ]]

    canonical = canonical.dropna(subset=["date", "home_team", "away_team", "result"])
    canonical = canonical[canonical["result"].isin(["H", "D", "A"])]
    canonical = canonical.drop_duplicates(subset=["date", "home_team", "away_team"], keep="last")

    # fill odds with season medians as fallback
    for col in ["odds_home", "odds_draw", "odds_away"]:
        canonical[col] = canonical[col].fillna(canonical[col].median())

    return canonical


def main() -> None:
    rows = []
    for s in SEASONS:
        path = download_season(s)
        rows.append(load_and_clean(path, s))

    full = pd.concat(rows, ignore_index=True).sort_values("date")
    OUT_PROCESSED.parent.mkdir(parents=True, exist_ok=True)
    full.to_csv(OUT_PROCESSED, index=False)

    manifest = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "football-data.co.uk",
        "seasons": [f"20{s[:2]}-20{s[2:]}" for s in SEASONS],
        "rows": int(len(full)),
        "output": str(OUT_PROCESSED),
        "apiKeyUsed": bool(os.getenv("FOOTBALL_DATA_API_KEY")),
    }
    Path("data/processed/manifest.json").write_text(json.dumps(manifest, indent=2))
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
