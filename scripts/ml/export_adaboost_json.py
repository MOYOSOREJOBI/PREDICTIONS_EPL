from __future__ import annotations
from pathlib import Path
import json
import pickle
from datetime import date

import numpy as np

FEATURES = [
    "elo_home", "elo_away", "elo_diff", "form_points_last5_home", "form_points_last5_away",
    "form_points_last5_diff", "form_points_last10_home", "form_points_last10_away", "form_points_last10_diff",
    "odds_p_home", "odds_p_draw", "odds_p_away"
]


def to_tree_payload(tree):
    t = tree.tree_
    return {
        "children_left": t.children_left.tolist(),
        "children_right": t.children_right.tolist(),
        "feature": t.feature.tolist(),
        "threshold": t.threshold.tolist(),
        "value": t.value.tolist(),
    }


def main() -> None:
    model_path = Path("scripts/ml/output/AdaBoostClassifier.pkl")
    if not model_path.exists():
        raise FileNotFoundError("Run train_adaboost.py first")

    with model_path.open("rb") as f:
        model = pickle.load(f)

    payload = {
        "version": date.today().isoformat(),
        "algorithm": "AdaBoostClassifier",
        "samme": "SAMME.R",
        "learning_rate": float(model.learning_rate),
        "n_classes": int(model.n_classes_),
        "labels": ["H", "D", "A"],
        "feature_names": FEATURES,
        "preprocess": {"type": "standardize", "mean": [0.0] * len(FEATURES), "std": [1.0] * len(FEATURES)},
        "estimator_weights": model.estimator_weights_.tolist(),
        "trees": [to_tree_payload(tree) for tree in model.estimators_],
    }

    out = Path("artifacts/model_adaboost.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=2))
    print(f"exported {out}")


if __name__ == "__main__":
    main()
