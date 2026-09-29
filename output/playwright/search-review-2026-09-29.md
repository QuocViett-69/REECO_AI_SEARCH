# Kiểm thử AI Search — 29/09/2026

## Kết luận

Chưa hoàn tất toàn bộ yêu cầu. 15 truy vấn đã được nhập và gửi qua trình duyệt thật tại http://localhost:5173/ bằng Playwright, mỗi truy vấn là một search mới, không có conversation context.

Đánh giá retrieval chính: 5 đạt, 8 đạt một phần, 1 chưa đạt, 1 chưa đủ bằng chứng. “Đạt” nghĩa là tìm đúng model hoặc nhóm sản phẩm ở đầu danh sách theo mục đích case, không có nghĩa tất cả 10 kết quả đều liên quan. Các điều kiện bắt buộc cần được xác nhận đồng thời; sản phẩm chỉ khớp một điều kiện không được tính là đáp ứng đầy đủ.

## Kết quả từng case

| # | Query | Đánh giá | Kết quả thực tế |
|---|---|---|---|
| 1 | `CS655` | Đạt exact Top-1 | CS655 đứng đầu; 9 kết quả tiếp theo có nhiều model không liên quan. |
| 2 | `soil moisture sensor` | Đạt retrieval | Top-5: SoilVue10-5, HS2-12, CS650, CS655, CS616. Phần cuối vẫn có sản phẩm khác nhóm. |
| 3 | `cảm biến đo độ ẩm đất` | Đạt retrieval đa ngôn ngữ | Top-5: HS2-12, SoilVue10-5, CS616, CS650, CS655. |
| 4 | `soil sensor with SDI-12` | Một phần | SoilVue10-5, CS655 đúng ở vị trí 1–2; ClimaVue50G2 đứng thứ 3, SnowVue10 thứ 5, không đúng nhóm soil sensor. |
| 5 | `cảm biến độ ẩm đất hỗ trợ SDI-12 và đo nhiệt độ đất` | Một phần | CS650, CS655 đúng ở đầu; TempVue50 thứ 3 chỉ có bằng chứng nhiệt độ; TCAV và 105E chưa xác nhận SDI-12. Chưa bảo đảm cả độ ẩm + nhiệt độ + protocol. |
| 6 | `thiết bị dùng để quan trắc độ ẩm đất ngoài đồng` | Một phần | LWS (leaf wetness) và TCAV (soil temperature) đứng trước HS2-12, SoilVue10-5, CS616. Sai ưu tiên đại lượng đo. |
| 7 | `sensor suitable for harsh outdoor environments` | Chưa đủ bằng chứng | Trả ClimaVue40, CS120A-ST, SnowVue10… nhưng lời giải thích chỉ xác nhận loại thiết bị; không đưa bằng chứng chịu môi trường khắc nghiệt. |
| 8 | `thiết bị hoạt động ở nhiệt độ -50°C` | Chưa đạt điều kiện bắt buộc | 109, TEMP120-XD, CS241DM, CS230 có giải thích đáp ứng; 6 kết quả sau tự ghi chưa đủ dữ liệu xác nhận −50°C. Không thể coi cả danh sách đáp ứng nhiệt độ hoạt động. Mất 19,2 giây trong lượt lưu dữ liệu. |
| 9 | `thiết bị truyền dữ liệu qua cellular` | Một phần, có lỗi tạm thời | Lượt lưu dữ liệu trả HTTP 503, UI báo Search unavailable. Chạy lại HTTP 200/hybrid, CELL205-AT và CELL210-V đứng đầu; vẫn lẫn NL241 (Wi-Fi) và model chưa xác nhận cellular. |
| 10 | `datalogger có Wi-Fi` | Một phần | CR310-WIFI đứng thứ 3, sau CR310-NA và CR6-NA-ST-CC. CR310-NA không có Wi-Fi trong supported_protocols; tài liệu chứa thông tin nhiều biến thể. Còn lẫn sensor và thiết bị Wi-Fi rời. |
| 11 | `cảm biến đo nhiệt độ độ ẩm và áp suất không khí` | Một phần | HygroVue10 đứng đầu nhưng dữ liệu chỉ có temperature + relative_humidity; chưa xác nhận áp suất. TCAV thứ 4 là cảm biến nhiệt độ đất. Không bảo đảm đủ ba đại lượng. |
| 12 | `cảm biến đo độ đục của nước` | Đạt retrieval Top-1 | ClariVue10 đứng đầu, giải thích có độ đục; nhiều kết quả sau không đo độ đục. |
| 13 | `thiết bị đọc cảm biến vibrating wire` | Đạt retrieval | Top-4: VWANALYZER, VWIRE305-XD, AVW200-ST, CRVW3-NE. Các kết quả sau bắt đầu lệch nhóm. |
| 14 | `nguồn cấp cho hệ thống Campbell ngoài hiện trường` | Một phần | SunScout và CPEC306-DW đứng trước PS84-CR ở vị trí 3; PS150 thứ 8, PS24-w/CH150 thứ 10. Nguồn cấp chưa được ưu tiên đúng. |
| 15 | `tôi cần cảm biến để theo dõi độ ẩm đất và nhiệt độ đất, ưu tiên giao tiếp SDI-12` | Một phần | CS650, CS655 đúng ở đầu; TempVue50, TCAV, 105E không xác nhận đo cả độ ẩm và nhiệt độ đất. |

