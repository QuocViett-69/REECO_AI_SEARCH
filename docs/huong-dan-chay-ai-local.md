# Hướng dẫn chạy AI local trong REECO — từng bước trên Windows

Cập nhật theo mã nguồn dự án ngày **07/10/2026**. Các lệnh dưới đây dùng PowerShell.

Hướng dẫn chính dùng `npm run staging:local` để chạy API, client và admin cùng lúc. Model inference chạy trên máy; dữ liệu sản phẩm vẫn lấy từ Supabase được cấu hình trong backend.

## 1. Hiểu các thành phần cần chạy

| Thành phần | Chức năng | Địa chỉ khi chạy staging |
|---|---|---|
| Ollama server | Nhận request từ backend và nạp model local | `http://127.0.0.1:11434` |
| `qwen3-embedding:4b` | Tạo vector cho query search | Chạy trong Ollama |
| `qwen3:4b-instruct-2507-q4_K_M` | Chọn cách diễn đạt explanation từ các phương án có bằng chứng | Chạy trong Ollama |
| NestJS API | Gọi Supabase và điều phối AI search | `http://127.0.0.1:3100/api/v1` |
| Client | Giao diện tìm kiếm khách hàng | `http://127.0.0.1:4173` |
| Admin | Giao diện quản trị | `http://127.0.0.1:4174` |
| BGE reranker, tùy chọn | Sắp xếp lại tối đa Top 5 candidate | `http://127.0.0.1:8011` |

Ba trạng thái khác nhau:

- **Đã tải model:** file model nằm trên ổ đĩa, kiểm tra bằng `ollama ls`.
- **Server đang chạy:** Ollama trả lời được `ollama ls` hoặc API.
- **Model đã nạp:** model đang ở RAM/VRAM, kiểm tra bằng `ollama ps`.

`ollama ps` trống không có nghĩa Ollama bị tắt. Backend có thể tự yêu cầu nạp model khi nhận query.

## 2. Chuẩn bị dự án lần đầu hoặc sau khi đổi dependency

Mở PowerShell, chuyển vào thư mục dự án:

```powershell
Set-Location 'E:\Personal Projects\Reeco\REECO_AI_SEARCH'

node --version
npm --version
npm install
```

Dự án yêu cầu Node.js 22+ và npm 10+. `npm install` cài các dependency đã được khai báo trong workspace; không cần chạy lại ở mọi lần mở dự án.

Nếu từng gặp:

```text
Module not found: Error: Can't resolve 'react-router-dom'
```

Chạy `npm install` ở **thư mục gốc**, rồi kiểm tra:

```powershell
npm ls react-router-dom --all
```

Kết quả cần hiển thị dependency của `@reeco/client` và `@reeco/admin`. Package này đã có trong cấu hình dự án; không cần tự thêm một version khác.

## 3. Kiểm tra cấu hình backend và frontend

### 3.1. Tạo file env nếu chưa có

Không ghi đè `.env` đã được cấu hình. Chỉ copy khi file chưa tồn tại:

```powershell
if (-not (Test-Path apps/api/.env)) {
  Copy-Item apps/api/.env.example apps/api/.env
}
if (-not (Test-Path apps/client/.env)) {
  Copy-Item apps/client/.env.example apps/client/.env
}
if (-not (Test-Path apps/admin/.env)) {
  Copy-Item apps/admin/.env.example apps/admin/.env
}
```

### 3.2. Cấu hình AI trong backend

Mở [apps/api/.env](../apps/api/.env), giữ hoặc cập nhật các dòng:

```dotenv
EMBEDDING_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
EMBEDDING_MODEL=qwen3-embedding:4b
EMBEDDING_DIMENSIONS=1536
EMBEDDING_VERSION=ollama-qwen3-embedding-4b-1536-v1
OLLAMA_EMBEDDING_TIMEOUT_MS=180000
EMBEDDING_BATCH_SIZE=8

LLM_EXPLANATION_ENABLED=true
LLM_MODEL=qwen3:4b-instruct-2507-q4_K_M
LLM_EXPLANATION_TIMEOUT_MS=20000

# Để false nếu chưa chạy service BGE riêng ở phần 9.
RERANKER_ENABLED=false
```

