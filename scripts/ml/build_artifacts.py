from __future__ import annotations
from pathlib import Path
import json
from datetime import datetime


def main() -> None:
    fixtures = {
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "fixtures": []
    }
    teams = {
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "teams": {}
    }
    Path("artifacts/fixtures.json").write_text(json.dumps(fixtures, indent=2))
    Path("artifacts/teams_state.json").write_text(json.dumps(teams, indent=2))
    print("artifacts refreshed")


if __name__ == "__main__":
    main()
