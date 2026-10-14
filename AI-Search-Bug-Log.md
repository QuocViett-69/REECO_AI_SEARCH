# AI-Search — Bug log cho Codex

**Phạm vi:** hybrid search cho danh mục thiết bị khí tượng, thủy văn và quan trắc môi trường; giải thích lựa chọn sản phẩm bằng bằng chứng (Explainable AI).

**Ngày lập log:** 13/10/2026. **Nguồn:** 27 tình huống và ghi nhận QA do người dùng cung cấp. Chưa có repository, phiên bản build, request/response gốc, ảnh chụp hoặc log backend; tài liệu này chưa phải kết quả kiểm thử lại.

## 1. Yêu cầu bàn giao cho Codex

Đọc toàn bộ bug log, kiểm tra `AGENTS.md` và kiến trúc hiện có, sau đó tái hiện và sửa các lỗi được ghi nhận. Kiểm tra xuyên suốt: dữ liệu catalog → phân tích truy vấn → tìm kiếm từ khóa/ngữ nghĩa → hợp nhất kết quả → áp dụng ràng buộc/xếp hạng → giải thích → trạng thái hội thoại và hiển thị UI.

Không ép trả một model bằng cách hardcode câu hỏi hoặc sửa riêng danh sách kết quả. Model trong test case là ứng viên kỳ vọng của QA; chỉ dùng làm tiêu chí top-1 sau khi xác nhận model/biến thể có trong catalog và phù hợp điều kiện kỹ thuật. Nếu kỳ vọng QA sai, ghi rõ bằng chứng và điều chỉnh test; không sửa dữ liệu để tạo một kết quả đạt giả.

Các thông báo tự chẩn đoán của AI về “Exact Identity Match” và “thiếu stop words tiếng Việt” là **giả thuyết**, chưa phải nguyên nhân gốc đã được xác nhận. Codex phải kiểm tra code, query thực tế và log trước khi kết luận.

Đầu ra yêu cầu: bản sửa code/dữ liệu cần thiết, regression tests, kết quả chạy test và ghi chú nguyên nhân gốc theo từng bug ID. Phân biệt lỗi đã sửa, vấn đề dữ liệu, kỳ vọng cần sửa và tình huống còn chưa kiểm thử.

## 2. Chuẩn hóa trạng thái QA

| Test case | Nhãn ban đầu | Trạng thái sử dụng trong log | Lý do |
| --- | --- | --- | --- |
| TC-06 — Đo mưa tuyết | PASS | PARTIAL | Tìm được sản phẩm nhưng chưa giải thích cơ chế làm tan tuyết trong ngữ cảnh. |
| TC-07 — Trạm nhỏ gọn | PASS | PASS truy xuất / XAI chưa đủ bằng chứng | Ghi chú chỉ có “Giải thích”; chưa đủ dữ liệu để kết luận phần XAI đạt hoặc lỗi cụ thể. |
| TC-19 — Timeout | Failed | NOT TESTED | Chưa làm mô hình vượt quá 20 giây; trả nhanh không chứng minh lỗi fallback. |
| TC-25 — Khoảng trắng | PASS | PASS theo QA | Giữ làm regression case; Codex vẫn cần kiểm tra frontend và API. |
| TC-26 — Ký tự đặc biệt | PASS | FAIL về kết quả tìm kiếm | Thực tế vẫn có sản phẩm, trái kỳ vọng danh sách rỗng. Chưa ghi nhận lỗi cơ sở dữ liệu. |
| TC-27 — Cả hai nhánh lỗi | Chưa xác định / NOT TESTED | NOT TESTED | Chưa tái hiện lỗi đồng thời; truy vấn bình thường không xác minh được error handling. |

TC-14 đạt một phần về nhận diện nhu cầu phối hợp thiết bị. Những case có ghi chú ngắn “Giải thích” giữ ghi nhận lỗi của QA, nhưng cần thu lại response để xác định chính xác nội dung thiếu. Không tính tỷ lệ pass tổng thể từ các ghi chép này.

## 3. Danh sách lỗi và công việc kiểm chứng

P1: ảnh hưởng trực tiếp đến chọn đúng sản phẩm, đáp ứng ràng buộc hoặc độ tin cậy của dịch vụ. P2: lỗi đầu vào hoặc trải nghiệm, ưu tiên sau các lỗi chọn sản phẩm. Đây là mức ưu tiên đề xuất, chưa có dữ liệu tần suất để đánh giá mức độ trên production.

| ID | Ưu tiên | Vấn đề | Test case liên quan | Trạng thái |
| --- | --- | --- | --- | --- |
| BUG-01 | P1 | Bỏ qua ràng buộc bắt buộc và điều kiện phủ định | TC-01, TC-09, TC-20, TC-21 | OPEN theo QA |
| BUG-02 | P1 | Nhầm model đang có với sản phẩm cần mua; nhầm câu hỏi tính năng với yêu cầu tính năng | TC-10, TC-18 | OPEN theo QA |
| BUG-03 | P1 | Truy xuất tiếng Việt, cụm giao thức và khái niệm vệ tinh không ổn định | TC-11, TC-12, TC-16, TC-17 | OPEN theo QA |
| BUG-04 | P1 | Không truy xuất theo nhiệt độ và điều kiện số có đơn vị | TC-13 | OPEN theo QA |
| BUG-05 | P1 | Không phân biệt cellular, radio và satellite theo điều kiện triển khai | TC-15, TC-16, TC-17 | OPEN theo QA |
| BUG-06 | P1 | Giải thích chung, không đối chiếu nhu cầu hoặc không chứng minh được lý do xếp hạng | TC-01–TC-09, TC-12–TC-18, TC-21 | OPEN; TC-07 cần bổ sung bằng chứng |
| BUG-07 | P1 | Câu hỏi tiếp nối làm mất nhu cầu và ràng buộc trước đó | TC-01, lượt hỏi tiếp | OPEN theo QA |
| BUG-08 | P1 | Đề xuất trạm gồm nhiều thành phần chưa đầy đủ và chưa kiểm tra tương thích/nguồn điện | TC-14 | PARTIAL |
| BUG-09 | P1 | Ép trả sản phẩm cho truy vấn ngoài danh mục | TC-22, TC-23, TC-24 | OPEN theo QA |
| BUG-10 | P2 | Chuỗi chỉ gồm ký tự đặc biệt vẫn kích hoạt kết quả sản phẩm | TC-26; regression TC-25 | OPEN theo QA |
| VERIFY-01 | P1 | Chưa xác minh timeout và giải thích dự phòng | TC-19 | NOT TESTED; chưa kết luận có bug |
| VERIFY-02 | P1 | Chưa xác minh khi cả hai nhánh tìm kiếm thất bại | TC-27 | NOT TESTED; chưa kết luận có bug |

## 4. Test case chi tiết và tiêu chí nghiệm thu

