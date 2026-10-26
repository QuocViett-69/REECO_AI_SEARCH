# Phân công báo cáo và thuyết trình theo 4 role: FE, BE, BA, AI Engineer

Ngày đối chiếu: 26/10/2026. Phương án chỉnh theo yêu cầu: một Frontend Developer, một Backend Developer, một Business Analyst và một AI Engineer kiêm xử lý dữ liệu. Căn cứ là tài liệu, code, migration và report hiện có; chưa chạy lại hệ thống hoặc benchmark.

Đây là phân công viết báo cáo và bảo vệ. Bảng đóng góp lập trình thực tế cần ghi theo công việc đã thực hiện. Chưa có tên thành viên nên dùng tên role.

## 1. Phân công chung

| Thành viên | Phạm vi | Nội dung báo cáo | Nội dung trình bày |
|---|---|---|---|
| Người 1 — FE | Cả client và admin, tích hợp API | Thiết kế giao diện, routing, state/session phía browser, hiển thị AI, UI commerce/admin và test frontend | Trải nghiệm người dùng và demo xuyên suốt |
| Người 2 — BE | Backend ứng dụng, database, bảo mật và nghiệp vụ | Kiến trúc, ERD, API/contracts, auth, sản phẩm/giá, orders, VNPay, notifications, vận hành và test backend | Cách hệ thống lưu dữ liệu, kiểm tra quyền, tính tiền và xử lý giao dịch |
| Người 3 — BA | Bài toán, yêu cầu, quy trình và nghiệm thu | Tổng quan, actor/use case, đặc tả, business rules, acceptance criteria, UAT, tổng hợp kết quả và kết luận | Bài toán, phạm vi, yêu cầu và mức độ đáp ứng |
| Người 4 — AI Engineer + Data | Toàn bộ xử lý dữ liệu và AI Search | Chuẩn hóa/enrichment/search document, embedding, retrieval/RRF, kiểm chứng kỹ thuật, reranker, explanation/context và đánh giá | Từ dữ liệu nguồn đến kết quả tìm kiếm có bằng chứng |

FE phụ trách cả `apps/client` và `apps/admin`. Các service tìm kiếm viết bằng NestJS vẫn thuộc nội dung chuyên môn của AI Engineer. BA biên tập báo cáo chung; từng role tự viết và xác nhận phần kỹ thuật của mình.

## 2. Người 1 — Frontend Developer

### Công việc và phần báo cáo

- Hai ứng dụng React client/admin: component, routing, state/context và tích hợp API.
- Client: search, catalog, detail, compare, cart/favorites, login/register, checkout, account/profile, orders và notifications.
- Admin: login, dashboard, sản phẩm/giá/lịch sử giá, quản lý đơn và báo cáo.
- Gửi query, `explain`, context/model được chọn; hiển thị guidance/explanation/evidence và giữ thứ tự backend trả về.
- Session/refresh ở browser, protected route, xử lý 401/403; BE giải thích xác minh token/role phía server.
- Giá hiển thị/làm mới giá, validation form, loading/empty/error/retry, responsive và kiểm thử UI/tích hợp API.
- Phân biệt cart/favorites lưu browser với đơn hàng lưu server; recommendation hiện dùng bảng khai báo sẵn.

### Code, tài liệu và đầu ra

- Code: `apps/client/src/`, `apps/admin/src/`; tập trung `App.js`, `components/`, `context/`, `services/` và test frontend.
- Đọc: [Frontend handoff](frontend-handoff.md), [API contract](api-contract.md), [Commerce fixes](commerce-fixes-2026-10-14.md), [Demo commerce](demo-script-Quyen.md).
- Nộp: sơ đồ màn hình, mô tả component/state/API, ảnh luồng chính, bảng test UI và slide demo. BA cung cấp use case/tiêu chí, FE mô tả cách hiện thực.
- Demo: tìm → đọc explanation → chi tiết/so sánh → giỏ → đăng nhập → checkout → admin xử lý đơn → khách theo dõi. BE hỗ trợ môi trường/dữ liệu, AI giải thích thuật toán ở phần riêng.
- Phản biện: F5/Back, session hết hạn, vì sao không tự sắp lại score, giá đổi khi checkout và nơi lưu dữ liệu.

