# AI Search — kết quả sau sửa, 29/09/2026

## Kết quả

Đã nhập đủ 15 câu qua trình duyệt thật tại http://localhost:5173/. Mỗi case bắt đầu bằng Edit và gửi một search mới, không mang context của câu trước. Toàn bộ 15 phản hồi HTTP 200, mode hybrid, có giải thích và UI hiển thị đúng thứ tự API.

| # | Nhóm | Sản phẩm trả về sau sửa | Đánh giá |
|---|---|---|---|
| 1 | Exact CS655 | CS655 | Đạt |
| 2 | Soil moisture tiếng Anh | SoilVue10-5, HS2-12, CS650, CS655, CS616 | Đạt |
| 3 | Độ ẩm đất tiếng Việt | HS2-12, SoilVue10-5, CS616, CS650, CS655 | Đạt |
| 4 | Soil + SDI-12 | SoilVue10-5, CS655, CS650, TempVue50 | Đạt; câu này yêu cầu soil sensor, không bắt buộc đo độ ẩm |
| 5 | Độ ẩm + nhiệt độ đất + SDI-12 | CS650, CS655, SoilVue10-5 | Đạt |
| 6 | Độ ẩm đất ngoài đồng | HS2-12, SoilVue10-5, CS616, CS655, CS650 | Đạt retrieval đúng đại lượng |
| 7 | Harsh outdoor environments | ClimaVue40, ClimaVue50G2 | Đạt gợi ý có bằng chứng và giới hạn; không khẳng định phù hợp mọi môi trường |
| 8 | Hoạt động −50°C | 109, TEMP120-XD, CS241DM, CS230 | Đạt; chỉ giữ operating-temperature được xác nhận |
| 9 | Cellular | CELL205-AT, CELL210-V, CELL225-IT1A, CELL215-IT1A, CELL220-IT1A, RV50X | Đạt trong lượt này, không 503 |
| 10 | Datalogger Wi-Fi | CR310-WIFI | Đạt đúng biến thể |
| 11 | Nhiệt độ + độ ẩm + áp suất không khí | MetSENS300-D2, MetSENS500-DS, ClimaVue50G2, MetSENS550-D2 | Đạt đủ ba đại lượng |
| 12 | Độ đục nước | ClariVue10 | Đạt |
| 13 | Đọc vibrating wire | VWANALYZER, AVW200-ST, CRVW3-NE | Đạt |
| 14 | Nguồn cấp hệ thống | PS84-CR, PS150, PS24-w/CH150, PS200 | Đạt |
| 15 | Câu dài về độ ẩm + nhiệt độ đất, ưu tiên SDI-12 | CS650, CS655, SoilVue10-5 | Đạt |

Thời gian đơn lẻ: case 1 khoảng 8,1 giây; các case còn lại 1,3–2,2 giây. Case −50°C từ 19,2 giây trong lượt trước xuống 1,9 giây trong lượt này. Không coi đây là benchmark tải hoặc cam kết độ trễ.

## Thay đổi

- Nhận diện các khái niệm có trong catalogue bằng alias Việt/Anh; lọc đồng thời các đại lượng và loại thiết bị, sau retrieval và trước reranking.
- Search mới và hỏi tiếp đều yêu cầu bằng chứng protocol/nhiệt độ; không đưa UNKNOWN vào danh sách khớp.
- Exact model chỉ trả model đó. Không đổi các điểm keyword/semantic/RRF để làm giả độ phù hợp.
- Nhận diện Wi-Fi và xét Communication Option của biến thể hiện tại, tránh dùng Wi-Fi của cả dòng cho CR6-NA.
- Truy vấn môi trường đọc ingress_protection từ bảng thông số, giữ nguyên các giới hạn và câu không có chứng nhận chính thức.
- Giải thích dùng cùng điều kiện và bằng chứng với bộ lọc. Câu nhiều điều kiện/nhiệt độ không qua bước viết lại LLM để giữ đủ các điều kiện và giảm thời gian chờ.
- Retry một lần khi toàn bộ thao tác search chỉ đọc gặp ServiceUnavailableException. Lỗi kéo dài vẫn trả lỗi; không trả thành công giả. Chưa có log đủ để quy nguyên nhân gốc của 503 cũ cho một dịch vụ cụ thể.

## Kiểm chứng

- `npm.cmd run search:intent:test`: 63/63 kiểm thử qua, gồm 15 case trên catalogue, loại kết quả thiếu điều kiện, retry, hợp đồng API, hỏi tiếp, technical matching, explanations và reranker.
- ESLint qua với các file backend thay đổi đã kiểm tra.
- `search-results.json`: phản hồi API, request, thời gian và nội dung UI của đủ 15 câu.
- `search-case-01.png` … `search-case-15.png`: ảnh giao diện sau sửa.

## Phạm vi

Đạt bộ 15 case đã nêu dựa trên dữ liệu hiện có. Bộ nhận diện alias là hữu hạn; chưa phải bộ hiểu mọi cấu trúc AND/OR hoặc mọi truy vấn tự nhiên. Kết quả được lọc từ tập ứng viên retrieval nên không chứng minh recall toàn danh mục. Không đổi dữ liệu hay schema Supabase. Không khẳng định riêng nhánh multilingual embedding qua kiểm thử hybrid này. Lượt browser trước đó bị gián đoạn vì API tự khởi động khi build; bảng trên dùng lượt chạy hoàn chỉnh sau build.