### TC-01 — Đo nước thải ăn mòn mạnh

- **Query:** “Nước thải có tính ăn mòn cao cần đo mực nước bồn chứa mà không được nhúng cảm biến chìm vào chất lỏng”.
- **Kỳ vọng QA:** ưu tiên RangeVue30, giải thích đo từ phía trên bồn và không nhúng đầu đo vào hóa chất.
- **Thực tế:** CRS451-WN đứng đầu; RangeVue30 đứng thứ 3. Phần giải thích không phản ánh điều kiện “không được nhúng”. Khi hỏi tiếp thiết bị phù hợp nhất, AI chuyển sang sản phẩm khác.
- **Trạng thái:** FAIL. **Liên quan:** BUG-01, BUG-06, BUG-07.
- **Nghiệm thu:** nhận diện `contact_mode=NON_CONTACT` là ràng buộc bắt buộc; sản phẩm phải nhúng vào chất lỏng không nằm trong danh sách phù hợp. RangeVue30 đứng top-1 trong fixture đã xác nhận đủ điều kiện. Giải thích liên kết radar không tiếp xúc với nhu cầu tránh nhúng vào nước thải ăn mòn; cách lắp phải có căn cứ và xét hình học bồn, vật cản, bề mặt đo. Không suy ra thiết bị chống được mọi hóa chất chỉ từ đặc tính không tiếp xúc. Câu hỏi tiếp “cái nào phù hợp nhất?” giữ nguyên nhu cầu và ràng buộc. [S1]

### TC-02 — Đo độ ẩm đất đa tầng sâu

- **Query:** “cảm biến độ ẩm đất dạng thanh cắm nhiều tầng”.
- **Kỳ vọng QA:** ưu tiên SoilVue10-5 vì khả năng đo profile đất ở nhiều độ sâu.
- **Thực tế:** trả đúng sản phẩm nhưng giải thích chung, không gắn với dạng thanh và đo nhiều tầng.
- **Trạng thái:** FAIL về XAI. **Liên quan:** BUG-06.
- **Nghiệm thu:** nhận diện `soil_profile` và `multi_depth`; giải thích vì sao một đầu đo dạng thanh với nhiều vị trí đo đáp ứng nhu cầu, khác với cảm biến chỉ đo tại một vùng đất. Các độ sâu phải lấy từ đúng biến thể sản phẩm. [S2]

### TC-03 — Khảo sát rễ cây nhiều độ sâu

- **Query:** “Tôi cần theo dõi độ ẩm và nhiệt độ đất theo từng độ sâu 10cm 20cm 50cm ở vùng rễ cây mà không muốn đào nhiều hố”.
- **Kỳ vọng QA:** ưu tiên SoilVue10-5, giải thích các vị trí đo tích hợp và phương án lắp đặt.
- **Thực tế:** chưa giải thích các độ sâu cố định, chưa xác nhận lắp đặt đáp ứng nhu cầu; câu trả lời chủ yếu chung chung hoặc liệt kê thông số.
- **Trạng thái:** FAIL về XAI. **Liên quan:** BUG-06.
- **Nghiệm thu:** đối chiếu riêng 10, 20 và 50 cm; xác nhận đo cả độ ẩm và nhiệt độ. Với bản 0,5 m, các vị trí đo là 5, 10, 20, 30, 40 và 50 cm. Giải thích một vị trí lắp cho mỗi profile, có tạo lỗ bằng dụng cụ phù hợp; không nói hoàn toàn không cần đào/tạo lỗ, hoặc một thanh đại diện toàn bộ khu vực trồng. [S2][S3]

### TC-04 — Cân bằng nhiệt lượng trong đất

- **Query:** “Nghiên cứu nông nghiệp cần đo lượng nhiệt truyền qua bề mặt đất xuống các lớp đất sâu”.
- **Kỳ vọng QA:** HFP01, giải thích vai trò trong nghiên cứu cân bằng năng lượng vi khí hậu.
- **Thực tế:** giải thích chung, chưa liên hệ với câu hỏi.
- **Trạng thái:** FAIL về XAI. **Liên quan:** BUG-06.
- **Nghiệm thu:** giải thích HFP01 đo thông lượng nhiệt tại vị trí đặt tấm đo, là đầu vào của bài toán cân bằng năng lượng. Phân biệt thông lượng nhiệt với nhiệt độ đất và năng lượng tích lũy. Nếu cần suy ra thông lượng tại bề mặt hoặc nhiều lớp, nêu dữ liệu/bố trí bổ sung; không nói một tấm đo trực tiếp được toàn bộ profile nhiệt. [S4]

### TC-05 — Quan trắc sạt lở đồi núi

- **Query:** “Khu vực sườn đồi hay có nguy cơ sạt lở tôi cần thiết bị tự động ghi nhận lượng mưa tích lũy ngoài trời để cảnh báo lũ quét”.
- **Kỳ vọng QA:** ưu tiên RainVue10-MM, giải thích sử dụng dữ liệu mưa tích lũy trong trạm cảnh báo.
- **Thực tế:** QA ghi Failed với ghi chú “Giải thích”; chưa cung cấp response hoặc thứ hạng cụ thể.
- **Trạng thái:** FAIL theo QA, cần bổ sung bằng chứng. **Liên quan:** BUG-06.
- **Nghiệm thu:** ưu tiên thiết bị đo mưa phù hợp trong fixture; giải thích ghi nhận lượng mưa, tích lũy theo khoảng thời gian và cung cấp dữ liệu cho hệ thống cảnh báo. Không khẳng định thiết bị đo mưa tự phát hiện sạt lở hoặc tự tạo một hệ thống cảnh báo hoàn chỉnh. [S5]

### TC-06 — Đo mưa tuyết vùng băng giá

- **Query:** “Tôi cần phễu đo mưa hoạt động ở vùng núi tuyết có tuyết rơi không bị đóng băng làm nghẹt phễu”.
- **Kỳ vọng QA:** 52202, giải thích sấy nhiệt làm tan tuyết/băng.
- **Thực tế:** được ghi PASS nhưng chưa có giải thích làm tan tuyết theo ngữ cảnh.
- **Trạng thái:** PARTIAL — truy xuất đạt theo QA, XAI chưa đạt. **Liên quan:** BUG-06.
- **Nghiệm thu:** giải thích cơ chế sấy điều khiển bằng thermostat, liên hệ với tuyết/băng và nêu điều kiện nguồn sấy, dải làm việc theo tài liệu. Không cam kết chống tắc ở mọi mức lạnh; thông số hãng của 52202 là -20 đến +50 °C khi có sấy, không dùng case này để mặc định đạt -40 °C. [S6]

### TC-07 — Trạm thời tiết trang trại nhỏ gọn

