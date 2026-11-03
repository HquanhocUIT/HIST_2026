"""Generate Vietnamese KorvaTTS voice tracks for the six exhibit videos."""

import argparse
import hashlib
import json
from pathlib import Path
from uuid import uuid4

import numpy as np
import soundfile as sf
from korvatts import TTS


MODULE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = MODULE_DIR.parent
OUTPUT_DIR = FRONTEND_DIR / "public" / "narration"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--exhibit", choices=("drum", "jar", "dagger", "all"), default="all")
    parser.add_argument("--video", choices=("crafting", "story", "all"), default="all")
    parser.add_argument("--voice", default="ngoc_huyen")
    parser.add_argument("--assets-dir", type=Path, help="Existing KorvaTTS assets directory; disables downloads.")
    parser.add_argument("--force", action="store_true", help="Replace tracks after review.")
    args = parser.parse_args()

    videos = json.loads(
        (FRONTEND_DIR / "src" / "videoNarrations.json").read_text(encoding="utf-8")
    )
    scripts = {
        exhibit: {kind: video["narration"] for kind, video in choices.items()}
        for exhibit, choices in videos.items()
    }
    exhibits = list(scripts) if args.exhibit == "all" else [args.exhibit]
    video_kinds = ("crafting", "story") if args.video == "all" else (args.video,)
    jobs = []

    for exhibit in exhibits:
        for video_kind in video_kinds:
            text = scripts[exhibit][video_kind].strip()
            output = OUTPUT_DIR / f"{exhibit}-{video_kind}-vi.mp3"
            metadata_file = output.with_suffix(".json")
            settings = {
                "provider": "local",
                "model": "KorvaTTS-0.1.3",
                "voice": args.voice,
                "language": "vi",
                "exhibit": exhibit,
                "video_kind": video_kind,
                "steps": 32,
                "speed": 0.96,
                "seed": 42,
                "text": text,
            }
            fingerprint = hashlib.sha256(
                json.dumps(settings, ensure_ascii=False, sort_keys=True).encode("utf-8")
            ).hexdigest()

            if output.exists() and not args.force:
                metadata = (
                    json.loads(metadata_file.read_text(encoding="utf-8"))
                    if metadata_file.exists()
                    else {}
                )
                if metadata.get("fingerprint") != fingerprint:
                    raise FileExistsError(f"Review {output} and use --force to replace it.")
                print(f"Already generated: {output.name}", flush=True)
                continue

            jobs.append((text, output, metadata_file, settings, fingerprint))

    if not jobs:
        return

    print(f"Loading KorvaTTS; voice: {args.voice}", flush=True)
    tts = TTS(assets_dir=args.assets_dir, auto_download=args.assets_dir is None)
    if args.voice not in tts.list_voices():
        raise ValueError(f"Unknown voice: {args.voice}. Available: {', '.join(tts.list_voices())}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for text, output, metadata_file, settings, fingerprint in jobs:
        print(f"Generating {output.name} ({len(text)} characters)...", flush=True)
        wav, _ = tts.synthesize(
            text,
            voice=args.voice,
            lang="vi",
            total_steps=32,
            speed=0.96,
            seed=42,
        )
        if len(wav) < tts.sample_rate or not np.isfinite(wav).all():
            raise ValueError(f"Invalid generated audio: {output.name}")

        temporary = output.with_name(f"{output.stem}.{uuid4().hex}.tmp")
        try:
            sf.write(temporary, wav, tts.sample_rate, format="MP3")
            info = sf.info(temporary)
            temporary.replace(output)
            metadata = {key: value for key, value in settings.items() if key != "text"}
            metadata.update(
                fingerprint=fingerprint,
                duration_seconds=round(info.duration, 2),
                sample_rate=info.samplerate,
            )
            metadata_file.write_text(
                json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        finally:
            temporary.unlink(missing_ok=True)

        print(f"Saved {output.name}: {info.duration:.1f}s", flush=True)


if __name__ == "__main__":
    main()
