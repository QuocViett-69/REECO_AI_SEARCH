# AI Search stress test — 29/09/2026

## Kết quả

- 134 case người dùng cung cấp (A08–Q05), thêm 89 query exact model từ database: tổng 223.
- Exact model: **89/89 Top 1**. Không suy diễn nội dung A01–A07 chưa được cung cấp.
- Sau sửa: **219 PASS, 0 FAIL, 4 LIMITATION**. Các case phủ định trả HTTP 400 rõ ràng; chưa có bộ lọc phủ định tổng quát.
- Không có ID ngoài catalog trong kết quả của các tầng. Có 0 case vi phạm điều kiện trong Top 5 theo bộ đánh giá; 0 evidence không đối chiếu được với product record.
- HTTP: 134 request thật, concurrency 4, 0 lỗi ngoài trạng thái dự kiến; p50 3.31s, p95 8.22s. Hit@1 failures: 0; mode counts: {"hybrid":130}.
- Reranker: 7 cải thiện, 115 giữ nguyên, 0 giảm nDCG@5 trên 122 case có nhãn. 0 regression nDCG@5 của public pipeline so với trước sửa.

## Cách đo và giới hạn

Kiểm thử fallback chủ động ngắt Semantic: 7 HTTP requests, 0 lỗi, 0 Hit@1 failures. Dùng các câu logger tiếng Anh, tiếng Việt, mixed và typo; kiểm tra yêu cầu Wi-Fi vẫn được giữ. Xem [http-fallback.json](http-fallback.json). Lỗi K03 trước sửa được lưu ở [http-before-fallback-fix.json](http-before-fallback-fix.json).

Đọc snapshot đầy đủ 89 sản phẩm active và 3277 specification từ database. Keyword và Semantic được gọi thật; Hybrid dùng RRF hiện hành. Mỗi query dùng cùng candidate set cho public filter và BGE. **public** = Hybrid + intent/technical filters; **reranker** = public + pinned BGE Top-5. Điểm RRF, cosine, lexical và BGE logit không phải xác suất đúng. Literal raw-spec hits mới có lexical score 0 nếu không có điểm RPC, không tạo confidence giả.

Nhãn binary được tạo độc lập từ evidence trong toàn catalog bằng **stress-cases.mjs**, không lấy ranking làm ground truth. Đây là nhãn tự động có thể review, chưa phải gold set do chuyên gia chấm. Hai pha được tính lại trên cùng nhãn; “water sensor” chấp nhận cả soil-water-content vì query mơ hồ. 122 case đủ nhãn để tính metrics; 12 case phủ định/out-of-domain/quá mơ hồ không đưa vào trung bình relevance. Recall dùng toàn bộ tập relevant được tìm thấy trong snapshot. MRR tính trên candidate list đã thu thập (tối đa 100), không tuyên bố recall toàn database ngoài tập nhãn.

Benchmark BGE dùng timeout 60000ms để đo chất lượng; cấu hình ứng dụng là 350ms. HTTP toàn bộ suite tắt reranker và LLM rewrite để đo pipeline xác định. Reranker cải thiện offline không có nghĩa đã được bật trong cấu hình ứng dụng. Rerank lỗi/fallback: 0. Retrieval fallback: 3.

Smoke HTTP riêng với reranker bật, dùng timeout ứng dụng: 5 query Q01–Q05; 0 lỗi HTTP, 4 lần gọi BGE, 1 lỗi gọi BGE. Q04 chỉ còn một ứng viên nên bỏ qua reranker. Xem [http-reranker.json](http-reranker.json).

LLM rewrite đã bị giới hạn vào câu verified hoặc câu verified có tiền tố model. Regression có payload bịa waterproof/medical và thông số mới; đều bị từ chối. Không dùng vài kết quả model ngẫu nhiên để tuyên bố mọi output AI tương lai đều đúng. Query ngoài domain vẫn có thể trả sản phẩm để tham khảo, nhưng explanation nói rõ chưa xác nhận mục đích sử dụng. Chưa có bộ phân loại domain hoặc confidence được hiệu chuẩn.

## Metrics trước sửa

| Stage | Hit@1 | Hit@3 | Hit@5 | MRR | Recall@5 | nDCG@5 (binary) |
|---|---:|---:|---:|---:|---:|---:|
| keyword | 33.61% | 36.89% | 37.70% | 0.3548 | 23.18% | 0.3099 |
| semantic | 61.48% | 84.43% | 90.98% | 0.7331 | 53.57% | 0.6393 |
| hybrid | 64.75% | 87.70% | 91.80% | 0.7659 | 57.98% | 0.6966 |
| public | 77.87% | 88.52% | 90.98% | 0.8346 | 63.20% | 0.7899 |
| reranker | 84.43% | 90.16% | 90.98% | 0.8769 | 63.20% | 0.8097 |

## Metrics sau sửa

| Stage | Hit@1 | Hit@3 | Hit@5 | MRR | Recall@5 | nDCG@5 (binary) |
|---|---:|---:|---:|---:|---:|---:|
| keyword | 59.84% | 63.93% | 64.75% | 0.6255 | 49.03% | 0.5775 |
| semantic | 60.66% | 83.61% | 90.16% | 0.7249 | 52.75% | 0.6311 |
| hybrid | 80.33% | 94.26% | 96.72% | 0.8760 | 66.91% | 0.8070 |
| public | 100.00% | 100.00% | 100.00% | 1.0000 | 76.78% | 0.9736 |
| reranker | 100.00% | 100.00% | 100.00% | 1.0000 | 76.78% | 0.9769 |

