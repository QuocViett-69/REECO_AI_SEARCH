# Kết quả kiểm tra Explanation VI–EN

Thời điểm: 2026-10-02T03:23:13.953Z. API: http://localhost:3000/api/v1/search.

Đã gửi nguyên văn 70 case × 2 ngôn ngữ, limit=5, explain=true, không context, hai request đồng thời. Không sửa logic sản phẩm trong lượt kiểm tra. Đây là một snapshot API, không phải kiểm tra UI hay benchmark độ trễ dưới tải chuẩn.

## Kết quả

```json
{
  "queries": 140,
  "http200": 138,
  "errors": 2,
  "empty": 13,
  "contractValid": 138,
  "nonempty": 125,
  "explanationPresent": 125,
  "evidencePresent": 125,
  "languageCorrect": 125,
  "ruleExplanations": 570,
  "llmExplanations": 0,
  "catalogProductsChecked": 68,
  "evidenceEntries": 873,
  "groundingIssues": 0,
  "pass": 14,
  "fail": 104,
  "blockedContext": 20
}
```

129/129 kiểm thử hồi quy hiện có đạt, nhưng không thay thế 140 truy vấn nghiệp vụ này. HTTP 200, có evidence và đúng nhãn ngôn ngữ chỉ là kiểm tra cấu trúc.

## Cách chấm

PASS/FAIL là đánh giá nội dung thủ công của snapshot: thiết bị ưu tiên đúng nhu cầu, giải thích nối chức năng đã xác nhận với yêu cầu, không khẳng định đáp ứng phần chưa được chứng minh, đủ thành phần khi câu hỏi yêu cầu hệ thống. Evidence measurement/capability/taxonomy có thể đủ cho câu hỏi chức năng cơ bản; câu hỏi bộ nhớ, số kênh, ngoài trời, thời gian vận hành cần thông số tương ứng, taxonomy đơn thuần không đủ. PASS không có nghĩa mọi sản phẩm phụ là lựa chọn tối ưu, hoặc giải pháp đã đủ để lắp đặt.

BLOCKED_CONTEXT: đã thực thi cả 20 query EXPLAIN, nhưng file không cung cấp sản phẩm hoặc ngữ cảnh để đánh giá tính phù hợp. Các case này cần fixture riêng; chưa tính PASS/FAIL nghiệp vụ. Câu hỏi có thể được đánh giá riêng về khả năng yêu cầu làm rõ.

Không dùng kiểm tra evidence có mặt để khẳng định tuyệt đối “không hallucination”. Response gốc giữ toàn bộ text/evidence để đối chiếu. Trong nội dung đã đọc, vấn đề nổi bật là thiếu thông số và giải thích chưa đủ; chưa thấy thông số số học mới được bịa ra.

## Từng case

