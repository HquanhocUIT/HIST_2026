"""Network diagnostic. Output is deliberately limited; never prints a key."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx
from app.config import Settings

settings = Settings.load()
try:
    response = httpx.get(
        "https://generativelanguage.googleapis.com/v1beta/models",
        headers={"x-goog-api-key": settings.api_key}, timeout=15,
    )
    print("Models HTTP:", response.status_code)
    if response.is_success:
        for model in response.json().get("models", []):
            print(model["name"], model.get("supportedGenerationMethods", []))
    else:
        error = response.json().get("error", {})
        print("Provider status:", error.get("status", "unknown"))
        message = str(error.get("message", "")).replace(settings.api_key, "[REDACTED]") if settings.api_key else "No key"
        print("Provider message:", message[:350])
except Exception as exc:
    print("Network error type:", type(exc).__name__)