Trong cùng file, backend cần đúng `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` của project. `DATABASE_URL` dùng cho import/backfill và các script kết nối PostgreSQL. Không đưa các secret này vào frontend.

Với database mới, phải chuẩn bị migration, import catalog và embedding sản phẩm trước. Xem [quy trình AI search tổng hợp](ai-search-quy-trinh-tong-hop.md). Khởi động Ollama không tự import dữ liệu hoặc backfill database.

Trong [apps/client/.env](../apps/client/.env), dùng:

```dotenv
REACT_APP_SEARCH_MOCK=false
```

Kiểm tra thêm `.env.local` nếu máy có file này, vì cấu hình mock tại đó có thể được ưu tiên. Mock bật thì giao diện dùng fixture thay vì backend AI thật.

Sau khi đổi `.env`, restart API hoặc staging. Không cần copy file model vào repository; backend gọi model bằng tên qua Ollama HTTP API.

## 4. Mở Ollama và kiểm tra model

### 4.1. Kiểm tra server trước

```powershell
ollama ls
```

Nếu lệnh trả danh sách model, server đã chạy. Chuyển sang bước tiếp theo, không cần thêm một `ollama serve`.

Nếu không kết nối được, mở **Ollama** từ Windows Start Menu rồi chạy lại `ollama ls`. Có thể dùng terminal riêng để chạy server thủ công:

```powershell
ollama serve
```

Khi dùng `ollama serve`, giữ terminal đó mở. Khi dùng ứng dụng/background server, không cần giữ terminal server riêng.

### 4.2. Hiểu lỗi cổng 11434

Nếu chạy `ollama serve` và thấy:

```text
Error: listen tcp 127.0.0.1:11434: bind:
Only one usage of each socket address ... is normally permitted.
```

Nghĩa là cổng đã có process lắng nghe. Nếu `ollama ls` vẫn hoạt động thì Ollama đang chạy bình thường; không cần tắt process để mở server lần nữa.

### 4.3. Kiểm tra hai model của dự án

Danh sách cần có:

```text
qwen3:4b-instruct-2507-q4_K_M
qwen3-embedding:4b
```

Chỉ tải model còn thiếu:

```powershell
ollama pull qwen3-embedding:4b
ollama pull qwen3:4b-instruct-2507-q4_K_M
```

Nếu đã có đúng tên model thì không cần tải lại mỗi lần khởi động.

## 5. Nạp trước model explanation — tùy chọn

Bước này giảm thời gian chờ khi query đầu tiên cần model chat. Có thể bỏ qua và để dự án tự nạp.

Trong PowerShell:

```powershell
Invoke-RestMethod `
  -Uri 'http://127.0.0.1:11434/api/chat' `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"model":"qwen3:4b-instruct-2507-q4_K_M","stream":false,"keep_alive":"10m"}'

ollama ps
```

Response có thể chứa:

```text
done        : True
done_reason : load
```

Message content rỗng là bình thường vì request này chỉ yêu cầu load, không hỏi câu chat. `ollama ps` lúc này cần có tên model, bộ nhớ, PROCESSOR và UNTIL.

`100% GPU` nghĩa model đã được nạp hoàn toàn lên GPU; `100% CPU` là chạy CPU. Dung lượng trong `ps` có thể lớn hơn size file ở `ls` vì có bộ nhớ runtime/context.