## Sửa nguyên nhân

- Identity parser nhận model trong câu có mô tả, giữ ranh giới identifier và không coi số đo là model số.
- Bổ sung RS-232, USB, CANbus, CPI; CANbus có thể được xác nhận từ raw specification.
- Evidence batch đọc cả text và phân trang; không mất dữ liệu sau 1.000 dòng. Theo [Supabase range](https://supabase.com/docs/reference/javascript/using-modifiers-range), chỉ số cuối là inclusive và cần thứ tự ổn định.
- Keyword retrieval bổ sung literal spec, bảo toàn số/unit, phân biệt ADC với phép đo điện trở 24-bit; model suggestions lấy từ catalog, không có mapping query → product.
- Intent dùng evidence cho lượng nước trong đất, humidity của đất, danh sách thông số thời tiết, thu thập/truyền dữ liệu, wireless, lượng mưa và chất lượng nước.
- Keyword bổ sung các khái niệm từ intent parser khi số ứng viên ít; giữ kết quả gốc và bộ lọc cuối, để câu tiếng Việt/tiếng Anh có từ đệm vẫn có ứng viên khi Semantic lỗi.
- Nhận diện cú pháp phủ định chưa hỗ trợ; transport “is unavailable” không trở thành yêu cầu dương.
- Explanation không nhận free-form rewrite thêm claim, và không xác nhận use case chỉ vì trùng từ/interface.

## Vietnamese ↔ English

| VI / EN | VI Top 5 public | EN Top 5 public | Semantic-only Hit@1 VI / EN |
|---|---|---|---|
| C01 / B01 | HS2-12, SoilVue10-5, CS616, CS650, CS655 | SoilVue10-5, HS2-12, CS650, CS655, CS616 | 0.00% / 100.00% |
| C02 / D01 | SoilVue10-5, CS616, HS2-12, CS655, CS650 | CS616, SoilVue10-5, HS2-12, CS650, CS655 | 0.00% / 100.00% |
| C04 / B07 | ClariVue10 | ClariVue10 | 100.00% / 100.00% |
| C05 / B06 | TB4, 52202, TE525, ClimaVue40, RainVue10-MM | TB4, TE525, 52202, ClimaVue40, ClimaVue50G2 | 100.00% / 100.00% |
| C06 / B09 | BaroVue10, ClimaVue50G2, MetSENS300-D2, MetSENS500-DS, MetSENS550-D2 | BaroVue10, ClimaVue50G2, MetSENS300-D2, MetSENS500-DS, MetSENS550-D2 | 100.00% / 100.00% |
| C07 / B05 | CR310-NA, CR1000Xe-XT-CC, CR350-NA, CR6-NA-ST-CC, CR310-WIFI | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC | 100.00% / 100.00% |
| C08 / B04 | RV50X, CELL205-AT, CELL210-V, CELL225-IT1A, CELL215-IT1A | CELL205-AT, CELL210-V, CELL215-IT1A, CELL220-IT1A, CELL225-IT1A | 0.00% / 100.00% |
| C09 / B10 | CS301, MS-80SH, NR01, SN500SS, ClimaVue50G2 | CS301, CS310, ClimaVue50G2, NR01, SN500SS | 100.00% / 100.00% |
| C10 / B08 | AVW200-ST, VWANALYZER, CRVW3-NE | VWANALYZER, AVW200-ST | 100.00% / 100.00% |
| F02 / F01 | SoilVue10-5, CS655, CS650 | SoilVue10-5, CS650, CS655 | 100.00% / 0.00% |
| F08 / F07 | ClimaVue50G2, MetSENS500-DS, MetSENS300-D2, MetSENS550-D2 | ClimaVue50G2, MetSENS500-DS, MetSENS300-D2, MetSENS550-D2 | 0.00% / 0.00% |
| G02 / G01 | 109, TEMP120-XD, CS230, CS241DM, CR1000Xe-XT-CC | TEMP120-XD, 109, CS241DM, ClimaVue40, SN500SS | 0.00% / 0.00% |

## Tất cả case được cung cấp

| Test | Query | Trạng thái | Public Top 5 | Reranked Top 5 |
|---|---|---|---|---|
| A08 | SoilVue10-5 | PASS | SoilVue10-5 | SoilVue10-5 |
| A09 | RainVue10-MM | PASS | RainVue10-MM | RainVue10-MM |
| A10 | CSAT3B-NC | PASS | CSAT3B-NC | CSAT3B-NC |
| B01 | soil moisture sensor | PASS | SoilVue10-5, HS2-12, CS650, CS655, CS616 | SoilVue10-5, CS655, CS650, HS2-12, CS616 |
| B02 | water content reflectometer | PASS | CS655, CS650, CS616, HS2-12, LWS | CS616, CS650, CS655, HS2-12, LWS |
| B03 | weather sensor | PASS | ClimaVue40, ClimaVue50G2, CS125-ST, MetSENS500-DS, MetSENS550-D2 | ClimaVue50G2, ClimaVue40, CS125-ST, MetSENS550-D2, MetSENS500-DS |
| B04 | cellular gateway | PASS | CELL205-AT, CELL210-V, CELL215-IT1A, CELL220-IT1A, CELL225-IT1A | CELL225-IT1A, CELL205-AT, CELL220-IT1A, CELL215-IT1A, CELL210-V |
| B05 | data logger | PASS | CR6-NA-ST-CC, CR310-NA, CR350-NA, CR310-WIFI, CR1000Xe-XT-CC | CR350-NA, CR310-NA, CR6-NA-ST-CC, CR1000Xe-XT-CC, CR310-WIFI |
| B06 | rain gauge | PASS | TB4, TE525, 52202, ClimaVue40, ClimaVue50G2 | 52202, TE525, TB4, ClimaVue50G2, ClimaVue40 |
| B07 | turbidity sensor | PASS | ClariVue10 | ClariVue10 |
| B08 | vibrating wire analyzer | PASS | VWANALYZER, AVW200-ST | VWANALYZER, AVW200-ST |
| B09 | barometric pressure sensor | PASS | BaroVue10, ClimaVue50G2, MetSENS300-D2, MetSENS500-DS, MetSENS550-D2 | BaroVue10, ClimaVue50G2, MetSENS550-D2, MetSENS500-DS, MetSENS300-D2 |
| B10 | solar radiation sensor | PASS | CS301, CS310, ClimaVue50G2, NR01, SN500SS | NR01, CS301, SN500SS, CS310, ClimaVue50G2 |
| C01 | cảm biến đo độ ẩm đất | PASS | HS2-12, SoilVue10-5, CS616, CS650, CS655 | SoilVue10-5, CS650, CS655, HS2-12, CS616 |
| C02 | cảm biến đo lượng nước trong đất | PASS | SoilVue10-5, CS616, HS2-12, CS655, CS650 | HS2-12, CS655, CS650, CS616, SoilVue10-5 |
| C03 | thiết bị đo nhiệt độ đất | PASS | TCAV, 105E, TempVue50, CS650, SoilVue10-5 | TCAV, CS650, SoilVue10-5, TempVue50, 105E |
| C04 | cảm biến đo độ đục nước | PASS | ClariVue10 | ClariVue10 |
| C05 | thiết bị đo lượng mưa | PASS | TB4, 52202, TE525, ClimaVue40, RainVue10-MM | RainVue10-MM, 52202, TB4, ClimaVue40, TE525 |
| C06 | cảm biến áp suất khí quyển | PASS | BaroVue10, ClimaVue50G2, MetSENS300-D2, MetSENS500-DS, MetSENS550-D2 | BaroVue10, MetSENS300-D2, MetSENS500-DS, ClimaVue50G2, MetSENS550-D2 |
| C07 | bộ ghi dữ liệu | PASS | CR310-NA, CR1000Xe-XT-CC, CR350-NA, CR6-NA-ST-CC, CR310-WIFI | CR6-NA-ST-CC, CR310-WIFI, CR310-NA, CR350-NA, CR1000Xe-XT-CC |
| C08 | thiết bị truyền dữ liệu qua mạng di động | PASS | RV50X, CELL205-AT, CELL210-V, CELL225-IT1A, CELL215-IT1A | CELL225-IT1A, CELL215-IT1A, CELL205-AT, RV50X, CELL210-V |
| C09 | cảm biến đo bức xạ mặt trời | PASS | CS301, MS-80SH, NR01, SN500SS, ClimaVue50G2 | CS301, MS-80SH, NR01, SN500SS, ClimaVue50G2 |
| C10 | thiết bị đo dây rung | PASS | AVW200-ST, VWANALYZER, CRVW3-NE | AVW200-ST, VWANALYZER, CRVW3-NE |
| D01 | I need a sensor for measuring water content in soil | PASS | CS616, SoilVue10-5, HS2-12, CS650, CS655 | HS2-12, CS616, CS650, CS655, SoilVue10-5 |
| D02 | Tôi cần cảm biến để theo dõi lượng nước trong đất | PASS | CS616, HS2-12, CS655, SoilVue10-5, CS650 | HS2-12, CS650, CS655, CS616, SoilVue10-5 |
| D03 | Tôi muốn theo dõi điều kiện đất ngoài đồng | PASS | TCAV, CS610, 105E, LWS, SoilVue10-5 | SoilVue10-5, TCAV, 105E, LWS, CS610 |
| D04 | I need equipment for remote environmental monitoring | PASS | ClimaVue40, LWS, ClimaVue50G2, CR6-NA-ST-CC, CS120A-ST | CR6-NA-ST-CC, ClimaVue50G2, ClimaVue40, CS120A-ST, LWS |
| D05 | thiết bị để thu thập dữ liệu cảm biến ngoài hiện trường | PASS | Aspen10-CELL-ST, CR6-NA-ST-CC, CR310-NA, CR1000Xe-XT-CC, CR350-NA | Aspen10-CELL-ST, CR350-NA, CR1000Xe-XT-CC, CR6-NA-ST-CC, CR310-NA |
| D06 | Tôi muốn truyền dữ liệu từ trạm quan trắc ở xa | PASS | TX326, NL241, TX325 | TX325, TX326, NL241 |
| D07 | sensor for monitoring rainfall in the field | PASS | TB4, 52202, ClimaVue40, TE525, RainVue10-MM | TB4, RainVue10-MM, 52202, TE525, ClimaVue40 |
| D08 | thiết bị dùng để đo chất lượng nước | PASS | ClariVue10, CS511 | ClariVue10, CS511 |
| D09 | thiết bị theo dõi thời tiết ngoài trời | PASS | ClimaVue40, ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, CS125-ST | ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, ClimaVue40, CS125-ST |
| D10 | I want one sensor that measures multiple weather parameters | PASS | ClimaVue40, ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, CS125-ST | ClimaVue50G2, ClimaVue40, MetSENS500-DS, MetSENS550-D2, CS125-ST |
| E01 | SDI-12 | PASS | ClimaVue50G2, MetSENS500-DS, TempVue20-S, CR6-NA-ST-CC, CR310-NA | ClimaVue50G2, MetSENS500-DS, TempVue20-S, CR310-NA, CR6-NA-ST-CC |
| E02 | RS-232 | PASS | MetSENS200-D2, MetSENS300-D2, MetSENS550-D2, CS120A-ST, CR6-NA-ST-CC | MetSENS550-D2, CS120A-ST, MetSENS300-D2, MetSENS200-D2, CR6-NA-ST-CC |
| E03 | SDI-12 RS-232 | PASS | CR310-NA, BaroVue10, CR6-NA-ST-CC, CR1000Xe-XT-CC, CS456 | CS456, BaroVue10, CR310-NA, CR1000Xe-XT-CC, CR6-NA-ST-CC |
| E04 | Wi-Fi datalogger | PASS | CR310-WIFI | CR310-WIFI |
| E05 | cellular modem | PASS | CELL205-AT, CELL210-V, CELL215-IT1A, CELL220-IT1A, CELL225-IT1A | CELL225-IT1A, CELL215-IT1A, CELL220-IT1A, CELL210-V, CELL205-AT |
| E06 | USB interface | PASS | CR310-NA, CR350-NA, MeteoPV, CR6-NA-ST-CC, VWIRE305-XD | MeteoPV, VWIRE305-XD, CR6-NA-ST-CC, CR350-NA, CR310-NA |
| E07 | CANbus | PASS | VOLT108-XD | VOLT108-XD |
| E08 | CPI interface | PASS | CR1000Xe-XT-CC, CR6-NA-ST-CC | CR1000Xe-XT-CC, CR6-NA-ST-CC |
| E09 | 24-bit ADC | PASS | CR310-NA, CR6-NA-ST-CC, CR350-NA, VOLT108-XD, CR310-WIFI | CR6-NA-ST-CC, CR350-NA, CR310-WIFI, CR310-NA, VOLT108-XD |
| E10 | IP62 | PASS | VWANALYZER | VWANALYZER |
| F01 | soil moisture sensor with SDI-12 | PASS | SoilVue10-5, CS650, CS655 | SoilVue10-5, CS655, CS650 |
| F02 | cảm biến độ ẩm đất có SDI-12 | PASS | SoilVue10-5, CS655, CS650 | SoilVue10-5, CS650, CS655 |
| F03 | soil sensor with SDI-12 and RS-232 | PASS | CS650, CS655 | CS650, CS655 |
| F04 | cảm biến đo độ ẩm đất và nhiệt độ đất | PASS | CS650, SoilVue10-5, CS655 | SoilVue10-5, CS655, CS650 |
| F05 | cảm biến đo độ ẩm đất, nhiệt độ đất và độ dẫn điện | PASS | CS650, CS655 | CS650, CS655 |
| F06 | datalogger with Wi-Fi | PASS | CR310-WIFI | CR310-WIFI |
| F07 | weather sensor with temperature humidity and pressure | PASS | ClimaVue50G2, MetSENS500-DS, MetSENS300-D2, MetSENS550-D2 | ClimaVue50G2, MetSENS300-D2, MetSENS500-DS, MetSENS550-D2 |
| F08 | thiết bị quan trắc thời tiết đo nhiệt độ độ ẩm áp suất | PASS | ClimaVue50G2, MetSENS500-DS, MetSENS300-D2, MetSENS550-D2 | MetSENS500-DS, MetSENS300-D2, ClimaVue50G2, MetSENS550-D2 |
| F09 | cellular gateway for remote monitoring | PASS | CELL205-AT, CELL215-IT1A, CELL210-V, CELL225-IT1A, CELL220-IT1A | CELL215-IT1A, CELL205-AT, CELL220-IT1A, CELL225-IT1A, CELL210-V |
| F10 | vibrating wire measurement device with thermistor support | PASS | AVW200-ST, VWANALYZER, CRVW3-NE | CRVW3-NE, AVW200-ST, VWANALYZER |
| G01 | operating temperature -50°C | PASS | TEMP120-XD, 109, CS241DM, ClimaVue40, SN500SS | 109, ClimaVue40, SN500SS, CS241DM, TEMP120-XD |
| G02 | thiết bị hoạt động ở -50°C | PASS | 109, TEMP120-XD, CS230, CS241DM, CR1000Xe-XT-CC | 109, CS241DM, TEMP120-XD, CR1000Xe-XT-CC, CS230 |
| G03 | operating temperature 70°C | PASS | 109, CR6-NA-ST-CC, CS301, WindSonic1, RV50X | 109, CS301, RV50X, CR6-NA-ST-CC, WindSonic1 |
| G04 | 300 to 6500 Hz | PASS | VWANALYZER | VWANALYZER |
| G05 | 1 kHz | PASS | CR6-NA-ST-CC, CS120A-ST, VOLT108-XD | CR6-NA-ST-CC, VOLT108-XD, CS120A-ST |
| G06 | 9.6 to 32 Vdc | PASS | VOLT108-XD, TEMP120-XD, AVW200-ST | VOLT108-XD, AVW200-ST, TEMP120-XD |
| G07 | 24 bit ADC | PASS | CR310-NA, CR6-NA-ST-CC, CR350-NA, VOLT108-XD, CR310-WIFI | CR350-NA, CR6-NA-ST-CC, CR310-WIFI, CR310-NA, VOLT108-XD |
| G08 | 5 AA battery | PASS | VWANALYZER | VWANALYZER |
| G09 | IP rating IP62 | PASS | VWANALYZER | VWANALYZER |
| G10 | accuracy 0.005% | PASS | VWIRE305-XD, CRVW3-NE, VWANALYZER | VWANALYZER, CRVW3-NE, VWIRE305-XD |
| H01 | agriculture soil monitoring | PASS | TCAV, LWS, SoilVue10-5, HS2-12, ClimaVue40 | SoilVue10-5, TCAV, HS2-12, LWS, ClimaVue40 |
| H02 | quan trắc nông nghiệp | PASS | ClimaVue40, LWS, TCAV, ClimaVue50G2, TB4 | ClimaVue50G2, TCAV, LWS, ClimaVue40, TB4 |
| H03 | hydrology monitoring | PASS | RangeVue30, SnowVue10, CS456, LevelVueB10-15, CRS451-WN | RangeVue30, CS456, LevelVueB10-15, CRS451-WN, SnowVue10 |
| H04 | water level monitoring | PASS | RangeVue30, LevelVueB10-15, CRS451-WN, LWS, CS456 | CRS451-WN, RangeVue30, LevelVueB10-15, CS456, LWS |
| H05 | weather station | PASS | ClimaVue40, ClimaVue50G2, CS125-ST, MetSENS500-DS, MetSENS550-D2 | CS125-ST, MetSENS550-D2, ClimaVue50G2, ClimaVue40, MetSENS500-DS |
| H06 | remote weather station | PASS | ClimaVue40, ClimaVue50G2, CS125-ST, MetSENS500-DS, MetSENS550-D2 | ClimaVue40, MetSENS550-D2, ClimaVue50G2, MetSENS500-DS, CS125-ST |
| H07 | environmental monitoring station | PASS | ClimaVue40, ClimaVue50G2, CS120A-ST, LWS, SnowVue10 | ClimaVue50G2, ClimaVue40, LWS, CS120A-ST, SnowVue10 |
| H08 | solar monitoring | PASS | SunScout, MeteoPV, CS301, ClimaVue50G2, MS-80SH | SunScout, MeteoPV, MS-80SH, CS301, ClimaVue50G2 |
| H09 | structural monitoring with vibrating wire sensors | PASS | VWANALYZER, AVW200-ST, CRVW3-NE | CRVW3-NE, AVW200-ST, VWANALYZER |
| H10 | monitoring water turbidity | PASS | ClariVue10 | ClariVue10 |
| I01 | soil humidity sensor | PASS | SoilVue10-5, HS2-12, CS616, CS650, CS655 | SoilVue10-5, CS655, CS650, HS2-12, CS616 |
| I02 | water in soil sensor | PASS | SoilVue10-5, HS2-12, CS616, CS650, CS655 | HS2-12, CS650, CS655, SoilVue10-5, CS616 |
| I03 | device for measuring how wet the soil is | PASS | SoilVue10-5, HS2-12, CS655, CS616, CS650 | HS2-12, SoilVue10-5, CS650, CS616, CS655 |
| I04 | rainfall measuring device | PASS | TB4, TE525, ClimaVue40, 52202, ClimaVue50G2 | 52202, TB4, TE525, ClimaVue50G2, ClimaVue40 |
| I05 | mobile network communication device | PASS | CELL205-AT, CELL210-V, CELL220-IT1A, CELL215-IT1A, CELL225-IT1A | CELL205-AT, CELL215-IT1A, CELL225-IT1A, CELL220-IT1A, CELL210-V |
| I06 | wireless data logger | PASS | CR310-WIFI | CR310-WIFI |
| I07 | water clarity sensor | PASS | ClariVue10, CS120A-ST, LWS, CS511, SnowVue10 | ClariVue10, CS120A-ST, SnowVue10, LWS, CS511 |
| I08 | atmospheric pressure | PASS | BaroVue10, ClimaVue50G2, MetSENS300-D2, MetSENS500-DS, MetSENS550-D2 | MetSENS300-D2, ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, BaroVue10 |
| I09 | sun radiation measurement | PASS | ClimaVue50G2, CS301, MS-80SH, SN500SS, SunScout | MS-80SH, CS301, SN500SS, ClimaVue50G2, SunScout |
| I10 | multi parameter weather sensor | PASS | ClimaVue40, ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, CS125-ST | ClimaVue50G2, MetSENS550-D2, MetSENS500-DS, ClimaVue40, CS125-ST |
| J01 | CS65 | PASS | CS650, CS506, CS655, CS120A-ST, CR6-NA-ST-CC | CS655, CS650, CS120A-ST, CS506, CR6-NA-ST-CC |
| J02 | CS6555 | PASS | CS655, CS506, CS120A-ST, CR6-NA-ST-CC, VWIRE305-XD | CS655, CS506, CS120A-ST, CR6-NA-ST-CC, VWIRE305-XD |
| J03 | soil moisure sensor | PASS | HS2-12, LWS, TCAV, SoilVue10-5, ClimaVue40 | SoilVue10-5, HS2-12, TCAV, LWS, ClimaVue40 |
| J04 | tempature sensor | PASS | BLACKGLOBE, 43347, TCAV, ClimaVue40, 109 | 109, TCAV, 43347, ClimaVue40, BLACKGLOBE |
| J05 | turbity sensor | PASS | ClariVue10, CS120A-ST, ClimaVue40, SnowVue10, LWS | ClariVue10, ClimaVue40, LWS, CS120A-ST, SnowVue10 |
| J06 | data loger wifi | PASS | CR310-WIFI | CR310-WIFI |
| J07 | SDI12 sensor | PASS | ClimaVue50G2, TempVue20-S, HygroVue10, SnowVue10, MetSENS500-DS | ClimaVue50G2, HygroVue10, MetSENS500-DS, SnowVue10, TempVue20-S |
| J08 | rs232 | PASS | CS120A-ST, MetSENS300-D2, MetSENS200-D2, CR6-NA-ST-CC, RF500M | RF500M, CS120A-ST, MetSENS300-D2, MetSENS200-D2, CR6-NA-ST-CC |
| J09 | clari vue 10 | PASS | ClariVue10 | ClariVue10 |
| J10 | rain vue | PASS | RainVue10-MM, ClimaVue40, ClimaVue50G2, TB4, 52202 | RainVue10-MM, ClimaVue40, ClimaVue50G2, 52202, TB4 |
| K01 | cảm biến soil moisture | PASS | CS616, CS655, HS2-12, SoilVue10-5, CS650 | SoilVue10-5, CS650, CS655, HS2-12, CS616 |
| K02 | soil sensor có SDI-12 | PASS | SoilVue10-5, CS655, CS650, TempVue50 | SoilVue10-5, CS655, CS650, TempVue50 |
| K03 | datalogger có wifi | PASS | CR310-WIFI | CR310-WIFI |
| K04 | thiết bị cellular gateway cho trạm quan trắc | PASS | CELL210-V, CELL205-AT, CELL215-IT1A, CELL220-IT1A, CELL225-IT1A | CELL215-IT1A, CELL205-AT, CELL225-IT1A, CELL220-IT1A, CELL210-V |
| K05 | weather sensor đo humidity | PASS | ClimaVue40, ClimaVue50G2, HygroVue10, EE181, HygroVue5 | ClimaVue50G2, ClimaVue40, HygroVue5, EE181, HygroVue10 |
| K06 | water sensor đo turbidity | PASS | ClariVue10 | ClariVue10 |
| K07 | sensor nhiệt độ operating -50°C | PASS | 109, CS241DM, CS230, ClimaVue40, CS650 | 109, ClimaVue40, CS650, CS241DM, CS230 |
| K08 | vibrating wire thiết bị đọc | PASS | VWANALYZER, AVW200-ST | VWANALYZER, AVW200-ST |
| L01 | sensor | PASS | SnowVue10, ClimaVue40, ClimaVue50G2, BLACKGLOBE, CS120A-ST | ClimaVue50G2, ClimaVue40, CS120A-ST, SnowVue10, BLACKGLOBE |
| L02 | temperature | PASS | BLACKGLOBE, 43347, ClimaVue40, 109, ClimaVue50G2 | 109, 43347, BLACKGLOBE, ClimaVue50G2, ClimaVue40 |
| L03 | water sensor | PASS | HS2-12, RangeVue30, SnowVue10, CS456, CRS451-WN | CS456, CRS451-WN, HS2-12, RangeVue30, SnowVue10 |
| L04 | weather | PASS | ClimaVue40, CS125-ST, ClimaVue50G2, MetSENS500-DS, MetSENS550-D2 | CS125-ST, MetSENS550-D2, ClimaVue50G2, ClimaVue40, MetSENS500-DS |
| L05 | communication | PASS | NL241, NL201-ST, COM220-AU, COM320-AU, RF407 | COM220-AU, COM320-AU, RF407, NL241, NL201-ST |
| L06 | power | PASS | PS150, PS84-CR, PS200, PS24-w/CH150, CH200 | PS200, PS84-CR, PS150, PS24-w/CH150, CH200 |
| L07 | monitoring | PASS | SunScout, LWS, MetSENS500-DS, MetSENS550-D2, ClimaVue40 | SunScout, MetSENS550-D2, MetSENS500-DS, LWS, ClimaVue40 |
| L08 | best sensor | PASS | BLACKGLOBE, ClimaVue40, BaroVue10, MetSENS500-DS, 43347 | MetSENS500-DS, ClimaVue40, 43347, BLACKGLOBE, BaroVue10 |
| M01 | iPhone 17 | PASS | COM320-AU, COM220-AU, CELL220-IT1A, CR350-NA, CR310-NA | COM320-AU, CELL220-IT1A, COM220-AU, CR350-NA, CR310-NA |
| M02 | gaming laptop | PASS | BLACKGLOBE, BaroVue10, ClimaVue50G2, ClimaVue40, PS150 | PS150, ClimaVue50G2, ClimaVue40, BLACKGLOBE, BaroVue10 |
| M03 | coffee machine | PASS | ClimaVue40, BLACKGLOBE, BaroVue10, TE525, TCAV | BLACKGLOBE, BaroVue10, ClimaVue40, TCAV, TE525 |
| M04 | blood pressure monitor | PASS | BaroVue10, ClimaVue40, BLACKGLOBE, LWS, ClimaVue50G2 | BaroVue10, ClimaVue50G2, LWS, ClimaVue40, BLACKGLOBE |
| M05 | car GPS navigation | PASS | CR350-NA, ClimaVue40, CR310-NA, CR6-NA-ST-CC, BLACKGLOBE | CR350-NA, CR6-NA-ST-CC, CR310-NA, ClimaVue40, BLACKGLOBE |
| M06 | home wifi router | PASS | NL241, CR310-WIFI | NL241, CR310-WIFI |
| N01 | soil moisture sensor without SDI-12 | LIMITATION | ∅ | ∅ |
| N02 | datalogger without Wi-Fi | LIMITATION | ∅ | ∅ |
| N03 | non-cellular communication device | LIMITATION | ∅ | ∅ |
| N04 | soil sensor but not temperature sensor | LIMITATION | ∅ | ∅ |
| O01 | Tôi đang xây dựng một trạm quan trắc ở vùng nông nghiệp và cần một thiết bị có thể đo lượng nước trong đất, nhiệt độ đất và ưu tiên giao tiếp SDI-12 để kết nối với hệ thống hiện tại | PASS | CS650, CS655, SoilVue10-5 | CS650, SoilVue10-5, CS655 |
| O02 | Our field station is located far away and we need to send measurement data over a cellular network because Wi-Fi is unavailable | PASS | CELL205-AT, CELL210-V, CELL220-IT1A, CELL215-IT1A, RV50X | RV50X, CELL220-IT1A, CELL205-AT, CELL215-IT1A, CELL210-V |
| O03 | Tôi cần thiết bị đo nhiều thông số thời tiết ngoài trời thay vì phải lắp nhiều cảm biến rời | PASS | MetSENS500-DS, ClimaVue40, ClimaVue50G2, MetSENS550-D2, MetSENS200-D2 | ClimaVue50G2, ClimaVue40, MetSENS500-DS, MetSENS550-D2, MetSENS200-D2 |
| O04 | We need an instrument to inspect and read vibrating wire sensors during field maintenance | PASS | VWANALYZER, AVW200-ST | VWANALYZER, AVW200-ST |
| P01 | CS655 soil moisture | PASS | CS655 | CS655 |
| P02 | CS655 SDI-12 | PASS | CS655 | CS655 |
| P03 | RV50X cellular gateway | PASS | RV50X | RV50X |
| P04 | CR310 WiFi datalogger | PASS | CR310-WIFI | CR310-WIFI |
| P05 | ClariVue10 turbidity | PASS | ClariVue10 | ClariVue10 |
| P06 | BaroVue10 pressure | PASS | BaroVue10 | BaroVue10 |
| Q01 | soil moisture sensor with SDI-12 | PASS | SoilVue10-5, CS650, CS655 | SoilVue10-5, CS655, CS650 |
| Q02 | weather sensor measuring temperature humidity pressure | PASS | ClimaVue50G2, MetSENS500-DS, MetSENS550-D2, MetSENS300-D2 | ClimaVue50G2, MetSENS500-DS, MetSENS300-D2, MetSENS550-D2 |
| Q03 | remote monitoring using cellular communication | PASS | CELL205-AT, CELL210-V, CELL215-IT1A, CELL225-IT1A, CELL220-IT1A | CELL225-IT1A, CELL215-IT1A, CELL210-V, CELL205-AT, CELL220-IT1A |
| Q04 | device for measuring turbidity in water | PASS | ClariVue10 | ClariVue10 |
| Q05 | vibrating wire field reader | PASS | VWANALYZER, AVW200-ST | AVW200-ST, VWANALYZER |

## Q: trace các tầng và điểm thật

### Q01: soil moisture sensor with SDI-12

| Model | Keyword rank | Semantic rank | RRF rank | Trước rerank | Sau rerank | Keyword score | Semantic score | RRF score | BGE logit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SoilVue10-5 | 1 | 2 | 1 | 1 | 1 | 0.230769 | 0.722087989226828 | 0.03252247488101534 | 4.3984375 |
| CS616 | 2 | 12 | 5 | — | — | 0.166667 | 0.666431049576119 | 0.030017921146953404 | — |
| CS650 | 3 | 4 | 3 | 2 | 3 | 0.166667 | 0.691180307198746 | 0.03149801587301587 | 3.640625 |
| CS655 | 4 | 3 | 4 | 3 | 2 | 0.166667 | 0.697676845761909 | 0.03149801587301587 | 3.7578125 |
| CS610 | 5 | 17 | 6 | — | — | 0.0909091 | 0.636883063687917 | 0.028371628371628373 | — |
| HS2-12 | 6 | 1 | 2 | — | — | 0.0909091 | 0.723563120625672 | 0.031544957774465976 | — |
| HygroVue10 | — | 5 | 7 | — | — | — | 0.689716380221629 | 0.015384615384615385 | — |

### Q02: weather sensor measuring temperature humidity pressure

| Model | Keyword rank | Semantic rank | RRF rank | Trước rerank | Sau rerank | Keyword score | Semantic score | RRF score | BGE logit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ClimaVue40 | — | 1 | 1 | — | — | — | 0.817675836835448 | 0.01639344262295082 | — |
| ClimaVue50G2 | — | 2 | 2 | 1 | 1 | — | 0.752018713483782 | 0.016129032258064516 | 4.03125 |
| LWS | — | 3 | 3 | — | — | — | 0.711183018197474 | 0.015873015873015872 | — |
| BaroVue10 | — | 4 | 4 | — | — | — | 0.702781074741948 | 0.015625 | — |
| MetSENS500-DS | — | 5 | 5 | 2 | 2 | — | 0.696290384396457 | 0.015384615384615385 | 3.8515625 |
| MetSENS550-D2 | — | 9 | 9 | 3 | 4 | — | 0.674946885548071 | 0.014492753623188406 | 3.53515625 |
| MetSENS300-D2 | — | 11 | 11 | 4 | 3 | — | 0.671580811048728 | 0.014084507042253521 | 3.7421875 |

### Q03: remote monitoring using cellular communication

| Model | Keyword rank | Semantic rank | RRF rank | Trước rerank | Sau rerank | Keyword score | Semantic score | RRF score | BGE logit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| CR310-NA | — | 1 | 1 | — | — | — | 0.59075397783804 | 0.01639344262295082 | — |
| CR350-NA | — | 2 | 2 | — | — | — | 0.580051949018111 | 0.016129032258064516 | — |
| CELL205-AT | — | 3 | 3 | 1 | 4 | — | 0.570750917464827 | 0.015873015873015872 | -4.91796875 |
| CR6-NA-ST-CC | — | 4 | 4 | — | — | — | 0.567830979824131 | 0.015625 | — |
| CELL210-V | — | 5 | 5 | 2 | 3 | — | 0.553657306112617 | 0.015384615384615385 | -4.90625 |
| CELL215-IT1A | — | 6 | 6 | 3 | 2 | — | 0.551564043946783 | 0.015151515151515152 | -4.890625 |
| CELL225-IT1A | — | 7 | 7 | 4 | 1 | — | 0.547354698181215 | 0.014925373134328358 | -4.7265625 |
| CELL220-IT1A | — | 9 | 9 | 5 | 5 | — | 0.531938758945582 | 0.014492753623188406 | -4.96875 |

### Q04: device for measuring turbidity in water

Reranker không gọi khi còn dưới hai ứng viên; không gán điểm giả.

| Model | Keyword rank | Semantic rank | RRF rank | Trước rerank | Sau rerank | Keyword score | Semantic score | RRF score | BGE logit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ClariVue10 | 1 | 1 | 1 | 1 | 1 | 0.333333 | 0.723421970574197 | 0.03278688524590164 | — |
| CS120A-ST | — | 2 | 2 | — | — | — | 0.591185783451794 | 0.016129032258064516 | — |
| LWS | — | 3 | 3 | — | — | — | 0.568904586900025 | 0.015873015873015872 | — |
| SnowVue10 | — | 4 | 4 | — | — | — | 0.564364537152226 | 0.015625 | — |
| ClimaVue40 | — | 5 | 5 | — | — | — | 0.554191155606902 | 0.015384615384615385 | — |

### Q05: vibrating wire field reader

| Model | Keyword rank | Semantic rank | RRF rank | Trước rerank | Sau rerank | Keyword score | Semantic score | RRF score | BGE logit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| AVW200-ST | 1 | 3 | 2 | 2 | 1 | 0.166667 | 0.684185126895193 | 0.032266458495966696 | 0.3671875 |
| VWANALYZER | 2 | 1 | 1 | 1 | 2 | 0.166667 | 0.705565200085231 | 0.03252247488101534 | -0.0855712890625 |
| VWIRE305-XD | — | 2 | 3 | — | — | — | 0.692233376798133 | 0.016129032258064516 | — |
| CRVW3-NE | — | 4 | 4 | — | — | — | 0.647295301388078 | 0.015625 | — |
| ClimaVue40 | — | 5 | 5 | — | — | — | 0.598388420767041 | 0.015384615384615385 | — |

## Tệp bằng chứng và chạy lại

- [summary.json](summary.json): metrics, safety, regression và reranker deltas.
- [before.json](before.json), [after.json](after.json): mỗi query, nhãn, toàn bộ ranking/score và explanation.
- [failures.json](failures.json): mỗi FAIL trước sửa có expected intent, Top 5, từng tầng, classification, suspected cause, fix và regression tests.
- [stage-failures.json](stage-failures.json): 121 trường hợp một tầng riêng lẻ trượt Hit@1, kể cả khi public pipeline đã đạt; không giấu hạn chế Keyword/Semantic sau kết quả cuối.
- [http.json](http.json): response thật và latency từng request.
- [catalog.json](catalog.json), [retrieval-before.json](retrieval-before.json), [retrieval.json](retrieval.json): snapshot và retrieval gốc để tái hiện.
- 165 regression tests qua, build API và lint các module đã kiểm tra qua. Log: **output/search-stress-regression-after.log**.

~~~powershell
npm.cmd run build:shared
npm.cmd run build:api
node --test scripts/search/*.test.mjs scripts/search-evaluation/*.test.mjs scripts/search-evaluation/**/*.test.mjs scripts/create-embeddings/*.test.mjs
node --env-file=apps/api/.env scripts/search-evaluation/stress.mjs --phase=after
node --env-file=apps/api/.env scripts/search-evaluation/stress-http.mjs
node --env-file=apps/api/.env scripts/search-evaluation/stress-http.mjs --reranker --cases=Q01,Q02,Q03,Q04,Q05
node scripts/search-evaluation/stress-report.mjs
~~~

Cần Ollama và pinned BGE đang chạy để so sánh đủ bốn tầng. **--replay** tái dùng retrieval đã ghi; không đại diện cho một lượt retrieval mới. Không thay schema/dữ liệu database, không chỉnh embedding hay gán sản phẩm theo ID để pass benchmark. Đây là kiểm thử relevance và tải đồng thời 4; chưa phải đo capacity cực đại hay soak test dài hạn.
