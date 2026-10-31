# REECO AI Search — 100 câu hỏi và trả lời về Backend, Dữ liệu và AI

Ngày đối chiếu: **29/10/2026**. Tài liệu giữ nguyên 100 câu hỏi quản lí đã đặt và bổ sung câu trả lời để chuẩn bị báo cáo, phản biện và bàn giao.

**Cách đọc:** Nội dung “hiện tại” căn cứ vào mã nguồn trong repository; số liệu benchmark/test được ghi rõ là kết quả đã lưu, không phải lần chạy mới. Những tiêu chí, ưu tiên hoặc quy trình chưa có bằng chứng triển khai được ghi là **đề xuất** hoặc **chưa xác nhận**. Tên người phụ trách, đóng góp cá nhân, SLA và cam kết hỗ trợ cần nhóm xác nhận; tài liệu không tự nhận thay bạn.

Lần soạn này chỉ đọc mã nguồn/báo cáo và tạo tài liệu; không kết nối database, chạy model, tạo giao dịch, thay cấu hình hay thực hiện deployment. Khi tài liệu lịch sử khác code, câu trả lời ưu tiên code được đối chiếu.

## 1. Mục tiêu, phạm vi và trách nhiệm

Nguồn: [README](../README.md), [phân công bốn role](phan-cong-bao-cao-thuyet-trinh-4-nguoi.md), [báo cáo chung](bao-cao-chung-gui-quan-ly-theo-role.md), [checklist demo](demo-ai-search-checklist.md).

### Câu 1. Backend, xử lí dữ liệu và AI đang giải quyết những vấn đề cụ thể nào cho khách hàng REECO?

**Trả lời:** Backend cung cấp API sản phẩm, xác thực, phân quyền, giá, đơn hàng, thanh toán và thông báo. Xử lí dữ liệu đưa catalog JSON không đồng nhất thành identity, thông số, tài liệu tìm kiếm và bằng chứng có thể truy vết. AI Search giúp tìm theo nhu cầu Việt–Anh bên cạnh mã model; lớp kiểm chứng đối chiếu yêu cầu kỹ thuật và explanation trình bày căn cứ lựa chọn. Giá trị mong muốn là giảm công tra cứu catalog; chưa có nghiên cứu người dùng trong các nguồn đã đọc để định lượng mức tiết kiệm thực tế.

### Câu 2. Nếu chỉ dùng tìm kiếm theo tên và bộ lọc thông thường, người dùng sẽ gặp khó khăn gì mà AI Search có thể cải thiện?

**Trả lời:** Khách có thể biết nhu cầu như đo độ ẩm đất hoặc theo dõi nước đục nhưng chưa biết tên model hay tên thuộc tính trong catalog tiếng Anh. Semantic retrieval và vocabulary song ngữ giúp nối cách nói đó với sản phẩm liên quan. Keyword vẫn cần cho mã model và thuật ngữ chính xác. Sau truy xuất, các rule kiểm tra điều kiện được hỗ trợ để tránh coi “liên quan về nghĩa” là “đáp ứng thông số”. Chưa có thử nghiệm người dùng chứng minh toàn bộ truy vấn tự nhiên đều tốt hơn bộ lọc.

### Câu 3. Những chức năng nào đã hoàn thành, chức năng nào chỉ phục vụ demo và chức năng nào chưa được triển khai?

**Trả lời:** Code đã có catalog API, auth, admin sửa giá/lịch sử giá, orders, VNPay sandbox, notifications, pipeline offline, embedding, hybrid search, kiểm chứng kỹ thuật và explanation/context. BGE reranker và LLM explanation là tính năng tùy chọn, mặc định tắt trong cấu hình. Catalog kỹ thuật bị khóa sửa qua admin, API import trả 403; gợi ý “You may also need” dùng graph viết sẵn. Chưa có bằng chứng triển khai engine recommendation học hành vi, xác nhận tương thích toàn hệ thống, ANN index hoặc vận hành production được nghiệm thu. “Có code” chưa tương đương đã PASS trên môi trường bàn giao.

### Câu 4. Trong ba phần backend, dữ liệu và AI, bạn trực tiếp phụ trách những gì? Ai tiếp nhận khi bạn vắng mặt?

**Trả lời:** Theo phân công role, BE phụ trách API, database, auth, commerce và vận hành; AI Engineer phụ trách pipeline dữ liệu, embedding, logic search/ranking/explanation và benchmark, kể cả service NestJS thuộc search. BA hỗ trợ yêu cầu/nhãn/nghiệm thu, FE hỗ trợ tích hợp và trình diễn. Repository chưa đủ căn cứ để kết luận bạn đã trực tiếp viết mọi phần này hoặc chỉ định người thay thế. Khi trình bày, cần bổ sung tên, PR/commit hoặc đầu ra mình thực hiện và một người tiếp nhận đã được thống nhất.

### Câu 5. Những tiêu chí nào phải đạt để bạn đề xuất nghiệm thu từng phần?

**Trả lời:** Đề xuất: backend phải đạt contract, quyền truy cập, nguồn giá server, trạng thái đơn và các ngoại lệ thanh toán; dữ liệu phải đạt validation, truy vết raw và đồng bộ search index/vector; AI phải đạt bộ query đã chốt, điều kiện kỹ thuật có evidence, fallback đúng và latency được đo. Checklist hiện có yêu cầu test/build/lint, kiểm embedding live và demo smoke. Các ngưỡng chất lượng, thời gian phản hồi và biên bản UAT vẫn cần người quản lí phê duyệt; không dùng kết quả cũ làm biên bản nghiệm thu mới.

### Câu 6. Nếu chỉ còn một tuần trước bàn giao, ba việc bạn ưu tiên nhất là gì và vì sao?

**Trả lời:** Đây là đề xuất ưu tiên: (1) chốt commit, dữ liệu, cấu hình và chạy lại một vòng tích hợp để biết đúng bản đang giao; (2) xử lí các lỗi ảnh hưởng tiền, quyền và tính đúng của dữ liệu/kết luận kỹ thuật; (3) chuẩn bị môi trường, warmup, phương án fallback và tài liệu bàn giao để người khác chạy được. Các cải tiến model hoặc mở rộng catalog chỉ thực hiện khi ba nhóm việc này đã ổn định, vì chúng có thể làm thay đổi dữ liệu và kết quả benchmark sát ngày giao.

## 2. Kiến trúc backend và hợp đồng API

Nguồn: [API contract](api-contract.md), [bootstrap](../apps/api/src/main.ts), [Zod pipe](../apps/api/src/common/pipes/zod-validation.pipe.ts), [shared schemas](../packages/shared/src/schemas/api-contract.ts), [SearchService](../apps/api/src/modules/search/search.service.ts), [ProductsRepository](../apps/api/src/modules/products/products.repository.ts).

### Câu 7. Bạn hãy mô tả đường đi của một request từ frontend qua NestJS đến database và các dịch vụ AI.

**Trả lời:** Frontend gọi `/api/v1/*`; middleware áp CORS, rate limit và chế độ read-only nếu bật. Route được bảo vệ chạy auth/admin guard; controller dùng schema phù hợp kiểm request rồi gọi service, service truy cập repository hoặc RPC Supabase. Với search thông thường: resolve query/context → keyword và query embedding/semantic RPC → RRF → lọc intent và đối chiếu kỹ thuật → xếp hạng → BGE tùy chọn → lấy thông tin public → explanation nếu yêu cầu → validate response. Nhánh giải thích sản phẩm đã chọn và nhu cầu nhiều thành phần có đường xử lí riêng.

### Câu 8. Vì sao dự án chọn NestJS và Supabase? Lợi ích và hạn chế thực tế của lựa chọn này là gì?

**Trả lời:** Xét kiến trúc đang có, NestJS cung cấp module, dependency injection, guard và pipe để tách API/nghiệp vụ; Supabase cung cấp PostgreSQL, Auth, Data API và pgvector trong cùng nền tảng. Điều này phù hợp monorepo TypeScript và giảm phần hạ tầng nhóm phải tự xây. Đổi lại, API phụ thuộc kết nối Supabase, phải hiểu RLS/service-role và quản lí migration; nhiều lời gọi PostgREST riêng lẻ không tự thành một transaction. Đây là lí giải từ thiết kế hiện có, chưa phải biên bản so sánh công nghệ được nhóm lưu lại.

### Câu 9. Ranh giới trách nhiệm giữa controller, service, repository và database RPC được xác định thế nào?

**Trả lời:** Controller nhận HTTP, áp guard/pipe và chuyển request; service xử lí quy tắc như tính tiền, transition hoặc điều phối search; repository gom truy cập bảng và ánh xạ dữ liệu; RPC thực hiện tác vụ SQL như truy xuất FTS/vector hoặc cập nhật giá có audit trong database. Thực tế search adapter cũng gọi RPC trực tiếp qua SupabaseService, nên không tuyên bố mọi module tuân theo đúng một lớp repository duy nhất. Khi sửa, giữ cấu trúc đang dùng và đặt kiểm tra nghiệp vụ tại nơi mọi caller liên quan đều đi qua.

### Câu 10. Request và response được kiểm tra ở đâu? Các schema trong `packages/shared` giúp tránh lỗi tích hợp như thế nào?

**Trả lời:** `ZodValidationPipe` gọi `safeParse`, trả 400 kèm đường dẫn trường lỗi khi request sai. Ví dụ search dùng `SearchRequestSchema`: query 1–500 kí tự có chữ/số, limit 1–100, context tối đa 5 ID và cấu trúc strict. `SearchService` parse output qua `SearchResponseSchema`; các schema/type dùng chung giúp API, fixture và test thống nhất dữ liệu. Tuy nhiên, không được suy rộng thành mọi response của mọi endpoint đều được runtime-validate hoặc cả hai frontend đều sử dụng toàn bộ shared schemas; phải kiểm tra từng caller.

### Câu 11. Khi thay đổi một trường trong API, bạn xác định những frontend, script và bộ test nào cần cập nhật bằng cách nào?

**Trả lời:** Tìm bằng `rg` theo tên trường, schema, endpoint và service tương ứng trong `apps`, `packages`, `scripts`, fixture và tài liệu API. Sau đó theo luồng controller → service/repository → client/admin HTTP service → component sử dụng, đồng thời kiểm request mẫu và evaluator. Ví dụ thêm `price_vnd` phải đi tới list/detail/search, giỏ/checkout và test pricing. Đây là quy trình đề xuất áp dụng khi thay đổi; shared types không thay thế được việc tìm caller JavaScript hoặc script không được TypeScript kiểm tra.

### Câu 12. Backend phân biệt lỗi dữ liệu đầu vào, thiếu quyền, database lỗi và model lỗi như thế nào để frontend xử lí đúng?

**Trả lời:** Các mã thường dùng là 400 cho input, 401 cho token thiếu/sai, 403 cho thiếu quyền/read-only, 404 cho tài nguyên không truy cập được, 409 cho xung đột giá/trạng thái và 503 cho phụ thuộc không khả dụng. Search có error code nội bộ và fallback; một nguồn retrieval lỗi vẫn có thể trả 200, hai nguồn cùng lỗi trả 503 đã làm sạch. Explanation lỗi có thể giữ template hoặc trả kết quả không có explanation. Cách ánh xạ chưa hoàn toàn đồng nhất: một số nhánh auth còn đưa message lỗi upstream vào 500, nên chưa thể khẳng định mọi lỗi đều được chuẩn hóa và che chi tiết.