- **Query:** “Trang trại muốn gắn một cảm biến trên cột đo được gió mưa nhiệt ẩm và bức xạ mặt trời nhỏ gọn tất cả trong một”.
- **Kỳ vọng QA:** ClimaVue50G2, giải thích đủ các yếu tố tích hợp.
- **Thực tế:** PASS theo QA, ghi chú chỉ có “Giải thích”.
- **Trạng thái:** PASS truy xuất / XAI chưa đủ bằng chứng. **Liên quan:** BUG-06 để kiểm chứng.
- **Nghiệm thu:** đối chiếu đủ gió, mưa, nhiệt độ, độ ẩm và bức xạ; giải thích lợi ích của một cụm cảm biến tích hợp gắn trên cột. Không suy ra đã tích hợp logger, modem và nguồn điện chỉ vì cảm biến là all-in-one. [S7]

### TC-08 — Đo bức xạ cho điện mặt trời

- **Query:** “Trạm điện mặt trời áp mái cần lắp thiết bị đo quang năng bức xạ để tính toán hiệu suất phát điện”.
- **Kỳ vọng QA:** chưa chốt model; bản gốc ghi “Hiển thị ....”, có giải thích phục vụ đánh giá hiệu suất.
- **Thực tế:** Failed, ghi chú “Giải thích”; thiếu model, thứ hạng và response.
- **Trạng thái:** FAIL theo QA; expected model còn TBD. **Liên quan:** BUG-06 và kiểm tra phân loại đại lượng.
- **Nghiệm thu:** truy xuất thiết bị đo bức xạ phù hợp cho giám sát PV, ưu tiên pyranometer trong catalog đã xác minh. Giải thích đại lượng bức xạ theo W/m² và sử dụng cùng dữ liệu công suất/điện năng để đánh giá hiệu suất. Không đồng nhất phép đo này với PAR/photon flux hoặc khẳng định chỉ một cảm biến bức xạ là tính được hiệu suất. Chốt model sau khi đọc catalog; không tự điền SKU chưa có trong dự án. [S8]

### TC-09 — Đo gió bão không dùng cánh quạt

- **Query:** “Trạm ven biển cần đo tốc độ và hướng gió chính xác cao trong bão mà không bị gãy cánh quạt cơ học”.
- **Kỳ vọng QA:** CSAT3B-NC, giải thích đo gió siêu âm không dùng cánh quạt quay.
- **Thực tế:** Failed, ghi chú “Giải thích”; chưa có response/thứ hạng để kết luận lỗi truy xuất.
- **Trạng thái:** FAIL theo QA, cần bổ sung bằng chứng. **Liên quan:** BUG-01, BUG-06.
- **Nghiệm thu:** ưu tiên cảm biến siêu âm đủ điều kiện, loại ứng viên dùng cánh quạt khi ràng buộc này là bắt buộc. Giải thích nguyên lý không có rotor quay, đồng thời kiểm tra dải gió và điều kiện độ chính xác. Không biến “không có cánh quạt” thành bảo đảm không hư hỏng hoặc luôn chính xác trong mọi cấp bão. Suffix `-NC` là biến thể không kèm hộp đựng, không phải bằng chứng tính năng chống bão. [S9]

### TC-10 — Ghép nối bus SDI-12 với CR1000X đang có

- **Query:** “Tôi có sẵn bộ ghi dữ liệu CR1000X cần mua cảm biến đo độ ẩm đất giao tiếp SDI-12 để gắn chung đường dây”.
- **Kỳ vọng QA:** CS655, giải thích kết nối SDI-12 với thiết bị đang có.
- **Thực tế:** không có CS655 trong danh sách. AI tự chẩn đoán bộ lọc exact model nhầm CR1000X là mục tiêu cần mua.
- **Trạng thái:** FAIL; nguyên nhân exact match chưa xác nhận. **Liên quan:** BUG-02.
- **Nghiệm thu:** `CR1000X` là thiết bị bối cảnh; sản phẩm cần tìm thuộc nhóm cảm biến độ ẩm đất và có SDI-12. CS655 xuất hiện/đứng đầu trong fixture hợp lệ. Giải thích ghép nối cần địa chỉ SDI-12 phù hợp, đấu dây/nguồn và giới hạn tuyến theo tài liệu; không chỉ suy luận tương thích vì hai sản phẩm cùng hãng. [S10]

### TC-11 — Cảm biến thời tiết Modbus

- **Query:** “cảm biến thời tiết giao tiếp RS-485 Modbus RTU”.
- **Kỳ vọng QA:** ClimaVue40.
- **Thực tế:** không có sản phẩm. AI tự chẩn đoán từ “giao tiếp” làm truy vấn phải khớp chính xác cụm từ do thiếu stop words tiếng Việt.
- **Trạng thái:** FAIL; nguyên nhân tokenizer/phrase match chưa xác nhận. **Liên quan:** BUG-03.
- **Nghiệm thu:** truy vấn đầy đủ và biến thể “cảm biến thời tiết RS485 Modbus” cùng nhận diện đúng loại thiết bị và cặp physical interface/protocol. ClimaVue40 được truy xuất khi dữ liệu xác nhận có RS-485 + Modbus RTU. Không yêu cầu description chứa nguyên văn toàn bộ câu tiếng Việt. [S11]

### TC-12 — Kéo dữ liệu về PLC

- **Query:** “Cần cảm biến thời tiết công nghiệp xuất tín hiệu RS-485 Modbus RTU để kéo thẳng về tủ điều khiển PLC nhà máy”.
- **Kỳ vọng QA:** ClimaVue40, giải thích tích hợp với PLC.
- **Thực tế:** không có sản phẩm.
- **Trạng thái:** FAIL. **Liên quan:** BUG-03, BUG-06.
- **Nghiệm thu:** truy xuất đúng cảm biến thời tiết công nghiệp có giao tiếp yêu cầu. Giải thích có điều kiện: PLC cần cổng/module RS-485 phù hợp, hỗ trợ vai trò Modbus master/client và cấu hình truyền thông/register tương ứng. Không nói kết nối trực tiếp với mọi PLC khi chưa biết model PLC. [S11]

### TC-13 — Vùng núi âm 40 °C

- **Query:** “Cần cảm biến đo nhiệt độ không khí có khả năng chịu lạnh âm sâu âm 40 độ C lắp đặt ở vùng núi tuyết”.
- **Kỳ vọng QA:** 109, giải thích dải -50 đến +70 °C.
- **Thực tế:** không có sản phẩm.
- **Trạng thái:** FAIL. **Liên quan:** BUG-04, BUG-06.
- **Nghiệm thu:** chuẩn hóa “âm 40”, “-40”, “−40 °C” thành điều kiện nhiệt độ, không thành mã model 40. Kiểm tra `operating_min <= -40 <= operating_max`, đồng thời đúng loại đo nhiệt độ không khí. 109 được truy xuất trong fixture hợp lệ; giải thích -40 °C nằm trong dải và nêu yêu cầu che bức xạ khi đo không khí ngoài trời. Không nhầm dải nhiệt độ lưu kho với dải vận hành. [S12]

