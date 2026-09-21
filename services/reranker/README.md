# REECO local reranker

The service loads the pinned `BAAI/bge-reranker-v2-m3` revision once, warms it,
and accepts at most five candidates per request.

```powershell
$env:RERANKER_MODEL_PATH = 'E:\ModelCache\huggingface\hub\models--BAAI--bge-reranker-v2-m3\snapshots\953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e'
E:\ModelCache\reeco-reranker-venv\Scripts\python.exe -m uvicorn app:app --app-dir services/reranker --host 127.0.0.1 --port 8011
```

Without `RERANKER_MODEL_PATH`, Transformers resolves the exact pinned revision
through the standard Hugging Face cache. The model cache is not part of this repository.
