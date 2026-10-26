# Bộ sơ đồ draw.io cho báo cáo REECO AI Search

Ngày đối chiếu: 26/10/2026. Thứ tự: **FE → BE → BA → AI Engineer + Data**.

Bộ này có **11 file riêng**, trong đó ERD có 2 trang; tổng cộng **12 trang sơ đồ**. [File tổng hợp](reeco-tat-ca-so-do.drawio) chứa toàn bộ 12 trang theo cùng thứ tự. Các ô, chữ, actor và đường nối đều là đối tượng chỉnh sửa được trong draw.io, không phải ảnh chụp.

## Chèn ở đâu trong bài báo cáo?

Các vị trí B.1–B.4 là các mục role trong bài báo cáo chung. Đếm đoạn văn từ đầu mục, không tính dòng hướng dẫn chèn hình.

| Hình | Role / file | Vị trí chèn đề xuất | Caption dùng trong báo cáo | Mức ưu tiên |
|---|---|---|---|---|
| 01 | FE · [Bản đồ màn hình](01-fe-ban-do-man-hinh.drawio) | B.1, sau đoạn đầu giới thiệu client và admin | Bản đồ màn hình của ứng dụng khách hàng và quản trị | Chính |
| 02 | BE · [Kiến trúc tổng thể](02-be-kien-truc-tong-the.drawio) | B.2, sau đoạn đầu mô tả NestJS/Supabase/model | Kiến trúc tổng thể và ranh giới giữa các thành phần | Chính |
| 03a–03b | BE + AI · [ERD, 2 trang](03-be-erd-du-lieu.drawio) | Ngay sau Hình 02; báo cáo đồ án đầy đủ đặt ở phần thiết kế database | Mô hình dữ liệu catalog/search; mô hình dữ liệu commerce/tài khoản | Chính |
| 04 | BE · [Sequence đăng nhập](04-be-sequence-dang-nhap.drawio) | B.2, sau đoạn thứ hai về xác thực và phân quyền | Trình tự đăng nhập, xác minh token và refresh session | Phụ lục hoặc slide dự phòng |
| 05 | BE · [Sequence đơn/VNPay](05-be-sequence-don-hang-vnpay.drawio) | B.2, sau đoạn thứ ba về đặt hàng và thanh toán | Trình tự tạo đơn và xác minh thanh toán VNPay sandbox | Chính |
| 06 | BE · [Trạng thái đơn](06-be-trang-thai-don-hang.drawio) | Sau Hình 05 hoặc phần thiết kế nghiệp vụ đơn | Trạng thái đơn hàng và quan hệ với trạng thái thanh toán | Phụ lục hoặc slide dự phòng |
| 07 | BA · [Use case](07-ba-use-case-tong-the.drawio) | B.3, sau đoạn đầu xác định các nhóm sử dụng | Use case tổng thể theo actor | Chính |
| 08 | BA · [Quy trình nghiệp vụ](08-ba-quy-trinh-nghiep-vu.drawio) | B.3, sau đoạn thứ hai về đặc tả use case | Quy trình tìm, đặt và xử lý đơn theo swimlane | Phụ lục; đưa vào phần phân tích nghiệp vụ của báo cáo đồ án |
| 09 | AI · [Pipeline dữ liệu](09-ai-pipeline-xu-ly-du-lieu.drawio) | B.4, sau hai đoạn đầu về dữ liệu/chuẩn hóa | Pipeline chuẩn hóa dữ liệu, import và tạo embedding | Chính |
| 10 | AI · [Hybrid Search](10-ai-hybrid-search.drawio) | B.4, sau đoạn thứ ba mô tả truy xuất và kiểm chứng | Pipeline Hybrid Search kết hợp kiểm chứng kỹ thuật | Chính |
| 11 | AI · [Explanation](11-ai-giai-thich-co-bang-chung.drawio) | Ngay sau Hình 10 hoặc phần triển khai explanation | Quy trình tạo giải thích có bằng chứng và kiểm chứng đầu ra LLM | Phụ lục hoặc slide dự phòng |

