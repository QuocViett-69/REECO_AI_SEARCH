# Kiểm thử lại AI Search — 31/10/2026

Phạm vi: 22 ca người dùng gửi, gồm 21 truy vấn thông thường và TC70 cần giả lập timeout. Kiểm thử chạy trên API local với Supabase thật từ cấu hình hiện có. Không cập nhật dữ liệu hay triển khai lên hosting.

## Những lỗi đã sửa

- Nhánh từ khóa dự phòng dùng cụm `weather instrument`, `communication equipment` quá hẹp. Khi nhánh ngữ nghĩa không sẵn sàng, ClimaVue40, RF407 và TX325 bị bỏ sót dù có trong catalog. Đã mở rộng bằng từ vựng thời tiết, modem, vô tuyến, vệ tinh và mạng di động; bộ lọc yêu cầu kỹ thuật vẫn chạy sau truy xuất.
- Đo mưa ưu tiên cảm biến mưa chuyên dụng có SDI-12 trước trạm đa chức năng. Không chèn sản phẩm ngoài tập ứng viên truy xuất.
- Giải thích tiếng Việt không còn chép đoạn tiếng Anh về dải đo gió hoặc thông số mưa vào câu trả lời theo tình huống. Thông số gốc và nguồn vẫn nằm trong `evidence`.
- Giải thích đầu đo nhiều tầng nêu các vị trí đo cố định trên thanh, giảm số hố lắp đặt; HFP01 nêu thông lượng nhiệt W/m² và cân bằng năng lượng vi khí hậu; SDI-12 nêu chia sẻ bus với địa chỉ riêng.
- CS655 trả lời rõ không kết nối Wi-Fi trực tiếp, cần bộ ghi hoặc bộ chuyển đổi ngoài nếu muốn đưa dữ liệu lên Wi-Fi.
- Truy vấn ngoài danh mục trả danh sách rỗng và hướng dẫn nêu đại lượng môi trường cần đo.
- Siết kiểm tra model đứng đầu, yêu cầu CELL210-V thực sự xuất hiện ở TC42, và ghi riêng trạng thái thiếu CR300. Không dùng kiểm tra đủ nhóm chức năng để tính TC42 đạt.

## Kết quả theo mã TC gốc