`keep_alive:10m` không giữ model vĩnh viễn. Khi hết thời gian không hoạt động, model có thể unload; request tiếp theo sẽ nạp lại. Xem [preload và quản lý bộ nhớ Ollama](https://docs.ollama.com/faq).

## 6. Chạy dự án ở terminal chính

Tại thư mục gốc:

```powershell
npm run staging:local
```

Lệnh này build shared, API, client, admin rồi mở ba dịch vụ. Chờ tới khi có thông báo:

```text
Customer UI: http://127.0.0.1:4173
Admin UI: http://127.0.0.1:4174
API: http://127.0.0.1:3100/api/v1 (ready)
Press Ctrl+C to stop local staging.
```

**Giữ terminal này mở.** Nếu build fail thì staging chưa khởi động đầy đủ; sửa lỗi trước rồi chạy lại.

Cảnh báo `DeprecationWarning: fs.F_OK is deprecated` không phải lỗi compile. Dấu hiệu cần xử lý là `Failed to compile`, `Build failed`, API dừng hoặc lỗi chiếm cổng.

Staging chặn mutation `/api/v1/admin` để đọc dữ liệu demo. Dùng đúng URL **127.0.0.1:4173** trong hướng dẫn này.

## 7. Mở giao diện và thử AI search

Truy cập **http://127.0.0.1:4173**, nhập:

```text
cảm biến độ ẩm đất hỗ trợ SDI-12
```

Hoặc:

```text
soil moisture sensor supporting SDI-12
```

Frontend tự gửi `explain:true`. Luồng thông thường là query → embedding/keyword retrieval → kiểm tra kỹ thuật → rerank nếu bật → explanation.

Ở terminal PowerShell thứ hai, chạy:

```powershell
ollama ps
```

Có thể thấy embedding model, chat model hoặc cả hai tùy thời điểm và tài nguyên. Không bắt buộc hai model luôn cùng nằm trong bộ nhớ. Qwen explanation chỉ được gọi cho tối đa ba kết quả đủ điều kiện có nhiều phương án câu chữ.

Query model exact hoặc kết quả chỉ có một phương án explanation có thể dùng rule dù flag LLM bật. Lần đầu load model có thể chậm; timeout embedding hiện là 180 giây và timeout explanation là 20 giây.

## 8. Kiểm tra API và xác nhận LLM được dùng

### 8.1. Kiểm tra API đã lên

Chạy trong terminal thứ hai:

```powershell
Invoke-RestMethod 'http://127.0.0.1:3100/api/v1/health'
```

Kết quả cần có `status:ok`. Health này chỉ kiểm tra API trả lời, chưa chứng minh Supabase hoặc model hoạt động.

### 8.2. Gửi search thật

```powershell
$searchResult = Invoke-RestMethod `
  -Uri 'http://127.0.0.1:3100/api/v1/search' `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"query":"soil moisture sensor supporting SDI-12","limit":3,"explain":true}'

$searchResult | Select-Object query, mode
$searchResult.results | Select-Object model, explanation | Format-List
```

Đọc `explanation.source` và `explanation.generation.status`:

| Source/status | Ý nghĩa |
|---|---|
| `llm` / `accepted` | Ollama đã trả lựa chọn câu chữ hợp lệ, backend đã dùng |
| `rule` / `disabled` | Flag off hoặc chưa có `LLM_MODEL` |
| `rule` / `not_applicable` | Kết quả không đủ điều kiện hoặc ngoài batch model được chọn |
| `rule` / `timeout` | Model chat quá thời gian; dùng template |
| `rule` / `unavailable` | Model/service/HTTP không dùng được; dùng template |
| `rule` / `invalid_response` | JSON hoặc lựa chọn model không hợp lệ; dùng template |

Model hiện **chọn giữa các explanation đã chuẩn bị theo bằng chứng**, không sinh tự do đoạn văn để API dùng thẳng. `source=llm` không có nghĩa model đã tự xác nhận thông số kỹ thuật.

`mode=hybrid` trên search thông thường nghĩa cả hai branch retrieval hoàn thành; không nhất thiết cả hai cùng đóng góp kết quả. `mode=keyword` là fallback khi semantic branch lỗi. `scores.rerank` public vẫn null dù BGE được dùng; kiểm tra log backend cho rerank.

Nếu không có results, cần xem query, dữ liệu, filter và guidance; không chỉ từ đó kết luận LLM lỗi. Nếu results thiếu explanation, xem warning backend về bước load/build explanation.

## 9. Chạy BGE reranker local — tùy chọn

BGE chạy bằng service Python riêng. Nó không nằm trong Ollama và không tự khởi động cùng `staging:local`. Chỉ làm phần này nếu muốn bật rerank.

### 9.1. Chuẩn bị Python environment

Nếu đã có venv đúng requirements, dùng lại. Nếu chưa có, ví dụ:

```powershell
python -m venv E:\ModelCache\reeco-reranker-venv
& 'E:\ModelCache\reeco-reranker-venv\Scripts\python.exe' -m pip install -r services/reranker/requirements.txt
```

Python/PyTorch phải tương thích với requirements và phần cứng. Service tự chọn CUDA khi PyTorch sử dụng được CUDA, CPU nếu không.

### 9.2. Mở terminal riêng chạy service

```powershell
Set-Location 'E:\Personal Projects\Reeco\REECO_AI_SEARCH'

& 'E:\ModelCache\reeco-reranker-venv\Scripts\python.exe' -m uvicorn app:app --app-dir services/reranker --host 127.0.0.1 --port 8011
```

Giữ terminal này mở. Không cấu hình model path thì Transformers resolve revision pin trong cache, có thể tải weights lần đầu. Nếu đã có snapshot local, đặt trước khi chạy uvicorn:

```powershell
$env:RERANKER_MODEL_PATH = 'E:\ModelCache\huggingface\hub\models--BAAI--bge-reranker-v2-m3\snapshots\953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e'
```

Chỉ dùng path nếu thư mục đó thực sự chứa đủ snapshot. Model ID là `BAAI/bge-reranker-v2-m3`, revision pin `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`.

### 9.3. Chờ model ready, rồi bật API flag

```powershell
Invoke-RestMethod 'http://127.0.0.1:8011/health'
```

Cần `status=ok`, `loaded=true`, đúng model/revision. HTTP 200 với `not_ready` nghĩa model vẫn đang load.

Trong backend `.env`, dùng:

```dotenv
RERANKER_ENABLED=true
RERANKER_BASE_URL=http://127.0.0.1:8011
RERANKER_TIMEOUT_MS=350
RERANKER_TOP_N=5
RERANKER_MODEL=BAAI/bge-reranker-v2-m3
RERANKER_MODEL_REVISION=953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e
```

Restart staging để API nhận flag. Khi đủ candidate, API reorder tối đa Top 5 với protection. Service timeout/busy/lỗi thì giữ baseline order. Không có kết quả reorder cũng có thể là model chọn cùng order; xem telemetry backend.

## 10. Tắt dự án và giải phóng model

### 10.1. Dừng ứng dụng trước

Trong terminal chạy staging, nhấn **Ctrl+C**. Nếu BGE đang chạy, nhấn **Ctrl+C** trong terminal uvicorn.

### 10.2. Unload các model Ollama

```powershell
ollama stop qwen3:4b-instruct-2507-q4_K_M
ollama stop qwen3-embedding:4b
ollama ps
```

Danh sách trống nghĩa không còn model loaded tại thời điểm kiểm tra. File model vẫn còn trên ổ đĩa; lần sau không cần tải lại. `ollama stop` là unload, không phải xóa model. Xem [Ollama CLI](https://docs.ollama.com/cli).

Nếu app vẫn đang chạy và có query mới, model có thể tự nạp lại. Vì vậy dừng app trước khi muốn giải phóng model cho hết phiên làm việc.

### 10.3. Tắt luôn server nếu muốn

- Nếu mở ứng dụng Ollama: chọn **Quit Ollama** ở khay hệ thống.
- Nếu mở server bằng `ollama serve`: nhấn **Ctrl+C** trong terminal server.

### 10.4. Tiếp tục search nhưng tắt riêng Qwen explanation

Đổi backend `.env`:

```dotenv
LLM_EXPLANATION_ENABLED=false
```

Restart staging, rồi unload model chat:

```powershell
ollama stop qwen3:4b-instruct-2507-q4_K_M
```

Search vẫn dùng embedding và explanation theo rule. Nếu muốn tắt BGE riêng, đổi `RERANKER_ENABLED=false`, restart API và dừng uvicorn.

## 11. Quy trình ngắn cho mỗi lần sử dụng

Sau khi setup ban đầu xong:

1. Mở PowerShell tại project root.
2. Chạy `ollama ls`; nếu không kết nối được thì mở Ollama.
3. Chạy `npm run staging:local`, chờ API ready, giữ terminal mở.
4. Mở `http://127.0.0.1:4173`, nhập query.
5. Dùng terminal thứ hai chạy `ollama ps` hoặc request API để kiểm tra khi cần.
6. Dùng xong: Ctrl+C staging/BGE, `ollama stop` các model; Quit Ollama nếu muốn.

Preload, `npm install`, tải model và tạo venv chỉ cần khi có nhu cầu tương ứng; không phải bước bắt buộc mỗi lần mở máy.

## 12. Các lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `ollama serve` báo cổng 11434 bị chiếm | Chạy `ollama ls`; nếu thành công thì dùng server đang có |
| `ollama ps` trống | Bình thường khi chưa load/hết keep-alive; search hoặc preload sẽ nạp model |
| `done_reason:load`, content rỗng | Preload đã hoàn thành; không phải chat thất bại |
| Thiếu `react-router-dom` khi build | `npm install` ở root, kiểm tra `npm ls react-router-dom --all`, chạy staging lại |
| `fs.F_OK` deprecation warning | Không chặn build; kiểm tra thông báo compile cuối cùng |
| `ollama` không được nhận diện | Mở lại terminal sau cài đặt, kiểm tra `Get-Command ollama` |
| Model not found | So tên trong env với `ollama ls`, pull đúng model còn thiếu |
| API/4173/4174 bị chiếm cổng | Dừng phiên staging cũ ở terminal của nó; không mở hai staging cùng lúc |
| UI có fixture dù model không chạy | Kiểm tra `REACT_APP_SEARCH_MOCK` trong `.env`/`.env.local`, tắt mock rồi rebuild staging |
| UI gọi API 3000 thay vì 3100 | Chạy staging bình thường để rebuild với API URL của staging; không tái dùng build dev sai URL |
| Health OK nhưng search lỗi | Health chưa kiểm tra Supabase/Ollama; kiểm tra request search và log backend |
| Explanation vẫn source rule | Đọc generation status; kiểm tra flag/model, eligibility, timeout và Ollama |
| Lần search đầu chậm | Model cold load; có thể preload, theo dõi tài nguyên và timeout |
| BGE health not_ready | Chờ load/warm model; chỉ bật thử integration khi loaded true |
| Query trả rỗng | Xem guidance và bằng chứng protocol/nhiệt độ; public filter có thể loại UNKNOWN |

Nếu chỉ muốn debug hoặc sửa code frontend, có thể dùng các terminal dev riêng: `npm run dev:api` (3000), `npm run dev:client` (5173), `npm run dev:admin` (5174). Dùng đúng API URL theo chế độ; hướng dẫn chính ở đây dùng staging 3100/4173/4174.

Tài liệu tham khảo của dự án: [AI search tổng hợp](ai-search-quy-trinh-tong-hop.md), [Reranker runtime](reranker-runtime.md), [Service Python](../services/reranker/README.md).