### Câu 13. Một request tìm kiếm có thể gọi database và model bao nhiêu lần? Bạn kiểm soát việc gọi lặp hoặc truy vấn N+1 thế nào?

**Trả lời:** Không có một con số cố định cho mọi request. Nhánh thông thường gọi một lượt hybrid, gồm một keyword RPC và một query embedding rồi semantic RPC; thêm các lượt batch lấy identity catalog, documents/specifications, summaries và evidence. Nếu bật BGE có thêm tối đa một lượt rerank của nhánh đó; explanation có tối đa một lượt chat cho nhóm đủ điều kiện. Các ID được gom để lấy theo batch thay vì gọi chi tiết từng kết quả. Nhánh nhiều thành phần gọi search cho từng thành phần; vì vậy phải đo query count theo nhánh, không tuyên bố mọi request chỉ gọi hai truy vấn DB.

### Câu 14. Nếu frontend nhận kết quả sai, bạn dùng thông tin gì để lần theo request và xác định tầng gây lỗi?

**Trả lời:** Lưu query, context, resolved query, mode, product ID, matched features, evidence, generation status và phiên bản dữ liệu/model của ca lỗi. So lần lượt candidate keyword/semantic, RRF, parser, matcher, lọc/rank và wording; evaluator đã có dữ liệu phục vụ phân tích theo tầng. Log hiện có sự kiện retrieval degraded, reranker và explanation. Chưa thấy cơ chế request ID/tracing xuyên suốt mọi tầng trong phần bootstrap đã đọc; đề xuất thêm mã tương quan khi cần vận hành, đồng thời tránh ghi token và thông tin cá nhân vào ca lỗi.

## 3. Database, xác thực và phân quyền

Nguồn: [migrations](../supabase/migrations/20260915081333_data_foundation_v1.sql), [commerce migration](../supabase/migrations/20261001000000_commerce_foundation.sql), [catalog RLS](../supabase/migrations/20261010000000_restrict_authenticated_catalog_read.sql), [AuthService](../apps/api/src/modules/auth/auth.service.ts), [auth guard](../apps/api/src/auth/supabase-auth.guard.ts), [admin guard](../apps/api/src/auth/admin.guard.ts), [security tests](../scripts/security/api-security.test.mjs).

### Câu 15. Những bảng chính trong database là gì? Quan hệ giữa catalog, specification, search document, search index và commerce ra sao?

**Trả lời:** `products` giữ identity/taxonomy/status; `product_specifications`, `product_documents`, `product_media` và `product_search_index` liên kết bằng `product_id`, phục vụ thông số, tài liệu, ảnh và FTS/vector. Commerce có `product_prices`, `product_price_history`, `orders`, `order_items`, `order_status_history`, `notifications`. Order thuộc `auth.users`; item tham chiếu sản phẩm nhưng lưu model, tên và giá snapshot. Quan hệ này cho phép giá/catalog hiện tại phục vụ tìm kiếm và đặt mới, còn đơn cũ giữ dữ liệu đã xác nhận lúc đặt. Cần lưu ý foreign key khi xóa sản phẩm đã có order item.

### Câu 16. Dữ liệu nào là nguồn chuẩn khi file local, database và nội dung hiển thị khác nhau?

**Trả lời:** Phải phân biệt miền dữ liệu: catalog kỹ thuật được quản lí từ raw/master và artifact đã validate, rồi phát hành vào DB; API runtime đọc bản DB đã import. Giá hiện hành lấy từ `product_prices`, lịch sử giá từ bảng audit; đơn đã tạo lấy snapshot trong order/items. Frontend và local fallback không phải nguồn quyết định thanh toán. Nếu file mới chưa được import thì chưa phải dữ liệu đang phục vụ. Khi có lệch, so hash/version và báo cáo import trước khi kết luận bên nào sai; không tự dùng file local ghi đè giá hoặc đơn hàng.

### Câu 17. Luồng đăng kí, đăng nhập, refresh token và xác minh token hiện chạy qua những thành phần nào?

**Trả lời:** Frontend gọi auth API NestJS. Register dùng Supabase admin API tạo user với `app_metadata.role='customer'` và hiện đặt `email_confirm: true`, rồi đăng nhập; đây không phải luồng yêu cầu khách tự xác minh email. Login/refresh dùng session client riêng để không đổi auth state của service-role client dùng chung. API trả access token/refresh token và thông tin user. Request được bảo vệ đi qua `SupabaseAuthGuard`, lấy Bearer token và gọi Supabase xác minh user trước khi service xử lí.

### Câu 18. Quyền admin được lấy từ đâu? Điều gì ngăn khách hàng tự gửi role hoặc sửa metadata để nâng quyền?

**Trả lời:** `AdminGuard` kiểm `request.user.app_metadata.role === 'admin'` sau auth guard; không lấy role từ request body hoặc `user_metadata`. Register gán role customer ở server; update hồ sơ chỉ cập nhật các trường user metadata cho phép. Security tests có trường hợp giả admin trong `user_metadata` vẫn bị từ chối. Việc cấp admin phải qua tài khoản/quyền quản trị tin cậy; nếu service-role secret bị lộ thì lớp bảo vệ này cũng bị đe dọa, nên bảo vệ secret là điều kiện bắt buộc.

### Câu 19. RLS bảo vệ những bảng nào? Bạn có bằng chứng khách hàng không đọc được đơn hàng hoặc dữ liệu riêng của người khác không?

**Trả lời:** Các bảng catalog bật RLS, public/authenticated thường chỉ đọc sản phẩm active; policy bổ sung cho admin đọc dữ liệu rộng hơn. Commerce bật RLS và thu hồi quyền trực tiếp của anon/authenticated, không mở policy truy cập tự do; API service-role là đường vào nghiệp vụ. Trong API, danh sách đơn lọc customer ID, chi tiết/hủy kiểm chủ đơn; thông báo cũng theo customer ID. Có test quyền và integration suite để kiểm chứng, nhưng lần soạn này chưa chạy lại chúng và chưa thử token khách thật trên DB hiện tại; bằng chứng code không thay thế kiểm thử live.

### Câu 20. Backend dùng `service_role` có thể vượt RLS; vậy kiểm tra quyền truy cập từng tài nguyên được bảo đảm ở đâu?

**Trả lời:** Auth guard xác minh danh tính, admin guard bảo vệ route quản trị; service/repository ràng buộc quyền sở hữu ở nghiệp vụ khách hàng. Ví dụ list orders lọc `customer_id`, xem/hủy đơn kiểm chủ đơn, tạo payment URL chỉ cho chủ đơn hoặc admin. Vì service-role vượt RLS, thiếu một điều kiện ở API có thể gây lộ dữ liệu dù DB bật RLS. Do đó cần test truy cập chéo cho từng endpoint có ID, không chỉ test token hợp lệ hoặc nút có bị ẩn trên giao diện hay không.

### Câu 21. Những secret nào đang được sử dụng? Bạn ngăn chúng xuất hiện trong frontend bundle, log và Git bằng cách nào?

**Trả lời:** Backend cần Supabase service-role key, database connection string chứa mật khẩu và VNPay hash secret; access/refresh token cũng là dữ liệu nhạy cảm của session. Repo ignore `.env*`; frontend chỉ nhận cấu hình công khai như API URL, không đưa backend key vào `REACT_APP_*`. Cấu hình và client phía server giữ secret để gọi dịch vụ. Chưa thực hiện secret scan toàn bộ Git history, bundle hoặc log trong lần này; `.gitignore` chỉ ngăn file mới, không chứng minh secret chưa từng bị commit. Khi bàn giao, chuyển secret qua kênh quản lí quyền phù hợp, không chép vào tài liệu này.

### Câu 22. Nếu migration thất bại hoặc schema local khác hosted, bạn phát hiện, khôi phục và xác nhận dữ liệu còn nguyên bằng cách nào?

**Trả lời:** Đối chiếu migration ledger của hosted với file versioned trong repo, xem schema/constraint/RPC và chạy validator sau thay đổi; tài liệu database đã ghi nhận việc đối chiếu lại timestamp migration lịch sử. Local có PGlite harness nhưng không kiểm runtime pgvector/event trigger đầy đủ như Supabase. Đề xuất trước thay đổi phải có backup, thử migration trên DB dùng thử, và phục hồi/forward-fix theo loại lỗi. Chưa có bằng chứng một đợt diễn tập restore đầy đủ; không dùng `db reset` trên DB đang có dữ liệu thật để giải quyết lệch schema.

## 4. Giá, đơn hàng và thanh toán

Nguồn: [OrdersService](../apps/api/src/modules/orders/orders.service.ts), [OrdersRepository](../apps/api/src/modules/orders/orders.repository.ts), [trạng thái đơn](../apps/api/src/modules/orders/orders.constants.ts), [VNPayService](../apps/api/src/modules/orders/vnpay.service.ts), [price audit migration](../supabase/migrations/20261014000000_product_price_history.sql), [commerce fixes](commerce-fixes-2026-10-14.md).

### Câu 23. Khi tạo đơn, tổng tiền được tính từ giá database hay từ dữ liệu frontend gửi lên? Vì sao?

**Trả lời:** Server lấy sản phẩm và giá từ database, kiểm tồn tại/active/có giá dương, gộp dòng trùng và kiểm quantity 1–999. Từng line total lấy giá DB nhân số lượng; subtotal cộng các dòng và total cộng shipping fee theo phương thức server cho phép. `expected_unit_price` do frontend gửi chỉ dùng để đối chiếu, không để tính tiền. Nhờ vậy sửa giá/tổng trên browser không làm giảm tiền đơn. Schema giá admin cho phép 0 nhưng tạo đơn từ chối giá không dương; 0 không có nghĩa sản phẩm được đặt miễn phí.

### Câu 24. Nếu admin đổi giá sau khi khách mở checkout nhưng trước khi tạo đơn, hệ thống phản hồi thế nào?

**Trả lời:** Khi request có `expected_unit_price`, server so với giá vừa đọc từ DB; lệch thì trả 409 trước ghi đơn để khách xem tổng mới và xác nhận lại. Frontend có cơ chế làm mới giá khi checkout/focus/polling. Trường quote hiện là tùy chọn, nên caller không gửi quote vẫn được tính theo DB. Việc đọc giá và ghi đơn chưa nằm trong cùng một DB transaction khóa giá; do đó không khẳng định đã loại bỏ mọi race nếu admin đổi giá sau lúc server đọc snapshot nhưng trước lúc lưu order.

### Câu 25. Khi giá sản phẩm thay đổi, làm sao giữ nguyên số tiền và thông tin sản phẩm của đơn hàng đã tạo?

**Trả lời:** `order_items` lưu `model`, `product_name`, `image_url`, `unit_price`, `quantity`, `line_total`; `orders` lưu subtotal, shipping fee và total. Các màn hình đơn đọc snapshot này thay vì tính lại theo `product_prices`. Vì vậy sửa giá hiện tại không viết lại đơn cũ. Tuy nhiên order item vẫn có foreign key đến sản phẩm: không nên xóa catalog tùy tiện chỉ vì đã có snapshot; cần quy trình ngừng phục vụ bảo toàn tham chiếu lịch sử.