| TC | Kết quả | Bằng chứng / giới hạn |
|---|---|---|
| TC08 | PASS | RangeVue30 đứng đầu; giải thích không nhúng vào chất lỏng. Câu hỏi tiếp “cái nào phù hợp nhất?” giữ RangeVue30. |
| TC13 | PASS | SoilVue10-5 đứng đầu; giải thích đầu đo nhiều tầng trên cùng thanh. |
| TC14 | PASS | SoilVue10-5; xác nhận các độ sâu 10, 20, 50 cm và vẫn cần tạo lỗ lắp đúng kỹ thuật. |
| TC20 | PASS | HFP01; thông lượng nhiệt W/m², cân bằng năng lượng và hiệu chỉnh nhiệt tích trữ khi suy ra thông lượng bề mặt. |
| TC22 | PASS | RainVue10-MM đứng đầu; giải thích mưa tích lũy, bộ ghi và ngưỡng cảnh báo bằng tiếng Việt. |
| TC28 | PASS | Có CS301; phân biệt bức xạ W/m² với thông lượng photon quang hợp khi đánh giá điện mặt trời. |
| TC30 | PASS | CSAT3B-NC đứng đầu; giải thích siêu âm, không có bộ phận quay cơ học; không cam kết chịu mọi cơn bão. |
| TC32 | PASS | Có CS655; model bộ ghi đã sở hữu không thay thế mục tiêu mua cảm biến. Giải thích bus SDI-12, địa chỉ và đấu dây. |
| TC33 | PASS | ClimaVue40, đúng RS-485 và Modbus RTU. |
| TC34 | PASS | ClimaVue40; nêu điều kiện cổng RS-485 và cấu hình Modbus phía PLC. |
| TC37 | PASS | Có 109; dải vận hành -50 đến +70°C bao phủ -40°C. |
| TC42 | CHƯA ĐẠT — THIẾU DANH MỤC | Có nhóm cảm biến, bộ ghi, modem và nguồn; CELL210-V có trong kết quả. Không có sản phẩm CR300 trong catalog local và catalog active trên Supabase nên chưa đáp ứng bộ model yêu cầu. CR310-NA là model khác, không được đổi tên thành CR300. |
| TC46 | PASS | Có RF407; loại cellular; giải thích sóng vô tuyến không phụ thuộc di động. Khoảng cách 5 km cần khảo sát đường truyền và anten. |
| TC47 | PASS | TX325 đứng đầu; truy vấn vệ tinh bằng tiếng Việt tìm được sản phẩm. |
| TC48 | PASS | TX325 đứng đầu; truyền trực tiếp lên vệ tinh, không phụ thuộc viễn thông mặt đất; vùng phủ phải được xác minh. |
| TC63 | PASS với hiệu chỉnh thông số nghiệm thu | CS655; trả lời rõ về Wi-Fi. Giao tiếp đúng theo hãng là SDI-12/RS-232, không phải RS-485. |
| TC70 | PASS — fault injection | Tại 19.999 ms chưa hủy; tại 20.000 ms hủy tác vụ, vẫn trả CS655 với `source: rule` và `generation.status: timeout`; phản hồi muộn không thay đổi kết quả. |
| TC71 | PASS | Trả bộ ghi có giao tiếp thay thế để không dùng Modbus; loại thiết bị không có phương án giao tiếp thay thế được xác nhận. Không loại bộ ghi chỉ vì nó có hỗ trợ Modbus tùy chọn. |
| TC72 | PASS | Có CS655 và các cảm biến đất có dây; không trả bộ ghi thay cho cảm biến đất. |
| TC73 | PASS | Rỗng; thông báo ngoài danh mục quan trắc môi trường. |
| TC74 | PASS | Rỗng; hướng dẫn làm rõ nhu cầu quan trắc. |
| TC75 | PASS | Rỗng; hướng dẫn tìm thiết bị đo môi trường. |

