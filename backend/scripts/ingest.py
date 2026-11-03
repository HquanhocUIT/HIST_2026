import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import Settings
from app.corpus import Corpus
from app.vector import VectorIndex

if __name__ == "__main__":
    settings = Settings.load()
    if not settings.api_key:
        raise SystemExit("Missing GEMINI_API_KEY in .env")
    try:
        index = VectorIndex(settings, Corpus(settings.corpus))
        print(json.dumps(index.ingest(), ensure_ascii=False, indent=2))
    except Exception as exc:
        # Do not print raw SDK exceptions: providers may include sensitive request details.
        print(f"Ingest failed: {type(exc).__name__}; provider code: {getattr(exc, 'code', 'unknown')}")
        raise SystemExit(1)