## 3. Người 2 — Backend Developer

### Công việc và phần báo cáo

- Kiến trúc NestJS, controller/service/repository, Supabase integration, shared Zod contracts và xử lý lỗi.
- Database tổng thể: catalog/search, giá, đơn/item, lịch sử, thông báo và audit giá. AI cung cấp yêu cầu schema/vector/FTS/RPC; BE tổng hợp ERD, migration và quyền truy cập.
- Auth API login/register/refresh/me; xác minh token, admin role trong `app_metadata`, quyền sở hữu đơn/thông báo.
- API browse/detail/giá và admin cập nhật giá; catalog kỹ thuật hiện khóa sửa, API import bị chặn.
- Tạo đơn, tính tiền từ DB, đối chiếu quote khi có, snapshot giá, trạng thái và điều kiện hủy.
- VNPay sandbox: URL theo đơn đã lưu, ký/xác minh, đối chiếu tiền/trạng thái, xử lý callback lặp theo cơ chế hiện có.
- Notifications API, dữ liệu dashboard/báo cáo, rate limit, cấu hình/CORS, secrets phía server và vận hành.
- Tích hợp module search: BE phụ trách HTTP contract/validation/cấu hình dùng chung; AI phụ trách thuật toán và kết quả.
- Test API, quyền, giá, chữ ký thanh toán, trạng thái và lỗi nghiệp vụ.

### Code, tài liệu và đầu ra

- Code: `apps/api/src/` phần auth/database/common và các module auth/products/admin/orders/notifications/imports; `packages/shared/`, `supabase/migrations/`, `scripts/payments/`, `scripts/notifications/`, `scripts/security/`, `scripts/staging/`.
- Đọc: [Architecture](architecture.md), [Database](database.md), [API contract](api-contract.md), [Commerce fixes](commerce-fixes-2026-10-14.md), [Vercel workflow](vercel-hobby-workflow.md).
- Nộp: kiến trúc, ERD thống nhất, bảng endpoint, sequence auth/checkout/VNPay, sơ đồ trạng thái, bảng test backend và checklist chạy demo.
- Phản biện: sửa giá ở browser, truy cập đơn người khác, callback lặp, snapshot đơn cũ, kiểm tra quyền và mô hình triển khai.

`npm run staging:local` bật `LOCAL_STAGING_READ_ONLY=true`, chặn ghi `/admin/*`, gồm đổi giá/trạng thái đơn. BE chuẩn bị môi trường phù hợp cho demo ghi trước buổi bảo vệ. Import API còn bị chặn riêng trong `ImportsService`.

## 4. Người 3 — Business Analyst

### Công việc và phần báo cáo

- Bài toán tìm thiết bị quan trắc theo model, nhu cầu và điều kiện kỹ thuật; mục tiêu, giá trị, phạm vi và giới hạn.
- Actor, quyền và hệ thống ngoài: khách vãng lai, khách đăng nhập, admin, Supabase Auth, VNPay và model service trong sơ đồ phù hợp.
- Yêu cầu chức năng/phi chức năng, use case tổng thể, quy trình và quy tắc nghiệp vụ bám hành vi đã triển khai.
- Đặc tả use case: tìm/bổ sung điều kiện/xem bằng chứng, so sánh, đặt/thanh toán/hủy đơn, admin cập nhật giá/xử lý đơn. Mỗi đặc tả có tiền điều kiện, luồng chính/ngoại lệ, hậu điều kiện và acceptance criteria.
- Thống nhất với AI ý nghĩa đáp ứng/chưa xác nhận/không đáp ứng và trường hợp hỏi làm rõ; với BE về giá/trạng thái/quyền; với FE về thao tác UI.
- Ma trận yêu cầu → chức năng/API → test → bằng chứng; kịch bản UAT, tổng hợp đạt/chưa đạt dựa trên kiểm tra thực tế.
- Tổng hợp mở đầu, kết luận, giới hạn/hướng phát triển và biên tập báo cáo/slide. FE/BE/AI vẫn tự viết phần kỹ thuật và xác nhận số liệu.

