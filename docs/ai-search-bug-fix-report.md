# AI Search — báo cáo sửa lỗi 13/10/2026

Phạm vi: `AI-Search-Bug-Log.md`, 27 tình huống. Không tìm thấy `AGENTS.md` trong repository hoặc các thư mục cha đã kiểm tra. Đã đọc kiến trúc Nest API, hybrid retrieval, technical matching/ranking, explanation và luồng tìm kiếm client trước khi sửa.

Mốc trước sửa: commit `382ab26da059a9158618c207d25c6321cf1bf320`. Thay đổi hiện nằm trong working tree; chưa commit, chưa redeploy Vercel, chưa thay tiến trình API staging đang chạy.

## Phương pháp và bằng chứng

- [before.json](../output/bug-log/before.json): chạy code API lấy từ Git HEAD, gọi Supabase và Ollama embedding thật, giải thích bằng rule. Có query gốc, ứng viên của từng truy xuất, điểm và thứ hạng thực tế, response và thời gian. Bộ query này lấy đúng 25 input thông thường từ bug log; TC-19/27 cần fault injection riêng. Một lần trích query ban đầu bị lỗi dấu ngoặc Unicode đã bị loại bỏ, không dùng làm bằng chứng.
- [after-llm.json](../output/bug-log/after-llm.json): chạy mã đã sửa, Supabase và Ollama thật, bật LLM giải thích. Lưu parsed intent, RRF/keyword/semantic ranks và scores, ứng viên, requirements/evidence, trạng thái generation, phiên bản embedding và hash catalog.
- [after.json](../output/bug-log/after.json): lượt cuối với rule, sau biến thể phủ định tiếng Anh; dùng cùng dữ liệu live và lưu hash module runtime. Test regression xác minh biến thể mới; không dùng lượt LLM trước đó để suy đoán biến thể chưa chạy live.
- [live-verification.json](../output/bug-log/live-verification.json): kiểm tra riêng truy xuất và nội dung giải thích của snapshot thật; chỉ ghi PASS sau assert. Sản phẩm hiển thị phải có trong tập ứng viên truy xuất thật. Các điều kiện triển khai chưa biết vẫn được trình bày là chưa xác minh.
- [bug-log-regression.test.mjs](../scripts/search/bug-log-regression.test.mjs): 27 ca gốc và 3 test bổ sung gồm hội thoại, HTTP và biến thể/đối nghịch. Pool ứng viên cố tình chứa toàn bộ 89 sản phẩm để thử bộ lọc với ứng viên sai có điểm cao; dùng parser, matcher, ranking và explanation thật cùng catalog/specs thật. Test này xác minh chính sách và bằng chứng, không được xem là bằng chứng recall; lượt live ở trên xác minh recall/ranking.
- TC-19 dùng đồng hồ giả tiến tới 19.999 rồi 20.000 ms trong đường gọi SearchService → ExplanationService → fetch thật của service; fetch được giả lập treo và bỏ qua signal. Xác nhận signal abort, giữ CS655, fallback `rule`, trạng thái `timeout`, bỏ qua phản hồi đến muộn. Đây là thời gian giả lập, không phải benchmark chờ thực 20 giây.
- TC-27 dùng HybridSearchService thật: lỗi và timeout từng nhánh/cả hai nhánh; timeout 15 giây mỗi nhánh. Có test HTTP Nest thật: input không hợp lệ trả 400 trước retrieval; hai nhánh hỏng trả 503 không lộ lỗi nội bộ; hai nhánh thành công nhưng rỗng trả 200. Các adapter được giả lập để chủ động gây lỗi, không giả định dependency thật đã bị outage.

## Theo bug ID

Đường dẫn viết gọn trong bảng: `search/` là `apps/api/src/modules/search/`. Các test TC tương ứng nằm trong regression file trên, trừ khi chỉ rõ khác.

