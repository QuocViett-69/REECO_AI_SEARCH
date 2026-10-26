# Mở rộng parser và diễn đạt có bằng chứng — 14/10/2026

## Thay đổi và nguyên nhân

| Phần | Giới hạn trước đây | Thay đổi |
|---|---|---|
| Nhiệt độ | Chỉ °C; ít kiểu khoảng; chưa tách điều kiện đo/vận hành ở các mệnh đề | Chuẩn hóa °C/°F/K, Celsius/Fahrenheit/Kelvin, dấu phẩy thập phân, khoảng dùng dấu gạch và đơn vị khác nhau ở hai đầu; tách mệnh đề có nhãn đo/vận hành |
| Thông số có đơn vị | So khớp chuỗi, nên 1000 Hz và 1 kHz không tương đương | Chuẩn hóa Hz/kHz/MHz, V/mV và VDC/mVDC, A/mA/µA, W/mW, m/cm/mm, Pa/kPa/MPa/bar; so giá trị hoặc khoảng bao phủ cùng đơn vị; giữ dấu âm và phân biệt tiền tố milli/mega |
| Protocol | Danh sách hẹp, không nhận Modbus TCP/ASCII | Thêm Modbus TCP/ASCII, RS-422, Ethernet, PakBus, DNP3, MQTT, TCP/IP; dùng chung chuẩn hóa trong parser, phủ định và đối chiếu bằng chứng |
| Phủ định | Bỏ sót RS-485, danh sách phủ định và một số cách viết Việt/Anh | Nhận danh sách sau “không hỗ trợ”, “không dùng”, “without”, “does not support”; nhận phủ định sau protocol; phân biệt “không cần” với loại trừ và câu hỏi “có hỗ trợ … không?” |
| LLM | Trả chỉ số để chọn một đoạn soạn sẵn | Trả đoạn văn, có thể phối hợp các cách diễn đạt đã kiểm chứng và đổi thứ tự câu hoàn chỉnh; validator đối chiếu toàn bộ câu với giải thích có bằng chứng |

Các lỗi mới được phát hiện trong regression và sửa tại nguồn: phủ định CANbus không còn trở thành yêu cầu CANbus dương; độ sâu đất được đánh giá bằng logic độ sâu hiện có thay vì diễn giải lại thành chiều dài chung; Ethernet trong truy vấn lựa chọn mạng không còn bị coi là điều kiện bổ sung cho mọi thành phần.

## Luồng và file

- `technical-query.constants.ts`, `technical-query-parser.service.ts`: phiên bản parser v2, đơn vị nhiệt độ và protocol.
- `unit-query.ts`, `specification-query.ts`: chuẩn hóa đơn vị và kiểm tra giá trị/khoảng. Không gộp VDC với VAC.
- `protocol-query.ts`, `conversation-query.ts`: chuẩn hóa tên, phủ định có phạm vi và điều kiện không bắt buộc.
- `technical-match.service.ts`, `search-intent.ts`, `search.service.ts`: dùng kết quả chuẩn hóa để truy xuất, lọc và đối chiếu; không suy ra Modbus TCP từ RS-485 hoặc Ethernet.
- `explanation.service.ts`, `explanation-wording.ts`: sinh cách diễn đạt và xác minh trước khi chấp nhận; giữ nguyên evidence và trạng thái từng yêu cầu.
- `parser-expansion.test.mjs`, `explanation-runtime.test.mjs`, `technical-match.test.mjs`, `bug-log-regression.test.mjs`: regression, nội dung bịa, mất phủ định, đổi đại lượng, model, con số và phản hồi hợp lệ đến sau timeout.
- `parser-expansion-live.mjs`: kiểm tra chỉ đọc với Supabase, truy xuất hybrid và Ollama thật.

## Kiểm chứng giải thích

Giải thích gốc vẫn được tạo từ yêu cầu, kết quả matcher và dữ liệu của đúng sản phẩm. Prompt chỉ chứa bằng chứng thực tế và các cách diễn đạt tương đương. Đoạn LLM trả về chỉ được chấp nhận nếu sau chuẩn hóa những cách diễn đạt đã review, mọi câu đều tương đương câu gốc, đủ số lượng và không thêm/bớt ý. Không dùng việc có cùng từ khóa làm bằng chứng đúng nghĩa.

Ví dụ đã chạy thật:

> Theo dữ liệu sản phẩm, SoilVue10-5 đáp ứng yêu cầu về độ ẩm đất. SoilVue10-5 hỗ trợ SDI-12. Nhiệt độ vận hành được ghi nhận là -40–60°C bao phủ mức -40°C bạn yêu cầu.

Các cảnh báo về ngưỡng, loại đất và cấu hình lắp đặt vẫn được giữ trong đoạn đầy đủ. Không biến dải vận hành thành dải đo, hoặc biến “chưa xác nhận” thành “có hỗ trợ”.

## Kết quả

- `npm run test:api`: **221/221 PASS**, gồm 27 tình huống cũ, giả lập timeout LLM 20 giây, lỗi/timeout từng và cả hai nhánh truy xuất.
- `npm run lint`: **PASS**; shared/API build **PASS**.
- `node --env-file=apps/api/.env scripts/search/parser-expansion-live.mjs`: **6 truy vấn thật PASS**, với Supabase và `qwen3:4b-instruct-2507-q4_K_M`; **11 đoạn viết lại khác câu gốc và được kiểm chứng** ở lần chạy kiểm tra.
- Điều kiện 233,15 K được đối chiếu thành −40°C; truy xuất trả SoilVue10-5, CS655, CS650.
- Truy vấn Modbus TCP trả CR6-NA-ST-CC, CR310-NA, CR350-NA với bằng chứng hỗ trợ protocol tương ứng.
- Yêu cầu đồng thời ẩm đất, nhiệt độ không khí và SDI-12 không có ứng viên được xác nhận; không nới điều kiện để ép có kết quả.
- Câu hỏi CS655/Wi-Fi có phản hồi LLM bị từ chối; fallback giữ trạng thái chưa xác nhận Wi-Fi và bằng chứng giao tiếp có dây.

## Giới hạn và áp dụng

- Diễn đạt LLM được giới hạn bằng các phép diễn đạt tương đương đã review; đây không phải bộ chứng minh mọi câu văn tự do. Câu không xác minh được, lỗi JSON, offline hoặc timeout sẽ dùng giải thích gốc.
- Chưa mở rộng toàn bộ đơn vị, so sánh `<`/`>`, dung sai hoặc khoảng truyền radio phụ thuộc anten/địa hình. Không suy ra đáp ứng ứng dụng từ một con số không có đúng ngữ cảnh.
- Phủ định ngoài các dạng đã hỗ trợ vẫn bị chặn để tránh chuyển thành điều kiện dương. Thiếu metadata hỗ trợ không chứng minh protocol vắng mặt.
- Không thay schema phản hồi frontend, không sửa dữ liệu catalog, không reset tài khoản hay ghi đơn hàng.
- Thay đổi này ở backend: build và restart API để áp dụng; giữ tunnel chạy cùng cổng thì không cần đổi URL hoặc redeploy frontend.
- Chưa commit/push hoặc kiểm tra trên website Vercel. Hai file tài liệu đã bị xóa trước khi bắt đầu công việc được giữ nguyên trạng thái của người dùng.