### Code, tài liệu và đầu ra

- Đọc: [API contract](api-contract.md), [Demo commerce](demo-script-Quyen.md), [Demo checklist](demo-ai-search-checklist.md), [Kịch bản AI Search](script-thuyet-trinh-ai-search.md), [Commerce fixes](commerce-fixes-2026-10-14.md).
- Đối chiếu route/màn hình trong hai `App.js`, schema trong `packages/shared/src/schemas/`, trạng thái trong `apps/api/src/modules/orders/orders.constants.ts` và bằng chứng của ba role kỹ thuật.
- Nộp: yêu cầu có ID, use case diagram, đặc tả use case, activity diagram, business rules, ma trận truy vết, bảng UAT và phần tổng hợp báo cáo.
- Ví dụ tiêu chí: chỉ trả sản phẩm có bằng chứng đáp ứng điều kiện giao tiếp/nhiệt độ bắt buộc đang áp dụng; thiếu dữ liệu phải nêu chưa xác nhận; tiền đơn lấy từ giá server. Nhóm đối chiếu code/test trước khi đánh dấu đạt.
- Phản biện: giải quyết vấn đề gì, lý do chọn phạm vi, quyền actor, tiêu chí hoàn thành và giới hạn.

Phân biệt yêu cầu nhóm đề xuất với yêu cầu đã được xác nhận thực tế. Không ghi đã phỏng vấn/khảo sát hoặc có UAT được khách hàng ký nếu chưa thực hiện.

## 5. Người 4 — AI Engineer kiêm xử lý dữ liệu

### Công việc và phần báo cáo

- Toàn bộ pipeline incoming/raw → product master → normalized specifications → enrichment → search document.
- Identity/family/variant, active/review; chuẩn hóa giá trị/đơn vị/protocol, giữ `value_raw`/`raw_ref`; bảo toàn các thông số chưa parse chắc chắn.
- Enrichment bằng rule/vocabulary VI/EN, `search_text`, `content_hash`, validation và truy vết nguồn.
- Import offline, transaction/idempotency, invalidation vector khi nguồn đổi, backfill/coverage/model/version/dimensions; BE phối hợp schema/quyền/kết nối database.
- Embedding sản phẩm/truy vấn; keyword + semantic, RRF mặc định `K=60`, fallback.
- Parser/intent, kiểm chứng kỹ thuật MATCH/MISMATCH/UNKNOWN, chính sách lọc public và xếp hạng.
- BGE tùy chọn tối đa Top-5; rule explanation trước, Qwen diễn đạt qua `verifiedWording`, fallback khi lỗi/timeout/không hợp lệ.
- Context/follow-up, giải thích model được chọn, guidance nhiều thành phần và giới hạn tương thích.
- Benchmark/nhãn relevance, metrics/latency, đánh giá dữ liệu/search/reranker/explanation và lỗi theo tầng. BA hỗ trợ review tiêu chí/nhãn dựa trên evidence; không dùng thứ hạng làm ground truth.

### Code, tài liệu và đầu ra

- Code: `data/`; các thư mục xử lý raw/master/normalization/enrichment/search-documents/import/backfill trong `scripts/`; `apps/api/src/ai/`, `modules/embeddings/`, `modules/search/`, `services/reranker/`, `scripts/search/`, `scripts/search-evaluation/`.
- Đọc: [Quy trình tổng hợp](ai-search-quy-trinh-tong-hop.md), [Kịch bản AI Search](script-thuyet-trinh-ai-search.md), [Parser mở rộng](parser-expansion-2026-10-14.md), [Reranker runtime](reranker-runtime.md), [Baseline v1.1](search-quality-baseline-v1.1.md), [BGE offline](reranker-bge-evaluation-v1.md).
- Nộp: pipeline dữ liệu/search, ví dụ raw → evidence CS655, thống kê dữ liệu, cấu hình model, ví dụ RRF/technical matching, bảng benchmark và case giới hạn.
- Minh họa: `cảm biến đo độ ẩm đất` → `Chỉ lấy loại hỗ trợ SDI-12` → explanation; thêm query độc lập có `hoạt động ở -40°C`. AI dùng response đã kiểm tra để giải thích; FE thao tác demo ứng dụng.
- Phản biện: vì sao giữ text, embedding có phải huấn luyện không, hybrid/RRF, UNKNOWN, retrieval miss, vai trò LLM và giới hạn số liệu.

