"""Small live diagnostic; no secrets or raw tracebacks are printed."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.config import Settings
from app.corpus import Corpus
from app.rag import RagEngine
from app.schemas import ChatRequest
from app.vector import VectorIndex

s=Settings.load()
try:
    corpus=Corpus(s.corpus)
    index=VectorIndex(s,corpus)
    matches=index.retrieve("Trống Ngọc Lũ cao bao nhiêu?","drum")
    print("Retrieval:",len(matches),"chunks")
    engine=RagEngine(s,index)
    response,_=engine.chat(ChatRequest(question="Trống Ngọc Lũ cao bao nhiêu?",artifact_id="drum",session_id="smoke-direct"))
    print(response.model_dump_json(indent=2))
except Exception as exc:
    print("Error type:",type(exc).__name__)
    reason=str(exc)
    for secret in (s.api_key,s.admin_token):
        if secret:
            reason=reason.replace(secret,"[REDACTED]")
    print("Sanitized reason:",reason[:1800])
    raise SystemExit(1)
