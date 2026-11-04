"""Regression checks for the historical dates reported as mispronounced."""

import importlib.util
import json
from pathlib import Path
import unittest


MODULE_DIR = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    "generator", MODULE_DIR / "generate-video-narration.py"
)
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
VIDEOS = json.loads(
    (MODULE_DIR.parent / "src" / "videoNarrations.json").read_text(encoding="utf-8")
)


class SpokenNumberTests(unittest.TestCase):
    def test_reviewed_dates_preserve_the_displayed_content(self):
        replacements = {
            "drum": {
                "1893": "một nghìn tám trăm chín mươi ba",
                "4": "tư",
                "1903": "một nghìn chín trăm linh ba",
                "2012": "hai nghìn không trăm mười hai",
            },
            "jar": {
                "14": "mười bốn",
                "9": "chín",
                "1961": "một nghìn chín trăm sáu mươi mốt",
            },
        }
        for exhibit, numbers in replacements.items():
            video = VIDEOS[exhibit]["story"]
            expected = video["narration"]
            for number, reading in sorted(numbers.items(), key=lambda item: -len(item[0])):
                expected = expected.replace(number, reading)
            self.assertEqual(generator.speech_text(video, exhibit), expected)

    def test_all_six_tracks_have_digit_free_speech(self):
        for exhibit, choices in VIDEOS.items():
            for kind, video in choices.items():
                with self.subTest(exhibit=exhibit, kind=kind):
                    text = generator.speech_text(video, f"{exhibit}/{kind}")
                    self.assertNotRegex(text, r"\d")
                    self.assertTrue(text)

    def test_raw_numbers_require_a_reviewed_reading(self):
        for text in ("Năm 2026.", "Cao 98 cm.", "Ngày 14/9/1961.", ""):
            with self.subTest(text=text), self.assertRaisesRegex(ValueError, "speechText"):
                generator.speech_text({"narration": text}, "test")

    def test_spoken_override_cannot_contain_raw_numbers(self):
        with self.assertRaises(ValueError):
            generator.speech_text(
                {"narration": "Năm 1893.", "speechText": "Năm 1893."}, "test"
            )

    def test_ordinary_text_needs_no_override(self):
        video = VIDEOS["drum"]["crafting"]
        self.assertEqual(generator.speech_text(video, "drum/crafting"), video["narration"])


if __name__ == "__main__":
    unittest.main()