### Câu 26. Cập nhật giá và ghi lịch sử giá có cùng transaction không? Nếu ghi lịch sử thất bại thì điều gì xảy ra?

**Trả lời:** Có, đường cập nhật giá dùng RPC `set_product_price` cùng trigger audit trong migration lịch sử giá. Actor ID/email được gắn vào ngữ cảnh của thao tác để lưu giá cũ/mới và người thay đổi; cập nhật không đổi giá không tạo audit mới. Nếu trigger ghi lịch sử lỗi, statement/transaction cập nhật giá bị rollback. Báo cáo commerce ghi đã kiểm ca này bằng PGlite và migration thật; lần này chưa chạy lại. Kết luận atomic này áp dụng đường ghi giá đó, không được suy rộng sang luồng đơn hàng/thông báo.

### Câu 27. Những chuyển trạng thái đơn hàng và thanh toán nào được phép? Ai có quyền thực hiện từng chuyển trạng thái?

**Trả lời:** Bảng `ORDER_STATUS_TRANSITIONS` quy định: chờ thanh toán → paid/thất bại/hủy; paid → xử lí/hủy; xử lí → chuyển nhà sản xuất/giao vận/hủy; chuyển nhà sản xuất → giao vận/hủy; giao vận → đã giao/hủy; thất bại → chờ thanh toán/hủy; đã giao và hủy là trạng thái kết thúc. Khách chỉ hủy đơn của mình ở tập trạng thái được cho phép, admin đi qua transition validator, callback VNPay cập nhật đơn còn chờ thanh toán. COD có quy tắc ghi paid khi giao thành công; VNPay thành công đi thẳng `PROCESSING/PAID`. Code có thêm ràng buộc theo payment method, không chỉ bảng transition.

### Câu 28. Với VNPay, backend kiểm tra chữ kí, số tiền, mã giao dịch và quyền sở hữu đơn hàng ở những bước nào?

**Trả lời:** Khi tạo URL, API yêu cầu đăng nhập, tìm order, kiểm chủ đơn/admin, payment method VNPay và trạng thái cho phép; số tiền lấy từ `orders.total`, mã tham chiếu được lưu DB và URL kí HMAC-SHA512. Verify/IPN kiểm hash, tìm đơn theo `vnp_TxnRef`, so `vnp_Amount` với total nhân 100, kiểm trạng thái và hai mã thành công trước ghi paid. Callback dựa vào chữ kí thay vì token khách. Repository còn có đường khôi phục order number từ cấu trúc txn ref cho link cũ; cần giữ test cho tình huống nhiều lần tạo link.

### Câu 29. Nếu callback và IPN đến đồng thời hoặc được gửi lại nhiều lần, điều gì ngăn cập nhật đơn và tạo thông báo trùng?

**Trả lời:** Service trả trạng thái đã thanh toán nếu `payment_status=PAID`; repository cập nhật có điều kiện order còn thuộc nhóm chờ thanh toán. Trong race thành công, chỉ request thắng đổi order sang processing; request thua đọc lại hoặc trả already-confirmed, không đi tiếp ghi thông báo của nhánh thắng. Đây là bảo vệ chống lặp hiện có. Tuy nhiên lịch sử/thông báo được insert bằng lời gọi riêng và lỗi được cảnh báo: nếu process chết sau đổi trạng thái thì có thể thiếu chúng. Chưa thể gọi toàn bộ luồng là transaction atomic hoặc bảo đảm exactly-once cho mọi loại race/thất bại.

### Câu 30. Nếu đơn đã bị hủy nhưng ngân hàng báo thanh toán thành công, hoặc khách bị trừ tiền mà hệ thống chưa ghi nhận, ai đối soát và xử lí thế nào?

**Trả lời:** Với đơn không còn chờ thanh toán, callback không tự hồi sinh đơn; verify trả `ORDER_NOT_AWAITING_PAYMENT`, IPN trả mã 02 và có log phục vụ đối soát. Nếu đơn đã paid thì phản hồi theo trạng thái đã xác nhận. Chưa có quy trình hoàn tiền/đối soát tự động hoàn chỉnh hoặc tên người trực trong bằng chứng đã đọc. Đề xuất BE cùng người vận hành được chỉ định đối chiếu txn ref, transaction number, số tiền, thời gian và trạng thái ngân hàng, sau đó xử lí đơn/hoàn tiền theo quy trình được phê duyệt; không hứa hệ thống đã tự hoàn tiền.

## 5. Nguồn dữ liệu và pipeline cập nhật

Nguồn: [quy trình tổng hợp](ai-search-quy-trinh-tong-hop.md), [raw staging](../scripts/raw-incoming/lib.mjs), [importer](../scripts/supabase/import-data-foundation.mjs), [master report](../data/reports/product-master-report.json), [raw CS616/CS650/CS655](../data/raw/CS616_CS650_CS655.json), [normalized CS655](../data/normalized/specifications/CSI_CS655.json), [search document CS655](../data/search-documents/CSI_CS655.json).

### Câu 31. Catalog ban đầu đến từ đâu? Ai xác nhận nguồn dữ liệu đáng tin và được phép sử dụng?

**Trả lời:** Pipeline nhận bộ JSON thiết bị quan trắc đã được chuẩn bị trong `data/raw`/`raw-incoming`, có thông tin sản phẩm, specification, URL và provenance theo bản ghi. Đây là đầu vào dự án chứ không phải dữ liệu phát sinh từ hành vi mua hàng. Có thể đối chiếu nội dung với tài liệu/đường dẫn nhà sản xuất trong raw, nhưng repository không tự chứng minh quyền sử dụng thương mại hay ghi rõ cá nhân đã duyệt mọi nguồn. Nhóm cần chỉ định người chịu trách nhiệm và xác nhận quyền sử dụng trước khi phát hành ngoài phạm vi hiện tại.

### Câu 32. Dự án đang nhận JSON đã chuẩn bị hay tự crawl, đọc PDF và OCR? Phạm vi thực tế đến đâu?

**Trả lời:** Luồng được tài liệu hóa là xử lí JSON catalog đã chuẩn bị: audit incoming, stage/promote, build master, chuẩn hóa, enrichment, search document, import và embedding. Không nên mô tả những script này thành bộ crawl website, parser PDF hay OCR tổng quát. Nếu muốn nhận PDF/ảnh trong tương lai, đó là một pipeline đầu vào mới cần trích xuất, nguồn và kiểm duyệt riêng; hiện chưa có bằng chứng nó thuộc chức năng hoàn thiện của dự án.

### Câu 33. Bạn hãy đi qua một sản phẩm cụ thể từ raw incoming đến master, normalized specification, enrichment, search document, database và embedding.

**Trả lời:** Có thể dùng `CSI_CS655`: dữ liệu nguồn nằm trong nhóm raw `CS616_CS650_CS655.json`; master chọn đúng identity/model và liên kết raw. Normalizer tạo `data/normalized/specifications/CSI_CS655.json` với canonical key, giá trị và raw reference; enrichment bổ sung facet theo rule/vocabulary. Builder tạo search document và hash; importer ghi products/specifications/documents/index; backfill chỉ lấy `product_search_index.search_text` để tạo vector và metadata. CS655 đã có artifact làm ví dụ, không cần đưa lại sản phẩm đang tồn tại qua incoming; với dữ liệu mới, audit/stage/promote diễn ra trước master.

### Câu 34. Mỗi bước pipeline kiểm tra những điều kiện nào trước khi cho dữ liệu đi tiếp?

**Trả lời:** Incoming kiểm cấu trúc, ID trùng và xung đột raw/canonical; master kiểm identity, taxonomy, trạng thái và raw match. Normalization kiểm giá trị, đơn vị, range, raw reference và protocol; enrichment kiểm schema/vocabulary và tính nhất quán; search document kiểm schema, coverage và content hash. Importer kiểm các artifact/hash trước kết nối DB, sau import có so dữ liệu thực với nguồn. Backfill kiểm text, model/dimension/version và hash khi ghi. Đây là nhiều bước/lệnh riêng, không nên mặc định chạy một lệnh là mọi bước đều đã tự động hoàn thành.

### Câu 35. Nếu nhiều file cùng chứa một `product_id` nhưng thông tin khác nhau, hệ thống chọn bản nào và lưu căn cứ lựa chọn ở đâu?

**Trả lời:** Stage unwrap dữ liệu, chuẩn hóa ID, gom bản ghi và dùng quy tắc chọn raw đại diện; master hiện có và canonical record là căn cứ ưu tiên theo luồng đã tài liệu hóa, curation có thể ghi đè quyết định representative/family. Report stage/audit và metadata nguồn giữ các vị trí để đối chiếu. Chọn representative không chứng minh hai bản mâu thuẫn đều đúng; xung đột identity/taxonomy chưa giải quyết phải được review. Không được chỉ lấy file đến sau hoặc âm thầm bỏ một variant có thông số khác.

### Câu 36. Product family, sản phẩm đại diện và variant được phân biệt thế nào để tránh gán nhầm thông số giữa các phiên bản?

**Trả lời:** Family nhóm những phiên bản liên quan; representative xác định sản phẩm được đưa vào master/search, còn variant lưu identity và đặc điểm phân biệt trong dữ liệu variants. Curation quyết định representative, provenance chỉ về raw cụ thể; API detail có trường variants. Khi chuẩn hóa và làm evidence phải giữ điều kiện/phiên bản gắn với thông số, không hợp tất cả giá trị thành khả năng chung của mọi thành viên. Dù có cấu trúc family/variant, vẫn cần review dữ liệu từng nhóm; không thể suy ra mọi cấu hình đã được xác nhận tương thích.

### Câu 37. Vì sao import catalog qua admin đang bị chặn? Người vận hành phải cập nhật catalog bằng quy trình nào?

**Trả lời:** `ImportsService.run()` luôn ném 403 và schema admin chỉ cho sửa giá: catalog demo được khóa để tránh sửa specification mà document/index/vector không cập nhật đồng bộ. Khi cần đổi catalog, người phụ trách chạy audit/stage/promote nếu có incoming, build/validate master → normalization → enrichment → search document, rồi dry-run/import/validate DB và backfill embedding. Backfill mặc định là dry-run, muốn ghi dùng `npm run embeddings:backfill -- --execute`. Chạy smoke trước khi sử dụng bản mới; không mở khóa UI chỉ để bỏ qua pipeline.

### Câu 38. Import có tính lặp an toàn như thế nào? Bạn chứng minh chạy lại không tạo bản ghi trùng hoặc ghi đè dữ liệu không cần thiết bằng gì?

**Trả lời:** Import dùng khóa/unique constraint và upsert; chỉ update khi nội dung có khác biệt. Document dựa vào `content_hash`, index dựa vào source hash và index version, specification dựa vào source key và giá trị; dữ liệu không đổi được bỏ qua. Có local harness và report thống kê số bản ghi đổi/xóa để đối chiếu hai lần import cùng input. Đây là idempotency với cùng snapshot hợp lệ, không có nghĩa mọi snapshot mới đều an toàn hoặc không có thao tác delete. Lần soạn này chưa import lại, nên không ghi kết quả mới.

