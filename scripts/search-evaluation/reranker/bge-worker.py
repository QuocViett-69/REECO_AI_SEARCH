import argparse
from importlib.metadata import version
import json
import sys
import time

import torch
import transformers
from transformers import AutoModelForSequenceClassification, AutoTokenizer


def emit(value):
    print(json.dumps(value, ensure_ascii=False), flush=True)


parser = argparse.ArgumentParser()
parser.add_argument('--model-path', required=True)
parser.add_argument('--model-id', required=True)
parser.add_argument('--revision', required=True)
parser.add_argument('--batch-size', type=int, default=4)
parser.add_argument('--max-length', type=int, default=512)
args = parser.parse_args()

torch.manual_seed(0)
torch.cuda.manual_seed_all(0)
torch.backends.cudnn.benchmark = False
torch.backends.cudnn.deterministic = True
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
dtype = torch.float16 if device.type == 'cuda' else torch.float32
load_started = time.perf_counter()
tokenizer = AutoTokenizer.from_pretrained(args.model_path, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(
    args.model_path,
    local_files_only=True,
    dtype=dtype,
).to(device).eval()
if device.type == 'cuda':
    torch.cuda.synchronize()
emit({
    'type': 'ready',
    'model_id': args.model_id,
    'revision': args.revision,
    'model_path': args.model_path,
    'device': str(device),
    'gpu': torch.cuda.get_device_name(0) if device.type == 'cuda' else None,
    'cold_load_ms': round((time.perf_counter() - load_started) * 1000, 3),
    'batch_size': args.batch_size,
    'max_length': args.max_length,
    'python_version': sys.version.split()[0],
    'torch_version': torch.__version__,
    'transformers_version': transformers.__version__,
    'sentencepiece_version': version('sentencepiece'),
    'huggingface_hub_version': version('huggingface-hub'),
    'pip_version': version('pip'),
    'flag_embedding_version': None,
    'cuda_runtime': torch.version.cuda,
    'vram_gb': round(torch.cuda.get_device_properties(0).total_memory / 1024 ** 3, 2) if device.type == 'cuda' else None,
})

for line in sys.stdin:
    try:
        request = json.loads(line)
        query = request['query']
        documents = request['documents']
        scores = []
        token_count = 0
        if device.type == 'cuda':
            torch.cuda.reset_peak_memory_stats()
            torch.cuda.synchronize()
        started = time.perf_counter()
        with torch.inference_mode():
            for offset in range(0, len(documents), args.batch_size):
                batch = documents[offset:offset + args.batch_size]
                encoded = tokenizer(
                    [query] * len(batch),
                    batch,
                    padding=True,
                    truncation=True,
                    max_length=args.max_length,
                    return_tensors='pt',
                )
                token_count += int(encoded['attention_mask'].sum().item())
                encoded = {key: value.to(device) for key, value in encoded.items()}
                logits = model(**encoded, return_dict=True).logits.view(-1).float().cpu().tolist()
                scores.extend(logits)
        if device.type == 'cuda':
            torch.cuda.synchronize()
        emit({
            'type': 'result',
            'id': request['id'],
            'scores': scores,
            'inference_ms': round((time.perf_counter() - started) * 1000, 3),
            'input_tokens': token_count,
            'peak_vram_mb': round(torch.cuda.max_memory_allocated() / 1024 / 1024, 3) if device.type == 'cuda' else None,
        })
    except Exception as error:
        emit({'type': 'error', 'id': request.get('id') if 'request' in locals() else None, 'error': type(error).__name__, 'message': str(error)[:500]})