| ID | Nguyên nhân được xác nhận bằng code/log | File đã sửa | Kết quả kiểm thử | Chưa xác minh / giới hạn |
|---|---|---|---|---|
| BUG-01 | Intent cũ không có điều kiện không tiếp xúc/profile/sấy/sonic. TC-01 đưa đầu đo chìm lên đầu; TC-06 giữ phễu không sấy. Phủ định bị dùng như từ khóa dương; “không dùng Modbus” loại cả thiết bị có giao thức thay thế. | `search/search-intent.ts`, `conversation-query.ts`, `query-context.ts`, `search.service.ts` | TC-01/02/03/06/09/20/21 PASS. Ràng buộc phải có bằng chứng; depth 70 cm và profile + Modbus RTU thiếu bằng chứng trả rỗng. Exclusion không được hiểu trả 400. | Việc thiếu nhãn hỗ trợ không chứng minh tính năng vắng mặt. Requirements ghi `unconfirmed` khi chưa có bằng chứng; không bảo đảm mọi cách diễn đạt phủ định tự nhiên. |
| BUG-02 | Nhánh logger trong parser xóa các đại lượng cảm biến dù logger chỉ là thiết bị đang có. TC-10 trả logger. TC-18 dùng câu hỏi Wi-Fi làm điều kiện bắt buộc và truy xuất cả câu dài, tập ứng viên không có CS655. | `search/query-context.ts`, `search-intent.ts`, `technical-query-parser.service.ts`, `search.service.ts`, `requirement-explanation.ts` | TC-10 trả cảm biến SDI-12, có CS655; TC-18 trả chính CS655 và Wi-Fi `unconfirmed`. Biến thể tiếng Anh PASS. “CS655 with Wi-Fi” là yêu cầu bắt buộc, trả rỗng. | Không kết luận CR1000X là lỗi exact-model đã chứng minh: catalog đang dùng tên CR1000Xe-XT-CC. Chưa kiểm tra đấu nối bus thực tế với logger của người dùng. |
| BUG-03 | Query tiếng Việt và catalog tiếng Anh thiếu ánh xạ use case; nhãn Modbus RTU của ClimaVue40 thiếu trong catalog đang chạy. TC-11/12 rỗng; TC-16 dùng từ chung, TX325 không có trong top 10. | `search/search-intent.ts`, `search.service.ts`; raw/normalized/enriched/search-document của ClimaVue40; `scripts/search/sync-bug-log-specs.mjs` | TC-11/12 trả ClimaVue40, xác nhận riêng RS-485 và Modbus RTU. TC-16/17 có TX325. | Không thêm mọi chức năng trong phần quảng cáo của hãng; chỉ bổ sung thuộc tính đã đối chiếu. Ngôn ngữ tự nhiên ngoài các khái niệm đã hỗ trợ cần thêm dữ liệu kiểm thử. |
| BUG-04 | “âm 40” chưa chuẩn hóa dấu âm; intent vận hành thiếu “chịu lạnh”. Regex `cảm biến.*đất` nhận nhầm chữ “lắp đặt” thành nhu cầu cảm biến đất. 109 chỉ có nhiệt độ chung, thiếu môi trường đo. | `search/technical-query-parser.service.ts`, `search-intent.ts`; raw/normalized/enriched/search-document của 109 | TC-13 có 109; explanation kiểm tra -40 nằm trong -50…70°C và nêu che bức xạ/thông gió. Các dạng `âm 40`, `-40`, `−40`, `âm 45` PASS. TC-03 giữ từng độ sâu 10/20/50 cm. | Dải vận hành không chứng minh dải đo, độ chính xác ở mọi nhiệt độ hay cấu hình lắp đặt ngoài trời. |
| BUG-05 | Parser không phân biệt đủ cellular/radio/satellite. Nhắc thiếu sóng 4G vẫn trở thành nhu cầu cellular; tên/vocabulary vệ tinh không được chuyển thành target truy xuất. | `search/search-intent.ts`, `search.service.ts`, `requirement-explanation.ts`; raw/normalized TX325 | TC-15 radio, có RF407, không cellular-only. TC-16/17 vệ tinh có TX325; explanation nêu vùng phủ GOES và giới hạn triển khai. | Không bảo đảm radio 5 km trong thung lũng; chưa đo tuyến, anten, tần số hợp lệ. Không bảo đảm GOES cho Việt Nam hoặc mọi vùng biển; chưa có tọa độ/quyền dịch vụ. |
| BUG-06 | Explain service cũ đã nhận query và dữ liệu sản phẩm; không chứng minh được giả thuyết “LLM không nhận nhu cầu”. Lỗi xác nhận là thiếu đối chiếu điều kiện quyết định và template thiên về loại thiết bị/thông số chung. | `search/explanation.service.ts`, `requirement-explanation.ts`, `search-intent.ts`, `search.service.ts` | TC-01…18,20,21 được kiểm tra nội dung cốt lõi + evidence. Rule và LLM thật đều giữ giới hạn; không cho LLM tự sinh tính năng. Source/raw_ref trong test phải thuộc đúng sản phẩm. | Đây là giải thích dựa trên yêu cầu và dữ liệu truy xuất, không phải SHAP/feature importance. Không suy ra lý do model xếp hạng cao từ văn bản LLM. Chưa nghiệm thu UI trên Vercel. |
| BUG-07 | Resolver cũ không hiểu “cái nào phù hợp nhất”; mất nhu cầu hiện hành. Khi cho phép đầu đo chìm, scope cũ giữ nguyên sẽ chặn các ứng viên mới. | `search/conversation-query.ts`, `search.service.ts`, `scripts/search/conversation-query.test.mjs` | TC-01 → “cái nào phù hợp nhất?” giữ RangeVue30; → “chấp nhận cảm biến chìm” bỏ điều kiện cũ và mở rộng có CS451. Query độc lập không nhận context cũ. | Đã kiểm tra contract hội thoại do client gửi; chưa chạy chuỗi này trên trình duyệt staging. |
| BUG-08 | Nhánh xây hệ thống không giữ 4G trong truy vấn thành phần, nên TC-14 có cảm biến/logger/nguồn nhưng thiếu thiết bị truyền thông. | `search/search-intent.ts`, `search.service.ts`, `requirement-explanation.ts` | TC-14 có bốn nhóm: cảm biến thời tiết, logger, cellular, nguồn; guidance ghi rõ tương thích và công suất nguồn chưa xác nhận. | Chưa có nhà mạng, SIM, băng tần, số kênh, nhu cầu năng lượng và vị trí. Không ép CR300/CELL210-V hoặc coi đây là BOM tương thích đã chốt. |
| BUG-09 | Query ngoài domain không có intent rõ vẫn công bố hàng xóm vector, dẫn tới thiết bị môi trường cho máy đo huyết áp, lọc nước gia đình, điện thoại. | `search/query-context.ts`, `search.service.ts` | TC-22/23/24 rỗng, không gọi retrieval; positive controls áp suất không khí, chất lượng nước và modem vẫn có kết quả. | Router nhận diện nhóm nhu cầu rõ, không dùng ngưỡng cosine tùy tiện. Chưa đánh giá mọi lĩnh vực ngoài catalog hoặc truy vấn pha trộn nhiều ý định. |
| BUG-10 | Schema chỉ trim/min-length; dấu câu vẫn hợp lệ. Service cũ truy xuất và trả sản phẩm cho TC-26. Client cũng gửi input không có nội dung. | `packages/shared/src/schemas/api-contract.ts`, `search/search.service.ts`, `apps/client/src/components/search/SearchHero.js`, `apps/client/src/services/api.js`, `api.test.js` | TC-25/26: schema/service/HTTP 400 trước retrieval; client không fetch. Mã model, dấu âm và đơn vị được giữ trong các test kỹ thuật. | Chưa kiểm tra thao tác nhập trên trình duyệt Vercel; test client đã xác nhận đường gọi API. |
| VERIFY-01 | Trước đó chưa có bằng chứng timeout. Code chỉ dựa vào AbortSignal của fetch, chưa chặn adapter/body treo hoặc bỏ qua signal. | `search/search-deadline.ts`, `explanation.service.ts` | TC-19 PASS fault injection đúng mốc 20.000 ms, cancellation và late-response; kết quả không mất. | Fake clock không đo hiệu năng phần cứng thật. Lượt LLM thật xác minh generation/fallback, không được dùng thay cho test timeout. |
| VERIFY-02 | Trước đó chưa kiểm thử đồng thời. Promise.allSettled có fallback/error nhưng không có deadline nhánh; một nhánh treo khiến toàn bộ chờ. | `search/search-deadline.ts`, `hybrid-search.service.ts`, `keyword-search.service.ts`, `semantic-search.service.ts` | TC-27 PASS cho từng/cả hai nhánh error/timeout; còn một nhánh trả mode degraded; cả hai hỏng 503; healthy-empty 200. Log chỉ ra nhánh và `success/error/timeout`. | Chưa gây outage trên Supabase/Ollama đang dùng chung. Deadline abort các RPC; embedding có timeout riêng 10 giây. |