### Câu 39. Nếu import lỗi giữa chừng, phạm vi rollback là gì? Những thay đổi nào có thể đã xảy ra ngoài transaction?

**Trả lời:** `importData` dùng transaction của thư viện postgres cho thay đổi các bảng catalog trong lượt import; lỗi SQL bên trong làm rollback các thay đổi đó. Artifact build, file report và các batch embedding là công việc riêng, không được rollback cùng transaction catalog. Validation DB diễn ra sau import; nếu bước này báo sai sau commit, dữ liệu đã ghi không tự hoàn nguyên. Vì vậy cần validate nguồn trước, backup và kế hoạch khôi phục; không nói toàn chuỗi raw → embedding là một transaction duy nhất.

### Câu 40. Khi sản phẩm đổi thông số, bị ngừng bán hoặc bị loại khỏi catalog, những bảng và artifact nào phải cập nhật để kết quả tìm kiếm không bị cũ?

**Trả lời:** Cần cập nhật master/normalized/enriched/search document rồi đồng bộ products, specifications, documents, media và search index; hash/index version đổi sẽ xóa vector cũ để backfill lại. Public hydration chỉ nhận active là lớp chặn cuối. Có giới hạn quan trọng: importer hiện xóa một số dữ liệu cho review ID và có nhánh xóa products review, nhưng không tự quét xóa mọi ID đã biến mất khỏi master; foreign key order item cũng có thể chặn xóa. Vì vậy ngừng bán/loại bỏ cần quy trình được kiểm tra riêng, giữ tham chiếu đơn cũ và xác nhận DB không còn active ngoài ý muốn; không chỉ xóa file local.

## 6. Chuẩn hóa và chất lượng dữ liệu

Nguồn: [normalization engine](../scripts/spec-normalization/lib.mjs), [normalization report](../data/reports/spec-normalization-report.json), [semantic enrichment](../scripts/semantic-enrichment/lib.mjs), [vocabulary](../data/ontology/semantic-vocabulary.json), [audit specifications](../scripts/supabase/audit-specifications.mjs), [parser expansion](parser-expansion-2026-10-14.md).

### Câu 41. Những tên thông số khác nhau được quy về canonical key theo quy tắc nào? Ai duyệt các quy tắc đó?

**Trả lời:** Engine dùng rule/mapping theo nhãn, nhóm và ngữ cảnh thông số để tạo canonical key và quantity kind ổn định, thay vì chỉ dùng tên hiển thị nguyên văn. Các key kỹ thuật được matcher chọn bằng allowlist, ví dụ operating temperature tách khỏi storage/accuracy. Bộ rule nằm trong code, validator/report phát hiện xung đột và mất nguồn. Theo phân công, AI Engineer chịu trách nhiệm và BA hỗ trợ review; chưa có danh sách người kí duyệt từng mapping, nên không khẳng định tất cả đã được chuyên gia độc lập chứng nhận.

### Câu 42. Vì sao một phần specification được chuyển thành dữ liệu có cấu trúc, còn phần khác vẫn giữ text?

**Trả lời:** Chỉ cấu trúc hóa khi engine hiểu chắc kiểu giá trị, đơn vị và ý nghĩa; các mô tả có điều kiện, nhiều ý hoặc hình dạng chưa hỗ trợ được giữ text để không làm sai nghĩa. Snapshot report ghi 3.277 specification: 1.012 có cấu trúc và 2.265 giữ text có chủ đích. Những giá trị text vẫn hữu ích để hiển thị và tìm kiếm, nhưng không mặc nhiên đủ cho phép so sánh số. Số liệu này là artifact đã lưu; không phải xác nhận mới về DB live.

### Câu 43. Khi không parse được một giá trị, hệ thống giữ nguyên, đánh dấu chờ kiểm tra hay loại bỏ? Làm sao tránh mất thông tin?

**Trả lời:** Luồng ưu tiên giữ text/value raw và raw reference, kèm diagnostic theo loại vấn đề; trường không parse chắc không bị ép thành số hoặc xóa bỏ để làm đẹp thống kê. Validator phân biệt phần giữ text có chủ đích với lỗi cần sửa. Nếu thiếu nguồn hoặc cấu trúc không hợp lệ, bước kiểm tra phải báo lỗi thay vì để downstream tự đoán. Ở runtime, không có dữ liệu chuẩn phù hợp sẽ dẫn tới chưa xác nhận/UNKNOWN, không bịa giá trị từ tên sản phẩm.

### Câu 44. Bạn xử lí đơn vị, khoảng giá trị, dấu âm, dấu thập phân và chuyển đổi °C/°F/K thế nào?

**Trả lời:** Dữ liệu chuẩn giữ kiểu number/range/unit, còn parser query v2 nhận các dạng °C/°F/K, tên đơn vị, dấu phẩy thập phân và range có đơn vị ở hai đầu; quy đổi nhiệt độ về Celsius trước so sánh. `unit-query` chuẩn hóa các họ được hỗ trợ như Hz/kHz/MHz, V/mV, A/mA/µA, W/mW, m/cm/mm và Pa/kPa/MPa/bar. Rule giữ dấu âm, phân biệt milli/mega và không gộp VAC với VDC. Không tuyên bố đã hỗ trợ mọi đơn vị, bất đẳng thức nghiêm ngặt hay dung sai.

### Câu 45. Nếu cùng một thông số có nhiều giá trị theo điều kiện hoạt động hoặc variant, hệ thống lưu và chọn đúng điều kiện thế nào?

**Trả lời:** Specification có source key/raw reference riêng; các dòng cùng canonical key vẫn có thể giữ nhiều giá trị hợp lệ theo điều kiện và được nhóm khi hiển thị, không tự loại bằng một map chỉ giữ một dòng. Variant và qualifier phải đi cùng giá trị. Matcher chỉ dùng nhóm key/value shape nó hiểu đúng và trả UNKNOWN khi bằng chứng không đủ diễn giải. Cần review trường hợp duty mode hoặc điều kiện đặc biệt; không dùng giá trị tối đa của một cấu hình để xác nhận cho mọi phiên bản sản phẩm.

### Câu 46. Từ một thông số đã chuẩn hóa, bạn có thể truy ngược về đúng dòng dữ liệu nguồn bằng cách nào?

**Trả lời:** Theo `raw_ref` về raw file, chỉ mục/vị trí sản phẩm và thông số nguồn; đối chiếu `value_raw` với `normalized_value` và canonical key. Artifact CS655 là ví dụ cụ thể để lần từ normalized trở lại raw nhóm CS616/CS650/CS655. Script `supabase:audit-specifications` đối chiếu specification live với normalized artifact và raw row, báo thiếu/đổi dòng, encoding hoặc khóa lặp. Lệnh này đọc DB thật; lần soạn tài liệu chưa chạy, nên không đánh dấu audit hiện tại đã PASS.

### Câu 47. Semantic enrichment và từ vựng Việt–Anh được tạo, duyệt và kiểm chứng thế nào để không bổ sung khả năng sản phẩm không có?

**Trả lời:** Enrichment sử dụng rule, normalized data và vocabulary miền trong `data/ontology/semantic-vocabulary.json` để tạo measurements, capabilities, applications, protocol và keyword song ngữ. Đây không phải cho LLM tự viết mọi khả năng sản phẩm. Schema/validator kiểm cấu trúc và tính nhất quán; review nguồn và test chống false positive vẫn cần thiết vì rule hợp lệ có thể gán sai ngữ nghĩa. Facet giúp retrieval nhưng kết luận giao thức/nhiệt độ phải theo evidence phù hợp; chưa có bằng chứng mọi enrichment đã được nhiều chuyên gia độc lập duyệt.

### Câu 48. Bạn đo chất lượng dữ liệu bằng những chỉ số nào? Với lỗi encoding, thiếu trường, trùng identity và mâu thuẫn thông số, ngưỡng nào khiến pipeline phải dừng?

**Trả lời:** Report theo dõi coverage, ID/model trùng, raw match, taxonomy conflict, invalid range, missing raw reference, protocol false positive, giá trị không được raw hỗ trợ và blocking error. Snapshot normalization có 0 blocking error nhưng vẫn ghi 20 unknown unit; vì vậy không đọc PASS thành “hiểu được toàn bộ đơn vị”. Lỗi schema/identity/hash/truy vết bắt buộc phải được xử lí trước import; threshold cụ thể theo validator hiện có. Đề xuất chốt thêm mức chấp nhận encoding/warning với nhóm; chưa có một SLA chất lượng chung cho mọi loại cảnh báo.

## 7. Embedding và lưu trữ vector

Nguồn: [Ollama provider](../apps/api/src/ai/ollama-embedding.provider.ts), [embedding module](../apps/api/src/modules/embeddings/embeddings.module.ts), [backfill](../scripts/create-embeddings/backfill.mjs), [backfill logic](../scripts/create-embeddings/lib.mjs), [live validator](../scripts/create-embeddings/validate.mjs), [semantic migration](../supabase/migrations/20260916080205_step7_semantic_search_foundation.sql).

### Câu 49. Embedding có vai trò gì trong dự án? Nó khác việc huấn luyện hoặc fine-tune model như thế nào?

**Trả lời:** Embedding biến search text và query thành vector để so mức gần nhau về ngữ nghĩa, giúp tìm cả khi từ khóa không trùng hoàn toàn. Backfill tạo và lưu vector cho sản phẩm; lúc tìm kiếm chỉ tạo vector query rồi so với vector đang lưu. Đây là inference bằng model đã có, không cập nhật trọng số. Fine-tune/huấn luyện cần dữ liệu và quy trình tối ưu trọng số riêng; chưa có bằng chứng dự án đã thực hiện bước đó. Thêm sản phẩm hoặc backfill lại không có nghĩa đã “huấn luyện AI với catalog”.

### Câu 50. Vì sao chọn `qwen3-embedding:4b` và vector 1536 chiều? Bạn có đánh giá lựa chọn này trên tiếng Việt và thuật ngữ thiết bị không?

**Trả lời:** Đây là contract đã triển khai thống nhất giữa provider, metadata và cột `vector(1536)`, chạy local qua Ollama. Dự án có benchmark/query và thử nghiệm retrieval song ngữ, nên có bằng chứng đánh giá pipeline với model này trên thuật ngữ catalog. Tuy nhiên chưa có báo cáo so nhiều embedding model hoặc kích thước vector trên cùng điều kiện để kết luận nó tối ưu nhất. Lựa chọn hiện tại có thể được giữ để ổn định bản demo; đổi model/dimension phải migration và tạo lại vector, không chỉ đổi tên biến môi trường.

### Câu 51. Nội dung nào thực sự được đưa vào embedding? Những nội dung nào bị loại và vì sao?