Đây là role rộng nhất. BE hỗ trợ hạ tầng/database/vận hành, BA hỗ trợ đặc tả/nhãn/biên tập, FE hỗ trợ demo; AI vẫn chịu trách nhiệm nội dung và kết quả Data/AI.

## 6. Phân công viết báo cáo

| Chương | Phân công |
|---|---|
| 1. Tổng quan | BA: bài toán, mục tiêu, phạm vi và giá trị; nhóm xác nhận đóng góp |
| 2. Cơ sở lý thuyết/công nghệ | FE: React/routing/state; BE: NestJS/auth/database/API; AI: chuẩn hóa/pgvector/embedding/retrieval/RRF/reranker/explanation/metrics; BA biên tập thuật ngữ và nguồn |
| 3. Phân tích và thiết kế | BA: actor/use case/đặc tả/quy trình; FE: UI; BE: kiến trúc/ERD/API/quyền; AI: dữ liệu tìm kiếm và pipeline |
| 4. Triển khai | 4.1 FE: client/admin và tích hợp; 4.2 BE: server/database/nghiệp vụ; 4.3 BA: đối chiếu với yêu cầu; 4.4 AI: data và AI Search |
| 5. Kiểm thử và đánh giá | FE: UI; BE: API/security/commerce; AI: data/search/model/benchmark; BA: UAT, ma trận truy vết và tổng hợp nghiệm thu |
| 6. Kết luận | BA tổng hợp kết quả, giới hạn và hướng phát triển từ từng role |

Mỗi phần triển khai theo cùng cấu trúc: vấn đề → thiết kế → xử lý → minh họa → kiểm thử → giới hạn. Không chép toàn bộ source hoặc toàn bộ tài liệu 89 model vào thân báo cáo.

Ranh giới phối hợp:

- FE ↔ BE: màn hình/request/session browser và contract/xác minh quyền/database/nghiệp vụ server.
- BE ↔ AI: BE tổng hợp kiến trúc/ERD/migration/quyền và HTTP integration; AI làm dữ liệu/vector/RPC retrieval/logic search, kể cả service nằm trong NestJS. Import offline thuộc AI; hạ tầng database phối hợp BE.
- BA ↔ các role: BA mô tả hệ thống cần đáp ứng gì và nghiệm thu thế nào; từng role kỹ thuật mô tả cách hiện thực và kết quả.
- Dùng một ERD, bảng API và bộ tên trạng thái thống nhất; BE tổng hợp, BA kiểm tra nghiệp vụ, AI xác nhận dữ liệu search.

## 7. Thuyết trình và demo

Giả định 20 phút gồm demo, chưa gồm phản biện. Thứ tự nói: **FE → BE → BA → AI Engineer**, theo thứ tự role đã thống nhất. Bài báo cáo gửi quản lý và lời trình bày từng role nằm trong [báo cáo chung](bao-cao-chung-gui-quan-ly-theo-role.md).

| Thời gian | Role | Nội dung |
|---|---|---|
| 00:00–05:00 | FE | Mở đầu ngắn, client/admin và tích hợp; minh họa hành trình người dùng; slide 1–3 |
| 05:00–10:00 | BE | Kiến trúc, ERD, auth/quyền, giá–đơn–thanh toán; một sequence giao dịch; slide 4–6 |
| 10:00–13:00 | BA | Actor/use case, quy tắc, tiêu chí nghiệm thu và phạm vi; slide 7–8 |
| 13:00–20:00 | AI | Pipeline dữ liệu; embedding/hybrid/RRF; kiểm chứng/reranker/explanation; kết quả/giới hạn và lời kết; slide 9–12 |

