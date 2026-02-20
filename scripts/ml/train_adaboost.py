from __future__ import annotations
from pathlib import Path
import json
import pickle
from datetime import date

from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
import numpy as np


def main() -> None:
    rng = np.random.default_rng(42)
    X = rng.normal(size=(400, 12))
    y = rng.choice([0, 1, 2], size=400, p=[0.45, 0.25, 0.30])

    model = AdaBoostClassifier(
        estimator=DecisionTreeClassifier(max_depth=2, random_state=42),
        n_estimators=30,
        learning_rate=0.8,
        algorithm="SAMME.R",
        random_state=42,
    )
    model.fit(X, y)

    output_dir = Path("scripts/ml/output")
    output_dir.mkdir(parents=True, exist_ok=True)
    with (output_dir / "AdaBoostClassifier.pkl").open("wb") as f:
        pickle.dump(model, f)

    print(f"trained {date.today().isoformat()} -> {output_dir / 'AdaBoostClassifier.pkl'}")


if __name__ == "__main__":
    main()
