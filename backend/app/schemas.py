from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

ArtifactId = Literal["drum", "jar", "dagger"]
Status = Literal["answered", "insufficient_evidence", "out_of_scope", "needs_selection", "temporarily_unavailable"]


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str = Field(min_length=1, max_length=1500)
    artifact_id: ArtifactId | None = None
    session_id: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z0-9_-]+$")

    @field_validator("question")
    @classmethod
    def clean_question(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Question cannot be blank")
        return value


class Passage(BaseModel):
    chunk_id: str
    quote: str = Field(min_length=1, max_length=1200)


class Selection(BaseModel):
    status: Literal["answered", "insufficient_evidence", "out_of_scope"]
    answer: str = Field(default="", max_length=2400, description="Friendly Vietnamese response grounded only in the cited passages; no inline citation markers.")
    passages: list[Passage] = Field(default_factory=list, max_length=4)


class Citation(BaseModel):
    number: int
    chunk_id: str
    title: str
    url: str
    section: str
    excerpt: str


class ChatResponse(BaseModel):
    artifact_id: ArtifactId | None
    status: Status
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    elapsed_ms: int = 0
    usage: dict[str, int] = Field(default_factory=dict)
    corpus_version: str