### TC-14 — Trạm từ xa, không điện lưới, truyền 4G

- **Query:** “Tôi cần lắp trạm khí tượng trên đồi không có điện lưới tự động truyền dữ liệu về văn phòng qua mạng di động 4G”.
- **Kỳ vọng QA:** cảm biến thời tiết + CR300 + CELL210-V.
- **Thực tế:** hiểu một phần nhu cầu phối hợp nhiều thành phần, nhưng chưa trả đúng ba thiết bị kỳ vọng.
- **Trạng thái:** PARTIAL. **Liên quan:** BUG-08, BUG-06.
- **Nghiệm thu:** trả cấu hình theo vai trò: cảm biến thời tiết, logger, module cellular tương thích; giải thích luồng đo → ghi dữ liệu → truyền 4G. Điều kiện không điện lưới phải có phương án nguồn độc lập và nêu thông tin công suất/thời gian tự chủ còn thiếu. Ba thiết bị trên chưa đủ để giải quyết nguồn điện. CR300/CELL210-V chỉ là ứng viên QA: CELL210-V được hãng định danh cho Verizon US, nên phải xét thị trường/nhà mạng và tương thích trước khi chốt; không bắt buộc model này cho mọi nơi triển khai. [S13]

### TC-15 — Radio khi không có sóng di động

- **Query:** “Trạm đo đặt ở thung lũng sâu không có sóng di động 4G cần truyền dữ liệu về trạm mẹ cách 5km bằng sóng vô tuyến”.
- **Kỳ vọng QA:** RF407, giải thích không phụ thuộc mạng di động và truyền xa.
- **Thực tế:** ưu tiên CELL205-AT, CELL220-IT1A; chưa xác nhận phương án không phụ thuộc cellular hoặc cự ly truyền.
- **Trạng thái:** FAIL. **Liên quan:** BUG-05, BUG-06.
- **Nghiệm thu:** không đưa cellular-only vào phương án phù hợp. Truy xuất radio phù hợp, RF407 là ứng viên trong fixture; giải thích liên kết với trạm mẹ và điều kiện anten, địa hình, tầm nhìn, thiết bị ở hai đầu. Không cam kết 5 km trong thung lũng chỉ từ danh mục sản phẩm; RF407 yêu cầu line-of-sight và cần đánh giá tuyến truyền. [S14]

### TC-16 — Modem truyền dữ liệu vệ tinh

- **Query:** “thiết bị truyền thông qua vệ tinh cho trạm quan trắc từ xa”.
- **Kỳ vọng QA:** TX325.
- **Thực tế:** chưa trả đúng thiết bị; giải thích chỉ xác nhận truyền dữ liệu nói chung, không xác nhận vệ tinh.
- **Trạng thái:** FAIL. **Liên quan:** BUG-03, BUG-05, BUG-06.
- **Nghiệm thu:** nhận diện `transmission=SATELLITE`, truy xuất TX325 khi có trong catalog và gắn bằng chứng loại satellite/GOES. Giải thích cần kiểm tra vùng phủ, điều kiện truy cập dịch vụ và tích hợp logger trước khi kết luận phù hợp. TX325 không phải giải pháp vệ tinh toàn cầu mặc định. [S15]

### TC-17 — Quan trắc ngoài biển khơi

- **Query:** “Cần thiết bị phát dữ liệu thời tiết ở giữa biển khơi xa bờ không có bất kỳ mạng viễn thông mặt đất nào”.
- **Truy vấn bổ sung đã thử:** “Truyền dữ liệu qua vệ tinh”; “satellite data transmission”.
- **Kỳ vọng QA:** TX325, giải thích phát gói dữ liệu lên vệ tinh quan trắc.
- **Thực tế:** truy vấn tiếng Việt không tìm được hoặc chỉ ra thiết bị truyền dữ liệu chung; tiếng Anh mới tìm được TX325.
- **Trạng thái:** FAIL. **Liên quan:** BUG-03, BUG-05, BUG-06.
- **Nghiệm thu:** suy ra nhu cầu truyền không dựa vào mạng mặt đất và ưu tiên lớp giải pháp vệ tinh; hai truy vấn Việt/Anh truy xuất cùng tập ứng viên phù hợp trong fixture. Model cuối cùng phụ thuộc tọa độ/vùng phủ, năng lượng và lắp đặt ngoài biển. Với TX325, nêu giới hạn GOES thay vì khẳng định dùng được ở mọi vùng biển. [S15]

### TC-18 — Trung thực về Wi-Fi của CS655

- **Query:** “Cảm biến CS655 có hỗ trợ kết nối mạng không dây wifi không”.
- **Kỳ vọng QA gốc:** tìm CS655, trả lời không có Wi-Fi và dùng SDI-12 hoặc RS-485.
- **Thực tế:** không có sản phẩm.
- **Trạng thái:** FAIL. **Liên quan:** BUG-02, BUG-06.
- **Nghiệm thu đã hiệu chỉnh:** vẫn truy xuất đúng CS655; đây là câu hỏi kiểm tra tính năng, không phải điều kiện chỉ tìm sản phẩm có Wi-Fi. Tài liệu hãng ghi SDI-12 và serial RS-232, không phải RS-485. Giải thích đúng giao tiếp có dây; không tự thêm Wi-Fi tích hợp. Nếu nói tới kết nối không dây qua phụ kiện ngoài, phải phân biệt rõ phụ kiện với tính năng của đầu đo. [S10]

### TC-19 — Timeout giải thích

- **Thao tác QA:** gửi câu hỏi phức tạp, kỳ vọng mô hình xử lý quá 20 giây.
- **Kỳ vọng:** giữ kết quả tìm kiếm; dùng mẫu giải thích dự phòng và ghi nhận timeout.
- **Thực tế:** trả kết quả nhanh, chưa tái hiện timeout.
- **Trạng thái:** NOT TESTED. **Liên quan:** VERIFY-01.
- **Nghiệm thu:** dùng dependency injection/fake clock để cho nhánh giải thích vượt deadline 20 giây hoặc treo; retrieval thành công vẫn được trả đúng. Fallback có nội dung bám dữ liệu xác minh, cờ timeout và log nội bộ. Request không tiếp tục chờ mô hình treo; xử lý hủy tài nguyên và kết quả đến muộn. Không đánh dấu PASS chỉ vì câu hỏi phức tạp vẫn trả nhanh.

### TC-20 — Không dùng Modbus

