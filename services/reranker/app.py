import os
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Lock, Thread
from time import perf_counter
from typing import Annotated

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL_ID = "BAAI/bge-reranker-v2-m3"
MODEL_REVISION = "953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e"
BATCH_SIZE = 5
MAX_LENGTH = 512


class Candidate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    product_id: Annotated[str, Field(min_length=1, max_length=200)]
    document: Annotated[str, Field(min_length=1, max_length=50_000)]


class RerankRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: Annotated[str, Field(min_length=1, max_length=500)]
    candidates: Annotated[list[Candidate], Field(min_length=1, max_length=5)]


class ModelRuntime:
    def __init__(self):
        self.loaded = False
        self.load_failed = False
        self.device = "cpu"
        self._lock = Lock()

    def load(self):
        model_source = os.environ.get("RERANKER_MODEL_PATH", MODEL_ID)
        local_only = "RERANKER_MODEL_PATH" in os.environ
        if local_only and Path(model_source).resolve().name != MODEL_REVISION:
            raise RuntimeError("RERANKER_MODEL_PATH must target the pinned snapshot")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if self.device == "cuda" else torch.float32
        common = {"local_files_only": local_only}
        if not local_only:
            common["revision"] = MODEL_REVISION
        self.tokenizer = AutoTokenizer.from_pretrained(model_source, **common)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_source, dtype=dtype, **common
        ).to(self.device).eval()
        self.score("warmup", ["warmup"] * BATCH_SIZE)
        self.loaded = True

    def score(self, query: str, documents: list[str]) -> tuple[list[float], float]:
        started = perf_counter()
        scores = []
        if not self._lock.acquire(blocking=False):
            raise RuntimeError("RERANKER_BUSY")
        try:
            with torch.inference_mode():
                for offset in range(0, len(documents), BATCH_SIZE):
                    batch = documents[offset : offset + BATCH_SIZE]
                    encoded = self.tokenizer(
                        [query] * len(batch),
                        batch,
                        padding=True,
                        truncation=True,
                        max_length=MAX_LENGTH,
                        return_tensors="pt",
                    )
                    encoded = {key: value.to(self.device) for key, value in encoded.items()}
                    scores.extend(
                        self.model(**encoded, return_dict=True)
                        .logits.view(-1)
                        .float()
                        .cpu()
                        .tolist()
                    )
                if self.device == "cuda":
                    torch.cuda.synchronize()
        finally:
            self._lock.release()
        return scores, round((perf_counter() - started) * 1000, 3)


def create_app(runtime=None):
    runtime = runtime or ModelRuntime()

    @asynccontextmanager
    async def lifespan(_app):
        if not runtime.loaded:
            def load():
                try:
                    runtime.load()
                except Exception:
                    runtime.load_failed = True

            Thread(target=load, daemon=True, name="reranker-model-loader").start()
        yield

    app = FastAPI(title="REECO Reranker", docs_url=None, redoc_url=None, lifespan=lifespan)

    @app.get("/health")
    def health():
        return {
            "status": "ok" if runtime.loaded else "error" if runtime.load_failed else "not_ready",
            "model": MODEL_ID,
            "revision": MODEL_REVISION,
            "loaded": runtime.loaded,
            "device": runtime.device,
        }

    @app.post("/rerank")
    def rerank(request: RerankRequest):
        if not runtime.loaded:
            raise HTTPException(status_code=503, detail="model not ready")
        ids = [candidate.product_id for candidate in request.candidates]
        if len(set(ids)) != len(ids):
            raise HTTPException(status_code=422, detail="candidate IDs must be unique")
        try:
            scores, latency_ms = runtime.score(
                request.query, [candidate.document for candidate in request.candidates]
            )
        except RuntimeError as error:
            if str(error) == "RERANKER_BUSY":
                raise HTTPException(status_code=503, detail="reranker busy") from error
            raise
        ranked = sorted(
            zip(request.candidates, scores, range(len(scores))),
            key=lambda item: (-item[1], item[2]),
        )
        return {
            "results": [
                {"product_id": candidate.product_id, "score": score}
                for candidate, score, _index in ranked
            ],
            "model": MODEL_ID,
            "revision": MODEL_REVISION,
            "latency_ms": latency_ms,
        }

    return app


app = create_app()
