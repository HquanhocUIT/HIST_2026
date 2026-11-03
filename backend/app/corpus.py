import hashlib
import json
from pathlib import Path
import re
import unicodedata

ARTIFACTS = {
    "drum": {"name": "Trống đồng Ngọc Lũ", "corpus_id": "NL-01", "aliases": ["ngoc lu", "trong dong"]},
    "jar": {"name": "Thạp đồng Đào Thịnh", "corpus_id": "DT-01", "aliases": ["dao thinh", "thap dong", "thap"]},
    "dagger": {"name": "Dao găm đồng Đông Sơn", "corpus_id": "DG-DS-01", "aliases": ["dao gam", "dagger"]},
}


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower()).replace("đ", "d")
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    # Some visitors leave the Telex acute-tone key in the submitted text ("cais" for "cái").
    # Normalize this frequent demonstrative without stripping legitimate final s from other words.
    substitutions = {"cais": "cai", "j": "gi", "ko": "khong", "k": "khong", "dc": "duoc", "sp": "hien vat", "nguon goc": "nguon goc"}
    text = " ".join(substitutions.get(word, word) for word in text.split())
    return text


def explicit_artifacts(question: str) -> set[str]:
    normalized = f" {normalize(question)} "
    result = {key for key, value in ARTIFACTS.items() if any(f" {alias} " in normalized for alias in value["aliases"])}
    if re.search(r"\btrống\b", question.lower()):
        result.add("drum")
    return result


class Corpus:
    def __init__(self, path: Path):
        self.data = json.loads(path.read_text(encoding="utf-8"))
        self.version = hashlib.sha256(json.dumps(self.data, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
        self.sources = {source["id"]: source for source in self.data["sources"]}
        self.chunks = self.data["chunks"]
        self.by_id = {chunk["id"]: chunk for chunk in self.chunks}
        if len(self.by_id) != len(self.chunks):
            raise ValueError("Duplicate chunk IDs")
        for chunk in self.chunks:
            if chunk["artifact_id"] not in ARTIFACTS or chunk["source_id"] not in self.sources:
                raise ValueError("Invalid corpus metadata")
            if not chunk["source_checked"] or not chunk["text"].strip():
                raise ValueError("Unverified or empty chunk")
        if {c["artifact_id"] for c in self.chunks} != set(ARTIFACTS):
            raise ValueError("Corpus must cover exactly three artifacts")

    def documents(self):
        from langchain_core.documents import Document
        return [Document(page_content=chunk["text"], metadata={
            "chunk_id": chunk["id"], "artifact_id": chunk["artifact_id"],
            "corpus_id": ARTIFACTS[chunk["artifact_id"]]["corpus_id"],
            "source_id": chunk["source_id"], "section": chunk["section"],
            "source_checked": True, "corpus_version": self.version,
        }) for chunk in self.chunks]
