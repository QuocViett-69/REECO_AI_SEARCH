# Kiểm tra cải tiến AI Search explanation

2026-10-02T04:40:46.241Z

Đã chạy nguyên văn 70 case × VI/EN, thêm 20 lượt EXPLAIN với nhu cầu độ ẩm/nhiệt độ đất, SDI-12 và phạm vi CS655/CS650. Các lượt thiếu lịch sử hỏi lại model và nhu cầu thay vì tự suy đoán.

130 kiểm thử backend, 34 kiểm thử client đạt; lint các file backend thay đổi và build thành công. Giao diện desktop/mobile và nút giải thích model ngoài nhóm đầu được kiểm tra bằng Playwright.

```json
{
  "rawQueries": 140,
  "contextualQueries": 20,
  "httpErrors": 0,
  "contractErrors": 0,
  "wrongLanguage": 0,
  "missingExplanation": 0,
  "missingEvidence": 0,
  "contextScopeErrors": 0,
  "emptyWithoutGuidance": 0,
  "explanations": 555,
  "llm": 326,
  "normalizedSpecEvidence": 154,
  "generationStatuses": {
    "accepted": 326,
    "invalid_response": 40,
    "not_applicable": 189
  },
  "groundingIssues": 0
}
```

Đây là kiểm tra HTTP, hợp đồng dữ liệu, ngôn ngữ, phạm vi hội thoại và sự hiện diện bằng chứng; không phải chứng nhận mọi suy luận đều đúng hay 160 lượt đạt chất lượng ngữ nghĩa tuyệt đối. Dữ liệu catalog thực tế được lưu trong catalog-evidence.json để đối chiếu.

LLM chọn cách diễn đạt từ các phương án đã có bằng chứng. Trạng thái accepted xác nhận được dùng; timeout/unavailable/invalid_response giữ lời giải thích theo dữ liệu. Câu hỏi nhiệt độ chưa rõ môi trường đo cần làm rõ; WATER-010 không có sản phẩm được xác nhận đồng thời toàn bộ yêu cầu. Số kênh, thời gian lưu, tuổi thọ nguồn, ngưỡng cảnh báo, khả năng tương thích và lắp đặt vẫn cần cấu hình thực tế; không tự kết luận từ taxonomy.