- **Query:** “bộ ghi dữ liệu không dùng Modbus”.
- **Kỳ vọng QA:** trả logger không bắt buộc sử dụng/cấu hình Modbus.
- **Thực tế:** vẫn trả sản phẩm QA đánh giá là bắt buộc cấu hình Modbus; chưa có danh sách model để đối chiếu.
- **Trạng thái:** FAIL theo QA. **Liên quan:** BUG-01.
- **Nghiệm thu:** phân biệt “có hỗ trợ Modbus” với “bắt buộc dùng Modbus”. Không tự loại logger đa giao thức chỉ vì catalog có chữ Modbus nếu có đường kết nối phù hợp khác. Loại ứng viên thực sự bắt buộc dùng Modbus khi điều kiện này được xác nhận. Nếu catalog không đủ dữ liệu, đánh dấu chưa xác minh hoặc yêu cầu làm rõ, không tuyên bố sản phẩm chắc chắn đáp ứng.

### TC-21 — Cảm biến đất có dây, tránh Wi-Fi

- **Query:** “cảm biến đo độ ẩm đất không dùng wifi vì sợ mất kết nối”.
- **Kỳ vọng QA:** CS655 có dây, không có sản phẩm dùng bộ thu phát không dây trong nhóm đáp ứng.
- **Thực tế:** không đúng sản phẩm; giải thích tập trung vào logger, không xác nhận kết nối của cảm biến hoặc điều kiện loại trừ.
- **Trạng thái:** FAIL. **Liên quan:** BUG-01, BUG-06.
- **Nghiệm thu:** đúng loại cảm biến độ ẩm đất, nhận diện tránh Wi-Fi và ưu tiên kết nối có dây; CS655 là ứng viên phù hợp trong fixture. Phân biệt “không Wi-Fi” với “không mọi loại radio”: nếu yêu cầu nghiệp vụ là chỉ có dây, biểu diễn riêng `connection=WIRED` hoặc làm rõ, không âm thầm mở rộng phủ định. Giải thích nối dây giảm phụ thuộc liên kết vô tuyến nhưng không đảm bảo tuyệt đối không mất kết nối. [S10]

### TC-22 — Thiết bị y tế ngoài danh mục

- **Query:** “Tôi bị tăng huyết áp cần tư vấn máy đo huyết áp bắp tay tự động Omron”.
- **Kỳ vọng:** không có sản phẩm; thông báo ngoài danh mục thiết bị quan trắc môi trường.
- **Thực tế:** vẫn có sản phẩm.
- **Trạng thái:** FAIL. **Liên quan:** BUG-09.
- **Nghiệm thu:** `results=[]`, thông báo rõ phạm vi danh mục; không gán cảm biến áp suất công nghiệp thành máy đo huyết áp và không phát sinh tư vấn y tế từ luồng tìm kiếm sản phẩm.

### TC-23 — Đồ gia dụng nhà bếp

- **Query:** “Tìm mua máy lọc nước gia đình 9 lõi lọc Kangaroo”.
- **Kỳ vọng:** kết quả rỗng; làm rõ phạm vi nhu cầu.
- **Thực tế:** vẫn trả kết quả.
- **Trạng thái:** FAIL. **Liên quan:** BUG-09.
- **Nghiệm thu:** không gán từ “nước” thành nhu cầu cảm biến mực nước/chất lượng nước; kết quả rỗng và thông báo ngoài danh mục.

### TC-24 — Điện tử tiêu dùng

- **Query:** “điện thoại thông minh chụp ảnh đẹp pin trâu”.
- **Kỳ vọng:** kết quả rỗng, hướng dẫn tìm thiết bị đo đạc môi trường.
- **Thực tế:** vẫn trả kết quả.
- **Trạng thái:** FAIL. **Liên quan:** BUG-09.
- **Nghiệm thu:** không ép lấy top-k từ vector search khi ứng viên đều không liên quan; trả rỗng với thông báo phạm vi phù hợp.

### TC-25 — Chuỗi rỗng/khoảng trắng

- **Query:** ô tìm kiếm chỉ có khoảng trắng.
- **Kỳ vọng:** từ chối xử lý và yêu cầu nhập nội dung hợp lệ.
- **Thực tế:** không cho tìm kiếm.
- **Trạng thái:** PASS theo QA, chưa kiểm tra API độc lập.
- **Regression:** trim đầu vào; kiểm tra rỗng, khoảng trắng, tab, newline ở cả frontend và backend; không gọi retrieval/LLM. API trả lỗi validation theo contract hiện có, không lỗi server.

### TC-26 — Chuỗi ký tự đặc biệt

- **Query:** `!@#$%^&*`.
- **Kỳ vọng:** danh sách rỗng an toàn, không lỗi cơ sở dữ liệu/dịch vụ.
- **Thực tế:** vẫn trả sản phẩm dù nhãn gốc là PASS.
- **Trạng thái:** FAIL về kết quả. **Liên quan:** BUG-10.
- **Nghiệm thu:** đầu vào không có ký tự chữ/số có ý nghĩa không tạo danh sách gợi ý sản phẩm. Trả rỗng hoặc validation message theo contract UI/API thống nhất, không lỗi DB/server. Không xóa dấu nối trong model/giao thức, ký hiệu âm trong nhiệt độ hoặc ký hiệu độ/đơn vị của truy vấn hợp lệ.

### TC-27 — Cả hai nguồn tìm kiếm thất bại

- **Thao tác yêu cầu:** giả lập mất kết nối cả nhánh từ khóa và nhánh ngữ nghĩa.
- **Kỳ vọng:** thông báo dịch vụ tạm gián đoạn, mã lỗi công khai an toàn; không lộ thông tin máy chủ.
- **Thực tế:** truy vấn bình thường vẫn có kết quả; chưa gây được lỗi đồng thời.
- **Trạng thái:** NOT TESTED. **Liên quan:** VERIFY-02.
- **Nghiệm thu:** inject lỗi cả hai adapter, xác nhận trạng thái unavailable và mã lỗi công khai ổn định; UI có thông báo thử lại. Không trả `success + []` để giả thành không tìm thấy sản phẩm, không bịa danh sách bằng LLM. Kiểm tra riêng từng nhánh lỗi: còn nhánh khỏe thì xử lý degraded theo contract và vẫn áp dụng ràng buộc. Hai nhánh khỏe nhưng không tìm thấy khác với hai nhánh lỗi. Response không chứa stack trace, SQL, endpoint nội bộ hoặc thông tin xác thực.

## 5. Hướng sửa cho từng nhóm lỗi

### BUG-01 — Ràng buộc và phủ định

**Điều tra:** câu truy vấn gốc, kết quả phân tích intent, điều kiện query/filter của từng nhánh và danh sách sau fusion. Xác định điều kiện bị mất lúc nào; chưa giả định chỉ chỉnh trọng số là đủ.

**Hướng sửa:** tách loại sản phẩm, điều kiện bắt buộc, ưu tiên mềm và điều kiện loại trừ. Bảo toàn “không”, “không muốn”, “không được”, “không có” khi xử lý tiếng Việt. Ràng buộc bắt buộc phải được kiểm tra trước khi một sản phẩm được công bố là phù hợp; điểm ngữ nghĩa cao không bù được vi phạm. Xác thực lại sau fusion/reranking để chặn ứng viên lọt từ nhánh khác.

