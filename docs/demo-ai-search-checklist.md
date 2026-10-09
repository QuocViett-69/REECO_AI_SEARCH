# AI search: chuẩn bị demo

Catalog đã khóa sửa và import trong admin/API. Admin vẫn sửa được giá; giá không tham gia truy hồi AI. Nếu cần thay dữ liệu, chạy pipeline hiện có, import rồi backfill embedding trước buổi demo. Không thay catalog khi đang trình diễn.

## Kiểm tra mã nguồn và DB

```powershell
npm run test:api
npm run test:client -- --runInBand
npm run test:admin -- --runInBand
npm run lint
npm run build
npm run embeddings:validate
```

`test:api` gồm các test search, embedding và explanation. `embeddings:validate` đọc DB thật, kiểm tra đủ index cho sản phẩm active, vector 1536 chiều và metadata đúng model/version; thiếu cấu hình hoặc dữ liệu sai sẽ thất bại. Các lệnh kiểm tra không sửa DB.

## Chạy và làm nóng model

Mở Ollama và API trước. Có thể dùng `npm run staging:local -- --skip-build` để xem hai giao diện production trên máy. URL search mặc định của các lệnh demo là `http://127.0.0.1:3100/api/v1/search`; nếu API ở nơi khác, đặt biến môi trường:

```powershell
$env:SEARCH_API_URL="https://your-api.example/api/v1/search"
npm run demo:warmup
npm run demo:smoke
```

Khi dùng model trên máy khác, chạy warmup tại máy chạy API/Ollama với đúng `.env`. Warmup dùng timeout dài để tải model, sau đó gọi search thật. Smoke kiểm tra model/version của API đang chạy, mode hybrid, CS655, phân loại sensor, câu hỏi USB và câu hỏi làm rõ điều kiện hệ thống. Có thể dùng `npm run demo:smoke -- --require-llm` để yêu cầu explanation thực sự được LLM chấp nhận.

`/health` chỉ là liveness và cấu hình, không chứng minh search hoạt động. Chỉ coi bản demo sẵn sàng khi validator và smoke đều PASS. Nếu smoke báo keyword fallback, làm nóng model rồi chạy lại; không tăng timeout online lên vài phút.

- `SEARCH_EMBEDDING_TIMEOUT_MS=10000`: ngân sách embedding cho query online; quá hạn sẽ dùng keyword khi nguồn đó hoạt động.
- `OLLAMA_EMBEDDING_TIMEOUT_MS=180000`: dùng riêng cho backfill/warmup.
- Browser ngừng chờ search sau 45 giây và cho phép thử lại.
- Model nguội vẫn có thể fallback; chạy warmup ngay trước demo và giữ máy/API/Ollama hoạt động.

## Phạm vi demo

Yêu cầu thiết kế nhiều thành phần có protocol, điều kiện loại trừ hoặc thông số chưa rõ sẽ yêu cầu tìm riêng thành phần với đầy đủ điều kiện. Chưa có bộ suy luận tự động gán mọi điều kiện cho từng thiết bị hay xác nhận tương thích toàn hệ thống. USB của CS655 được trả là chưa xác nhận khi catalog không có bằng chứng.

Deploy theo mô hình hiện có: giữ một API và Ollama trên cùng máy, dùng Supabase hiện tại và phục vụ hai frontend static. Cấu hình HTTPS, API URL và CORS theo địa chỉ demo. Không cần thêm hàng đợi, Redis hay cụm inference cho phạm vi này.
