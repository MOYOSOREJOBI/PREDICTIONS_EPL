from __future__ import annotations

from pathlib import Path
import json
import pickle
import pandas as pd


FEATURES = [
    'elo_home','elo_away','elo_diff',
    'form_points_last5_home','form_points_last5_away','form_points_last5_diff',
    'form_points_last10_home','form_points_last10_away','form_points_last10_diff',
    'p_home','p_draw','p_away','overround'
]


def tree_to_json(tree):
    t = tree.tree_
    return {
        'children_left': t.children_left.tolist(),
        'children_right': t.children_right.tolist(),
        'feature': t.feature.tolist(),
        'threshold': t.threshold.tolist(),
        'value': t.value.tolist(),
    }


def main() -> None:
    with open('scripts/ml/output/AdaBoostClassifier.pkl', 'rb') as f:
        payload = pickle.load(f)
    model = payload['model']
    scaler = payload['scaler']

    trees = [tree_to_json(est) for est in model.estimators_]

    out = {
        'version': 'adaboost-export-v2',
        'algorithm': 'AdaBoostClassifier',
        'samme': 'SAMME.R',
        'learning_rate': float(model.learning_rate),
        'n_classes': int(model.n_classes_),
        'labels': ['H', 'D', 'A'],
        'feature_names': FEATURES,
        'preprocess': {'mean': scaler.mean_.tolist(), 'std': scaler.scale_.tolist()},
        'estimator_weights': [float(w) for w in model.estimator_weights_],
        'trees': trees,
        'temperature': 1.0,
    }
    Path('artifacts/model_adaboost.json').write_text(json.dumps(out))

    matches = pd.read_csv('data/processed/matches.csv', parse_dates=['date']).sort_values('date')
    latest_season = sorted(matches['season'].unique())[-1]
    teams = sorted(set(matches.loc[matches['season'] == latest_season, 'home_team']) | set(matches.loc[matches['season'] == latest_season, 'away_team']))
    Path('artifacts/teams_state.json').write_text(json.dumps({'season': latest_season, 'teams': teams}, indent=2))

    now = pd.Timestamp.utcnow().tz_localize(None)
    upcoming = matches[matches['date'] >= now - pd.Timedelta(days=7)].head(80)
    fixtures = []
    for _, r in upcoming.iterrows():
        fixtures.append({
            'id': f"{r['season']}-{r['home_team']}-{r['away_team']}-{r['date'].date()}",
            'date': str(r['date']),
            'season': r['season'],
            'homeTeam': r['home_team'],
            'awayTeam': r['away_team'],
            'odds': {'home': float(r['odds_home']), 'draw': float(r['odds_draw']), 'away': float(r['odds_away'])}
        })
    Path('artifacts/fixtures.json').write_text(json.dumps({'generatedAt': str(now), 'fixtures': fixtures}, indent=2))
    print('exported artifacts')


if __name__ == '__main__':
    main()
