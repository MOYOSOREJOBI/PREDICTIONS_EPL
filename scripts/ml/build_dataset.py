from __future__ import annotations

from pathlib import Path
import pandas as pd

INPUT = Path('data/processed/matches.csv')
OUTPUT = Path('data/processed/features.csv')


def outcome_points(result: str, is_home: bool) -> int:
    if result == 'D':
        return 1
    if (result == 'H' and is_home) or (result == 'A' and not is_home):
        return 3
    return 0


def main() -> None:
    df = pd.read_csv(INPUT, parse_dates=['date']).sort_values('date').reset_index(drop=True)

    elo: dict[str, float] = {}
    form: dict[str, list[int]] = {}
    out_rows = []

    for _, row in df.iterrows():
        home = row['home_team']
        away = row['away_team']
        home_elo = elo.get(home, 1500.0)
        away_elo = elo.get(away, 1500.0)

        home_form = form.get(home, [])
        away_form = form.get(away, [])

        inv_h = 1 / float(row['odds_home'])
        inv_d = 1 / float(row['odds_draw'])
        inv_a = 1 / float(row['odds_away'])
        overround = inv_h + inv_d + inv_a

        feature_row = {
            'date': row['date'],
            'season': row['season'],
            'home_team': home,
            'away_team': away,
            'result': row['result'],
            'odds_home': row['odds_home'],
            'odds_draw': row['odds_draw'],
            'odds_away': row['odds_away'],
            'elo_home': home_elo,
            'elo_away': away_elo,
            'elo_diff': home_elo - away_elo,
            'form_points_last5_home': sum(home_form[-5:]),
            'form_points_last5_away': sum(away_form[-5:]),
            'form_points_last5_diff': sum(home_form[-5:]) - sum(away_form[-5:]),
            'form_points_last10_home': sum(home_form[-10:]),
            'form_points_last10_away': sum(away_form[-10:]),
            'form_points_last10_diff': sum(home_form[-10:]) - sum(away_form[-10:]),
            'p_home': inv_h / overround,
            'p_draw': inv_d / overround,
            'p_away': inv_a / overround,
            'overround': overround,
        }
        out_rows.append(feature_row)

        result = row['result']
        # update Elo after saving features
        expected_home = 1 / (1 + 10 ** ((away_elo - home_elo) / 400))
        actual_home = 1.0 if result == 'H' else 0.5 if result == 'D' else 0.0
        k = 20
        elo[home] = home_elo + k * (actual_home - expected_home)
        elo[away] = away_elo + k * ((1 - actual_home) - (1 - expected_home))

        form.setdefault(home, []).append(outcome_points(result, True))
        form.setdefault(away, []).append(outcome_points(result, False))

    out = pd.DataFrame(out_rows)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUTPUT, index=False)
    print(f'wrote {OUTPUT} ({len(out)} rows)')


if __name__ == '__main__':
    main()
