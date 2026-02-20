from __future__ import annotations

from pathlib import Path
import json
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import AdaBoostClassifier
from sklearn.metrics import accuracy_score, log_loss, brier_score_loss
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

FEATURES = [
    'elo_home','elo_away','elo_diff',
    'form_points_last5_home','form_points_last5_away','form_points_last5_diff',
    'form_points_last10_home','form_points_last10_away','form_points_last10_diff',
    'p_home','p_draw','p_away','overround'
]
LABEL_MAP = {'H': 0, 'D': 1, 'A': 2}
LABELS = ['H', 'D', 'A']


def ece_score(y_true: np.ndarray, y_prob: np.ndarray, bins: int = 10) -> float:
    pred = y_prob.argmax(axis=1)
    conf = y_prob.max(axis=1)
    acc = (pred == y_true).astype(float)
    edges = np.linspace(0, 1, bins + 1)
    ece = 0.0
    for i in range(bins):
        m = (conf > edges[i]) & (conf <= edges[i + 1])
        if m.any():
            ece += abs(acc[m].mean() - conf[m].mean()) * m.mean()
    return float(ece)


def main() -> None:
    df = pd.read_csv('data/processed/features.csv', parse_dates=['date'])
    df = df.sort_values('date')
    seasons = sorted(df['season'].unique())
    holdout = seasons[-1]

    train = df[df['season'] != holdout]
    valid = df[df['season'] == holdout]

    X_train = train[FEATURES].values
    X_valid = valid[FEATURES].values
    y_train = train['result'].map(LABEL_MAP).values
    y_valid = valid['result'].map(LABEL_MAP).values

    scaler = StandardScaler().fit(X_train)
    X_train_s = scaler.transform(X_train)
    X_valid_s = scaler.transform(X_valid)

    base = AdaBoostClassifier(
        estimator=DecisionTreeClassifier(max_depth=2, random_state=42),
        n_estimators=80,
        learning_rate=0.5,
        algorithm='SAMME',
        random_state=42,
    )
    cal = CalibratedClassifierCV(base, method='isotonic', cv=3)
    cal.fit(X_train_s, y_train)

    probs = cal.predict_proba(X_valid_s)
    preds = probs.argmax(axis=1)

    metrics = {
        'accuracy': float(accuracy_score(y_valid, preds)),
        'logloss': float(log_loss(y_valid, probs, labels=[0,1,2])),
        'brier': float(np.mean([
            brier_score_loss((y_valid == i).astype(int), probs[:, i]) for i in range(3)
        ])),
        'ece': ece_score(y_valid, probs),
        'trainSeasons': [str(s) for s in sorted(train['season'].unique())],
        'validSeason': str(holdout),
        'validStart': str(valid['date'].min().date()),
        'validEnd': str(valid['date'].max().date()),
    }
    Path('artifacts').mkdir(exist_ok=True)
    Path('artifacts/metrics.json').write_text(json.dumps(metrics, indent=2))

    metadata = {
        'updatedAt': datetime.now(timezone.utc).isoformat(),
        'dataSource': 'football-data.co.uk',
        'seasonsIncluded': [str(s) for s in seasons],
        'notes': 'Features are generated sequentially with strict forward-looking ELO and form windows.',
        'modelVersion': 'adaboost-isotonic-v2',
    }
    Path('artifacts/metadata.json').write_text(json.dumps(metadata, indent=2))

    model_state = {
        'features': FEATURES,
        'labels': LABELS,
        'scaler_mean': scaler.mean_.tolist(),
        'scaler_std': scaler.scale_.tolist(),
    }
    Path('scripts/ml/output').mkdir(parents=True, exist_ok=True)
    Path('scripts/ml/output/model_state.json').write_text(json.dumps(model_state, indent=2))

    # fit non-calibrated adaboost for TS parity export; calibration will be approximated via temperature
    export_model = AdaBoostClassifier(
        estimator=DecisionTreeClassifier(max_depth=2, random_state=42),
        n_estimators=80,
        learning_rate=0.5,
        algorithm='SAMME.R',
        random_state=42,
    )
    export_model.fit(X_train_s, y_train)
    import pickle
    with open('scripts/ml/output/AdaBoostClassifier.pkl', 'wb') as f:
        pickle.dump({'model': export_model, 'scaler': scaler}, f)

    print(json.dumps(metrics, indent=2))


if __name__ == '__main__':
    main()
