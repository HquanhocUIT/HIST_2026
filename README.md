# HeritageXR Studio

An interactive museum exhibit prototype for the HIST 2026 project. The visitor experience combines a Three.js exhibit viewer, exhibit videos with pre-generated local narration, and browser-based spatial ambience.

## Run the app

```powershell
cd frontend
npm install
npm run dev
```

The story panel has separate **Quy trình chế tác** and **Câu chuyện hiện vật** videos for each artifact. Each video displays its own Vietnamese script and expects a matching local KorvaTTS voice track in `frontend/public/narration/`; the player starts and pauses that track with the video. No external speech API key is used.

To generate the six voice tracks locally, run these commands from `frontend` in a Python 3.10 environment:

```powershell
python -m venv audio_ai_engineering/.venv
audio_ai_engineering/.venv/Scripts/python.exe -m pip install -r audio_ai_engineering/requirements-local.txt
audio_ai_engineering/.venv/Scripts/python.exe audio_ai_engineering/generate-video-narration.py --exhibit all --video all
```

The generator uses KorvaTTS with the `ngoc_huyen` Vietnamese voice and writes one MP3 per video. If the KorvaTTS model is already installed locally, pass its assets folder with `--assets-dir` to avoid downloads.

## Spatial ambience

In the story panel, choose an MP3 or WAV file from your device and start playback. The Web Audio API places that sound in a 3D field, and the phone orientation sensor turns the listener as the visitor rotates. The bearing slider remains available on desktop or when sensor access is denied. iOS Safari requires a user gesture and an HTTPS origin for device orientation access.

Ambience files are loaded locally in the browser and are not uploaded. This prototype does not include licensed ambience tracks.

## Project references

- `Hist.png` shows the end to end HeritageXR architecture.
- `HistPlan.md` contains the master product plan and pipeline stages.
- `frontend/public/videos/` contains the existing exhibit demo clips.
- `frontend/audio_ai_engineering/` contains the local narration scripts and generator.