TC63: [Thông số chính thức CS655](https://www.campbellsci.com/products/cs655) ghi đầu ra SDI-12 và serial RS-232. Không sửa dữ liệu thành RS-485 để khớp tiêu chí sai.

TC42: [CELL210](https://www.campbellsci.com/products/cell210) có cấu hình CELL210-V cho Verizon. Việc model xuất hiện không xác nhận triển khai được với nhà mạng Việt Nam. Muốn nghiệm thu nguyên tiêu chí TC42 cần bổ sung sản phẩm CR300 có dữ liệu được duyệt vào catalog, hoặc thống nhất model bộ ghi thay thế; đây là thay đổi dữ liệu kinh doanh chưa thực hiện trong lượt sửa code này.

## Chạy lại và kiểm tra

```powershell
npm run test:api
npm run lint --workspace=@reeco/api
node --env-file=apps/api/.env scripts/search/bug-log-live.mjs retest-final
node scripts/search/verify-bug-log-live.mjs output/bug-log/retest-final.json output/bug-log/retest-final-verification.json
node --env-file=apps/api/.env output/bug-log/check-followup.mjs
```

- Build shared/API và 224 test API đạt; không có test bị bỏ qua.
- ESLint API đạt với `--max-warnings=0`.
- Snapshot [trước sửa](../output/bug-log/retest-before.json), [sau sửa](../output/bug-log/retest-final.json), [kiểm tra snapshot](../output/bug-log/retest-final-verification.json), [câu hỏi tiếp TC08](../output/bug-log/retest-followup.json).
- Có lượt kiểm tra riêng khi tắt LLM: [snapshot dự phòng](../output/bug-log/retest-fallback.json). Lượt này chạy trước thay đổi cuối về phần thông số tiếng Việt của TC22; snapshot `retest-final` là bằng chứng cuối cùng.
- Snapshot chứa model/cấu hình LLM, hash catalog và module runtime để đối chiếu. Các yêu cầu ngoài danh mục dừng trước truy xuất nên có `mode: hybrid` nhưng không phải đã chạy tìm kiếm hybrid.

Lượt chạy thật sử dụng nhánh từ khóa dự phòng vì nhánh ngữ nghĩa không sẵn sàng; LLM trả trạng thái `unavailable` nên lời giải thích đến từ quy tắc có bằng chứng. Chưa xác minh chất lượng sinh câu của LLM đang hoạt động. TC70 được chứng minh riêng bằng fake clock và mô phỏng lỗi, không suy ra từ tốc độ truy vấn bình thường.

Chưa kiểm thử giao diện trình duyệt hoặc bản đang deploy. Kết quả này không xác nhận tính tương thích phần cứng hay điều kiện lắp ngoài hiện trường.

## Bổ sung: tìm kiếm theo dải nhiệt độ

Đã sửa truy vấn `Dải nhiệt độ hoạt động -35 to +70 °C`: truy xuất trực tiếp thông số nhiệt độ đã chuẩn hóa, thay vì phụ thuộc khớp nguyên văn của câu tìm kiếm. Phân trang đọc thông số để không bỏ sót sản phẩm sau 500 dòng; chỉ nhận sản phẩm active. Khi có nhiều điều kiện, các điều kiện phải cùng đúng trên một sản phẩm.

- Dải khớp đúng được ưu tiên trước dải bao phủ rộng hơn; bộ reranker ngữ nghĩa không được đẩy khớp đúng xuống dưới khớp bao phủ. Nhận diện model vẫn có độ ưu tiên cao nhất.
- Giữ điều kiện nhiệt độ khi chuyển câu hỏi thành truy vấn theo đại lượng, chẳng hạn vừa đo tốc độ gió vừa cần dải vận hành -35 đến +70°C.
- Hiểu thêm “nhiệt độ vận hành”, “nhiệt độ làm việc”, dấu âm Unicode và các đơn vị nhiệt độ đã hỗ trợ. Tách dải vận hành, dải đo và dải lưu kho.
- Kết quả thật đứng đầu: **WindSonic1**. Giải thích: “Dải hoạt động -35–70°C khớp đúng dải -35–70°C bạn yêu cầu.” Ví dụ kết quả bao phủ: CR6-NA-ST-CC với dải -40–70°C. Cả hai đều kèm nguồn thông số trong `evidence`.
- 7/7 truy vấn với Supabase thật đạt, gồm truy vấn kết hợp đo gió, quy đổi °F, tìm riêng dải đo và dải không có sản phẩm phù hợp. [Snapshot đầy đủ](../output/temperature-feature-live.json).
- 228/228 test API đạt; ESLint API đạt. Có kiểm tra phân trang, không ghép điều kiện từ hai sản phẩm khác nhau và mô phỏng reranker cố đảo thứ tự khớp đúng/bao phủ.

Chạy lại: `npm run test:api` và `node --env-file=apps/api/.env scripts/search/temperature-feature-live.mjs`. Lượt chạy thật vẫn dùng giải thích theo quy tắc khi LLM không sẵn sàng. Chưa deploy và chưa đánh giá toàn bộ các trường thông số khác trong catalog.

## Bổ sung: tìm theo các nhóm thông số kỹ thuật

Đã mở rộng truy xuất theo **tên trường + giá trị**, lọc cùng lúc nhiều điều kiện trên từng sản phẩm, ưu tiên giá trị/dải khớp đúng trước giá trị nằm trong dải rộng hơn, và giữ ưu tiên đó sau rerank. Khi giải thích, API nêu quan hệ khớp, giá trị được xác nhận và bằng chứng từ chính trường thông số; điều kiện/chế độ của số liệu gốc vẫn áp dụng.

| Ví dụ truy vấn | Kết quả đã kiểm tra |
|---|---|
| Điện áp nguồn 9 to 28 VDC | BaroVue10/CS230 khớp đúng; các dải bao phủ xếp sau |
| Điện áp nguồn 9000 đến 28000 mVDC | Tương đương truy vấn trên |
| Dải áp suất 500 to 1100 hPa | BaroVue10, CS106-PF và các ứng viên có dải bao phủ |
| Dải tốc độ gió 0 to 60 m/s | ClimaVue40, WindSonic1 |
| Tần số 300 to 6500 Hz | VWANALYZER khớp đúng trước AVW200-ST có dải rộng hơn |
| Độ phân giải 0.001 Hz | Có VWANALYZER và các sản phẩm có thông số tương ứng |
| Độ chính xác ±0.005% | VWANALYZER, CRVW3-NE; ghi chú điều kiện trong bằng chứng vẫn áp dụng |
| Bộ nhớ 80 MB / Bộ nhớ tối thiểu 64 MB | VWANALYZER |
| Cấp bảo vệ IP68 | Có CS655/CS650; không suy diễn IP68 tương đương IP67 |
| Dòng tiêu thụ 14 mA | Các modem CELL; giải thích rõ đây là chế độ nghỉ |
| Điện áp đầu ra 5 V | AVW200-ST; không dùng điện áp nguồn để chứng minh đầu ra |
| Đầu vào dòng 4 to 20 mA | Có CR310-NA; không coi khả năng đọc dòng là khả năng xuất dòng |
| Khối lượng 770 g | TX325, TX326 |
| Điện áp nguồn 6 to 18 VDC và cấp bảo vệ IP68 | CS650, CS655 đáp ứng cả hai điều kiện |
| Bộ nhớ tối thiểu 900 GB | Danh sách rỗng |

Cũng có nhận diện công suất tiêu thụ, dải độ ẩm, tần số lấy mẫu và tốc độ truyền khi tên trường và đơn vị thuộc tập hỗ trợ. Hỗ trợ so sánh `<=`, `<`, `>=`, `>`, “tối đa”, “không quá”, “tối thiểu”, “ít nhất”, `at most`, `at least`; phân biệt điện AC/DC và dấu ±. KB/MB/GB được quy đổi thập phân, không suy diễn KiB/MiB. Không coi số ghi trong điều kiện của công thức là giá trị chính của thông số.

Kiểm tra: **248/248 test API**, ESLint API; bộ kiểm thử dữ liệu thật gồm 17 truy vấn trong [specification-feature-live.json](../output/specification-feature-live.json). Chạy lại bằng `node --env-file=apps/api/.env scripts/search/specification-feature-live.mjs` sau khi build API. Có kiểm tra reranker đảo thứ tự, sai trường, sai đơn vị, dải đảo ngược, ngưỡng nghiêm ngặt và hai điều kiện phải cùng đúng trên một sản phẩm.

Giới hạn: dùng tập tên trường Anh/Việt được đối chiếu catalog. Công thức phức tạp, đồ thị hiệu chuẩn và các tên trường chưa có alias không được tự suy diễn thành cam kết đáp ứng. Truy vấn có điều kiện số cần ghi rõ đơn vị. Dữ liệu gốc vẫn nằm trong `evidence`; chưa thay đổi catalog hay deploy.

## Bổ sung: thống nhất ngôn ngữ câu trả lời

- Ngôn ngữ của câu hỏi hiện tại quyết định phần diễn giải, yêu cầu kỹ thuật và hướng dẫn. Lịch sử chỉ cung cấp ngôn ngữ dự phòng cho truy vấn không có dấu hiệu ngôn ngữ như mã model/giao thức.
- Câu hỏi tiếng Anh sau một lượt tiếng Việt trả lời tiếng Anh và ngược lại. Truy vấn thành phần bằng tiếng Anh trong nội bộ không còn làm đổi ngôn ngữ của câu trả lời tiếng Việt.
- Nhãn thông số được trình bày theo ngôn ngữ trả lời. Giá trị số và đơn vị được giữ; ghi chú nguồn chưa dịch không được chép xen vào phần diễn giải hoặc bị bỏ điều kiện để tạo cam kết mới. Nguồn nguyên văn vẫn có trong bằng chứng.
- Phần chờ tải, lỗi, danh sách rỗng và thông báo tìm kiếm dự phòng trên màn hình kết quả được trình bày cùng ngôn ngữ. Bằng chứng nguyên văn được đặt riêng trong “Xem dữ liệu gốc” / “View original product data”.
- LLM viết sai ngôn ngữ không vượt qua kiểm tra bảo toàn câu chữ; hệ thống giữ giải thích dự phòng đã chọn đúng ngôn ngữ.

Xác minh: **256/256 test API**, **52/52 test client**, build client và lint API đạt. Kiểm tra phần giới thiệu cho **89 model × 2 ngôn ngữ**, các tình huống theo ứng dụng, truy vấn trộn tên thông số tiếng Anh trong câu tiếng Việt, đổi ngôn ngữ qua lịch sử và LLM trả sai ngôn ngữ.

**12/12 kiểm tra trên Supabase thật đạt**: [search-language-live.json](../output/search-language-live.json). Chạy lại: `node --env-file=apps/api/.env scripts/search/language-live.mjs`. Lượt chạy thật sử dụng giải thích dự phòng khi LLM không sẵn sàng; nhánh LLM chấp nhận/từ chối được kiểm tra bằng mô phỏng. Chưa deploy hoặc kiểm thử trình duyệt trực tiếp cho thay đổi ngôn ngữ.

## Kiểm tra lỗi `demo:warmup` và ảnh hưởng production

Lỗi `label: string | undefined` xuất phát từ nhãn yêu cầu có thể thiếu khi tra bảng theo phương thức truyền thông. Đã khai báo phương thức truyền thông bằng tập giá trị hữu hạn và khai báo mảng yêu cầu có `label: string`; thiếu bản dịch sẽ bị phát hiện ngay khi biên dịch. Kiểm tra hồi quy xác nhận nhãn của radio, vệ tinh và di động ở cả hai ngôn ngữ đều là chuỗi không rỗng, đúng schema.

Xác minh: `npm run build:api` đạt; kiểm tra không dùng cache bằng compiler của workspace API (`node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false`, chạy trong `apps/api`) đạt; **257/257 test API** và lint API đạt. Compiler TypeScript ở root dùng bởi CRA khác compiler trong workspace API, nên kiểm tra API phải dùng đúng compiler của API.

Khi chạy lại đúng `npm run demo:warmup`, bước build qua nhưng bước nạp mô hình thất bại với `OLLAMA_NOT_REACHABLE` / `ECONNREFUSED 127.0.0.1:11434`. Đây là lỗi dịch vụ chưa chạy, không phải lỗi kiểu dữ liệu. API local `/api/v1/health` vẫn trả 200; tìm `CS655` trả 200, `mode: keyword`, đúng model. Warmup yêu cầu mô hình và chế độ hybrid sẵn sàng nên không được đổi thành PASS cho chế độ dự phòng.

Kiểm tra các địa chỉ đang được frontend production sử dụng:

| Thành phần | Kết quả |
|---|---|
| `https://ai-search-client.vercel.app` | HTTP 200; deployment production trên Vercel ở trạng thái READY |
| `https://ai-search-admin.vercel.app` | HTTP 200 |
| API được nhúng trong cả hai bản build: `https://multiple-automotive-per-miniature.trycloudflare.com/api/v1` | DNS hệ thống báo ENOTFOUND; Cloudflare DNS-over-HTTPS trả Status 3 (NXDOMAIN) |
| `http://127.0.0.1:3100/api/v1/health` | HTTP 200 |
| `http://127.0.0.1:11434/api/tags` | ECONNREFUSED |

Lệnh build/warmup không tự deploy hoặc ghi lại dữ liệu kinh doanh. Với lỗi build người dùng gửi, `&&` ngăn phần warmup chạy sau khi build thất bại. Tuy nhiên, build Nest có `deleteOutDir: true`: không nên dùng thư mục build đang thất bại để khởi động lại API. Bản API đã build lại thành công trong lượt kiểm tra này.

Vấn đề production cần xử lý riêng: khôi phục tunnel API hoặc dùng endpoint ổn định, cập nhật `REACT_APP_API_URL` nếu URL đổi và redeploy hai frontend theo quy trình hiện có. Để warmup đầy đủ trên máy local, khởi động Ollama với `ollama serve`, giữ API chạy, rồi chạy lại `npm run demo:warmup`. Chưa khởi động lại dịch vụ, đổi endpoint hay deploy trong lượt kiểm tra này.
