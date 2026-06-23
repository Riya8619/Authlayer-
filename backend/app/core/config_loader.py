import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def load_json(path: str):

    with open(BASE_DIR / path, "r") as f:
        return json.load(f)


API_KEYS = load_json("config/api_keys.json")