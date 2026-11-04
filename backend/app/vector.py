from functools import lru_cache
import hashlib
import json
import math
import os
import threading

import chromadb
from chromadb.config import Settings as ChromaSettings
from google import genai
from google.genai import types
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings

from .config import Settings
from .corpus import Corpus


class GeminiEmbeddings(Embeddings):
    def __init__(self, settings: Settings):
        self.client = genai.Client(
            api_key=settings.api_key or "not-configured",
            http_options=types.HttpOptions(timeout=30000),
        )
        self.model = settings.embedding_model
        self.lock = threading.Lock()
        self.calls = 0
        self.characters = 0

    def _embed(self, texts, task):
        result = self.client.models.embed_content(
            model=self.model,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type=task,
                output_dimensionality=768,
            ),
        )
        if not result.embeddings or len(result.embeddings) != len(texts):
            raise ValueError("Unexpected embedding count; index was not updated")

        vectors = []
        for item in result.embeddings:
            vector = item.values
            if not vector or len(vector) != 768 or not all(math.isfinite(x) for x in vector):
                raise ValueError("Invalid embedding vector")
            norm = math.sqrt(sum(x * x for x in vector))
            if norm == 0:
                raise ValueError("Zero embedding")
            vectors.append([x / norm for x in vector])

        with self.lock:
            self.calls += 1
            self.characters += sum(len(text) for text in texts)

        return vectors

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        result = []
        for offset in range(0, len(texts), 32):
            result.extend(
                self._embed(texts[offset : offset + 32], "RETRIEVAL_DOCUMENT")
            )
        return result

    @lru_cache(maxsize=128)
    def _query(self, text):
        return tuple(self._embed([text], "RETRIEVAL_QUERY")[0])

    def embed_query(self, text: str) -> list[float]:
        return list(self._query(text))


class VectorIndex:
    def __init__(self, settings: Settings, corpus: Corpus, embeddings=None):
        self.settings = settings
        self.corpus = corpus
        self.serverless = os.environ.get("HERITAGE_SERVERLESS") == "1"
        self.embeddings = (
            None
            if self.serverless
            else embeddings or GeminiEmbeddings(settings)
        )

        fingerprint = hashlib.sha256(
            f"{corpus.version}:{settings.embedding_model}:768".encode()
        ).hexdigest()[:16]
        self.collection_name = f"heritage_{fingerprint}"
        self.lock = threading.Lock()

        if self.serverless:
            self.client = None
            self.store = None
        else:
            settings.storage.mkdir(parents=True, exist_ok=True)
            self.client = chromadb.PersistentClient(
                path=str(settings.storage / "chroma"),
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            self.store = Chroma(
                client=self.client,
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                collection_metadata={"hnsw:space": "cosine"},
            )

    @property
    def ready(self):
        if self.serverless:
            return bool(self.corpus.chunks)

        actual = self.store.get(include=[])["ids"]
        return set(actual) == set(self.corpus.by_id)

    def ingest(self):
        manifest = {
            "corpus_version": self.corpus.version,
            "embedding_model": self.settings.embedding_model,
            "dimensions": 768,
            "collection": self.collection_name,
            "chunks": len(self.corpus.chunks),
            "review_status": self.corpus.data["review_status"],
        }

        if self.serverless:
            return manifest

        with self.lock:
            documents = self.corpus.documents()
            existing = set(self.store.get(include=[])["ids"])
            missing = [
                document
                for document in documents
                if document.metadata["chunk_id"] not in existing
            ]

            if missing:
                self.store.add_documents(
                    missing,
                    ids=[document.metadata["chunk_id"] for document in missing],
                )

            if not self.ready:
                raise ValueError("Unexpected collection contents; create a new index")

            path = self.settings.storage / "manifest.json"
            temporary = path.with_suffix(".tmp")
            temporary.write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            temporary.replace(path)

            return manifest

    def retrieve(self, question: str, artifact_id: str):
        if not self.ready:
            raise RuntimeError("INDEX_NOT_READY")

        if self.serverless:
            return [
                {
                    "chunk_id": chunk["id"],
                    "text": chunk["text"],
                    "distance": None,
                    "artifact_id": chunk["artifact_id"],
                }
                for chunk in self.corpus.chunks
                if chunk["artifact_id"] == artifact_id and chunk["source_checked"]
            ]

        metadata_filter = {
            "$and": [
                {"artifact_id": artifact_id},
                {"corpus_version": self.corpus.version},
                {"source_checked": True},
            ]
        }
        count = sum(
            chunk["artifact_id"] == artifact_id
            for chunk in self.corpus.chunks
        )

        if count <= 32:
            result = self.store.get(
                where=metadata_filter,
                include=["documents", "metadatas"],
            )
            return [
                {
                    "chunk_id": metadata["chunk_id"],
                    "text": text,
                    "distance": None,
                    "artifact_id": metadata["artifact_id"],
                }
                for text, metadata in zip(
                    result["documents"],
                    result["metadatas"],
                )
            ]

        matches = self.store.similarity_search_with_score(
            question,
            k=min(6, count),
            filter=metadata_filter,
        )
        return [
            {
                "chunk_id": document.metadata["chunk_id"],
                "text": document.page_content,
                "distance": float(score),
                "artifact_id": document.metadata["artifact_id"],
            }
            for document, score in matches
        ]