| Case | VI | EN | Sản phẩm VI | Sản phẩm EN | Nhận xét |
|---|---|---|---|---|---|
| TC-COMM-001 | FAIL | FAIL | MeteoPV, ClimaVue40, CR6-NA-ST-CC, SnowVue10, CS120A-ST | ClimaVue40, MeteoPV, CR6-NA-ST-CC, CS120A-ST, CR310-NA | Không xác định nhu cầu xem từ xa thành truyền thông; top thiết bị thời tiết/trạm mặt trời. |
| TC-COMM-002 | FAIL | FAIL | CELL210-V, CELL205-AT, CELL215-IT1A, CELL220-IT1A, CELL225-IT1A | CELL205-AT, CELL210-V, CELL215-IT1A, CELL225-IT1A, CELL220-IT1A | Có cellular modem nhưng chỉ xác nhận nhóm chức năng; không giải thích sóng di động, SIM/mạng và tương thích. |
| TC-COMM-003 | FAIL | FAIL | CR6-NA-ST-CC, NL241, CR310-NA, ClimaVue40, NL201-ST | CR6-NA-ST-CC, CR310-NA, ClimaVue40, CR350-NA, MeteoPV | Không làm rõ kênh truyền thay thế; có Wi-Fi/Ethernet mà chưa xác nhận hạ tầng ở nơi không Internet. |
| TC-COMM-004 | FAIL | ERROR | SunScout, MeteoPV, ClimaVue40, MetSENS500-DS, CR6-NA-ST-CC | ∅ | VI trả trạm mặt trời, chưa mô tả chu kỳ gửi mỗi giờ/bộ ghi/kênh truyền; EN HTTP 400 vì “without visiting” bị xem là phủ định không hỗ trợ. |
| TC-COMM-005 | FAIL | FAIL | SunScout, MeteoPV, ClimaVue40, TB4, CR6-NA-ST-CC | ClimaVue40, SunScout, MeteoPV, ClimaVue50G2, CR310-NA | Chưa mô tả nhiều trạm, thu tập trung và cấu hình truyền/định danh từng trạm. |
| TC-COMM-006 | FAIL | FAIL | MetSENS200-D2, CR310-NA, CR350-NA, ClimaVue40, MetSENS500-DS | CELL205-AT, CELL210-V, CELL215-IT1A, CELL225-IT1A, CELL220-IT1A | Chưa phân biệt mất mạng với mất dữ liệu lưu cục bộ; thiếu chứng cứ lưu và gửi lại. |
| TC-COMM-007 | FAIL | FAIL | NL241, CR310-WIFI | ∅ | Không so sánh các lựa chọn Ethernet/Wi-Fi/cellular theo hạ tầng; xem lựa chọn thay thế như ràng buộc đồng thời. |
| TC-COMM-008 | FAIL | FAIL | NL241, RF500M, RV50X, COM220-AU, TX326 | NL241, RF500M, RV50X, TX326, TX325 | Thiếu chứng cứ vùng phủ, đường truyền và cấu hình thiết bị ở vùng núi. |
| TC-COMM-009 | FAIL | FAIL | CR310-NA, CR1000Xe-XT-CC, CR6-NA-ST-CC, CRVW3-NE, Aspen10-CELL-ST | ∅ | Chưa giải thích đầy đủ khác biệt lưu tại trạm và truyền để truy cập từ xa. |
| TC-COMM-010 | FAIL | FAIL | CR350-NA, CR310-NA, CR6-NA-ST-CC, NL241, CRVW3-NE | NL241, CELL205-AT, CELL215-IT1A, RV50X, CELL210-V | Không đối chiếu dòng tiêu thụ/chế độ tiết kiệm điện hay phương án truyền. |
| TC-DATALOGGER-001 | PASS | FAIL | Aspen10-CELL-ST, CR1000Xe-XT-CC, CR6-NA-ST-CC, CR310-NA, CR350-NA | ClimaVue40, MetSENS500-DS, CR6-NA-ST-CC, ClimaVue50G2, CR310-NA | VI xác định bộ ghi và phân biệt với cảm biến; EN top thiết bị thời tiết, chỉ taxonomy. |
| TC-DATALOGGER-002 | FAIL | FAIL | Aspen10-CELL-ST, CR1000Xe-XT-CC, ClimaVue40, CR310-NA, NL241 | Aspen10-CELL-ST, ClimaVue40, CR310-NA, CR6-NA-ST-CC, CR350-NA | Chưa chứng minh lưu cục bộ khi mất Internet; lẫn cảm biến và thiết bị Wi-Fi. |
| TC-DATALOGGER-003 | FAIL | FAIL | ∅ | ∅ | Cả VI và EN rỗng; nhu cầu kết nối cảm biến bị xử lý như bộ ghi phải tự đo các đại lượng. |
| TC-DATALOGGER-004 | FAIL | FAIL | CR310-NA, Aspen10-CELL-ST, CR6-NA-ST-CC, CR310-WIFI, CR1000Xe-XT-CC | CR310-NA, CR6-NA-ST-CC, CR310-WIFI, CR1000Xe-XT-CC, Aspen10-CELL-ST | Không đối chiếu nguồn, điều kiện môi trường và khả năng vận hành 24/7. |
| TC-DATALOGGER-005 | FAIL | FAIL | CR310-NA, CR1000Xe-XT-CC, CRVW3-NE, Aspen10-CELL-ST, CR6-NA-ST-CC | CR310-NA, CR1000Xe-XT-CC, Aspen10-CELL-ST, CR6-NA-ST-CC, CR350-NA | Không có dung lượng, tần suất/bản ghi hoặc cách tính bộ nhớ cho vài tháng. |
| TC-DATALOGGER-006 | FAIL | FAIL | CR310-NA, CR1000Xe-XT-CC, CR310-WIFI, Aspen10-CELL-ST, CR6-NA-ST-CC | CR310-NA, CR1000Xe-XT-CC, Aspen10-CELL-ST, CR6-NA-ST-CC, CR350-NA | Không có số kênh, loại tín hiệu hay căn cứ nối được 10 cảm biến. |
| TC-DATALOGGER-007 | PASS | PASS | CR310-WIFI, CR310-NA, Aspen10-CELL-ST, CR1000Xe-XT-CC, CR6-NA-ST-CC | CR310-NA, CR310-WIFI, CR6-NA-ST-CC, CR1000Xe-XT-CC, CR350-NA | Giải thích bộ ghi ghi nhận dữ liệu và không thay thế cảm biến đo; có evidence phân loại thiết bị. |
| TC-DATALOGGER-008 | FAIL | FAIL | CR310-WIFI, CR310-NA, CR1000Xe-XT-CC, Aspen10-CELL-ST, CR6-NA-ST-CC | CR310-WIFI, CR310-NA, CR1000Xe-XT-CC, CR6-NA-ST-CC, Aspen10-CELL-ST | Không xác nhận xử lý trung bình 10 phút và lưu cực đại bằng chứng cứ tính năng. |
| TC-DATALOGGER-009 | FAIL | FAIL | CR310-NA, CR310-WIFI, CR6-NA-ST-CC, CR350-NA, CR1000Xe-XT-CC | CR310-NA, CR310-WIFI, CR6-NA-ST-CC, CR350-NA, Aspen10-CELL-ST | Không đối chiếu đầu vào analog/digital hoặc giao thức hỗ trợ. |
| TC-DATALOGGER-010 | FAIL | FAIL | CR310-NA, Aspen10-CELL-ST, CR6-NA-ST-CC, CR350-NA, CR1000Xe-XT-CC | CR310-NA, CR6-NA-ST-CC, CR350-NA, CR1000Xe-XT-CC, Aspen10-CELL-ST | Không so sánh số kênh/tài nguyên cần thiết cho 2 cảm biến với bộ ghi công suất lớn. |
| TC-EXPLAIN-001 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | ClimaVue40, LWS, BaroVue10, VWIRE305-XD, ClimaVue50G2 | ClimaVue40, CS120A-ST, BaroVue10, BLACKGLOBE, ClimaVue50G2 | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-002 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | ClimaVue40, ClimaVue50G2, MetSENS500-DS, CR6-NA-ST-CC, MetSENS550-D2 | ClimaVue40, CR310-NA, CR350-NA, CR6-NA-ST-CC, ClimaVue50G2 | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-003 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | BaroVue10, ClimaVue40, VWIRE305-XD, ClimaVue50G2, LWS | BaroVue10, ClimaVue50G2, BLACKGLOBE, ClimaVue40, CS120A-ST | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-004 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | ClimaVue40, BaroVue10, VWIRE305-XD, ClimaVue50G2, BLACKGLOBE | ClimaVue40, ClimaVue50G2, BaroVue10, CS120A-ST, CR310-NA | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-005 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | ClimaVue40, LWS, BLACKGLOBE, VWIRE305-XD, BaroVue10 | ClimaVue40, CS120A-ST, BaroVue10, VWIRE305-XD, BLACKGLOBE | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-006 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | LWS, SnowVue10, CS125-ST, ClimaVue40, CS120A-ST | ClimaVue40, ClimaVue50G2, LWS, CS120A-ST, SnowVue10 | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-007 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | VWANALYZER, AVW200-ST, VWIRE305-XD, RF500M, LWS | ClimaVue40, CS120A-ST, ClimaVue50G2, LWS, BaroVue10 | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-008 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | BLACKGLOBE, LWS, ClimaVue40, ClariVue10, 43347 | CS120A-ST, ClimaVue40, CR6-NA-ST-CC, CR310-NA, BLACKGLOBE | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-009 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | ClimaVue40, COM220-AU, RF500M, BaroVue10, VWIRE305-XD | CR310-NA, CR6-NA-ST-CC, CR350-NA, CS120A-ST, VWIRE305-XD | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-EXPLAIN-010 | BLOCKED_CONTEXT | BLOCKED_CONTEXT | RF500M, CS120A-ST, CR6-NA-ST-CC, CR310-NA, COM220-AU | CR310-NA, CR6-NA-ST-CC, BaroVue10, BLACKGLOBE, CS120A-ST | Đã chạy nguyên văn nhưng thiếu model/sản phẩm, nhu cầu ban đầu và (nếu so sánh) sản phẩm đối chiếu. Không tự gán ngữ cảnh để chấm đạt; response cần yêu cầu làm rõ thay vì kết luận phù hợp. |
| TC-SOIL-001 | FAIL | FAIL | LWS, HS2-12, TCAV, CS616, CS655 | LWS, HS2-12, TCAV, CS616, SoilVue10-5 | VI có cảm biến ẩm đất nhưng top 1 là LWS; EN phần lớn chỉ taxonomy, không nối water stress với nhu cầu đo ẩm đất. |
| TC-SOIL-002 | FAIL | FAIL | LWS, HS2-12, SoilVue10-5, TCAV, CS616 | LWS, HS2-12, TCAV, SoilVue10-5, CS616 | Lẫn LWS/nhiệt độ đất; chưa mô tả ngưỡng đất khô, bộ điều khiển và phần đóng/ngắt tưới. |
| TC-SOIL-003 | FAIL | FAIL | CS616, SoilVue10-5, HS2-12, CS655, CS650 | SoilVue10-5, CS616, HS2-12, CS650, CS655 | Có cảm biến ẩm đất nhưng lẫn máy đo cầm tay HS2-12; chưa xử lý rõ yêu cầu theo dõi liên tục. |
| TC-SOIL-004 | FAIL | FAIL | LWS, HS2-12, SoilVue10-5, TCAV, CS616 | LWS, HS2-12, TCAV, SoilVue10-5, CS616 | Top 1 LWS không đo độ ẩm đất; các giải thích chưa ánh xạ tình trạng quá ướt sau tưới. |
| TC-SOIL-005 | FAIL | PASS | TCAV, CS650, CS655, 105E, SoilVue10-5 | SoilVue10-5, CS650, CS655 | VI bỏ điều kiện độ ẩm và đưa TCAV/105E chỉ đo nhiệt độ; EN xác nhận đồng thời soil moisture và soil temperature. |
| TC-SOIL-006 | FAIL | FAIL | HS2-12, LWS, TCAV, SoilVue10-5, CS616 | SoilVue10-5, HS2-12, CS616, CS655, CS650 | Chưa giải thích bố trí nhiều điểm, so sánh dữ liệu đồng bộ và bộ ghi; còn lẫn LWS/nhiệt độ đất. |
| TC-SOIL-007 | FAIL | FAIL | LWS, HS2-12, CS616, TCAV, SoilVue10-5 | HS2-12, LWS, CS616, TCAV, SoilVue10-5 | Có đo nước thể tích nhưng lẫn thiết bị không đo ẩm đất; chưa giải thích cách hỗ trợ giảm tưới mà tránh stress. |
| TC-SOIL-008 | FAIL | FAIL | 105E, TCAV, CS610, SoilVue10-5, TempVue50 | 105E, TCAV, SnowVue10, TempVue50, SoilVue10-5 | Thiếu chứng cứ chôn đất, độ bền ngoài trời và thời gian nhiều tháng. |
| TC-SOIL-009 | FAIL | FAIL | ∅ | ClimaVue40, 52202, ClimaVue50G2, RainVue10-MM, MetSENS500-DS | VI rỗng; EN trả thiết bị thời tiết, không trả lời so sánh với đo ẩm đất. |
| TC-SOIL-010 | FAIL | FAIL | HS2-12, TCAV, 52202, LWS, TB4 | 52202, TB4, ClimaVue40, RainVue10-MM, TE525 | VI lẫn nhiều chức năng; EN chỉ lượng mưa. Chưa nối thấm nước với đo ẩm đất theo độ sâu/thời gian. |
| TC-SYSTEM-001 | FAIL | FAIL | ClariVue10, CS511 | LevelVueB10-15, LWS, RangeVue30, ClariVue10, CS456 | Chưa đưa đủ cảm biến nước → bộ ghi → truyền thông để xem từ nhà. |
| TC-SYSTEM-002 | FAIL | FAIL | ∅ | ∅ | Chưa phân rã ẩm đất, mưa, nhiệt độ thành hệ nhiều thiết bị; lọc điều kiện đồng thời gây thiếu/rỗng. |
| TC-SYSTEM-003 | FAIL | FAIL | ClimaVue40, MetSENS500-DS, ClimaVue50G2, MetSENS550-D2, MetSENS200-D2 | ClimaVue40, MetSENS500-DS, ClimaVue50G2, MetSENS550-D2, MetSENS200-D2 | Chưa đưa đủ cảm biến thời tiết, bộ ghi, nguồn ngoài lưới và truyền Internet. |
| TC-SYSTEM-004 | FAIL | FAIL | HS2-12, SoilVue10-5, CS616, CS655, CS650 | ∅ | Chưa đề xuất phối hợp đo mưa và ẩm đất cùng mốc thời gian. |
| TC-SYSTEM-005 | FAIL | FAIL | TB4, TE525, 52202, RainVue10-MM, ClariVue10 | ∅ | Chưa đề xuất phối hợp mưa, độ đục và bộ ghi để phân tích tương quan. |
| TC-SYSTEM-006 | FAIL | FAIL | RF500M, CR6-NA-ST-CC, SnowVue10, AVW200-ST, Aspen10-CELL-ST | MeteoPV, CPEC306-DW, CR6-NA-ST-CC, SnowVue10, RF500M | Không có đánh giá ngân sách năng lượng, lưu dữ liệu, nguồn và bảo trì sáu tháng. |
| TC-SYSTEM-007 | FAIL | FAIL | NL241, NL201-ST | MetSENS500-DS, ClimaVue40, MetSENS200-D2, MetSENS300-D2, MetSENS550-D2 | Chưa phân biệt và đề xuất cả ghi/lưu dữ liệu lẫn truyền về server. |
| TC-SYSTEM-008 | FAIL | FAIL | CRVW3-NE, Aspen10-CELL-ST, CR1000Xe-XT-CC, CR310-NA, CR310-WIFI | ∅ | Chưa đưa đủ cảm biến ẩm đất, bộ ghi, truyền thông và cơ chế cảnh báo. |
| TC-SYSTEM-009 | FAIL | FAIL | ClariVue10, CRS451-WN, RangeVue30, CS456, LevelVueB10-15 | ClariVue10 | Chưa mô tả chuỗi đo độ đục, kiểm tra ngưỡng, ghi và gửi cảnh báo. |
| TC-SYSTEM-010 | FAIL | FAIL | ClimaVue40, LWS, MeteoPV, ClimaVue50G2, MetSENS500-DS | ClimaVue40, LWS, ClimaVue50G2, MeteoPV, MetSENS500-DS | Chưa phân rã theo nhóm đại lượng môi trường, bộ ghi và truy cập từ xa. |
| TC-WATER-001 | PASS | PASS | ClariVue10, CS511 | ClariVue10, CS511 | ClariVue10 liên kết độ đục với theo dõi nước; CS511 được mô tả là chỉ số bổ sung, không phải thiết bị làm sạch. |
| TC-WATER-002 | FAIL | FAIL | ClariVue10, CRS451-WN, CS456, RangeVue30, CS511 | ClariVue10, CS456, CRS451-WN, LWS, RangeVue30 | Có ClariVue10 nhưng lẫn cảm biến mực nước/lá ướt; chưa phân biệt nhu cầu theo dõi độ đục theo thời gian. |
| TC-WATER-003 | FAIL | FAIL | ClariVue10 | ClariVue10 | Đúng độ đục nhưng chưa đối chiếu thông số ngoài trời và yêu cầu đo liên tục. |
| TC-WATER-004 | PASS | PASS | ClariVue10, CS511 | ClariVue10, CS511 | Có cảm biến độ đục/oxy, giải thích vai trò và giới hạn; không khẳng định tự cảnh báo hay tự xử lý. |
| TC-WATER-005 | FAIL | FAIL | ClariVue10, TB4, RainVue10-MM, 52202, RangeVue30 | TB4, ClimaVue40, 52202, RainVue10-MM, TE525 | VI lẫn cảm biến mưa và mực nước; EN chỉ trả cảm biến mưa, bỏ độ đục cần đo. |
| TC-WATER-006 | FAIL | FAIL | ClariVue10, CS511 | ClariVue10, CS511 | Đúng nhóm nước nhưng thiếu căn cứ triển khai vùng xa, bảo trì và vận hành lâu dài. |
| TC-WATER-007 | FAIL | FAIL | ClariVue10 | ∅ | VI chỉ có độ đục; EN rỗng. Thiếu phối hợp cảm biến mưa và độ đục. |
| TC-WATER-008 | FAIL | FAIL | CRS451-WN, RangeVue30, CS456, HS2-12, LevelVueB10-15 | CRS451-WN, RangeVue30, CS456, HS2-12, LevelVueB10-15 | Chỉ mô tả taxonomy, không đối chiếu thời gian hoạt động và yêu cầu bảo trì. |
| TC-WATER-009 | FAIL | FAIL | ClariVue10 | ClariVue10 | VI giải thích độ đục nhưng không so sánh với mực nước; EN chỉ xác nhận độ đục. |
| TC-WATER-010 | FAIL | FAIL | ∅ | ∅ | Cả VI và EN rỗng; chưa phân biệt nhiệt độ của đầu đo độ đục với nhiệt độ nước được xác nhận. |
| TC-WEATHER-001 | PASS | PASS | ClimaVue40, ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, MetSENS200-D2 | ClimaVue40, ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, WindSonic1 | Liệt kê cảm biến thời tiết đa đại lượng, có measurement evidence và nêu chưa xác nhận cấu hình lắp đặt. |
| TC-WEATHER-002 | PASS | PASS | TB4, 52202, TE525, ClimaVue40, RainVue10-MM | TB4, 52202, ClimaVue40, TE525, ClimaVue50G2 | Ưu tiên TB4/52202 đo lượng mưa thực tế, có căn cứ measurement/taxonomy; không khẳng định đo dự báo. |
| TC-WEATHER-003 | FAIL | FAIL | WindSonic1, MetSENS200-D2, ClimaVue40, MetSENS500-DS, CSAT3B-NC | WindSonic1, ClimaVue40, MetSENS500-DS, MetSENS200-D2, ClimaVue50G2 | Có sản phẩm gió nhưng chưa xác nhận đồng thời tốc độ và hướng gió; top WindSonic1 chỉ giải thích taxonomy. |
| TC-WEATHER-004 | PASS | PASS | ClimaVue40, ClimaVue50G2, HMP60, HygroVue10, EE181 | ClimaVue40, ClimaVue50G2, HygroVue10, HMP60, EE181 | Xác nhận cả nhiệt độ và độ ẩm không khí, có evidence và giới hạn cấu hình. |
| TC-WEATHER-005 | FAIL | FAIL | LWS, CS301, ClimaVue50G2, ClimaVue40, CS140 | CS301, CS310, MS-80SH, SN500SS, NR01 | VI top LWS sai vai trò; EN có bức xạ nhưng chưa giải thích tích lũy theo ngày và liên quan ánh sáng cây nhận. |
| TC-WEATHER-006 | FAIL | FAIL | WindSonic1, CSAT3B-NC, ClimaVue40, ClimaVue50G2, MetSENS200-D2 | WindSonic1, ClimaVue40, ClimaVue50G2, CSAT3B-NC, MetSENS500-DS | Chỉ taxonomy, chưa giải thích lưu cực đại gió hoặc tốc độ lấy mẫu/bộ ghi. |
| TC-WEATHER-007 | FAIL | ERROR | TB4, 52202, TE525, ClimaVue40, RainVue10-MM | ∅ | VI chỉ cảm biến mưa, thiếu bộ ghi/nguồn/bảo trì; EN HTTP 400 vì “without personnel” bị xem là phủ định không hỗ trợ. |
| TC-WEATHER-008 | FAIL | FAIL | ClimaVue40, ClimaVue50G2, 52202, MetSENS550-D2, TB4 | ClimaVue40, ClimaVue50G2, MetSENS550-D2 | Chưa nối đủ nhiệt độ, độ ẩm và mưa với nghiên cứu tương quan; VI trả cả cảm biến chỉ đo mưa. |
| TC-WEATHER-009 | FAIL | FAIL | HS2-12, CS616, CS650, SoilVue10-5, CS655 | TB4, 52202, TE525, RainVue10-MM, ClimaVue50G2 | Không giải thích vai trò bổ sung mưa và ẩm đất; thiếu một nhóm hoặc trả rỗng. |
| TC-WEATHER-010 | FAIL | FAIL | TB4, 52202, TE525, ClimaVue40, RainVue10-MM | TB4, 52202, ClimaVue40, TE525, ClimaVue50G2 | Đúng cảm biến mưa nhưng chưa trả lời có cần mua cả trạm hoàn chỉnh hay không. |

