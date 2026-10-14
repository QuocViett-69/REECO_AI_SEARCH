# Client/admin commerce fixes — 14/10/2026

## Thay đổi và nguyên nhân

| Yêu cầu | Nguyên nhân / thay đổi | Kiểm chứng |
|---|---|---|
| Giá admin chưa hiện trên client | API catalog/search bỏ qua `product_prices`; client dùng bảng giá mặc định. Repository nay join giá, schema và response trả `price_vnd` cho list/detail/search. GET products có `Cache-Control: no-store`. | Test service đổi giá 100 → 250 → 0; list/detail/search summaries đều đúng. Lượt live read-only xác nhận 89 sản phẩm khớp bảng giá server. |
| Checkout summary giữ giá cũ | Cart lưu giá trong localStorage và không làm mới. Dùng cache giá công khai chung; cập nhật cart/favorites khi có giá mới, khi tải trang/focus và mỗi 30 giây. Checkout đọc lại giá khi vào trang và trước submit. | Regression với giỏ đã lưu: summary đổi trước tạo đơn; khi giá tiếp tục đổi, yêu cầu người mua kiểm tra và bấm xác nhận lại. Browser xác nhận catalog và checkout cùng hiển thị giá mới. |
| Giá đổi giữa lúc xem và tạo đơn | Client gửi `expected_unit_price` để server đối chiếu; số tiền tính từ DB, không dùng quote của client để tính tiền. Nếu quote lệch: 409 trước tạo order. | Test stale quote: không ghi đơn; quote đúng dùng giá DB. Giá các đơn đã tạo vẫn giữ snapshot lịch sử. |
| Thiếu popup add cart/favorite | Provider thay state nhưng không gọi toast chung. Các thao tác phát thông báo tới ToastContainer hiện có, gồm tên/model sản phẩm. | React StrictMode test xác nhận một popup mỗi lần thêm, không thông báo “đã thêm” khi bỏ yêu thích. Browser đã chụp cả hai popup. |
| Lịch sử sản phẩm | Trước đây chỉ upsert giá. Thêm `product_price_history`, trigger và RPC ghi giá + lịch sử trong cùng transaction; lưu giá cũ/mới, thời gian, actor ID/email. Admin detail hiển thị 100 thay đổi gần nhất. | PGlite chạy migration thật: đúng actor/old/new; không ghi no-op; audit lỗi rollback cả giá; khách không được đọc/gọi ghi. Migration đã áp dụng trên Supabase, không sửa giá đang có. |
| Lịch sử order | DB đã lưu chuyển trạng thái, thời gian, ghi chú và `changed_by`; UI chưa hiện người sửa. Admin detail nay có “Lịch sử chỉnh sửa đơn hàng” và nhãn người thực hiện. API chỉ bổ sung nhãn/email cho admin; khi không tra được giữ ID. | Admin tests và browser xác nhận heading, người thực hiện, lịch sử. Không viết lại lịch sử cũ hoặc đổi snapshot giá order. |
| Chữ nút Cancel order | Nút confirm dùng màu trắng nhưng theme tạo nền sáng. Override đúng nút trong modal bằng chữ đỏ đậm/nền hồng nhạt, gồm hover. | Computed style trong browser: chữ `rgb(159,32,27)`, nền `rgb(255,240,238)`, text “Cancel order” hiện rõ. |
| Scroll tới field bắt buộc | Validation chỉ set errors rồi return. Nay scroll/focus field lỗi đầu tiên, giữ `aria-invalid` và thông báo lỗi. | React test không gửi order khi thiếu dữ liệu. Browser xác nhận focus `checkout-phone` nằm trong viewport khi full name/email đã có. |
| Ẩn import admin | Bỏ link sidebar, import card trên dashboard và component route. URL `/import` chuyển sang `/products`. | Admin test và browser: không có link Import; truy cập URL cũ được redirect. Backend import module được giữ, vẫn có các guard/ràng buộc hiện có. |

## “You may also need” dựa vào đâu?

`apps/client/src/services/recommendationService.js` dùng bảng `TECHNICAL_COMPATIBILITY_GRAPH` viết sẵn theo model: cặp cảm biến/logger, sản phẩm bổ sung và model thay thế. Nếu không có key model khớp, nó lấy ba model đầu khác model hiện tại trong bảng. Sau đó gọi API chi tiết để lấy ID, ảnh và giá thực; bỏ model không có trong catalog.

Phần này chưa dùng AI, hành vi người dùng, lịch sử mua hàng hoặc endpoint recommendation của backend. Bảng gợi ý cũng chưa kiểm tra tự động toàn bộ giao thức, điện năng và cấu hình. Đã thêm nhắc xác minh kết nối/nguồn/phụ kiện và sửa mô tả CR310 có “4G tích hợp” không có căn cứ; không triển khai một engine gợi ý mới trong lượt sửa này.

## Kiểm tra

- API: 215/215 tests PASS, gồm 4 test pricing/audit mới và regression AI Search đã có.
- Client: 50/50 tests PASS, gồm 3 test mới về popup, giá checkout và validation.
- Admin: 52/52 tests PASS.
- Lint và build shared/API/client/admin PASS. Toolchain React hiện có cảnh báo deprecation `fs.F_OK`.
- `scripts/payments/commerce-pricing-live.mjs`: read-only, đối chiếu 89 sản phẩm; list/detail/search/admin và history API PASS; không tạo đơn, không sửa giá thật.
- Browser dùng API fixtures có kiểm soát để kiểm tra thao tác/hiển thị, không gửi đơn hoặc hủy đơn thật. Ảnh nằm trong `output/playwright/commerce-*.png`. Không coi fixtures là bằng chứng thay đổi giá trên DB thật; nguồn giá thật được kiểm tra riêng ở lượt live.

Lịch sử giá bắt đầu từ migration `20261014000000_product_price_history`; không thể tái dựng các lần sửa trước đó từ dữ liệu hiện có. Migration đã ghi vào ledger Supabase. Lịch sử order trước đó vẫn còn.

Chưa restart API đang chạy ở port 3100, chưa commit hoặc redeploy Vercel. Cần chạy API build mới và deploy client/admin mới để staging dùng các sửa này; thông tin actor của sửa giá được gửi bởi API mới. Các sửa AI Search từ lượt trước được giữ nguyên.