AI được 7 phút vì kiêm dữ liệu và phụ trách lõi tìm kiếm. FE mở đầu và minh họa một hành trình chung; AI dùng một response để giải thích cơ chế ở phần cuối. BA biên tập lời kết cho AI trình bày; phản biện phân theo role.

Nếu demo không đủ chờ ngân hàng/OTP, dùng COD đã chạy thử và giải thích VNPay bằng sequence/kết quả sandbox đã lưu, nói rõ phần live và bằng chứng cũ. Không kéo dài buổi trình bày để chờ dịch vụ ngoài.

Nếu cần đúng 5 phút/người: giữ FE → BE → BA → AI; FE rút ngắn demo, BA bổ sung ma trận nghiệm thu, AI rút gọn cấu hình/benchmark sang slide dự phòng.

## 8. Các điểm tài liệu khác code phải thống nhất trước khi viết

| Mô tả dễ lấy nhầm từ tài liệu cũ | Căn cứ hiện tại trong code và cách viết |
|---|---|
| Kế hoạch demo đã chia 3 người, vậy thêm người thứ tư là đủ | [Kế hoạch cũ](demo-completion-tasks.md) loại Data/AI khỏi phạm vi và là kế hoạch phát triển. Phân công báo cáo hiện tại phải bao phủ cả Data/AI và phần đã triển khai |
| Frontend là Vite hoặc điều hướng chỉ bằng state | Hai `package.json` frontend dùng `react-scripts`; `App.js` client/admin đã dùng React Router. Viết React/CRA và URL routing |
| Browser đăng nhập trực tiếp Supabase; chưa có auth API hoặc refresh | `modules/auth/auth.controller.ts`, auth service phía client/admin và helper HTTP đã có login/register/refresh/me theo phần tương ứng. Đăng nhập hiện đi qua NestJS rồi Supabase Auth |
| Parser chỉ Celsius và bốn protocol | `technical-query.constants.ts` là v2; parser đã mở rộng °C/°F/K, protocol và một số đơn vị/phủ định. Vẫn có phạm vi hỗ trợ, không tuyên bố hiểu mọi câu tự nhiên |
| Mọi UNKNOWN đều được giữ trong kết quả search | `SearchService.applyTechnicalPolicy()` yêu cầu MATCH cho protocol và temperature constraint high-confidence đang áp dụng. Nhánh giải thích sản phẩm được chọn vẫn có thể trình bày unconfirmed/mismatch |
| LLM chỉ trả `option` index | `ExplanationService` hiện nhận `{ index, text }`; `verifiedWording` kiểm tra cách diễn đạt. Không mô tả như sinh văn bản tự do hoặc tự xác nhận thông số |
| Admin sửa mọi thông tin catalog, import trực tiếp từ UI | `AdminProductUpdateSchema` chỉ nhận giá; route `/import` chuyển về products; `ImportsService.run()` trả 403. Pipeline cập nhật catalog/embedding chạy offline |
| Giá hiển thị chỉ là bảng hardcode | API đã trả `price_vnd`, frontend có cập nhật giá; fallback local vẫn tồn tại. Server tính tổng từ DB và có đối chiếu quote; đơn cũ giữ snapshot |
| Có file Users thì hệ thống đã quản lý người dùng qua API | Có file mock cũ nhưng `App.js` admin hiện không đăng ký route users; không tính là chức năng quản lý người dùng đã hoàn thiện |
| “You may also need” là AI recommendation | `recommendationService.js` dùng graph khai báo sẵn rồi hydrate qua product API; chưa có recommendation endpoint/model học hành vi |
| Khách nhận thông báo tức thì qua WebSocket | Badge notification dùng polling mặc định 30 giây; phân biệt tạo thông báo ở backend với thời điểm UI tải lại |
| `embeddings:validate` chỉ kiểm tra fixture local | Script hiện truy vấn Supabase thật, kiểm coverage active, vector và metadata. Không chạy lệnh này rồi gọi đó là kiểm tra hoàn toàn offline |
| `staging:local` đủ demo tất cả thao tác admin | Script bật admin read-only. Kiểm tra môi trường trước khi demo đổi giá hoặc xử lý đơn |
| Có pgvector nghĩa đã có ANN index | Migration semantic dùng vector 1536 và phép so cosine; chưa có HNSW/IVFFlat trong migration hiện tại |