**Trả lời:** Backfill đọc duy nhất `product_search_index.search_text`, do search document builder tạo từ dữ liệu catalog và enrichment được chọn. Không gửi nguyên object sản phẩm, source JSON, ảnh, file PDF, secret, đơn hàng hoặc metadata đánh giá vào model embedding. URL không được embed như nội dung tài liệu nguồn chỉ vì có trong raw. Giá được quản lí riêng và không tham gia truy hồi AI theo phạm vi demo. Cách này làm đầu vào có kiểm soát, hash được và tái tạo được; không phải cơ chế tự đọc mọi tài liệu được liên kết.

### Câu 52. Làm sao bảo đảm embedding của truy vấn và sản phẩm dùng model, số chiều và phiên bản tương thích?

**Trả lời:** Provider kiểm cấu hình 1536 chiều và model/version không rỗng; response được kiểm số lượng vector, số chiều và giá trị hữu hạn. Mỗi index row lưu model, dimensions, version, embedded_at cùng vector; semantic RPC nhận model/version bắt buộc và chỉ lấy hàng tương ứng. Cột vector cố định chiều và constraint metadata bổ sung bảo vệ DB; live validator kiểm coverage và metadata thực tế. Vì vậy không dùng lẫn vector khác version trong cùng truy vấn; nếu đổi model phải backfill và xác nhận coverage trước khi bật.

### Câu 53. Khi nội dung sản phẩm thay đổi, vector cũ được vô hiệu hóa và tạo lại như thế nào? Trong thời gian đó sản phẩm còn được tìm thấy qua đường nào?

**Trả lời:** Nếu source content hash hoặc index version đổi, importer cập nhật search text và đặt vector cùng metadata embedding về null trong lượt import. Backfill tạo lại embedding từ text mới và ghi khi nguồn vẫn đúng. Khi chưa có vector hợp lệ, sản phẩm không được semantic RPC dùng, nhưng index từ khóa mới vẫn có thể truy xuất nếu sản phẩm còn active. Nếu semantic RPC vẫn chạy thành công, public mode có thể vẫn là hybrid dù coverage thiếu; phải dùng validator để phát hiện thiếu vector, không chỉ nhìn mode.

### Câu 54. Nếu dữ liệu thay đổi trong lúc backfill đang chạy, điều gì ngăn vector tạo từ nội dung cũ ghi đè trạng thái mới?

**Trả lời:** Backfill đọc source hash và index version cùng text trước khi gọi model. Câu UPDATE sau đó yêu cầu `product_id`, hash và index version vẫn khớp, đồng thời sản phẩm vẫn active. Nếu nguồn đổi hoặc không còn active, UPDATE không ghi vector cũ; report phải thể hiện hàng không cập nhật để xử lí ở lượt sau. Đây là kiểm tra lạc quan tại DB, tránh giữ transaction lâu trong lúc chờ model; không có nghĩa backfill tự khóa mọi cập nhật catalog.

### Câu 55. Bạn kiểm tra coverage embedding, metadata thiếu, vector sai chiều hoặc giá trị không hợp lệ bằng cách nào?

**Trả lời:** `npm run embeddings:validate` hiện đọc Supabase thật, đếm sản phẩm active và lấy index theo trang. Script kiểm có search text, vector đúng chiều cấu hình, mọi phần tử hữu hạn, có phần tử khác 0, model/version/dimensions/timestamp đúng và số embedding current bằng số active. Provider còn kiểm response ngay khi inference, DB constraint kiểm hình dạng lưu trữ. Vì đây là validator live, cần cấu hình đúng DB và không gọi nó là kiểm fixture offline; lần tài liệu này chưa chạy lệnh đó.

### Câu 56. Hiện truy vấn vector quét chính xác hay dùng ANN index? Khi catalog tăng lên hàng chục nghìn sản phẩm, căn cứ nào khiến bạn đổi chiến lược?

**Trả lời:** Migration semantic hiện dùng cosine distance và exact scan với tie-break ổn định; chưa tạo HNSW/IVFFlat. Với snapshot 89 sản phẩm, chưa có số đo buộc phải thêm ANN. Khi tăng dữ liệu, đề xuất đo `EXPLAIN ANALYZE`, p95, CPU/memory và tải đồng thời, rồi so exact với ANN trên cùng bộ nhãn để lượng hóa latency/recall. Không đặt một mốc số lượng tùy ý thành quy tắc tuyệt đối; ANN thêm chi phí build/cập nhật index và có đánh đổi truy xuất cần đo.

## 8. Retrieval, hợp nhất và reranking

Nguồn: [keyword SQL](../supabase/migrations/20260915081333_data_foundation_v1.sql), [HybridSearchService](../apps/api/src/modules/search/hybrid-search.service.ts), [RRF scoring](../apps/api/src/modules/search/search-score.service.ts), [SearchService](../apps/api/src/modules/search/search.service.ts), [reranker service](../apps/api/src/modules/search/reranker.service.ts), [BGE offline](reranker-bge-evaluation-v1.md), [reranker runtime](reranker-runtime.md).

### Câu 57. Keyword search và semantic search mạnh, yếu ở những loại truy vấn nào? Vì sao cần kết hợp cả hai?

**Trả lời:** Keyword phù hợp từ/mã xuất hiện trực tiếp trong index, dễ giải thích nhưng có thể hụt khi khách diễn đạt khác hoặc dùng ngôn ngữ khác. Semantic hỗ trợ nhu cầu và cách nói tương đương nhưng có thể đưa sản phẩm gần nghĩa mà sai model hoặc điều kiện kỹ thuật. Hybrid hợp candidate để tận dụng hai hướng rồi kiểm chứng bằng rule/evidence. Benchmark phải xem cả lỗi từng nguồn; kết quả cuối đúng không chứng minh keyword và semantic đều tốt ở mọi query.

### Câu 58. Keyword search xử lí tiếng Việt, dấu câu, mã model và thuật ngữ giao thức như thế nào?

**Trả lời:** DB tạo `tsvector` bằng cấu hình `simple`, GIN index và `websearch_to_tsquery`; search text có nội dung/keyword song ngữ từ pipeline. Đây không phải bộ tách từ tiếng Việt chuyên biệt hoặc bảo đảm tìm không dấu tự động. Chuẩn hóa identity và protocol ở tầng query/matching xử lí một số biến thể dấu cách/gạch nối, nhưng chỉ có tác dụng theo phạm vi rule và candidate truy xuất được. Dấu câu, mã model và tên giao thức cần regression riêng; không tuyên bố FTS tự hiểu mọi alias, lỗi gõ hoặc dấu tiếng Việt.

### Câu 59. RRF hợp nhất hai danh sách bằng cách nào? Vì sao chọn `K = 60`, và đã có bằng chứng cần điều chỉnh chưa?

**Trả lời:** Mỗi sản phẩm nhận tổng `1 / (K + rank)` từ các nguồn có chứa nó; sau đó sắp xếp theo điểm và tie-break xác định. RRF dùng thứ hạng nên không phải đưa lexical score và cosine về một thang đo giả. `SEARCH_RRF_K` mặc định 60 là baseline đã chốt, chưa có bằng chứng tuning nhiều K để nhận là tối ưu. Muốn đổi phải giữ benchmark/nhãn cố định, kiểm identity/technical safety và latency; không đổi chỉ vì một query demo nhìn tốt hơn.

### Câu 60. Số lượng candidate lấy từ mỗi nguồn khác số kết quả trả cho khách thế nào? Giới hạn candidate có thể làm mất sản phẩm đúng ở đâu?

**Trả lời:** `SEARCH_RETRIEVAL_LIMIT` mặc định 20 cho mỗi nguồn; SearchService lấy ít nhất bằng request limit, rồi chặn độ sâu trong 1–100. Hợp candidate, lọc kỹ thuật và hydrate active xong mới áp limit trả khách. Một sản phẩm đúng ngoài cả hai danh sách nguồn sẽ không đến được tầng ranking; nhiều candidate bị lọc cũng có thể làm kết quả ít hơn limit. Tăng độ sâu có thể tăng recall nhưng thêm DB/matching/rerank evidence cost; cần đo thay vì coi limit response là recall của toàn catalog.

### Câu 61. Nếu một nguồn retrieval lỗi, cả hai nguồn lỗi hoặc cả hai trả rỗng, API trả trạng thái và chế độ tìm kiếm nào?

**Trả lời:** Hybrid chạy hai nguồn bằng `Promise.allSettled`; keyword thành công/semantic lỗi → 200, mode keyword; semantic thành công/keyword lỗi → 200, mode semantic. Cả hai lỗi → lỗi hybrid, SearchService trả 503 thông báo an toàn. Nguồn trả rỗng được coi là thành công, nên hai nguồn chạy xong nhưng rỗng vẫn là 200/hybrid với results rỗng và guidance phù hợp. Các nhánh trả guidance sớm có thể không gọi retrieval; không dùng riêng mode để kết luận model chắc chắn đã được gọi.

### Câu 62. Một model được nhập chính xác có luôn đứng đầu không? Nếu nó không nằm trong tập candidate ban đầu thì hệ thống xử lí ra sao?

**Trả lời:** Không thể bảo đảm chỉ từ việc nhận diện đúng model. Khi exact identity đã ở candidate và còn qua các điều kiện áp dụng, technical ranking ưu tiên nó, BGE có bảo vệ exact; SearchService còn scope về identity khi đã nhận diện. Nếu không nằm trong retrieved union, code không tự thêm nó chỉ vì parser tìm được identity; có thể trả rỗng. Report stress cũ ghi 89/89 exact Top-1 trên snapshot đã đo, nhưng đó là kết quả thử nghiệm cụ thể, không phải bảo đảm với mọi typo/alias/dữ liệu tương lai.

### Câu 63. Vì sao BGE chỉ xếp hạng lại tối đa Top-5? Giới hạn này khiến những lỗi nào không thể được sửa?

**Trả lời:** Thí nghiệm offline đã lưu cho thấy Top-5 cải thiện nDCG@5 từ 0,941883 lên 0,948655; Top-10/20 trong thí nghiệm đó có chất lượng kém hơn baseline ở chỉ số này và xuất hiện regression protocol. Giới hạn 5 giảm chi phí và phạm vi tác động, được config/service kiểm. Nó chỉ đổi thứ tự 5 ứng viên đầu, không kéo sản phẩm từ vị trí 6+ lên hoặc khắc phục sản phẩm không được retrieval lấy ra. Vì vậy không coi reranker là cách sửa mọi lỗi recall.

### Câu 64. Khi bật reranker, những bảo vệ nào giữ được exact identity, kết quả kiểm chứng kỹ thuật và thứ tự phần còn lại? Nếu reranker timeout hoặc trả ID sai thì sao?

**Trả lời:** BGE nhận prefix đã qua lọc/ranking; output phải đúng model/revision, score hữu hạn và là hoán vị không trùng/thiếu/thừa ID của prefix. Sau đó exact identity được đưa lại đầu, còn phần đuôi giữ nguyên. Candidate bị loại trước đó không thể được BGE đưa trở lại. Lỗi, timeout hoặc response không hợp lệ trả nguyên baseline; public mode không đổi và `scores.rerank` vẫn null. Độ trễ evidence load nằm ngoài timeout HTTP BGE, nên 350 ms không phải trần cho toàn bộ stage rerank.

## 9. Hiểu truy vấn và kiểm chứng thông số

