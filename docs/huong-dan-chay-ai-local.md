# Hướng dẫn chạy AI local trong REECO — từng bước trên Windows

Cập nhật theo mã nguồn dự án ngày **31/10/2026**. Các lệnh dưới đây dùng PowerShell.

Hướng dẫn chính dùng `npm run staging:local` để chạy API, client và admin cùng lúc. Model inference chạy trên máy; dữ liệu sản phẩm vẫn lấy từ Supabase được cấu hình trong backend.

**Không cần chạy toàn bộ tài liệu mỗi lần mở máy.** Nếu đã setup xong, dùng quy trình ngắn ở phần 11. Phân biệt các nhóm việc:

| Việc | Khi nào cần thực hiện |
|---|---|
| Mở Ollama, khởi động API và giao diện | Mỗi phiên sử dụng nếu các dịch vụ chưa chạy |
| Chạy service BGE | Mỗi phiên muốn dùng BGE và `RERANKER_ENABLED=true` |
| Warmup và smoke | Nên chạy trước buổi demo để xác nhận AI thật sẵn sàng |
| `npm install`, tạo env, tải model, tạo venv Python | Lần đầu; sau đó chỉ khi thiếu hoặc thay dependency/cấu hình |
| Build lại | Sau khi đổi code/dependency; `staging:local` mặc định tự build |
| Import, backfill hoặc sync catalog với `--execute` | Khi chuẩn bị DB mới hoặc đã duyệt thay đổi dữ liệu; không phải bước khởi động hằng ngày |
| Chạy toàn bộ test/lint/validator | Khi kiểm tra thay đổi hoặc chuẩn bị bàn giao/demo; không bắt buộc ở mỗi lần bật máy |

Chế độ staging trong tài liệu này **chặn ghi ở `/api/v1/admin`**. Nếu cần thử chức năng sửa giá/quản trị, dùng các terminal dev ở cuối tài liệu. Chạy local và giữ API cho website Vercel là hai quy trình khác nhau; xem phần 11.2.

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
SEARCH_EMBEDDING_TIMEOUT_MS=10000
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

Nếu đã có bản build thành công và **không đổi code/dependency cần build**, có thể khởi động nhanh bằng `npm run staging:local -- --skip-build`. Lệnh này dùng lại bản build cũ, không tự lấy thay đổi mới trong source. Không chạy thêm một API khác cùng cổng 3100 khi staging đang giữ cổng đó.

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

Có thể thấy embedding model, chat model hoặc cả hai tùy thời điểm và tài nguyên. Không bắt buộc hai model luôn cùng nằm trong bộ nhớ. Qwen explanation được gọi cho tối đa ba kết quả có bằng chứng và nằm trong ngân sách prompt.

Explanation có thể dùng rule dù flag LLM bật: ngoài batch được chọn, vượt ngân sách prompt, model không sẵn sàng/quá giờ hoặc câu trả lời không hợp lệ. Query model exact không chứng minh LLM đã được dùng; đọc `source` và `generation.status`.

Timeout embedding cho **query online mặc định 10 giây** (`SEARCH_EMBEDDING_TIMEOUT_MS=10000`); warmup/backfill mặc định **180 giây** (`OLLAMA_EMBEDDING_TIMEOUT_MS=180000`); explanation mặc định **20 giây**. Model nguội có thể làm query online chuyển sang tìm kiếm từ khóa dù warmup với timeout dài hơn vẫn thành công.

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

### 8.3. Cập nhật nền tảng explanation theo model — chỉ khi thay dữ liệu

Danh mục và ví dụ cho từng model nằm trong [báo cáo explanation theo model](ai-search-explainable-theo-model.md). API trả `explanation.requirements` với các trạng thái `confirmed`, `unconfirmed`, `mismatch`; từng mục có bằng chứng riêng. Thiếu dữ liệu được giữ là chưa xác nhận, không tự kết luận thiết bị không hỗ trợ.

Sau khi chỉnh dữ liệu hoặc quy tắc enrichment, chạy tại thư mục gốc:

```powershell
npm run build:semantic-enrichment
npm run build:search-documents
npm run validate:semantic-enrichment
npm run validate:search-documents
npm run search:catalog:audit
npm run search:catalog:sync
```

