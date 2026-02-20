from __future__ import annotations

import json
import subprocess
import numpy as np
import pandas as pd
import pickle

FEATURES = [
    'elo_home','elo_away','elo_diff',
    'form_points_last5_home','form_points_last5_away','form_points_last5_diff',
    'form_points_last10_home','form_points_last10_away','form_points_last10_diff',
    'p_home','p_draw','p_away','overround'
]


def run_ts(vectors: list[list[float]]) -> list[list[float]]:
    proc = subprocess.run([
        'node', 'scripts/ml/ts_predict.js', json.dumps(vectors)
    ], check=True, text=True, capture_output=True)
    return json.loads(proc.stdout)


def main() -> None:
    df = pd.read_csv('data/processed/features.csv').sample(20, random_state=42)
    X = df[FEATURES].values
    with open('scripts/ml/output/AdaBoostClassifier.pkl', 'rb') as f:
        payload = pickle.load(f)
    model = payload['model']
    scaler = payload['scaler']
    py = model.predict_proba(scaler.transform(X))
    ts = np.array(run_ts(X.tolist()))
    diff = np.abs(py - ts).max()
    assert diff <= 1e-3, f'max abs diff {diff}'
    print(f'parity ok max diff={diff}')


if __name__ == '__main__':
    main()