## Kết quả 27 tình huống

PASS dưới đây là nghiệm thu phần mềm theo điều kiện trong bug log. Không phải xác nhận thiết bị lắp ngoài hiện trường hoặc cấu hình trạm đã tương thích.

| TC | Truy xuất / xử lý | XAI / trạng thái |
|---|---|---|
| 01 | RangeVue30; loại đầu đo chìm | Không tiếp xúc, lắp phía trên; không bảo đảm kháng mọi hóa chất. PASS |
| 02 | SoilVue10-5 | Profile đa tầng; vẫn cần tạo lỗ lắp. PASS |
| 03 | SoilVue10-5; đúng 10/20/50 cm | Độ ẩm và nhiệt độ theo độ sâu; không đại diện toàn khu trồng. PASS |
| 04 | HFP01 | Flux khác nhiệt độ/nhiệt tích trữ; bề mặt cần bổ sung. PASS |
| 05 | Có RainVue10-MM (hạng 3 trong lượt live), cùng các ứng viên đo mưa khác | Ghi/tích lũy mưa phục vụ cảnh báo; chưa thành hệ cảnh báo hoàn chỉnh. PASS |
| 06 | 52202; loại phễu không sấy và heater của thiết bị không phải rain gauge | Nguồn sấy, thermostat, dải -20…50°C; không gán khả năng -40°C. PASS |
| 07 | ClimaVue50G2 | Các đại lượng yêu cầu; logger/modem/nguồn cần riêng. PASS |
| 08 | CS301 đứng đầu; các ứng viên bức xạ khác còn được giữ | Irradiance W/m² + dữ liệu điện cho PV; phân biệt PAR. PASS |
| 09 | CSAT3B-NC và WindSonic1 | Sonic không rotor; không bảo đảm sống sót/chính xác mọi bão. PASS |
| 10 | Có CS655 (hạng 2), CS650, SoilVue10-5; không trả logger | SDI-12 có bằng chứng; bus, dây, nguồn và logger đang có cần đối chiếu. PASS |
| 11 | ClimaVue40 | RS-485 và Modbus RTU được xác nhận riêng. PASS |
| 12 | ClimaVue40 | PLC cần cổng/module, master/client và register/baud/parity. PASS |
| 13 | Có 109 (hạng 3) cùng ứng viên nhiệt độ không khí khác | Dải vận hành bao phủ -40°C, cần che bức xạ/thông gió. PASS |
| 14 | Bốn nhóm có ứng viên | Tương thích/nguồn/nhà mạng chưa chốt, nêu rõ. PASS phần mềm |
| 15 | RF500M/RF452/RF407; không cellular | Chưa xác nhận tuyến 5 km, cần LOS/anten/địa hình. PASS |
| 16 | TX326/TX325 | Vệ tinh, GOES có giới hạn vùng phủ và dịch vụ. PASS |
| 17 | TX325/TX326 | Vùng biển/vị trí chưa xác minh, không quảng bá phủ toàn cầu. PASS |
| 18 | Chính CS655 | Wi-Fi `unconfirmed`; thực tế catalog xác nhận SDI-12 và RS-232. PASS |
| 19 | Giữ CS655 khi LLM treo | `rule` + `timeout` tại 20.000 ms, signal abort, bỏ qua kết quả muộn. PASS fault injection |
| 20 | Giữ logger có giao thức thay thế; có CR310-NA | Không đồng nhất hỗ trợ Modbus với bắt buộc dùng Modbus. PASS |
| 21 | Cảm biến đất, có CS655; không đổi thành logger | Có dây có bằng chứng; không bảo đảm tuyệt đối không mất kết nối. PASS |
| 22 | Rỗng, không retrieval | Thông báo đúng domain. PASS |
| 23 | Rỗng, không retrieval | Thông báo đúng domain. PASS |
| 24 | Rỗng, không retrieval | Thông báo đúng domain. PASS |
| 25 | API 400, client không fetch | Không retrieval/LLM. PASS |
| 26 | API 400, client không fetch | Không retrieval/LLM. PASS |
| 27 | Một nhánh hỏng: degraded; hai nhánh hỏng: 503; healthy-empty: 200 | Lỗi trả ra được vệ sinh; deadline/cancellation có test. PASS fault injection + HTTP |