Nguồn: [parser constants](../apps/api/src/modules/search/technical-query.constants.ts), [parser](../apps/api/src/modules/search/technical-query-parser.service.ts), [technical matcher](../apps/api/src/modules/search/technical-match.service.ts), [SearchService](../apps/api/src/modules/search/search.service.ts), [protocol rules](../apps/api/src/modules/search/protocol-query.ts), [unit rules](../apps/api/src/modules/search/unit-query.ts), [parser expansion](parser-expansion-2026-10-14.md).

### Câu 65. Parser hiện hỗ trợ những giao thức, đơn vị, biểu thức số và dạng câu nào? Những dạng nào còn ngoài phạm vi?

**Trả lời:** Parser v2 có SDI-12, RS-485/232/422, Modbus và RTU/TCP/ASCII, Wi-Fi, USB, CANbus, CPI, Ethernet, PakBus, DNP3, MQTT, TCP/IP. Nhiệt độ hỗ trợ °C/°F/K và một số point/range/“đo tới”; các helper hỗ trợ một số họ đơn vị điện, tần số, chiều dài, áp suất, cùng dạng phủ định đã định nghĩa. Phạm vi còn dựa vào rule và ngữ cảnh: chưa bao phủ toàn bộ bất đẳng thức `<`/`>`, dung sai, đơn vị hay radio range phụ thuộc triển khai. Không gọi đây là bộ hiểu ngôn ngữ tự nhiên không giới hạn.

### Câu 66. Hệ thống phân biệt nhiệt độ hoạt động, nhiệt độ đo, nhiệt độ lưu trữ và độ chính xác như thế nào?

**Trả lời:** Parser gán intent theo nhãn/mệnh đề; matcher dùng allowlist canonical key riêng cho operating và measurement. Storage, survivability, accuracy, resolution và các key không đúng nghĩa không được lấy thay cho dải cần kiểm. Nhánh giải thích còn xem môi trường/đại lượng đo; câu mơ hồ có thể yêu cầu làm rõ. Do đó dải vận hành −40–60°C không tự chứng minh thiết bị đo được nước/không khí ở mọi giá trị trong dải đó. Nếu không có key/range phù hợp, kết quả phải là chưa xác nhận.

### Câu 67. `MATCH`, `MISMATCH` và `UNKNOWN` có nghĩa gì? Bạn chứng minh thiếu bằng chứng không bị hiểu thành “không hỗ trợ” bằng trường hợp nào?

**Trả lời:** MATCH là có evidence đúng loại xác nhận yêu cầu; MISMATCH là bằng chứng cho thấy không đáp ứng trong phạm vi evaluator; UNKNOWN là thiếu, mơ hồ hoặc không diễn giải chắc được dữ liệu. Ví dụ hỏi CS655 có USB khi catalog chỉ xác nhận giao tiếp khác: lời giải thích phải nêu chưa xác nhận USB, không suy ra hỗ trợ hoặc chắc chắn không có. Runtime có requirement status confirmed/unconfirmed/mismatch và test chống đổi uncertainty. UNKNOWN có thể bị loại khỏi một danh sách bắt buộc phải xác nhận, nhưng loại khỏi kết quả không biến nó thành MISMATCH.

### Câu 68. Chính sách hiện tại giữ hoặc loại `UNKNOWN` như thế nào ở tìm kiếm thông thường và giải thích một sản phẩm được chọn? Vì sao hai nhánh có thể khác nhau?

**Trả lời:** `applyTechnicalPolicy` hiện chỉ cho qua các protocol match đều MATCH và các temperature constraint high-confidence đều MATCH khi technical policy áp dụng; UNKNOWN ở điều kiện đó không đủ để đưa vào danh sách đã xác nhận. Đây khác một số tài liệu cũ nói chỉ loại hard mismatch. Nhánh giải thích model người dùng đã chọn lấy bằng chứng trực tiếp theo ID và có thể trình bày partial match/unconfirmed/mismatch. Hai nhánh phục vụ mục tiêu khác: lọc ứng viên đáp ứng yêu cầu và giải thích trung thực một sản phẩm cụ thể; capability question cũng có xử lí riêng.

### Câu 69. Bạn phân biệt RS-485 với Modbus, hoặc Modbus chung với Modbus RTU/TCP như thế nào để tránh kết luận sai khả năng tương thích?

**Trả lời:** Chuẩn hóa tên không gộp các khái niệm này làm một. Có RS-485 không tự xác nhận Modbus RTU; có Ethernet không tự xác nhận Modbus TCP. Query Modbus chung có thể nhận evidence trong họ Modbus theo rule, nhưng yêu cầu biến thể cụ thể cần evidence phù hợp biến thể đó. Kiểm giao thức còn chưa đủ xác nhận hai thiết bị tương thích: vai trò, dây nối, cấu hình, nguồn và phụ kiện vẫn phải xem. Các regression trong parser expansion kiểm tránh suy luận RTU/TCP chỉ từ cổng vật lí.

### Câu 70. Với yêu cầu gồm nhiều điều kiện, chẳng hạn “đo độ ẩm đất, SDI-12, hoạt động ở −40°C”, hệ thống đánh giá từng điều kiện và quyết định kết quả cuối thế nào?

**Trả lời:** Intent tìm sản phẩm đo đúng đại lượng, parser nhận SDI-12 và operating temperature, matcher kiểm từng ứng viên trên document/specification. Các điều kiện bắt buộc phải có evidence phù hợp; ứng viên thiếu hoặc không đáp ứng bị loại theo policy hiện tại. Các ứng viên còn lại xếp theo technical policy rồi retrieval, BGE nếu bật và hydrate active. Explanation nêu căn cứ từng yêu cầu. Nếu không có sản phẩm xác nhận đồng thời, trả rỗng kèm hướng dẫn làm rõ; không bỏ bớt một điều kiện để ép có kết quả.

### Câu 71. Những biểu thức như “ít nhất”, “không quá”, “từ…đến…” hoặc “không dùng Wi-Fi” được hỗ trợ ở những nhánh nào và kiểm tra ra sao?

**Trả lời:** “Từ…đến…” và một số kiểu upper-bound/nhiệt độ có rule; các phép so đơn vị chỉ áp dụng khi helper nhận được đúng quantity và shape. Không thể cam kết mọi câu “ít nhất/không quá” hoặc so sánh nghiêm ngặt đều được hỗ trợ; tài liệu expansion nêu giới hạn bất đẳng thức/dung sai. Phủ định giao thức đi qua `protocolRequirements`/`parseNegativeConstraints`; một số follow-up chỉ có loại trừ được ghép context, dạng không hiểu được hỏi lại. Cần test riêng negation, “không cần” và câu hỏi “có … không?” để không đảo thành yêu cầu dương.

### Câu 72. Với câu “hồ cá bị bẩn, nên dùng thiết bị gì”, làm sao hệ thống tránh nhầm thiết bị quan trắc với thiết bị xử lí nước hoặc khẳng định một bộ thiết bị chắc chắn tương thích?

**Trả lời:** Intent/guidance giải thích thiết bị trong catalog chủ yếu đo và theo dõi: cảm biến độ đục cho số liệu về độ đục, không tự làm sạch nước hoặc xử lí nguyên nhân. Nếu chưa rõ đại lượng/mục tiêu, cần làm rõ thay vì chẩn đoán từ một câu chung. Với nhiều thành phần, backend đưa ứng viên theo vai trò cảm biến, bộ ghi, truyền thông, nguồn và nêu chưa xác nhận tương thích/kênh/công suất/lắp đặt. Không có bằng chứng một bộ suy luận thiết kế hệ thống hoàn chỉnh hay hiệu quả xử lí hồ cá đã được kiểm chứng.

## 10. LLM, giải thích và hội thoại

Nguồn: [ExplanationService](../apps/api/src/modules/search/explanation.service.ts), [verified wording](../apps/api/src/modules/search/explanation-wording.ts), [conversation resolver](../apps/api/src/modules/search/conversation-query.ts), [search request/response](../packages/shared/src/schemas/api-contract.ts), [SearchService](../apps/api/src/modules/search/search.service.ts), [parser expansion](parser-expansion-2026-10-14.md).

### Câu 73. Ba model embedding, reranker và explanation nhận đầu vào, trả đầu ra và chịu trách nhiệm khác nhau như thế nào?

**Trả lời:** `qwen3-embedding:4b` nhận text và trả vector 1536 chiều để retrieval. `BAAI/bge-reranker-v2-m3` nhận query và document evidence của candidate, trả score/logit dùng đổi thứ tự trong Top-5. `qwen3:4b-instruct-2507-q4_K_M` là model chat dùng trong các lượt thử đã lưu, nhận query/evidence/các cách diễn đạt và trả JSON `{index,text}` để wording được kiểm chứng. Embedding không viết giải thích; BGE không tự quyết thông số; chat không được thay kết luận kỹ thuật. Tên model chat runtime phải cấu hình, mặc định rỗng.

### Câu 74. Nếu tắt LLM explanation, người dùng vẫn nhận được những chức năng gì? Phần nào thực sự cần model chat?

**Trả lời:** Người dùng vẫn có keyword/semantic/hybrid, parser, lọc/xếp hạng kỹ thuật, evidence, guidance/context và explanation theo rule khi `explain:true`; BGE có cờ độc lập. Chat model chỉ phục vụ bước diễn đạt trong phạm vi wording được kiểm chứng, không phải nguồn duy nhất của câu trả lời. `LLM_EXPLANATION_ENABLED=false` hoặc thiếu `LLM_MODEL` khiến generation disabled. Vì vậy có lời giải thích trên màn hình không chứng minh chat đang chạy; đồng thời tắt chat không đồng nghĩa tắt toàn bộ AI Search.

### Câu 75. Qwen hiện được phép thay đổi những gì trong lời giải thích? Phần nào bắt buộc phải giữ từ bằng chứng đã kiểm chứng?

**Trả lời:** Backend tạo explanation gốc trước, đưa các phương án diễn đạt tương đương vào prompt; Qwen có thể chọn/phối hợp câu hoàn chỉnh và đổi thứ tự. Nó không được thêm/bớt sự kiện, số, đơn vị, model, phủ định hoặc uncertainty. `verifiedWording` chuẩn hóa những phép diễn đạt đã review rồi yêu cầu tập câu và số lượng khớp câu gốc. Evidence và requirement status vẫn do backend giữ. Đây là văn bản bị ràng buộc, không phải sinh tư vấn tự do; mô tả cũ “chỉ chọn option index” cũng không còn đầy đủ với code hiện tại.

### Câu 76. `verifiedWording` kiểm tra những điều kiện nào? Còn loại sai sót nào mà bộ kiểm tra này không phát hiện được?

**Trả lời:** Validator yêu cầu string không rỗng, có giới hạn độ dài; chuẩn hóa NFC/khoảng trắng, thay các cụm tương đương được review, tách và sắp xếp câu rồi so đủ số lượng/nội dung với câu gốc. Nó chặn nhiều trường hợp bịa số, đổi model, mất phủ định hoặc thêm ý. Nhưng nếu evidence, template hay mapping chuẩn hóa đã sai thì câu tương đương vẫn có thể sai; thứ tự câu cũng có thể ảnh hưởng cách hiểu. Nó không phải bộ chứng minh entailment tổng quát cho văn bản bất kì hoặc chứng nhận tính đúng của catalog.