| Case | Ngôn ngữ | Context | HTTP | Model / cần làm rõ |
|---|---|---|---|---|
| TC-COMM-001 | vi | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-001 | en | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-002 | vi | Không | 200 | CELL205-AT, CELL220-IT1A, RV50X, CELL210-V, CELL215-IT1A |
| TC-COMM-002 | en | Không | 200 | CELL220-IT1A, CELL205-AT, RV50X, CELL210-V, CELL215-IT1A |
| TC-COMM-003 | vi | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-003 | en | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-004 | vi | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-004 | en | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-005 | vi | Không | 200 | CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-COMM-005 | en | Không | 200 | CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-COMM-006 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-COMM-006 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-COMM-007 | vi | Không | 200 | NL201-ST, NL241, CELL205-AT, RV50X, CELL220-IT1A |
| TC-COMM-007 | en | Không | 200 | NL201-ST, NL241, CELL220-IT1A, RV50X, CELL205-AT |
| TC-COMM-008 | vi | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-008 | en | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-COMM-009 | vi | Không | 200 | CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-COMM-009 | en | Không | 200 | CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-COMM-010 | vi | Không | 200 | CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-COMM-010 | en | Không | 200 | COM320-AU, COM220-AU, RF500M, NL241, NL201-ST |
| TC-DATALOGGER-001 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-001 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-002 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-002 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-003 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-003 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-004 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-004 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-005 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-005 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-006 | vi | Không | 200 | CR310-NA, CR1000Xe-XT-CC, CR310-WIFI, Aspen10-CELL-ST, CR6-NA-ST-CC |
| TC-DATALOGGER-006 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-007 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-007 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-008 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-008 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-009 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-009 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-010 | vi | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-DATALOGGER-010 | en | Không | 200 | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC |
| TC-EXPLAIN-001 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-001 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-002 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-002 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-003 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-003 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-004 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-004 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-005 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-005 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-006 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-006 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-007 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-007 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-008 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-008 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-009 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-009 | en | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-010 | vi | Không | 200 | Cần làm rõ |
| TC-EXPLAIN-010 | en | Không | 200 | Cần làm rõ |
| TC-SOIL-001 | vi | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-001 | en | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-002 | vi | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-002 | en | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-003 | vi | Không | 200 | SoilVue10-5, CS650, CS655, CS616 |
| TC-SOIL-003 | en | Không | 200 | SoilVue10-5, CS650, CS655, CS616 |
| TC-SOIL-004 | vi | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-004 | en | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-005 | vi | Không | 200 | SoilVue10-5, CS650, CS655 |
| TC-SOIL-005 | en | Không | 200 | SoilVue10-5, CS650, CS655 |
| TC-SOIL-006 | vi | Không | 200 | SoilVue10-5, CR6-NA-ST-CC, HS2-12, CR310-NA |
| TC-SOIL-006 | en | Không | 200 | SoilVue10-5, CR6-NA-ST-CC, HS2-12, CR310-NA |
| TC-SOIL-007 | vi | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-007 | en | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-008 | vi | Không | 200 | SoilVue10-5, TCAV, HS2-12, CS655, 105E |
| TC-SOIL-008 | en | Không | 200 | SoilVue10-5, TCAV, HS2-12, CS655, 105E |
| TC-SOIL-009 | vi | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-009 | en | Không | 200 | SoilVue10-5, HS2-12, CS650, CS655, CS616 |
| TC-SOIL-010 | vi | Không | 200 | 52202, SoilVue10-5, CR6-NA-ST-CC, ClimaVue40, HS2-12 |
| TC-SOIL-010 | en | Không | 200 | 52202, SoilVue10-5, CR6-NA-ST-CC, ClimaVue40, HS2-12 |
| TC-SYSTEM-001 | vi | Không | 200 | ClariVue10, CR6-NA-ST-CC, COM320-AU, CS511, CR310-NA |
| TC-SYSTEM-001 | en | Không | 200 | ClariVue10, CR6-NA-ST-CC, COM320-AU, CS511, CR310-NA |
| TC-SYSTEM-002 | vi | Không | 200 | SoilVue10-5, 52202, CR6-NA-ST-CC, HS2-12, ClimaVue40 |
| TC-SYSTEM-002 | en | Không | 200 | SoilVue10-5, 52202, CR6-NA-ST-CC, HS2-12, ClimaVue40 |
| TC-SYSTEM-003 | vi | Không | 200 | ClimaVue40, CR6-NA-ST-CC, COM320-AU, PS84-CR, ClimaVue50G2 |
| TC-SYSTEM-003 | en | Không | 200 | ClimaVue40, CR6-NA-ST-CC, COM320-AU, PS84-CR, ClimaVue50G2 |
| TC-SYSTEM-004 | vi | Không | 200 | SoilVue10-5, 52202, CR6-NA-ST-CC, HS2-12, ClimaVue40 |
| TC-SYSTEM-004 | en | Không | 200 | SoilVue10-5, 52202, CR6-NA-ST-CC, HS2-12, ClimaVue40 |
| TC-SYSTEM-005 | vi | Không | 200 | ClariVue10, 52202, CR6-NA-ST-CC, ClimaVue40, CR310-NA |
| TC-SYSTEM-005 | en | Không | 200 | ClariVue10, 52202, CR6-NA-ST-CC, ClimaVue40, CR310-NA |
| TC-SYSTEM-006 | vi | Không | 200 | CR6-NA-ST-CC, COM320-AU, PS84-CR, CR310-NA, COM220-AU |
| TC-SYSTEM-006 | en | Không | 200 | CR6-NA-ST-CC, COM320-AU, PS84-CR, CR310-NA, COM220-AU |
| TC-SYSTEM-007 | vi | Không | 200 | CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-SYSTEM-007 | en | Không | 200 | CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-SYSTEM-008 | vi | Không | 200 | SoilVue10-5, CR6-NA-ST-CC, COM320-AU, HS2-12, CR310-NA |
| TC-SYSTEM-008 | en | Không | 200 | SoilVue10-5, CR6-NA-ST-CC, COM320-AU, HS2-12, CR310-NA |
| TC-SYSTEM-009 | vi | Không | 200 | ClariVue10, CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-SYSTEM-009 | en | Không | 200 | ClariVue10, CR6-NA-ST-CC, COM320-AU, CR310-NA, COM220-AU |
| TC-SYSTEM-010 | vi | Không | 200 | ClimaVue40, SoilVue10-5, CR6-NA-ST-CC, COM320-AU, ClimaVue50G2 |
| TC-SYSTEM-010 | en | Không | 200 | ClimaVue40, SoilVue10-5, CR6-NA-ST-CC, COM320-AU, ClimaVue50G2 |
| TC-WATER-001 | vi | Không | 200 | ClariVue10 |
| TC-WATER-001 | en | Không | 200 | ClariVue10 |
| TC-WATER-002 | vi | Không | 200 | ClariVue10 |
| TC-WATER-002 | en | Không | 200 | ClariVue10 |
| TC-WATER-003 | vi | Không | 200 | ClariVue10 |
| TC-WATER-003 | en | Không | 200 | ClariVue10 |
| TC-WATER-004 | vi | Không | 200 | ClariVue10, CS511 |
| TC-WATER-004 | en | Không | 200 | ClariVue10, CS511 |
| TC-WATER-005 | vi | Không | 200 | ClariVue10 |
| TC-WATER-005 | en | Không | 200 | ClariVue10 |
| TC-WATER-006 | vi | Không | 200 | ClariVue10, CS511 |
| TC-WATER-006 | en | Không | 200 | ClariVue10, CS511 |
| TC-WATER-007 | vi | Không | 200 | ClariVue10, 52202, CR6-NA-ST-CC, ClimaVue40, CR310-NA |
| TC-WATER-007 | en | Không | 200 | ClariVue10, 52202, CR6-NA-ST-CC, ClimaVue40, CR310-NA |
| TC-WATER-008 | vi | Không | 200 | RangeVue30, SnowVue10, ClariVue10, CRS451-WN, LevelVueB10-15 |
| TC-WATER-008 | en | Không | 200 | RangeVue30, SnowVue10, ClariVue10, CRS451-WN, LevelVueB10-15 |
| TC-WATER-009 | vi | Không | 200 | ClariVue10 |
| TC-WATER-009 | en | Không | 200 | ClariVue10 |
| TC-WATER-010 | vi | Không | 200 | Cần làm rõ |
| TC-WATER-010 | en | Không | 200 | Cần làm rõ |
| TC-WEATHER-001 | vi | Không | 200 | ClimaVue40, ClimaVue50G2, 52202, MetSENS500-DS, TB4 |
| TC-WEATHER-001 | en | Không | 200 | ClimaVue40, ClimaVue50G2, 52202, MetSENS500-DS, TB4 |
| TC-WEATHER-002 | vi | Không | 200 | TB4, ClimaVue40, 52202, TE525, ClimaVue50G2 |
| TC-WEATHER-002 | en | Không | 200 | TB4, ClimaVue40, 52202, TE525, ClimaVue50G2 |
| TC-WEATHER-003 | vi | Không | 200 | ClimaVue40, CSAT3B-NC, MetSENS200-D2, MetSENS500-DS, ClimaVue50G2 |
| TC-WEATHER-003 | en | Không | 200 | ClimaVue40, CSAT3B-NC, MetSENS200-D2, MetSENS500-DS, ClimaVue50G2 |
| TC-WEATHER-004 | vi | Không | 200 | ClimaVue40, HygroVue10, ClimaVue50G2, EE181, HMP60 |
| TC-WEATHER-004 | en | Không | 200 | ClimaVue40, HygroVue10, ClimaVue50G2, EE181, HMP60 |
| TC-WEATHER-005 | vi | Không | 200 | CS301, MS-80SH, ClimaVue50G2 |
| TC-WEATHER-005 | en | Không | 200 | CS301, MS-80SH, ClimaVue50G2 |
| TC-WEATHER-006 | vi | Không | 200 | CSAT3B-NC, CR6-NA-ST-CC, WindSonic1, CR310-NA |
| TC-WEATHER-006 | en | Không | 200 | CSAT3B-NC, CR6-NA-ST-CC, WindSonic1, CR310-NA |
| TC-WEATHER-007 | vi | Không | 200 | 52202, CR6-NA-ST-CC, ClimaVue40, CR310-NA |
| TC-WEATHER-007 | en | Không | 200 | 52202, CR6-NA-ST-CC, ClimaVue40, CR310-NA |
| TC-WEATHER-008 | vi | Không | 200 | 52202, HygroVue5, 43347, CR6-NA-ST-CC, ClimaVue40 |
| TC-WEATHER-008 | en | Không | 200 | HygroVue5, 52202, 43347, CR6-NA-ST-CC, HygroVue10 |
| TC-WEATHER-009 | vi | Không | 200 | SoilVue10-5, 52202, CR6-NA-ST-CC, HS2-12, ClimaVue40 |
| TC-WEATHER-009 | en | Không | 200 | SoilVue10-5, 52202, CR6-NA-ST-CC, HS2-12, ClimaVue40 |
| TC-WEATHER-010 | vi | Không | 200 | TB4, ClimaVue40, 52202, TE525, ClimaVue50G2 |
| TC-WEATHER-010 | en | Không | 200 | TB4, ClimaVue40, 52202, TE525, ClimaVue50G2 |
| TC-EXPLAIN-001 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-001 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-002 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-002 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-003 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-003 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-004 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-004 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-005 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-005 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-006 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-006 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-007 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-007 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-008 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-008 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-009 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-009 | en | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-010 | vi | Có | 200 | CS655, CS650 |
| TC-EXPLAIN-010 | en | Có | 200 | CS655, CS650 |

Dữ liệu đầy đủ: [responses.json](responses.json), [context responses](../explanation-cases-context/responses.json), [verification.json](verification.json).