Không thay score hoặc hardcode input để ép thứ hạng SKU. Ví dụ RainVue10-MM, CS655, 109 và TX325 không bắt buộc đứng hạng 1; thứ hạng thật được lưu trong snapshot.

## Dữ liệu, model và nguồn đã đối chiếu

89 sản phẩm active. Embedding thật: `qwen3-embedding:4b`, 1536 chiều, version `ollama-qwen3-embedding-4b-1536-v1`. LLM thật: `qwen3:4b-instruct-2507-q4_K_M`, timeout 20.000 ms. Lượt live bật LLM có 31 explanations `accepted`, 7 `invalid_response` dùng rule fallback, 21 `not_applicable` dùng rule theo giới hạn số kết quả/budget. Không đánh failed retrieval khi chỉ generation bị lỗi.

Chỉ sửa ba thuộc tính catalog có kiểm chứng:

- ClimaVue40 Communications: bổ sung Modbus RTU theo [tài liệu hãng](https://us.campbellsci.com/climavue40). Cập nhật raw, normalized, enriched, search document và embedding/index trên Supabase.
- 109 Sensor Description: thêm môi trường đo không khí/đất/nước theo [tài liệu 109](https://www.campbellsci.com/products/109). Cập nhật raw, normalized, enriched, search document và embedding/index.
- TX325 Satellite System: bổ sung phạm vi Western Hemisphere theo [tài liệu TX325](https://www.campbellsci.com/products/tx325). Cập nhật raw và normalized spec trên Supabase. Search document/index không đổi vì thuộc tính này không nằm trong phần tóm tắt được index; giữ vector hiện tại.

Raw specs có `review_source` và `reviewed_at`; explanation dẫn `raw_ref` về thuộc tính đã review. Sync có dry-run, so sánh bản remote với HEAD/local và chặn ghi đè thay đổi độc lập; lưu backup trước ghi. Không dùng import lại toàn catalog hoặc sửa quyền/tài khoản. Hai search documents đã được sync bằng quy trình hiện có, ba normalized specs được cập nhật có điều kiện qua `sync-bug-log-specs.mjs`.

Các điều kiện lắp đặt được đối chiếu từ [RangeVue30](https://www.campbellsci.com/products/rangevue30), [SoilVue10 installation](https://help.campbellsci.com/soilvue10/soilvue10/field-installation.htm), [HFP01](https://us.campbellsci.com/hfp01), [52202](https://www.campbellsci.com/products/pn52202), [CS655](https://www.campbellsci.com/products/cs655), [RF407](https://www.campbellsci.com/products/rf407) và các nguồn trong bug log. Lời tự giải thích của model không được dùng để xác định root cause hay bổ sung tính năng.

## Kiểm tra và chạy lại

- `npm run test:api`: 211/211 PASS, gồm bộ search mới và các regression cũ.
- `npm run test:client`: 47/47 PASS, 8 suites.
- `npm run lint`: PASS.
- `npm run build:shared`, `npm run build:api`, `npm run build:client`: PASS. Client build còn cảnh báo deprecation `fs.F_OK` từ toolchain hiện có.
- `node scripts/search/verify-bug-log-live.mjs`: 25/25 input thường PASS truy xuất/xử lý; 20 ca có sản phẩm PASS kiểm tra nội dung XAI. TC-19/27 PASS bằng fault injection riêng; không suy từ truy vấn thường.

Lệnh thuận tiện:

```powershell
npm run search:bugs:test
npm run search:bugs:live
```

Lệnh live cần API `.env`, Supabase và Ollama đang hoạt động; không dùng test này thay cho việc bật backend/tunnel của staging. Snapshot ghi cấu hình thực tế để phân biệt LLM bật/tắt. Muốn kiểm tra lại baseline có thể dùng `node --env-file=apps/api/.env scripts/search/bug-log-live.mjs baseline --baseline`; baseline là code HEAD trên dữ liệu hiện tại, không khôi phục catalog lịch sử. Snapshot `before.json` giữ bằng chứng catalog trước các sửa dữ liệu ở lượt này.

Chưa redeploy và chưa nghiệm thu trình duyệt Vercel sau sửa. Để dùng mã mới trên staging cần khởi động lại API bằng build mới và redeploy client có phần validation; nếu URL tunnel đổi thì cập nhật biến môi trường Vercel tương ứng. Các cấu hình radio, GOES, PLC, nguồn và logger/cảm biến chỉ được chốt sau khi có thông tin triển khai và kiểm tra tương thích thật.
