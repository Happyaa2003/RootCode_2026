import json
from pathlib import Path
from typing import Dict, Any, List

# Locate the parsed JSON from frontend or root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_PATH = BASE_DIR / "frontend" / "src" / "data" / "tempDataParsed.json"


def load_dataset() -> Dict[str, Any]:
    if DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


_cache = None


def get_cached_dataset() -> Dict[str, Any]:
    global _cache
    if _cache is None:
        _cache = load_dataset()
    return _cache