Lệnh sync mặc định chỉ kiểm tra. Để áp dụng dữ liệu đã kiểm tra vào Supabase:

```powershell
npm run search:catalog:sync -- --execute
npm run search:catalog:smoke -- --require-llm
```

Sync dùng API Supabase khi kết nối PostgreSQL trực tiếp không hoạt động. Nó kiểm tra dữ liệu remote trước khi cập nhật, giữ vector còn đúng với search text, tạo embedding trước khi ghi các nội dung thay đổi và không sửa giá, đơn hàng hoặc tài khoản. Thông số nguồn vẫn giữ các điều kiện, ghi chú và cảnh báo.

Bản sao trước cập nhật nằm trong `output/explanation-sync-backup.json`; trạng thái đã đồng bộ nằm trong `output/explanation-sync-baseline.json`. Giữ file baseline để nhận biết những chỉnh sửa độc lập ở Supabase trong lần đồng bộ sau. Nếu dữ liệu remote khác baseline, script dừng để tránh ghi đè. Sau cập nhật code, build và khởi động lại staging theo các bước ở trên.

Qwen được giới hạn tối đa ba kết quả đủ điều kiện và có giới hạn dung lượng prompt; explanation dài có thể dùng rule để giữ đầy đủ bằng chứng trong giới hạn context local.

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

### 11.1. Chạy trên máy local sau khi đã setup

1. Mở PowerShell tại project root:

   ```powershell
   Set-Location 'E:\Personal Projects\Reeco\REECO_AI_SEARCH'
   ollama ls
   ```

   Nếu không kết nối được, mở ứng dụng Ollama; hoặc dùng terminal riêng chạy `ollama serve` và giữ terminal đó mở. Nếu `ollama ls` đã chạy được thì không mở thêm server. Không cần pull lại model đã có.

2. Nếu `.env` bật `RERANKER_ENABLED=true` và muốn dùng BGE, khởi động service Python theo phần 9, chờ `loaded=true`. Nếu để `false`, bỏ qua. Lọc và xếp hạng theo thông số kỹ thuật vẫn hoạt động khi không dùng BGE; BGE là lớp sắp xếp bằng model riêng.

3. Khởi động ứng dụng và giữ terminal này mở:

   ```powershell
   npm run staging:local
   ```

   Đã build thành công, không đổi code/dependency thì có thể dùng `npm run staging:local -- --skip-build`. Chờ dòng `API: http://127.0.0.1:3100/api/v1 (ready)`.

4. Nên kiểm tra AI trước buổi demo, trong **terminal khác**:

   ```powershell
   Set-Location 'E:\Personal Projects\Reeco\REECO_AI_SEARCH'
   $env:SEARCH_API_URL = 'http://127.0.0.1:3100/api/v1/search'
   npm run demo:warmup
   npm run demo:smoke
   ```

   Warmup không tự mở Ollama, API hoặc BGE. Lệnh có build API nhưng không khởi động lại API đang chạy; nếu đổi code/env, dừng và khởi động lại staging trước khi xác minh. Chỉ coi AI demo sẵn sàng khi warmup và smoke đều PASS; nếu lỗi kết nối Ollama thì quay lại bước 1. `mode: keyword` có nghĩa đang dùng nhánh dự phòng, chưa đạt tiêu chí demo hybrid; warmup/smoke sẽ báo thất bại thay vì che lỗi này. Nếu chỉ làm giao diện hoặc kiểm tra chức năng cơ bản thì không bắt buộc chạy warmup/smoke mỗi lần.

5. Mở client **http://127.0.0.1:4173**, admin **http://127.0.0.1:4174**. Thử một truy vấn thật; `/health` OK chưa chứng minh mô hình/Supabase hoạt động. Khi cần, dùng `ollama ps` để xem model đã nạp.

6. Dùng xong: Ctrl+C staging/BGE. Có thể unload model hoặc Quit Ollama theo phần 10. Không dừng những dịch vụ này nếu website public vẫn đang sử dụng API/Ollama trên máy này.