## Ưu tiên xử lý

1. Hiểu triệu chứng và mục tiêu song ngữ: đục/turbid/cloudy, đất khô/water stress, ghi tự động, truy cập từ xa. Phân biệt đại lượng cần đo với bối cảnh (mưa sau đó nước đục không đồng nghĩa đang tìm cảm biến mưa).
2. Phân biệt yêu cầu một thiết bị đo nhiều đại lượng với hệ nhiều thiết bị; bộ ghi kết nối các cảm biến không phải tự đo những đại lượng đó.
3. Ánh xạ mỗi yêu cầu vào chứng cứ cụ thể: liên tục, ngoài trời, bảo trì, bộ nhớ, số kênh, xử lý trung bình/cực đại, tiêu thụ điện. Thiếu chứng cứ thì gọi tên yêu cầu chưa xác nhận.
4. Xử lý câu hỏi so sánh/lựa chọn thay thế và các câu hỏi cần lịch sử hoặc model cụ thể.

## Tái chạy

```powershell
node scripts/search/run-vi-en-explanation-cases.mjs
```

responses.json là dữ liệu thực thu thập từ API. evaluations.json chứa kết quả kiểm tra cấu trúc và nhận xét thủ công cho snapshot này. Script report chứa đánh giá snapshot cố định: khi chạy API lại cần review nội dung mới trước khi tái sinh báo cáo; không dùng danh sách PASS cố định làm oracle regression.