## Giao diện và vận hành

- Lượt được lưu đầy đủ: 14/15 HTTP 200, đều báo `hybrid`; 1/15 HTTP 503. Cellular chạy lại thành công.
- Danh sách model và thứ tự trên giao diện khớp phản hồi API ở cả 15 case, kể cả trạng thái không có card khi 503.
- Không ghi nhận sự kiện JavaScript `pageerror` trong lượt lưu dữ liệu.
- Các lượt HTTP 200 mất khoảng 1,4–19,2 giây từ thao tác submit đến khi đọc được kết quả UI. Đây là số đo đơn lẻ, không phải benchmark tải.
- Đã chạy một lượt ban đầu để quan sát, sau đó chạy lại đủ 15 case để lưu phản hồi có cấu trúc và ảnh không bị animation che. Bảng và thời gian lấy từ lượt lưu có cấu trúc.
- Kết quả tiếng Việt đúng không tự chứng minh riêng multilingual embedding hoạt động: API báo hybrid, dữ liệu search document cũng chứa từ khóa tiếng Việt. Cần kiểm thử riêng nhánh semantic để khẳng định chất lượng embedding độc lập.

## Điểm cần sửa

1. Ràng buộc nhiều đại lượng phải được xét đồng thời: độ ẩm đất + nhiệt độ đất; nhiệt độ + độ ẩm + áp suất không khí.
2. Điều kiện kỹ thuật bắt buộc cần loại hoặc tách rõ sản phẩm chưa xác nhận. `search.service.ts` chỉ bật `confirmedOnly` trong nhánh áp dụng context; search mới chủ yếu dùng xếp hạng kỹ thuật.
3. Phân biệt khả năng của model cụ thể với tùy chọn của dòng sản phẩm. `CSI_CR310_NA.json` chứa mô tả biến thể WIFI trong search text nhưng không có Wi-Fi ở supported_protocols; đây là nguồn nhiễu cần kiểm tra thêm.
4. Cải thiện xếp hạng theo đại lượng/loại thiết bị cho truy vấn ứng dụng và nguồn cấp, tránh LWS/TCAV hoặc hệ thống hoàn chỉnh đứng trên sản phẩm cần tìm.
5. Tra log backend tại thời điểm 503 để xác định nguyên nhân. Lượt kiểm thử này chưa xác định được lỗi từ dịch vụ nào.

## Bằng chứng

- `search-results.json`: đủ query, request, status, thời gian, response, nội dung card và UI cho 15 case.
- `search-case-01.png` đến `search-case-15.png`: ảnh toàn trang.
- `cellular-retry.json` và `cellular-retry.png`: lần chạy lại cellular.
- `search-15-cases.js` và `retry-cellular.js`: thao tác Playwright có thể chạy lại.
- Đối chiếu dữ liệu tại `data/search-documents/`, đặc biệt CS655, TempVue50, HygroVue10, CR310-NA, CR310-WIFI và các model nhiệt độ.

Phạm vi: kiểm thử và báo cáo; không sửa mã nguồn ứng dụng. Tính phù hợp đánh giá theo dữ liệu trong workspace và bằng chứng API, chưa kiểm chứng độc lập catalogue nhà sản xuất. Không khẳng định tính đầy đủ recall trên toàn bộ danh mục.