Preload thủ công ở phần 5, `npm install`, tải model, tạo venv và cập nhật catalog **không phải** các bước bắt buộc mỗi lần mở máy. Dữ liệu và embedding đã lưu trong Supabase không mất khi tắt máy.

### 11.2. Nếu dùng website đã deploy trên Vercel

Frontend Vercel không cần hai server giao diện 4173/4174 trên máy bạn. Tuy nhiên, nếu backend và Ollama vẫn đặt trên máy này, cần giữ **máy, API, Ollama và tunnel HTTPS** hoạt động; bật BGE nếu cấu hình yêu cầu dùng nó.

- Tunnel phải trỏ đến đúng cổng API đang chạy. CORS của API cần cho phép domain client/admin public; cấu hình staging mặc định là URL local, không tự thay thế cấu hình public.
- Nếu dùng tunnel Cloudflare tạm và URL đổi sau khi khởi động lại, cập nhật `REACT_APP_API_URL` cho cả hai project Vercel rồi redeploy để URL mới được nhúng vào frontend. Không cần redeploy mỗi lần mở máy nếu endpoint giữ nguyên và còn hoạt động.
- Nếu tắt máy hoặc tunnel không hoạt động, trang giao diện Vercel có thể vẫn mở được nhưng tìm kiếm/đăng nhập và các chức năng cần API sẽ lỗi.

Đối chiếu [quy trình deploy và API URL trên Vercel](vercel-hobby-workflow.md). Phần này không yêu cầu import/backfill lại DB hay chạy lại toàn bộ test mỗi lần bật máy.

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
| `demo:warmup` báo `OLLAMA_NOT_REACHABLE` / cổng 11434 từ chối kết nối | Mở Ollama, kiểm tra `ollama ls`, giữ API chạy rồi chạy lại warmup; build thành công không tự khởi động model server |
| Website Vercel mở được nhưng API báo ENOTFOUND/NXDOMAIN | Kiểm tra tunnel HTTPS. Nếu URL tạm đã đổi, cập nhật `REACT_APP_API_URL` và redeploy hai frontend; không cần import lại DB |
| API/4173/4174 bị chiếm cổng | Dừng phiên staging cũ ở terminal của nó; không mở hai staging cùng lúc |
| UI có fixture dù model không chạy | Kiểm tra `REACT_APP_SEARCH_MOCK` trong `.env`/`.env.local`, tắt mock rồi rebuild staging |
| UI gọi API 3000 thay vì 3100 | Chạy staging bình thường để rebuild với API URL của staging; không tái dùng build dev sai URL |
| Health OK nhưng search lỗi | Health chưa kiểm tra Supabase/Ollama; kiểm tra request search và log backend |
| UI báo không kết nối nhưng API health vẫn OK | Kiểm tra CORS; staging phải truyền `CLIENT_APP_URL=http://127.0.0.1:4173` và `ADMIN_APP_URL=http://127.0.0.1:4174` cho API. Sau cập nhật script, dừng staging cũ và chạy lại |
| Explanation vẫn source rule | Đọc generation status; kiểm tra flag/model, eligibility, timeout và Ollama |
| Lần search đầu chậm | Model cold load; có thể preload, theo dõi tài nguyên và timeout |
| BGE health not_ready | Chờ load/warm model; chỉ bật thử integration khi loaded true |
| Query trả rỗng | Xem guidance và bằng chứng protocol/nhiệt độ; public filter có thể loại UNKNOWN |

Nếu chỉ muốn debug hoặc sửa code frontend, có thể dùng các terminal dev riêng: `npm run dev:api` (3000), `npm run dev:client` (5173), `npm run dev:admin` (5174). Dùng đúng API URL theo chế độ; hướng dẫn chính ở đây dùng staging 3100/4173/4174.

Khi staging đang chạy, có thể kiểm tra CORS cho cả hai giao diện bằng `node --test scripts/staging/local.test.mjs`. Check này chỉ gửi preflight OPTIONS, không gọi model hoặc ghi database.

Tài liệu tham khảo của dự án: [AI search tổng hợp](ai-search-quy-trinh-tong-hop.md), [Reranker runtime](reranker-runtime.md), [Service Python](../services/reranker/README.md).