## Đối chiếu dữ liệu và giới hạn LLM

Đã đọc chi tiết 68 sản phẩm qua API products và lưu [catalog-evidence.json](catalog-evidence.json). Đối chiếu 873 evidence với taxonomy, giao thức và đại lượng đo thực tế; 0 evidence không khớp theo phép kiểm tra này. Các alias được chấp nhận có giới hạn: soil moisture → volumetric_water_content, rainfall → precipitation và tên đại lượng song ngữ đã được matcher sử dụng. Đây là kiểm tra fact/evidence, không chứng minh mọi câu suy luận hoặc mức phù hợp với mục tiêu cuối cùng.

Không response nào có evidence nguồn normalized_spec. Vì vậy các câu hỏi cần số kênh, bộ nhớ, điện năng hoặc độ bền không được giải quyết chỉ bằng việc evidence có mặt.

570 explanation đều source=rule, 0 source=llm. Cấu hình .env ghi LLM_EXPLANATION_ENABLED=true, nhưng điều này chưa xác nhận cấu hình của tiến trình API đang chạy hoặc việc gọi model thành công. Khi kiểm tra sau lượt chạy, ollama ps chỉ có model embedding. Không đủ bằng chứng kết luận nguyên nhân chính xác; kết quả này kiểm tra pipeline search/explanation hiện hoạt động, chưa xác nhận chất lượng diễn đạt bởi LLM.

Hai lỗi 400 tái hiện trong TC-WEATHER-007 EN (“without personnel”) và TC-COMM-004 EN (“without visiting”): parser từ chối phủ định về bối cảnh sử dụng, thay vì chỉ phủ định thông số sản phẩm. Đây không phải lỗi kết nối API.

Dữ liệu đầy đủ: [responses.json](responses.json), [evaluations.json](evaluations.json).