Các trang `architecture`, `frontend-handoff`, `backend-handoff`, `search-pipeline`, `grounded-explanation-design` và tài liệu tổng hợp có giá trị mô tả luồng nhưng có các đoạn lịch sử. Khi xung đột, trích đúng hành vi từ code và ghi phạm vi kiểm tra; không chọn bản mô tả thuận lợi hơn để báo cáo.

## 9. Số liệu có thể trích và cách ghi đúng

| Nội dung | Số liệu đã lưu | Người trình bày | Giới hạn |
|---|---|---|---|
| Catalog | 89 sản phẩm, 89 active, 0 review | AI Engineer | Snapshot report local, chưa xác nhận database live trong lần phân công này |
| Thông số | 3.277; 1.012 có cấu trúc, 2.265 giữ text | AI Engineer | Theo `spec-normalization-report.json`, không nói đã chuyển toàn bộ thành dữ liệu số |
| Benchmark v1.1 | 100 query; 93 có positive labels dùng tính metrics, 7 negative | AI Engineer | v1 → v1.1 thay ground truth; delta không chứng minh thuật toán đã cải thiện |
| BGE offline Top-5 | nDCG@5 từ 0,941883 lên 0,948655 | AI Engineer | Một thí nghiệm đã lưu; không gọi là độ chính xác toàn hệ thống 94,87% |
| Explanation VI/EN/context | 160 lượt HTTP; 555 explanations; 326 accepted LLM explanations | AI Engineer | Theo `output/explanation-cases-complete/report.md`; 326 là số explanation, không phải số request; kiểm tra contract/evidence không chứng minh mọi kết luận ngữ nghĩa đúng |
| Tests/build | Có các report khác nhau theo lần sửa | Từng người | Không cộng số test từ các lần chạy khác nhau. Chỉ ghi PASS hiện tại khi đã chạy lại ở đúng commit và môi trường |

Reranker và LLM explanation đều tùy chọn, mặc định tắt theo `configuration.ts`; tên model chat mặc định rỗng. Trước demo, xác nhận cờ và model của môi trường thực tế. Có explanation trên màn hình chưa chứng minh LLM được dùng; cần `source=llm` và `generation.status=accepted`.

## 10. Cách nhóm hoàn thành báo cáo và slide

1. Điền tên FE/BE/BA/AI, chốt phiên bản code và mẫu trường; ghi đóng góp thực tế riêng với phân công bảo vệ.
2. BA lập mục lục/yêu cầu/use case/acceptance criteria; FE/BE/AI xác nhận phạm vi theo code.
3. Mỗi role nộp nội dung, sơ đồ/ảnh, test và số liệu có nguồn; BA ghép báo cáo. Từng role xác nhận phần mình sau khi ghép.
4. Review FE ↔ BE về API/session/giá/trạng thái; BE ↔ AI về database/contract/timeout; BA ↔ AI về tiêu chí và nhãn relevance. BA đối chiếu yêu cầu với chức năng thật.
5. BE chuẩn bị API/database/môi trường; AI kiểm tra coverage/model/warmup/search smoke theo [demo checklist](demo-ai-search-checklist.md); FE kiểm tra client/admin và chạy hành trình; BA ghi bằng chứng nghiệm thu. Không ghi PASS cho bước chưa chạy.
6. Tập có bấm giờ theo FE → BE → BA → AI. Cả nhóm hiểu kiến trúc, vai trò ba model, nơi tính tiền và giới hạn hệ thống.

Phạm vi cập nhật: đổi phân công báo cáo/thuyết trình sang bốn role, giữ các lưu ý đối chiếu tài liệu–code. Chưa sửa code hoặc chạy lại hệ thống/benchmark.

Rủi ro: AI Engineer kiêm dữ liệu có khối lượng lớn nhất, cần BE hỗ trợ hạ tầng và BA hỗ trợ tài liệu/đánh giá. Staging mặc định chặn ghi admin; report cũ không chứng minh runtime hiện tại.
