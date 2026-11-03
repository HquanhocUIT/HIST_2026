"""Test STT with generated Vietnamese speech; this does not test a physical microphone."""
import json
from pathlib import Path
import sys
import wave
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from google import genai
from google.genai import types
import httpx
from app.config import Settings, REPOSITORY
from app.corpus import normalize

s=Settings.load()
fixture=s.storage/"synthetic-question-v2.wav"
try:
    if not fixture.exists():
        with genai.Client(api_key=s.api_key,http_options=types.HttpOptions(timeout=45000)) as client:
            response=client.models.generate_content(
                model="gemini-3.8-flash-tts",
                contents="Trống đồng Ngọc Lũ cao bao nhiêu?",
                config=types.GenerateContentConfig(response_modalities=["AUDIO"],speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")))),
            )
        blocks=[part.inline_data for candidate in (response.candidates or []) for part in (candidate.content.parts or []) if part.inline_data and part.inline_data.data]
        if not blocks:
            raise ValueError("No audio output")
        audio=blocks[0]
        if "wav" in audio.mime_type:
            fixture.write_bytes(audio.data)
        else:
            with wave.open(str(fixture),"wb") as output:
                output.setnchannels(1); output.setsampwidth(2); output.setframerate(24000); output.writeframes(audio.data)
        print("Created synthetic Vietnamese speech fixture.",flush=True)
    with fixture.open("rb") as handle:
        response=httpx.post("http://127.0.0.1:8000/api/transcribe",files={"audio":("test.wav",handle,"audio/wav")},timeout=90)
    print("STT HTTP:",response.status_code)
    if response.status_code!=200:
        print(response.text[:500]); raise SystemExit(1)
    body=response.json(); text=normalize(body["text"])
    passed=all(term in text for term in ("ngoc lu","cao","bao nhieu"))
    report={"fixture":"AI-generated Vietnamese speech, not a physical microphone recording",
            "expected":"Trống đồng Ngọc Lũ cao bao nhiêu?","transcript":body["text"],"passed":passed,"usage":body.get("usage",{}),
            "human_test_required":"Microphone permission, real Vietnamese pronunciation, ambient museum noise and target phone."}
    (REPOSITORY/"docs"/"voice-checks.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
except Exception as exc:
    print("Voice check error type:",type(exc).__name__,"code:",getattr(exc,"code","unknown"))
    raise SystemExit(1)
