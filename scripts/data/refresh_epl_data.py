from __future__ import annotations

import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

BASE_URL = "https://www.football-data.co.uk/mmz4281"
FIXTURES_URL = "https://www.football-data.co.uk/fixtures.csv"
RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")


def season_codes(start=2015, end=2025):
    return [f"{str(y)[-2:]}{str(y+1)[-2:]}" for y in range(start, end + 1)]


def download(url: str, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with urlopen(url, timeout=60) as r:
        path.write_bytes(r.read())


def normalize_team(name: str, mapping: dict[str, str]) -> str:
    clean = re.sub(r"\s+", " ", str(name).strip())
    return mapping.get(clean, clean)


def parse_date(value: str):
    value = value.strip()
    for fmt in ["%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d"]:
        try:
            return datetime.strptime(value, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def main():
    mapping = json.loads(Path("data/team_name_map.json").read_text()) if Path("data/team_name_map.json").exists() else {}
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    for code in season_codes():
        p = RAW_DIR / f"E0_{code}.csv"
        download(f"{BASE_URL}/{code}/E0.csv", p)
        with p.open() as f:
            reader = csv.DictReader(f)
            for r in reader:
                if not r.get("Date") or not r.get("HomeTeam") or not r.get("AwayTeam"):
                    continue
                dt = parse_date(r["Date"])
                if not dt:
                    continue
                ftr = (r.get("FTR") or "").strip().upper()
                if ftr not in {"H", "D", "A"}:
                    continue
                try:
                    hg = int(float(r.get("FTHG", "")))
                    ag = int(float(r.get("FTAG", "")))
                except ValueError:
                    continue
                rows.append({
                    "date": dt.isoformat(),
                    "season": f"20{code[:2]}-20{code[2:]}",
                    "home_team": normalize_team(r["HomeTeam"], mapping),
                    "away_team": normalize_team(r["AwayTeam"], mapping),
                    "home_goals": hg,
                    "away_goals": ag,
                    "result": ftr,
                    "odds_home": r.get("B365H") or "",
                    "odds_draw": r.get("B365D") or "",
                    "odds_away": r.get("B365A") or "",
                })

    rows.sort(key=lambda x: x["date"])
    with (PROCESSED_DIR / "matches.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader(); w.writerows(rows)

    fpath = RAW_DIR / "fixtures.csv"
    download(FIXTURES_URL, fpath)
    fixtures_out = []
    with fpath.open() as f:
        reader = csv.DictReader(f)
        for r in reader:
            if (r.get("Div") or "").strip() != "E0":
                continue
            dt = parse_date(r.get("Date", ""))
            if not dt:
                continue
            tm = (r.get("Time") or "12:00").strip()
            if len(tm) == 5:
                hh, mm = tm.split(":")
                dt = dt.replace(hour=int(hh), minute=int(mm))
            fixtures_out.append({
                "kickoff": dt.isoformat(),
                "home_team": normalize_team(r.get("HomeTeam", ""), mapping),
                "away_team": normalize_team(r.get("AwayTeam", ""), mapping),
                "odds_home": r.get("B365H") or "",
                "odds_draw": r.get("B365D") or "",
                "odds_away": r.get("B365A") or "",
            })
    with (PROCESSED_DIR / "fixtures.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(fixtures_out[0].keys()) if fixtures_out else ["kickoff", "home_team", "away_team", "odds_home", "odds_draw", "odds_away"])
        w.writeheader();
        if fixtures_out: w.writerows(fixtures_out)

    (PROCESSED_DIR / "manifest.json").write_text(json.dumps({"updatedAt": datetime.now(timezone.utc).isoformat(), "rows": len(rows)}, indent=2))


if __name__ == "__main__":
    main()