### Câu 77. Bạn dùng trường nào trong response để chứng minh một lời giải thích thực sự đã dùng LLM thành công?

**Trả lời:** Xem explanation có `source: 'llm'` và `generation.status: 'accepted'`, cùng model và latency khi được ghi. Các trạng thái disabled, not_applicable, timeout, unavailable, invalid_response không chứng minh model đã đóng góp wording hợp lệ. Cờ bật hoặc HTTP 200 chỉ chứng minh cấu hình/request, chưa đủ. Một request có thể có nhiều explanations nhưng chỉ tối đa ba mục đủ điều kiện được đưa vào batch chat hiện tại; số accepted explanations không được gọi thành số request đã dùng LLM.

### Câu 78. Nếu model bịa thông số, làm mất điều kiện, đảo nghĩa phủ định hoặc nhận chỉ dẫn độc hại từ query/catalog, hệ thống chặn và fallback thế nào?

**Trả lời:** Prompt đánh dấu query/catalog là dữ liệu không tin cậy, yêu cầu JSON và giới hạn câu chữ; response còn phải qua kiểm index, duplicate, shape và `verifiedWording`. Sai hoặc không kiểm chứng được thì giữ explanation gốc; timeout/lỗi dùng trạng thái tương ứng. Prompt chỉ là một lớp, không đủ bảo vệ nếu bỏ validator. Những biện pháp này giảm đầu ra vượt evidence nhưng chưa chứng minh chống mọi prompt injection; dữ liệu nguồn sai cũng cần được chặn ở pipeline trước khi trở thành explanation gốc.

### Câu 79. Với câu tiếp nối “chỉ lấy loại hỗ trợ SDI-12”, backend sử dụng context nào? Làm sao phân biệt tiếp nối với tìm kiếm mới và kiểm tra context do frontend gửi?

**Trả lời:** Context có `base_query`, `previous_query`, tối đa 5 `product_ids`; resolver nhận dạng từ mở đầu/câu ngắn có technical constraint để ghép query hoặc chuyển nhu cầu mới. Backend trả `resolved_query`/`context_applied` để UI thể hiện. Follow-up kỹ thuật có đường truy xuất theo query gốc rồi áp điều kiện để tránh mất ứng viên do câu mới đổi ranking. Context được schema kiểm kích thước và sản phẩm được lấy lại từ nguồn active, nhưng không có session server kí xác nhận lịch sử đó; không dùng ID frontend gửi làm bằng chứng sản phẩm đáp ứng hay làm quyền truy cập.

### Câu 80. Khi người dùng hỏi về sản phẩm ngoài Top-5 hoặc một yêu cầu chưa đủ rõ, hệ thống lấy bằng chứng và quyết định giải thích hay hỏi làm rõ như thế nào?

**Trả lời:** Nút giải thích có thể gửi ID sản phẩm được chọn trong context; nhánh explanation lấy document/specifications và public summary theo ID nên không bị giới hạn bởi Top-5 của lần tìm trước. Nó đánh giá theo nhu cầu trước cộng câu hỏi mới, trình bày yêu cầu chưa xác nhận thay vì loại sạch sản phẩm. Nếu hỏi “sản phẩm này” mà không có context/model, hoặc nhiệt độ chưa rõ môi trường hay điều kiện hệ thống chưa rõ thành phần, guidance yêu cầu làm rõ. Không tự bịa lịch sử để trả lời cho một model chưa xác định.

## 11. Đánh giá, kiểm thử và bằng chứng kết quả

Nguồn: [benchmark builder](../scripts/search-evaluation/build-benchmark.mjs), [baseline v1.1](search-quality-baseline-v1.1.md), [metrics implementation](../scripts/search-evaluation/metrics.mjs), [BGE offline](reranker-bge-evaluation-v1.md), [runtime BGE](reranker-runtime.md), [explanation design](grounded-explanation-design.md), [HTTP explanation report](../output/explanation-cases-complete/report.md), [stress report](../output/search-stress/report.md), [test commands](../package.json).

### Câu 81. Bộ benchmark 100 truy vấn được xây dựng từ nhu cầu người dùng, chuyên gia hay chính nhóm phát triển? Nó đại diện cho thực tế đến đâu?

**Trả lời:** Builder trong repo định nghĩa query từ model, device type, protocol, nhiệt độ và nhu cầu ứng dụng trên catalog; đây là bộ đánh giá do dự án xây dựng, không có bằng chứng là log tìm kiếm đại diện của khách hàng thực tế. V1.1 ghi 100 query được xác minh bằng rule/evidence review, trong đó 40 deterministic và 60 reviewed. Nó hữu ích cho regression trong miền dữ liệu hiện tại nhưng quy mô nhỏ, thiên về catalog/rule đã biết; chưa chứng minh tính đại diện cho mọi ngôn ngữ, khách hàng hoặc nhu cầu ngoài miền.

### Câu 82. Ai xác định sản phẩm liên quan cho từng query? Quy trình nào tránh dùng thứ hạng của hệ thống làm nhãn đúng?

**Trả lời:** Nhãn được tạo/đối chiếu từ identity, taxonomy, capability, application, protocol và specification evidence; báo cáo v1.1 ghi ranking/score bị loại khỏi bước labeling. Có script review validation và evidence grading để tái kiểm. Theo phân công AI phụ trách, BA hỗ trợ tiêu chí/nhãn; chưa có căn cứ chỉ ra danh sách reviewer độc lập hoặc độ đồng thuận nhiều người. Vì vậy gọi đây là human-directed evidence review, không tuyên bố là gold set được hội đồng chuyên gia độc lập chấm.

### Câu 83. Vì sao benchmark có 93 truy vấn dùng tính các chỉ số relevance và 7 truy vấn âm? Bạn đánh giá thành công của truy vấn âm thế nào?

**Trả lời:** 93 query có positive labels để tính thứ hạng/precision/recall/nDCG; 7 query âm có chủ đích không có positive theo nhãn, nên không gộp tùy tiện vào trung bình relevance vốn cần mẫu số phù hợp. Với query âm, kiểm hệ thống trả rỗng, hỏi làm rõ hoặc nêu ngoài phạm vi theo contract của case, không ép gợi ý sản phẩm không có evidence. Nên báo riêng false-positive/unsupported-result và guidance đúng. “Âm” không luôn đồng nghĩa 400: phản hồi mong đợi tùy query và phiên bản xử lí.

### Câu 84. MRR, Recall, Precision và nDCG trả lời những câu hỏi khác nhau nào về chất lượng tìm kiếm?

**Trả lời:** MRR@K đo kết quả relevant đầu tiên có xuất hiện sớm không; Recall@K đo tìm được bao nhiêu sản phẩm relevant trong tập nhãn; Precision@K đo phần kết quả trả ra có relevant; nDCG@K xét cả mức relevance và vị trí so với thứ tự lí tưởng. MRR cao vẫn có thể bỏ sót nhiều sản phẩm đúng; precision/recall cũng phụ thuộc query rộng/hẹp và độ đầy đủ nhãn. Phải nêu K, quy tắc relevance và số query đủ điều kiện; nDCG 0,948655 không phải “AI chính xác 94,8655%”.

### Câu 85. Khi nhãn benchmark v1 đổi sang v1.1, vì sao không thể coi mọi thay đổi chỉ số là thuật toán tốt hơn hoặc kém đi?

**Trả lời:** V1.1 sửa ground truth sau evidence review trong khi ranking/runtime cho phép so đó không đổi. Tập relevant và grade đổi làm mẫu số recall, precision và thứ tự lí tưởng nDCG đổi; delta phản ánh cách đánh giá được chỉnh, không chứng minh code cải thiện. Ví dụ Recall@5 từ 0,983810 xuống 0,582540 trong bảng lịch sử không tự nghĩa hệ thống vừa mất khả năng tìm. Muốn đo tác động thuật toán phải giữ query, nhãn, dữ liệu và cấu hình so sánh cố định.

### Câu 86. Bạn phân biệt lỗi không truy xuất được sản phẩm đúng, lỗi xếp hạng, lỗi parser và lỗi dữ liệu bằng cách nào?

**Trả lời:** Trước hết xác nhận sản phẩm có evidence đúng và đủ điều kiện active. Nếu không có ở candidate hai nguồn thì xem retrieval; nếu có candidate nhưng bị đẩy xuống sai thì xem RRF/rank/rerank. Nếu parser hiểu sai protocol, phủ định, đơn vị hoặc intent thì sửa parser; nếu hiểu đúng nhưng bằng chứng thiếu/sai thì sửa pipeline/catalog hoặc matcher theo nguyên nhân. Report baseline phân loại retrieval miss/rerankable, stress có stage failures. Không sửa mọi lỗi bằng prompt hoặc tăng score một sản phẩm cụ thể.

### Câu 87. Kết quả đánh giá BGE cho thấy lợi ích và trường hợp thua nào? Mức cải thiện đó có đủ để trả thêm độ trễ và chi phí vận hành không?

**Trả lời:** Thí nghiệm Top-5 đã lưu tăng nDCG@5 từ 0,941883 lên 0,948655, opportunity outcomes 6 WIN/26 TIE/1 LOSS; q068 vẫn là ca thua. Offline warm inference p95 khoảng 45,127 ms, nhưng runtime stage gồm evidence/HTTP có p95 648,278 ms và end-to-end p95 2.349,609 ms trong lượt đo riêng. Đây là lợi ích nhỏ có đánh đổi và không chứng minh trên CPU hay tải khác. Code giữ mặc định tắt; quyết định bật cần SLA và số đo môi trường mục tiêu, chưa có cơ sở tự tuyên bố đáng bật cho mọi deployment.

### Câu 88. Kiểm thử explanation đã đánh giá riêng template và LLM thật chưa? “Không có vi phạm tự động” chứng minh được điều gì và chưa chứng minh được điều gì?

**Trả lời:** Có bằng chứng tách phạm vi: benchmark offline trong design đánh giá template trên 40 cặp query/product; report HTTP khác ghi 160 lượt, 555 explanations và 326 accepted LLM explanations, cộng báo cáo parser expansion có lượt Ollama thật. Không gộp latency template thành latency model. Zero contract/grounding issues theo checker chứng minh không phát hiện vi phạm đã định nghĩa trong tập đó; chưa chứng minh mọi suy luận ngữ nghĩa đúng, dữ liệu nguồn đúng hay mọi query mới an toàn. Các report có thời điểm khác nhau và cần chạy lại cho bản giao.

### Câu 89. Những kết quả nào đến từ fixture, test offline, database thật hoặc HTTP với model thật? Chúng được gắn với commit, cấu hình và dữ liệu nào?

**Trả lời:** Unit/regression suites dùng fixture/mock để kiểm logic; PGlite chạy SQL local nhưng thay thế phần vector và không mô phỏng đầy đủ hosted. Các live validator/smoke đọc Supabase; evaluator HTTP/model có report riêng về query, thời điểm, model/revision và snapshot tùy bộ đo. Report stress ghi concurrency 4 và tắt BGE/LLM trong lượt HTTP; BGE runtime là lượt khác. Chưa xác nhận mọi artifact đều đóng đủ Git commit và cấu hình/hardware; khi bàn giao cần bổ sung manifest của lượt chạy thay vì tự suy ra tất cả report thuộc HEAD hiện tại.