**Nghiệm thu:** cảm biến chìm không được gắn nhãn phù hợp trong TC-01; thiết bị dùng rotor không đạt ràng buộc TC-09; TC-20 phân biệt Modbus tùy chọn/bắt buộc; TC-21 giữ đúng nhóm cảm biến và yêu cầu kết nối. Giá trị metadata chưa biết không bị coi là đã đáp ứng hoặc đã chứng minh không hỗ trợ.

### BUG-02 — Vai trò model và ý định câu hỏi

**Điều tra:** nhánh exact model match có short-circuit toàn truy vấn không; model được gán vai trò theo ngữ cảnh hay chỉ regex; câu hỏi có/không hỗ trợ tính năng có bị chuyển thành filter dương không.

**Hướng sửa:** phân loại entity là `target_product`, `existing_equipment`, `compatibility_context` hoặc `excluded_product`; phân biệt `recommendation` và `capability_question`. Chỉ exact-match cứng khi model thực sự là mục tiêu truy xuất. Cho phép truy xuất một sản phẩm để trả lời trung thực về tính năng mà sản phẩm không có.

**Nghiệm thu:** TC-10 trả cảm biến thay vì chỉ CR1000X; TC-18 tìm CS655 rồi trả lời về Wi-Fi; truy vấn trực tiếp “CS655” vẫn giữ khả năng exact match.

### BUG-03 — Hybrid search và truy vấn tiếng Việt

**Điều tra:** analyzer/tokenizer, AND/phrase match, aliases, trường được index, nội dung đưa vào embedding, ngôn ngữ embedding và cách hợp nhất/xếp hạng. Ghi lại sự khác biệt giữa query Việt và Anh; kiểm tra sản phẩm có thật trong index trước khi chỉnh thuật toán.

**Hướng sửa:** chuẩn hóa Unicode, tên model và biến thể `RS485`/`RS-485`, `SDI12`/`SDI-12`. Bổ sung alias kỹ thuật Việt–Anh theo dữ liệu xác minh: vệ tinh/satellite/GOES, bộ ghi dữ liệu/data logger, độ ẩm đất/soil moisture. Index loại sản phẩm, đại lượng, nguyên lý, giao tiếp và phương thức truyền, không chỉ description ngắn. Query expansion không được xóa ràng buộc hoặc thay đổi phủ định. “Giao tiếp” có thể là quan hệ có nghĩa; không mặc định xóa như stop word.

**Nghiệm thu:** TC-11/12 truy xuất ClimaVue40; TC-16/17 truy xuất lớp satellite và TX325 trong fixture hợp lệ; query tương đương không phụ thuộc việc description chứa nguyên văn câu tiếng Việt. Kiểm tra điểm BM25/vector có được hợp nhất phù hợp thay vì cộng trực tiếp các thang điểm khác nhau; sửa theo kiến trúc repo, không bắt buộc đổi search engine.

### BUG-04 — Điều kiện số và đơn vị

**Hướng sửa:** chuẩn hóa số âm, °C, cm/m và khoảng đo thành điều kiện cấu trúc; tách nhiệt độ vận hành, đo và lưu kho. Model số như `109` phải nằm trong lookup model, không được suy ra từ mọi con số trong query.

**Nghiệm thu:** TC-13 nhận diện -40 °C và kiểm tra bao hàm trong dải vận hành. TC-03 giữ riêng danh sách độ sâu yêu cầu, không biến thành một độ sâu tối đa duy nhất. Thông số thiếu không được suy đoán để cho đạt.

### BUG-05 — Phương thức truyền thông

**Hướng sửa:** dùng metadata phân biệt Wi-Fi, cellular, radio và satellite; tách physical interface SDI-12/RS-485/RS-232 khỏi transport, và giao thức Modbus khỏi chuẩn điện RS-485. Biểu diễn khả dụng mạng, khoảng cách, vùng phủ và điều kiện triển khai riêng.

**Nghiệm thu:** TC-15 không chọn cellular-only; TC-16/17 không giải thích chung “truyền dữ liệu”. Radio 5 km và satellite phải đi kèm điều kiện có bằng chứng; thiếu địa hình/tọa độ thì nêu chưa xác minh, không bịa bảo đảm.

### BUG-06 — Explainable AI có căn cứ

**Điều tra:** prompt giải thích có nhận query gốc, ràng buộc, metadata và trace xếp hạng hay chỉ nhận tên/description. Kiểm tra explanations có thật sự thuộc product ID đang hiển thị, có bị cache sai query hoặc render mất đoạn hay không.

**Hướng sửa:** tạo explanation từ bảng đối chiếu nhu cầu ↔ bằng chứng sản phẩm ↔ kết luận đáp ứng. LLM chỉ diễn đạt bằng chứng được cung cấp; không tự quyết định tính năng hay dựng lý do xếp hạng. Validate model/product ID, bằng chứng và mâu thuẫn trước khi render; nếu không đủ căn cứ, dùng template hoặc nêu giới hạn.

**Nghiệm thu:** giải thích nêu được điều kiện quyết định của từng case, không chỉ kể thông số; không gắn lý do của logger vào cảm biến; không nói hỗ trợ tính năng chỉ để chiều câu hỏi. Trace nội bộ cho thấy ứng viên đến từ nhánh nào, thứ hạng/điểm thực tế, kết quả constraint checks và phiên bản dữ liệu. Không gọi một đoạn văn do LLM tự tạo là bằng chứng đã áp dụng XAI hoặc là feature importance/SHAP của hệ thống.

### BUG-07 — Hội thoại tiếp nối

**Hướng sửa:** giữ structured intent, constraints và candidate IDs trong phạm vi phiên hội thoại; xử lý tham chiếu “cái nào”, “phù hợp nhất” trên nhu cầu đang hoạt động. Khi người dùng đổi rõ yêu cầu, cập nhật đúng trường và xử lý mâu thuẫn thay vì giữ ràng buộc cũ mãi.

**Nghiệm thu:** chuỗi TC-01 → “cái nào phù hợp nhất?” vẫn chọn ứng viên non-contact đủ điều kiện và giải thích vì sao. Phiên khác không thừa kế nhu cầu này. Thêm test người dùng đổi sang chấp nhận cảm biến chìm để xác nhận cập nhật trạng thái.

### BUG-08 — Cấu hình gồm nhiều thiết bị

**Hướng sửa:** nhận diện nhu cầu hệ thống, phân rã vai trò thành phần, tìm ứng viên cho từng vai trò và kiểm tra tương thích/giao tiếp/nguồn. Không xem một model có điểm cao là lời giải đủ cho cả trạm.