## Dùng khi trình bày

- **FE, slide 1–3:** Hình 01, kết hợp màn hình thực tế; sơ đồ không thay cho ảnh UI.
- **BE, slide 4–6:** Hình 02, ERD rút gọn từ Hình 03 và sequence Hình 05. Giữ Hình 04/06 để trả lời câu hỏi.
- **BA, slide 7–8:** Hình 07; Hình 08 hỗ trợ giải thích nghiệp vụ nếu đủ thời gian. Ma trận nghiệm thu nên dùng bảng, không cần thêm diagram.
- **AI, slide 9–12:** Hình 09, Hình 10 và bảng benchmark. Hình 11 dùng khi giải thích sâu về LLM.

Với bản gửi quản lý ngắn, có thể chỉ giữ Hình 01, 02, 07, 09 và 10; đưa ERD/sequence chi tiết sang phụ lục. Với báo cáo đồ án đầy đủ, sử dụng cả 11 file tại các chương phân tích, thiết kế và triển khai tương ứng.

## Cách mở và xuất hình

1. Mở draw.io hoặc diagrams.net, mở file `.drawio` từ máy. Chọn `reeco-tat-ca-so-do.drawio` để xem cả bộ; dùng các tab phía dưới để đổi trang.
2. Chỉnh chữ, màu, vị trí và đường nối trực tiếp. Trang 03 có hai phần catalog và commerce; các bảng lặp lại giữa hai trang là cùng bảng, không phải database riêng.
3. Khi đưa vào Word/slide, xuất SVG để giữ chữ nét hoặc PNG với độ phân giải phù hợp. Chọn đúng trang cần xuất; giữ nền trắng và kiểm tra hình sau khi chèn. File draw.io vẫn là bản gốc để sửa.

## Các quy ước và giới hạn đã thể hiện

- Xanh dương: FE; xanh lá: BE; vàng: nghiệp vụ/BA; tím: AI/Data; xám: ghi chú; đỏ: lỗi/hủy.
- Mũi tên thường biểu diễn luồng xử lý, không tự khẳng định là API call. Sequence dùng mũi tên ngang theo thời gian. ERD ghi cardinality trên đường liên kết; `PK`/`FK` nêu các khóa chính.
- ERD chọn các cột chính, không phải bản sao đầy đủ DDL. Quan hệ 0..* phản ánh FK vật lý, không khẳng định đơn luôn có đầy đủ bản ghi con sau mọi lỗi.
- Backend đăng nhập qua API và Supabase Auth. Sơ đồ không theo mô tả đăng nhập trực tiếp từ browser còn tồn tại trong tài liệu lịch sử.
- VNPay thành công có thể chuyển trực tiếp từ đơn đang chờ thanh toán sang `PROCESSING`, đồng thời đặt `payment_status=PAID`. Không ép runtime phải đi qua trạng thái đơn `PAID`.
- `status` (trạng thái đơn) và `payment_status` là hai trường riêng. Luồng admin, callback gateway và hủy bởi khách có các điều kiện khác nhau; sơ đồ trạng thái ghi rõ phạm vi.
- Tạo order hiện dùng insert và bù xóa nếu insert items lỗi; ghi history/notification bổ sung có cảnh báo khi lỗi. Không mô tả toàn bộ thao tác này như một transaction database nguyên tử.
- Import dữ liệu và cập nhật giá/audit có cơ chế transaction riêng. Catalog kỹ thuật cập nhật offline; API import bị chặn. Staging mặc định chặn ghi admin.
- Search thường và giải thích model được chọn là các nhánh khác nhau; hướng dẫn nhiều thành phần chưa xác nhận tương thích hệ thống.
- BGE/LLM là tùy chọn. Giải thích dựa trên rule trước; LLM text phải được kiểm chứng, không tự quyết định thông số.

Đã kiểm tra XML, liên kết đầu mút, kích thước trang và render bằng bộ hiển thị diagrams.net. Sơ đồ phản ánh code được đọc, chưa thay thế chạy lại API/model, giao dịch sandbox hoặc nghiệm thu triển khai.