### Câu 90. Trước bàn giao, còn những kiểm thử nào bắt buộc phải chạy cho phân quyền, transaction, thanh toán đồng thời, truy vấn song ngữ, follow-up và lỗi phụ thuộc?

**Trả lời:** Cần chạy lại bộ API/security/pricing/signing/regression, client/admin, lint/build; kiểm embedding live và demo smoke trên cùng commit. DB test dùng thử cần kiểm truy cập chéo, audit giá rollback, callback/IPN lặp/đồng thời, hủy và link thanh toán cũ; search cần Việt–Anh, negation/units, multi-constraint, context, selected model và failure/timeout từng nguồn. Đặc biệt kiểm crash giữa cập nhật order với history/notification để phản ánh giới hạn transaction hiện tại. `test:commerce:live` có ghi dữ liệu, chỉ chạy DB dùng thử; checklist này là việc phải làm, chưa được đánh dấu PASS trong lần soạn tài liệu.

## 12. Hiệu năng, vận hành và bàn giao

Nguồn: [configuration](../apps/api/src/config/configuration.ts), [deadline helper](../apps/api/src/modules/search/search-deadline.ts), [rate limiter](../apps/api/src/common/middleware/rate-limit.middleware.ts), [bootstrap](../apps/api/src/main.ts), [health](../apps/api/src/modules/health/health.controller.ts), [demo checklist](demo-ai-search-checklist.md), [Vercel workflow](vercel-hobby-workflow.md), [stress report](../output/search-stress/report.md), [reranker runtime](reranker-runtime.md).

### Câu 91. Mục tiêu thời gian phản hồi p50/p95 là bao nhiêu cho tìm kiếm thường, tìm kiếm có explanation và yêu cầu hệ thống nhiều thành phần?

**Trả lời:** Chưa thấy SLA được phê duyệt riêng cho ba loại request, nên chưa có cơ sở đưa một con số thành cam kết. Các số đo lịch sử khác điều kiện: lượt BGE runtime end-to-end p50/p95 khoảng 1,655/2,350 giây; stress HTTP concurrency 4, tắt BGE và LLM, khoảng 3,31/8,22 giây. Explanation và multi-component có thể thêm công việc, cần đo riêng trên máy mục tiêu. Browser ngừng chờ sau 45 giây theo checklist là giới hạn chờ, không phải SLA chấp nhận latency; đề xuất chốt mục tiêu sau khi đo lại.

### Câu 92. Bạn đo riêng thời gian database, embedding, retrieval, kiểm chứng, reranker và explanation thế nào để tìm đúng nút thắt?

**Trả lời:** Hiện evaluator có end-to-end latency; reranker log stage duration/candidate/fallback, explanation log thời gian batch/status/model; hybrid có log degraded. Chưa thấy tracing thời gian đầy đủ cho mọi DB call, parser/matching và embedding trong cùng một request. Đề xuất đo bằng đồng hồ monotonic quanh từng stage, gắn request ID và cấu hình, báo p50/p95 theo nhánh và cold/warm. Khi so benchmark phải giữ phạm vi đo: inference-only, stage evidence+HTTP và end-to-end là ba đại lượng khác nhau, không so như cùng một latency.

### Câu 93. Cold start model khác warm request bao nhiêu? Quy trình khởi động và warmup trước demo hoặc vận hành là gì?

**Trả lời:** Cold load có thể chậm đáng kể nhưng chưa có bộ số đo cold/warm cùng máy/cấu hình đủ để trả một delta cố định. Mở Ollama, xác nhận model đã cài, khởi động API, kiểm embedding coverage, chạy `npm run demo:warmup` rồi `npm run demo:smoke`; muốn bắt buộc LLM accepted dùng `--require-llm`. Nếu bật BGE, chạy service và đợi model ready qua health; service có bước warmup. Giữ máy/API/model hoạt động và chạy lại smoke gần giờ demo; không coi tải model xong một lần là mọi lần gọi sau đều warm.

### Câu 94. Nếu nhiều người tìm kiếm đồng thời, CPU, RAM, VRAM, connection pool và hàng đợi inference chịu được đến đâu theo số đo hiện có?

**Trả lời:** Report stress đã lưu có 134 HTTP requests ở concurrency 4, không lỗi ngoài trạng thái dự kiến, p95 8,22 giây; BGE/LLM tắt trong lượt này. Nó không xác định tải tối đa hay mức dùng RAM/VRAM/connection pool cho toàn hệ thống. Chưa có capacity plan cho nhiều instance hoặc queue inference được nghiệm thu. Đề xuất tăng tải theo bước, đo saturation, timeout và tài nguyên trên phần cứng thật, đặc biệt khi embedding/chat chia sẻ Ollama và BGE dùng GPU; không suy từ rate limit ra khả năng phục vụ.

### Câu 95. Timeout của từng dịch vụ có phù hợp với tổng thời gian request được phép chạy không? Client ngắt kết nối có dừng công việc phía sau không?

**Trả lời:** Default hiện có: query embedding 10 giây, mỗi nguồn hybrid deadline 15 giây, BGE HTTP 350 ms, chat 20 giây; timeout 180 giây dành cho provider/backfill/warmup, module online dùng ngân sách riêng. Hai nguồn retrieval chạy song song nhưng các stage khác và DB evidence vẫn cộng thêm; multi-component còn phức tạp hơn. Có AbortController cho một số dependency call, chưa thấy cơ chế truyền client disconnect thành tín hiệu hủy xuyên suốt controller/service. Vì vậy chưa bảo đảm tổng request luôn dưới 45 giây hoặc client đóng browser sẽ dừng mọi inference.

### Câu 96. Rate limit hiện bảo vệ những endpoint nào? Nó hoạt động thế nào khi có reverse proxy, nhiều người chung IP hoặc nhiều instance API?

**Trả lời:** Bootstrap áp search mặc định 60 lượt/phút/IP và login/register mỗi route 10 lượt/phút/IP; OPTIONS bỏ qua. Limiter fixed-window lưu Map trong một process, trả 429 và Retry-After; không chia sẻ budget giữa nhiều instance. Nhiều người chung IP có thể dùng chung quota. Code dùng `req.ip`/socket và không tự tin `X-Forwarded-For`; cấu hình proxy sai có thể gom cả khách vào IP proxy. Đề xuất xử lí ở gateway hoặc cấu hình trust proxy theo đúng hạ tầng khi mở rộng; hiện chưa có distributed rate limiter.

### Câu 97. Nếu Ollama, BGE hoặc Supabase ngừng hoạt động, người dùng còn làm được gì và đội vận hành nhận biết sự cố bằng cách nào?

**Trả lời:** Ollama embedding lỗi có thể còn keyword search nếu DB/keyword hoạt động; chat lỗi giữ explanation rule. BGE lỗi giữ thứ tự baseline. Supabase ngừng có thể làm mất catalog, auth, orders và cả hai retrieval, nên không có chế độ offline đầy đủ. API log lỗi/degraded, BGE có health; Nest `/health` chỉ trả liveness/cấu hình, không thử DB/model. Cần validator/smoke mới kiểm được search thật. Chưa thấy hệ thống cảnh báo tự động/on-call được xác nhận; đề xuất theo dõi health/smoke/log và chỉ định người nhận cảnh báo.

### Câu 98. Bạn tách môi trường phát triển, test, demo và production thế nào để test ghi dữ liệu không tác động catalog, đơn hàng hoặc thanh toán thật?

**Trả lời:** Repo có env mẫu, seed/test scripts, local Supabase và staging script; staging bật `LOCAL_STAGING_READ_ONLY=true` chặn non-GET admin, nhưng không chặn mọi đường ghi orders/payments. ImportsService chặn import riêng ngay cả ngoài staging. Vì vậy read-only admin không phải môi trường test cách li; cần DB dùng thử, tài khoản và VNPay sandbox riêng cho suite có ghi, xác nhận target trước chạy. Chưa xác nhận hiện có bốn deployment độc lập; đề xuất ghi rõ project/database/API URL và người sở hữu từng môi trường trong hồ sơ bàn giao.

### Câu 99. Quy trình deploy, rollback, backup và thử khôi phục database là gì? Bản frontend được host sẽ kết nối tới API và model local qua hạ tầng nào?

**Trả lời:** Theo workflow đã lưu, client/admin static deploy trên Vercel từ main sau PR/review; `REACT_APP_API_URL` trỏ API HTTPS, API và Ollama trên máy chạy backend, Supabase là DB hosted. Demo có thể dùng Cloudflare tunnel; URL tạm đổi thì sửa env và rebuild/redeploy frontend, đồng thời CORS phù hợp. Browser không gọi trực tiếp localhost Ollama trên máy chủ. Chưa xác nhận trạng thái deployment hiện tại, backup schedule hoặc lần restore thành công. Đề xuất rollback build/config có kiểm soát, backup trước migration và diễn tập phục hồi; rollback frontend không tự rollback schema/dữ liệu.

### Câu 100. Nếu bàn giao hôm nay, bạn sẽ giao những tài liệu, tài khoản/quyền truy cập, script, báo cáo và danh sách lỗi nào; đồng thời cam kết hỗ trợ phần nào sau bàn giao?

**Trả lời:** Đề xuất gói giao gồm commit/build và env mẫu; kiến trúc/ERD/API; dữ liệu nguồn và provenance; pipeline/import/backfill/validator; cấu hình model/revision; test/benchmark kèm snapshot và giới hạn; hướng dẫn chạy, warmup, deploy, backup/restore; danh sách lỗi/việc còn thiếu theo mức ảnh hưởng. Chuyển quyền repo, hosting, DB, máy API và VNPay sandbox cho đúng người, secret qua kênh riêng. Cam kết hỗ trợ cần chốt người, thời hạn, giờ phản hồi và phạm vi sửa lỗi; repository chưa có căn cứ để tự cam kết thay nhóm hoặc nhận hệ thống đã sẵn sàng production.

## Các điểm cần xác nhận trước khi dùng tài liệu để nghiệm thu

- Tên người thực hiện và người tiếp nhận thay thế; đóng góp cá nhân theo bằng chứng, không chỉ theo role.
- Quyền sử dụng dữ liệu nguồn và quy trình duyệt nội dung kỹ thuật.
- Commit, artifact/hash, cấu hình feature flags/model và môi trường áp dụng cho từng báo cáo.
- Ngưỡng chất lượng/SLA, tải mục tiêu, phần cứng, lịch backup và bằng chứng restore.
- Quy trình đối soát/hoàn tiền, cách xử lí thiếu history/notification và ngừng bán sản phẩm có order history.
- Kết quả chạy lại test/smoke/validation trên bản bàn giao; các số PASS và latency lịch sử không thay thế bước này.

Tài liệu chưa chạy kiểm thử ứng dụng, gọi DB/model, xác minh deployment hoặc thực hiện giao dịch. Các đề xuất và giới hạn được giữ rõ để không biến một câu trả lời chuẩn bị phản biện thành cam kết đã triển khai.