**Nghiệm thu:** TC-14 có cảm biến, logger, đường truyền 4G phù hợp và phương án năng lượng hoặc thông tin còn thiếu để thiết kế nguồn. Phân biệt thành phần đã xác minh với đề xuất chưa xác minh. Không ép CR300 + CELL210-V nếu bối cảnh kỹ thuật/thị trường không phù hợp.

### BUG-09 — Ngoài danh mục và quyền trả rỗng

**Hướng sửa:** bổ sung/kiểm tra domain routing và điều kiện đủ liên quan trước khi công bố kết quả. Vector top-k luôn tìm được hàng xóm gần nhất không có nghĩa đó là một sản phẩm phù hợp. Ngưỡng điểm phải hiệu chỉnh trên tập truy vấn in-domain/out-of-domain, không chọn ngưỡng tùy ý để đạt riêng ba câu mẫu.

**Nghiệm thu:** TC-22/23/24 trả rỗng với thông báo đúng phạm vi. Thêm positive controls như cảm biến áp suất, quan trắc chất lượng nước và modem để tránh chặn nhầm truy vấn hợp lệ có từ vựng gần nhau.

### BUG-10 — Đầu vào không có nội dung tìm kiếm

**Hướng sửa:** validate đầu vào trước retrieval/LLM ở frontend và backend. Chuẩn hóa phải bảo toàn mã model, dấu âm và đơn vị; không dùng một bộ lọc ký tự thô làm hỏng truy vấn kỹ thuật.

**Nghiệm thu:** TC-26 không trả sản phẩm; TC-25 tiếp tục đạt; query `CSAT3B-NC`, `RS-485`, `-40 °C` vẫn được xử lý hợp lệ. Lỗi validation và lỗi backend có contract riêng.

## 6. Contract giải thích và quan sát đề xuất

Đây là cấu trúc gợi ý để ánh xạ vào schema hiện có, không phải khẳng định repo đã dùng các tên trường này.

| Thành phần | Nội dung cần có | Mục đích |
| --- | --- | --- |
| Parsed intent | Loại câu hỏi, sản phẩm mục tiêu, thiết bị đang có, required/excluded/preferred constraints | Tách nhu cầu mua với bối cảnh và phủ định. |
| Product evidence | Thuộc tính, giá trị, model/variant, nguồn/version | Kiểm chứng tính năng và thông số. |
| Requirement match | Từng điều kiện với `MATCH`, `PARTIAL`, `MISMATCH`, `UNKNOWN` | Không nhầm thiếu dữ liệu với đáp ứng. |
| Retrieval trace | Nhánh từ khóa/ngữ nghĩa, thứ hạng/điểm, fusion/reranking thực tế | Chứng minh nguồn gốc kết quả; không bịa số phần trăm phù hợp. |
| Explanation | Lý do theo ngữ cảnh, điều kiện lắp đặt/tương thích cần thiết, thông tin chưa biết | Trả lời đúng tình huống, tránh kể thông số chung. |
| Degraded state | Trạng thái từng nhánh, explanation mode và fallback reason | Phân biệt timeout, lỗi nguồn và không tìm thấy. |

Ví dụ phân tích TC-10, chỉ minh họa contract:

```json
{
  "intent": "recommendation",
  "target_category": "soil_moisture_sensor",
  "existing_equipment": [{"model": "CR1000X"}],
  "required_constraints": [{"field": "protocol", "value": "SDI-12"}]
}
```

Với TC-18, intent phải là `capability_question`, target model là `CS655`, thuộc tính hỏi là `wifi`; sự xuất hiện của “wifi” không tự tạo `required_constraints: wifi=true`.

Giải thích user-facing thường chỉ cần 2–4 câu: nêu nhu cầu quyết định, bằng chứng đáp ứng và điều kiện còn cần xác minh. Trace chi tiết giữ ở công cụ quan sát dành cho kỹ thuật; UI không cần hiển thị toàn bộ điểm và dữ liệu debug.

Ví dụ kỳ vọng cho TC-03, dựa trên tài liệu hãng: “SoilVue10-5 phù hợp để theo dõi profile vùng rễ vì bản 0,5 m đo độ ẩm và nhiệt độ ở các độ sâu cố định, bao gồm 10, 20 và 50 cm bạn yêu cầu. Mỗi profile sử dụng một vị trí lắp có tạo lỗ phù hợp, giúp tránh bố trí nhiều đầu đo rời ở các hố khác nhau. Cần lắp đúng hướng dẫn để các vị trí đo nằm đúng độ sâu và tiếp xúc tốt với đất.” [S2][S3]

## 7. Kiểm thử timeout và lỗi nguồn

| Tình huống inject trong môi trường test | Kết quả phải xác minh |
| --- | --- |
| Retrieval thành công; explanation vượt 20 giây | Trả đúng results; chuyển template bám dữ liệu; timeout flag/log; không chờ promise treo. |
| Explanation ném lỗi hoặc trả dữ liệu không hợp lệ | Giữ kết quả retrieval; fallback rõ trạng thái; không hiển thị giải thích sai product hoặc thiếu căn cứ. |
| Keyword branch lỗi, semantic khỏe | Degraded theo contract; ràng buộc vẫn được kiểm tra; không báo cả dịch vụ unavailable. |
| Semantic branch lỗi, keyword khỏe | Tương tự; không bỏ ràng buộc hoặc tự sinh sản phẩm. |
| Cả hai branch lỗi | Public error code ổn định, trạng thái unavailable và thông báo thử lại. Ví dụ 503/`SEARCH_SERVICE_UNAVAILABLE` nếu phù hợp contract hiện có. |
| Cả hai branch khỏe, không có ứng viên đủ điều kiện | Không lỗi dịch vụ; results rỗng và thông báo không có sản phẩm phù hợp. |
| Một hoặc cả hai branch timeout | Deadline hữu hạn; phân biệt nhánh đã timeout với nhánh trả rỗng thành công. |

Dùng mock adapter/dependency injection và fake clock để lỗi xảy ra xác định. Ghi tổng budget request theo API hiện có và deadline riêng cho mô hình giải thích; 20 giây của mô hình không tự đồng nghĩa 20 giây cho toàn bộ pipeline. Fault injection chỉ phục vụ kiểm thử, không thêm endpoint debug công khai trên production.

## 8. Dữ liệu và kỳ vọng kỹ thuật cần kiểm tra trước khi chốt test

| Điểm cần xác minh | Hiệu chỉnh/yêu cầu |
| --- | --- |
| CS655 | Nguồn hãng ghi SDI-12 và serial RS-232; sửa kỳ vọng RS-485. Không nhầm giao tiếp của cảm biến với mạng không dây qua phụ kiện. [S10] |
| SoilVue10-5 | Biến thể 0,5 m có các độ sâu 5/10/20/30/40/50 cm; không dùng độ sâu của bản khác. Việc lắp vẫn cần tạo lỗ đúng hướng dẫn. [S2][S3] |
| RangeVue30 | Không tiếp xúc đáp ứng điều kiện không nhúng; khả năng lắp cho bồn/hóa chất cụ thể cần xác minh thêm, không biến thành tuyên bố kháng mọi hóa chất. [S1] |
| HFP01 | Đo thông lượng tại vị trí đặt tấm; thông lượng bề mặt và profile nhiều lớp có thể cần dữ liệu/thiết bị bổ sung. [S4] |
| 52202 | Có sấy làm tan băng/tuyết và yêu cầu nguồn sấy; dải -20 đến +50 °C khi có sấy khác với case cảm biến nhiệt độ ở -40 °C. [S6] |
| CSAT3B-NC | `-NC` là không kèm hộp đựng. Dải gió toàn thang và điều kiện hãng công bố độ chính xác là hai thông số khác nhau; kiểm tra trước khi kết luận thích hợp gió bão. [S9] |
| CELL210-V | Cấu hình cho Verizon US; chọn modem theo nơi triển khai/nhà mạng. Không ép đúng SKU nếu chưa có bằng chứng tương thích. [S13] |
| RF407 và 5 km | Cần line-of-sight, bố trí anten và đánh giá tuyến; thung lũng sâu không tự bảo đảm truyền được 5 km. [S14] |
| TX325 | Là thiết bị GOES; hãng mô tả phạm vi ở Tây Bán Cầu. Kỳ vọng truy xuất vệ tinh hợp lệ không đồng nghĩa thích hợp mọi vùng biển hoặc Việt Nam. [S15] |
| Solar case | Chưa có expected SKU; chốt ứng viên pyranometer từ catalog và bằng chứng ứng dụng PV, phân biệt với quantum/PAR sensor. [S8] |
| “Không dùng Modbus” | Không đồng nghĩa loại mọi thiết bị có hỗ trợ Modbus; cần biết giao thức bắt buộc hay tùy chọn. |

Nếu metadata thiếu, Codex cần lập danh sách bản ghi/thuộc tính thiếu, bổ sung có nguồn, cập nhật index/embedding tương ứng và kiểm tra lại. Không mặc định các thuộc tính chưa biết là `false`. Mọi thay đổi catalog/index phải gắn version để kết quả QA có thể tái hiện.

## 9. Thứ tự thực hiện và điều kiện đóng log

1. Thu lại response, thứ hạng, parsed intent và trace cho các case FAIL; kiểm tra target model có trong dữ liệu và chốt các expected có điều kiện.
2. Sửa intent/entity roles, ràng buộc/phủ định, routing ngoài danh mục và validation đầu vào.
3. Sửa metadata/indexing, truy xuất tiếng Việt, điều kiện số và cách fusion/reranking nếu bằng chứng chỉ ra lỗi ở các bước này.
4. Sửa giải thích có căn cứ, hội thoại tiếp nối và đề xuất cấu hình nhiều thành phần.
5. Kiểm chứng timeout/degraded/error handling bằng fault injection; sửa nếu test phát hiện lỗi.
6. Chạy regression cho toàn bộ 27 case cùng biến thể ngôn ngữ, positive controls và test ràng buộc đối nghịch.

Không dùng golden sentence buộc LLM trả nguyên văn để đánh giá XAI. Kiểm tra nội dung/thuộc tính cốt lõi và nguồn bằng chứng; giữ test retrieval/ràng buộc xác định với catalog fixture đã kiểm chứng. Không mock toàn bộ hệ tìm kiếm để chỉ chứng minh fixture trả model mong muốn. Nếu có dataset/đường chạy tích hợp thực tế, xác minh ranking trên đường chạy đó và báo rõ phạm vi được kiểm tra.

Để đóng một lỗi, báo cáo phải có:

- Bug ID và file/component đã sửa.
- Nguyên nhân gốc được xác nhận bằng code/log; tách khỏi giả thuyết ban đầu.
- Test chứng minh lỗi trước sửa và hành vi sau sửa, cùng version dữ liệu/model/index liên quan.
- Kết quả nghiệm thu truy xuất, ràng buộc và XAI riêng biệt; model đúng nhưng giải thích sai không được đánh PASS toàn bộ.
- Những case chưa kiểm thử hoặc cần thêm thông tin triển khai vẫn giữ trạng thái phù hợp, không tự chuyển PASS.

## 10. Nguồn kỹ thuật để hiệu chỉnh kỳ vọng

Các nguồn dưới đây được đối chiếu ngày 13/10/2026; không thay thế catalog đang chạy của dự án. Khi khác biệt, Codex cần kiểm tra model/variant và phiên bản tài liệu.

- [S1 — RangeVue30, Campbell Scientific](https://www.campbellsci.com/products/rangevue30)
- [S2 — SoilVue10: specifications, Campbell Scientific](https://help.campbellsci.com/soilvue10/soilvue10/specifications.htm)
- [S3 — SoilVue10: field installation, Campbell Scientific](https://help.campbellsci.com/soilvue10/soilvue10/field-installation.htm)
- [S4 — HFP01, Campbell Scientific](https://us.campbellsci.com/hfp01); [manual: heat flux and storage](https://s.campbellsci.com/documents/br/manuals/retired/hfp01.pdf)
- [S5 — RainVue10, Campbell Scientific](https://www.campbellsci.com/products/rainvue10); [RainVue-MM: accumulation measurements](https://help.campbellsci.com/aspen10/aspen/recipes/rainvue-mm.htm)
- [S6 — 52202, Campbell Scientific](https://www.campbellsci.com/products/pn52202)
- [S7 — ClimaVue50 G2: introduction, Campbell Scientific](https://help.campbellsci.com/climavue50g2/climavue-series/introduction.htm)
- [S8 — Solar radiation sensor types, Campbell Scientific](https://www.campbellsci.com/solar-radiation); [SR05: irradiance and PV monitoring](https://www.campbellsci.com/products/sr05)
- [S9 — CSAT3B and configuration variants, Campbell Scientific](https://www.campbellsci.com/products/csat3b)
- [S10 — CS655, Campbell Scientific](https://www.campbellsci.com/products/cs655); [electrical specifications](https://help.campbellsci.com/cs650-cs655/cs650-cs655/specifications/electrical-specifications.htm)
- [S11 — ClimaVue40, Campbell Scientific](https://us.campbellsci.com/climavue40)
- [S12 — 109, Campbell Scientific](https://www.campbellsci.com/products/109)
- [S13 — CELL210 configuration variants, Campbell Scientific](https://www.campbellsci.com/products/cell210)
- [S14 — RF407, Campbell Scientific](https://www.campbellsci.com/products/rf407); [RF407 series manual](https://s.campbellsci.com/documents/fr/manuals/rf407-series.pdf)
- [S15 — TX325, Campbell Scientific](https://www.campbellsci.com/products/tx325)
