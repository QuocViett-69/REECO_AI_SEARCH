# REECO AI Search — Phân công và báo cáo chung gửi quản lý

**Ngày lập:** 26/10/2026  
**Đơn vị thực hiện:** Nhóm đồ án REECO AI Search  
**Người nhận:** Quản lý dự án  
**Thứ tự báo cáo và trình bày:** FE → BE → BA → AI Engineer kiêm xử lý dữ liệu.

Tài liệu gồm phân công nhóm, bài báo cáo chung có thể gửi quản lý, lời trình bày cho từng thành viên, nguồn đối chiếu và bộ sơ đồ draw.io kèm vị trí chèn. Tên thành viên được biểu diễn bằng role; việc ghi nhận tác giả code cần theo đóng góp thực tế. Nội dung hiện trạng dựa trên mã nguồn và báo cáo đã lưu, chưa phải kết quả nghiệm thu mới trên môi trường đang chạy.

## A. Phân công theo bốn role

| Thứ tự | Role | Phạm vi chịu trách nhiệm | Phần báo cáo cần viết | Đầu ra bàn giao |
|---|---|---|---|---|
| 1 | Frontend Developer — FE | Cả giao diện khách hàng và quản trị; tích hợp API | UI, routing, state/session phía trình duyệt, hiển thị kết quả AI, luồng khách/admin, kiểm thử giao diện | Sơ đồ màn hình, mô tả tích hợp, ảnh minh họa, bảng test frontend và demo |
| 2 | Backend Developer — BE | API, database, xác thực/phân quyền, nghiệp vụ và vận hành | Kiến trúc, ERD, API contract, auth, sản phẩm/giá, orders, VNPay, notifications, test backend | Kiến trúc, ERD, bảng API, sequence giao dịch, sơ đồ trạng thái, bảng test và hướng dẫn chạy |
| 3 | Business Analyst — BA | Bài toán, yêu cầu, quy trình nghiệp vụ, tiêu chí chấp nhận và tổng hợp | Tổng quan, actor/use case, đặc tả, business rules, ma trận truy vết, kế hoạch UAT, kết luận | Bộ yêu cầu, use case/activity diagram, tiêu chí nghiệm thu và báo cáo được biên tập thống nhất |
| 4 | AI Engineer + Data Processing | Toàn bộ pipeline dữ liệu và AI Search | Chuẩn hóa, enrichment, search document, embedding, hybrid/RRF, kiểm chứng kỹ thuật, reranker, explanation/context và đánh giá | Pipeline dữ liệu/search, mẫu truy vết bằng chứng, cấu hình model, benchmark, phân tích kết quả và giới hạn |

FE phụ trách cả `apps/client` và `apps/admin`. AI Engineer phụ trách logic tìm kiếm kể cả các service viết bằng NestJS; BE phụ trách hạ tầng tích hợp, HTTP contract và database dùng chung. BA tổng hợp báo cáo, còn mỗi role tự viết và xác nhận nội dung chuyên môn của mình.

### Phân công viết báo cáo đồ án

| Chương | Người viết và phần phối hợp |
|---|---|
| 1. Tổng quan đề tài | BA chủ trì bài toán, mục tiêu, phạm vi và giá trị; cả nhóm xác nhận đóng góp |
| 2. Cơ sở lý thuyết và công nghệ | FE viết React/routing/state; BE viết NestJS/auth/database/API; AI viết xử lý dữ liệu, embedding, retrieval/RRF/reranker/explanation và metrics; BA biên tập |
| 3. Phân tích và thiết kế | BA viết yêu cầu/use case/quy trình; FE thiết kế màn hình; BE kiến trúc/ERD/API/quyền; AI mô hình dữ liệu tìm kiếm và pipeline |
| 4. Triển khai hệ thống | 4.1 FE: client/admin; 4.2 BE: backend/nghiệp vụ; 4.3 BA: đối chiếu triển khai với yêu cầu; 4.4 AI: dữ liệu và AI Search |
| 5. Kiểm thử và đánh giá | FE cung cấp test UI; BE cung cấp test API/security/commerce; BA lập ma trận nghiệm thu và tổng hợp; AI cung cấp kiểm tra dữ liệu và benchmark |
| 6. Kết luận và hướng phát triển | BA tổng hợp kết quả, giới hạn và đề xuất do từng role xác nhận |

### Ranh giới phối hợp

- **FE và BE:** thống nhất endpoint, request/response, session, mã lỗi, giá và trạng thái; FE không tự quyết định số tiền thanh toán hay quyền truy cập.
- **BE và AI:** thống nhất schema/vector/RPC, cấu hình model, timeout và fallback; BE tổng hợp ERD, AI quản lý pipeline dữ liệu và logic search.
- **BA và các role:** xác nhận yêu cầu, ngoại lệ và tiêu chí chấp nhận; phân biệt yêu cầu dự kiến với chức năng đã triển khai.
- **AI và FE:** thống nhất query/context, guidance, explanation và trạng thái yêu cầu; frontend giữ thứ tự kết quả backend trả về.

## B. Bài báo cáo chung gửi quản lý

### Báo cáo tổng quan và phân công thực hiện dự án REECO AI Search

Kính gửi Quản lý dự án,

Nhóm xin báo cáo phương án tổ chức thực hiện và phạm vi hệ thống REECO AI Search theo bốn vai trò: Frontend Developer, Backend Developer, Business Analyst và AI Engineer kiêm xử lý dữ liệu. Mục tiêu của dự án là hỗ trợ người dùng tìm thiết bị đo đạc, quan trắc theo mã sản phẩm hoặc nhu cầu bằng ngôn ngữ tự nhiên, kiểm tra thông số có bằng chứng và tiếp tục quy trình lựa chọn, đặt hàng, theo dõi đơn trên cùng hệ thống.

Qua đối chiếu mã nguồn, dự án đã có các thành phần cho giao diện khách hàng và quản trị, backend nghiệp vụ, nền tảng dữ liệu và tìm kiếm có giải thích. Các chức năng này cần được nghiệm thu lại trên phiên bản và môi trường trình diễn đã thống nhất. Báo cáo dưới đây trình bày theo thứ tự FE, BE, BA và AI Engineer để làm rõ sản phẩm người dùng nhìn thấy, cơ chế vận hành phía sau, tiêu chí nghiệp vụ và nền tảng dữ liệu–AI.

### 1. Frontend Developer — Giao diện khách hàng và quản trị

**Sơ đồ minh họa:** chèn [Hình 01 — Bản đồ màn hình client/admin](diagrams/01-fe-ban-do-man-hinh.drawio) sau đoạn đầu của mục này.

Phạm vi Frontend bao gồm hai ứng dụng React: ứng dụng dành cho khách hàng và ứng dụng dành cho quản trị viên. Phía khách hàng có các luồng tìm kiếm, xem danh mục, xem chi tiết và so sánh sản phẩm, giỏ hàng, yêu thích, đăng nhập/đăng ký, thanh toán, quản lý tài khoản và theo dõi đơn. Phía quản trị có các màn hình đăng nhập, tổng quan, xem sản phẩm, cập nhật giá, lịch sử giá, quản lý đơn và báo cáo.

Đối với tìm kiếm AI, giao diện tiếp nhận câu hỏi, gửi ngữ cảnh khi người dùng bổ sung yêu cầu, sau đó trình bày kết quả, hướng dẫn và lời giải thích do backend trả về. Người dùng có thể xem sản phẩm đáp ứng yêu cầu ở điểm nào và yêu cầu nào chưa đủ bằng chứng. Thứ tự hiển thị được giữ theo kết quả xử lý của backend; các điểm tìm kiếm không được trình bày như xác suất đáp ứng nhu cầu.

Frontend cũng xử lý điều hướng theo URL, trạng thái tải dữ liệu, kết quả rỗng, lỗi và thao tác thử lại. Luồng mua hàng có kiểm tra thông tin nhập và làm mới giá; giá trị thanh toán cuối cùng được backend kiểm tra. Giỏ hàng và yêu thích hiện được lưu phía trình duyệt theo người dùng, còn đơn hàng được quản lý tập trung phía server. Thông báo hiển thị được cập nhật qua cơ chế tải lại/polling.

Giá trị của phần Frontend là kết nối các khả năng kỹ thuật thành hành trình sử dụng rõ ràng cho khách hàng và quản trị viên. Thành viên FE chịu trách nhiệm mô tả thiết kế giao diện, tích hợp API, kiểm thử các trạng thái sử dụng và chuẩn bị demo. Các bước nghiệm thu cần kiểm tra điều hướng trực tiếp, làm mới trang, session hết hạn, dữ liệu lỗi và sự thống nhất giữa màn hình khách với màn hình quản trị.

### 2. Backend Developer — Nền tảng API và nghiệp vụ

**Sơ đồ chính:** [Hình 02 — Kiến trúc](diagrams/02-be-kien-truc-tong-the.drawio) và [Hình 03 — ERD, 2 trang](diagrams/03-be-erd-du-lieu.drawio) sau đoạn đầu; [Hình 05 — Tạo đơn/VNPay](diagrams/05-be-sequence-don-hang-vnpay.drawio) sau đoạn thứ ba. **Sơ đồ bổ sung:** [Hình 04 — Đăng nhập](diagrams/04-be-sequence-dang-nhap.drawio) sau đoạn xác thực; [Hình 06 — Trạng thái đơn](diagrams/06-be-trang-thai-don-hang.drawio) sau phần thanh toán hoặc trong phụ lục.

Backend sử dụng NestJS để cung cấp API cho hai ứng dụng, kết nối Supabase và điều phối các module nghiệp vụ. Phần này tổ chức dữ liệu sản phẩm, giá, đơn hàng, chi tiết đơn, lịch sử thay đổi và thông báo; đồng thời tích hợp module tìm kiếm với nền tảng dữ liệu chung. Request được kiểm tra bằng hợp đồng dữ liệu phù hợp trước khi đi vào xử lý nghiệp vụ.

Xác thực được thực hiện qua API của hệ thống và Supabase Auth. Các yêu cầu cần đăng nhập phải có token hợp lệ; thao tác quản trị được kiểm tra thêm quyền admin phía server. Quyền truy cập đơn hàng và thông báo được ràng buộc theo người dùng. Việc kiểm soát quyền ở backend là cơ sở bảo vệ dữ liệu dù người dùng có thay đổi giao diện hay tự gửi request.

Trong quy trình đặt hàng, backend đọc giá từ database, đối chiếu giá khách đã xác nhận khi request có cung cấp và tính tổng theo quy tắc hiện hành. Đơn hàng lưu lại giá tại thời điểm đặt để các thay đổi giá sau đó không viết lại giá trị lịch sử. Thanh toán VNPay được tích hợp ở môi trường sandbox, với các bước tạo URL theo đơn đã lưu, ký/xác minh, đối chiếu số tiền và trạng thái phản hồi. Việc cập nhật trạng thái đơn, lịch sử và thông báo phải tuân thủ điều kiện nghiệp vụ.

Thành viên BE phụ trách kiến trúc server, ERD, API contract, xác thực/phân quyền, nghiệp vụ, kiểm thử backend và cấu hình vận hành. Phạm vi quản trị sản phẩm hiện cho phép cập nhật giá; nội dung kỹ thuật của catalog được quản lý qua pipeline dữ liệu offline. API import đang bị chặn. Trước khi trình diễn thao tác ghi của admin, cần chuẩn bị môi trường phù hợp vì lệnh staging mặc định bật chế độ chỉ đọc cho các đường dẫn quản trị.

### 3. Business Analyst — Yêu cầu, quy trình và nghiệm thu

**Sơ đồ minh họa:** [Hình 07 — Use case tổng thể](diagrams/07-ba-use-case-tong-the.drawio) sau đoạn đầu; [Hình 08 — Quy trình nghiệp vụ theo swimlane](diagrams/08-ba-quy-trinh-nghiep-vu.drawio) sau đoạn thứ hai hoặc ở phụ lục. Tiêu chí chấp nhận và ma trận nghiệm thu trình bày bằng bảng.

Vai trò BA chịu trách nhiệm làm rõ mục tiêu nghiệp vụ, người sử dụng, phạm vi chức năng và điều kiện chấp nhận kết quả. Đối với REECO AI Search, nhóm người dùng chính gồm khách tìm kiếm sản phẩm, khách có tài khoản để đặt/theo dõi đơn và quản trị viên xử lý giá, đơn hàng, báo cáo. Các hệ thống ngoài như dịch vụ xác thực, cổng thanh toán và dịch vụ model cần được thể hiện phù hợp trong phân tích luồng tích hợp.

BA xây dựng bộ yêu cầu và đặc tả các use case chính: tìm theo model hoặc nhu cầu; bổ sung điều kiện kỹ thuật; xem lý do đề xuất; so sánh sản phẩm; đặt, thanh toán và hủy đơn; quản trị cập nhật giá và xử lý đơn. Mỗi use case cần mô tả tiền điều kiện, luồng chính, ngoại lệ, hậu điều kiện và tiêu chí chấp nhận. Các tiêu chí được đối chiếu với chức năng hiện có để tránh đưa nội dung kế hoạch cũ vào báo cáo như kết quả đã hoàn thành.

Đối với phần AI, tiêu chí nghiệp vụ cần phân biệt sản phẩm có bằng chứng đáp ứng, sản phẩm chưa đủ dữ liệu để kết luận và sản phẩm không đáp ứng yêu cầu đã kiểm tra. Việc đề xuất một nhóm thiết bị theo chức năng chưa đồng nghĩa các thiết bị đã được xác nhận tương thích thành một hệ thống hoàn chỉnh. Đối với thương mại, các quy tắc về quyền truy cập, nguồn giá, điều kiện hủy và chuyển trạng thái cần nhất quán giữa đặc tả, API và giao diện.

BA tổng hợp ma trận yêu cầu–chức năng–kiểm thử–bằng chứng, lập kế hoạch UAT và biên tập báo cáo chung. FE, BE và AI Engineer cung cấp bằng chứng chuyên môn cho các tiêu chí tương ứng. Phạm vi này là trách nhiệm được phân công; báo cáo không khẳng định đã có khảo sát người dùng hoặc nghiệm thu được khách hàng xác nhận khi chưa có hồ sơ chứng minh.

### 4. AI Engineer kiêm xử lý dữ liệu — Dữ liệu, tìm kiếm và giải thích

**Sơ đồ chính:** [Hình 09 — Pipeline dữ liệu](diagrams/09-ai-pipeline-xu-ly-du-lieu.drawio) sau hai đoạn đầu; [Hình 10 — Hybrid Search](diagrams/10-ai-hybrid-search.drawio) sau đoạn thứ ba. **Sơ đồ bổ sung:** [Hình 11 — Explanation có bằng chứng](diagrams/11-ai-giai-thich-co-bang-chung.drawio) sau Hình 10 hoặc trong phần triển khai AI. Kết quả benchmark giữ ở dạng bảng để dễ so sánh số liệu.

Vai trò AI Engineer chịu trách nhiệm toàn bộ chuỗi xử lý dữ liệu và AI Search. Dữ liệu nguồn được tổ chức thành catalog chuẩn, xác định định danh sản phẩm, family/variant và trạng thái đủ điều kiện tìm kiếm. Thông số được chuẩn hóa theo loại giá trị, đơn vị và ý nghĩa kỹ thuật; đồng thời giữ nguyên văn bản và tham chiếu nguồn để có thể truy vết. Bước làm giàu ngữ nghĩa sử dụng quy tắc và từ vựng miền song ngữ, sau đó tạo tài liệu tìm kiếm cho từng sản phẩm.

Theo báo cáo dữ liệu đã lưu, catalog có 89 sản phẩm active và 3.277 thông số. Trong đó, 1.012 thông số được chuyển thành cấu trúc và 2.265 thông số được giữ dạng text để bảo toàn ý nghĩa. Đây là số liệu của artifact trong repository, chưa phải xác nhận lại database live tại ngày lập báo cáo. Khi nội dung tài liệu tìm kiếm thay đổi, pipeline vô hiệu hóa vector cũ và tạo lại embedding tương ứng để giữ dữ liệu và biểu diễn tìm kiếm nhất quán.

Ở luồng tìm kiếm, hệ thống kết hợp truy xuất từ khóa và ngữ nghĩa, hợp kết quả bằng RRF, sau đó đối chiếu ý định và điều kiện kỹ thuật với bằng chứng sản phẩm. Việc kiểm tra giao tiếp, dải nhiệt độ và các thông số được hỗ trợ giúp tách mức liên quan ngữ nghĩa khỏi xác nhận đáp ứng kỹ thuật. BGE reranker có thể được bật để sắp lại tối đa năm ứng viên đầu. Lời giải thích được tạo từ bằng chứng trước; model ngôn ngữ hỗ trợ diễn đạt trong phạm vi kiểm chứng, và hệ thống giữ lời giải thích theo quy tắc khi phản hồi model không hợp lệ hoặc không khả dụng.

Các báo cáo đánh giá đã lưu cung cấp bằng chứng cho những thí nghiệm cụ thể. Benchmark v1.1 có 100 truy vấn, gồm 93 truy vấn dùng tính các chỉ số relevance và 7 truy vấn âm. Một thí nghiệm BGE offline Top-5 ghi nhận nDCG@5 tăng từ 0,941883 lên 0,948655. Một báo cáo explanation khác ghi nhận 160 lượt HTTP và 326 lời giải thích được LLM chấp nhận. Các số liệu này không đại diện cho độ chính xác tuyệt đối hoặc chất lượng runtime hiện tại; muốn kết luận cho bản demo cần chạy lại với cùng phiên bản, dữ liệu và cấu hình.

AI Engineer phụ trách pipeline dữ liệu, embedding, thuật toán truy xuất/xếp hạng, giải thích, benchmark và phân tích giới hạn. BE hỗ trợ database và môi trường chạy, BA hỗ trợ tiêu chí/đánh giá nhãn, FE hỗ trợ hiển thị và demo. Hướng hoàn thiện cần ưu tiên mở rộng chất lượng dữ liệu và tập đánh giá, tăng độ bao phủ của parser, đo độ trễ thực tế và kiểm chứng các nhu cầu vượt ngoài phạm vi hiện tại.

### Kết luận và bước tiếp theo

Cách tổ chức bốn role giúp nhóm xác định rõ trách nhiệm từ giao diện, nghiệp vụ, yêu cầu đến dữ liệu và AI. Hệ thống có cơ sở mã nguồn cho hành trình tìm kiếm có giải thích và các chức năng thương mại liên quan. Việc xác nhận mức sẵn sàng trình diễn cần dựa trên nghiệm thu tích hợp ở môi trường đã thống nhất.

Nhóm đề xuất bước tiếp theo là chốt tên người phụ trách và phiên bản code; hoàn thiện tài liệu của từng role; chạy lại các kiểm tra phù hợp; kiểm tra model, dữ liệu và môi trường admin; sau đó tập trình bày theo thứ tự FE → BE → BA → AI Engineer. Các giới hạn, lỗi còn tồn tại và kết quả chưa được kiểm chứng cần được ghi nhận cùng bằng chứng thay vì đánh dấu hoàn thành chung cho toàn hệ thống.

Trân trọng,  
Nhóm thực hiện đồ án REECO AI Search.

## C. Kịch bản trình bày theo thứ tự từng role

### 1. Thời lượng đề xuất

Giả định 20 phút gồm minh họa ngắn, chưa gồm phản biện. Đây là ngân sách thời gian; nhóm cần tập và điều chỉnh tốc độ nói, không kéo dài phần chờ dịch vụ ngoài.

| Thời gian | Người nói | Nội dung và slide |
|---|---|---|
| 00:00–05:00 | FE | Mở đầu ngắn; client/admin; tích hợp và trạng thái UI; minh họa hành trình. Slide 1–3 |
| 05:00–10:00 | BE | Kiến trúc/ERD; auth/quyền; giá, đơn và VNPay; vận hành. Slide 4–6 |
| 10:00–13:00 | BA | Actor/use case; quy tắc và tiêu chí nghiệm thu; phạm vi/giới hạn. Slide 7–8 |
| 13:00–20:00 | AI Engineer + Data | Pipeline dữ liệu; embedding/hybrid/RRF; kiểm chứng/reranker/explanation; đánh giá và kết luận. Slide 9–12 |

AI được nhiều thời gian nhất vì kiêm xử lý dữ liệu và phụ trách lõi tìm kiếm. Nếu bắt buộc đúng 5 phút mỗi người, giảm demo FE, để BA trình bày thêm ma trận nghiệm thu và chuyển chi tiết cấu hình/benchmark AI sang slide dự phòng; giữ thứ tự role.

### 2. Lời trình bày của FE

> Kính chào anh/chị quản lý. Nhóm chúng em xin trình bày hệ thống REECO AI Search theo bốn phần: Frontend, Backend, phân tích nghiệp vụ và AI kết hợp xử lý dữ liệu. Hệ thống hướng đến việc hỗ trợ người dùng tìm thiết bị quan trắc bằng nhu cầu hoặc mã sản phẩm, xem bằng chứng kỹ thuật và tiếp tục quy trình đặt hàng.
>
> Em phụ trách phần Frontend của cả ứng dụng khách hàng và quản trị. Ở phía khách hàng, hành trình bắt đầu từ tìm kiếm, xem chi tiết và so sánh sản phẩm; sau đó người dùng có thể lưu yêu thích, thêm giỏ, đăng nhập, checkout và theo dõi đơn. Ở phía quản trị, giao diện hỗ trợ xem sản phẩm, cập nhật giá, xem lịch sử giá và xử lý đơn hàng.
>
> Với AI Search, frontend gửi câu hỏi và ngữ cảnh cần thiết cho backend. Kết quả trả về gồm sản phẩm, hướng dẫn và lời giải thích có bằng chứng. Giao diện giữ thứ tự backend đã xác định và cho phép người dùng bổ sung điều kiện hoặc hỏi về một model cụ thể. Điểm tìm kiếm không được diễn giải thành phần trăm chắc chắn sản phẩm phù hợp.
>
> Ngoài luồng chính, phần giao diện cần xử lý dữ liệu đang tải, không có kết quả, lỗi kết nối, phiên đăng nhập hết hạn và thông tin nhập chưa hợp lệ. Các trang sử dụng URL routing để hỗ trợ điều hướng và truy cập lại. Giá trên giao diện được làm mới, còn số tiền đặt hàng được backend kiểm tra.
>
> Em sẽ minh họa ngắn thao tác tìm kiếm, xem lý do đề xuất và mở chi tiết hoặc so sánh sản phẩm. Luồng giỏ hàng và các màn hình đơn/admin được giới thiệu bằng dữ liệu đã chuẩn bị phù hợp với thời lượng. Tiếp theo, thành viên Backend sẽ trình bày cơ chế xác thực, lưu dữ liệu và xử lý nghiệp vụ phía sau các màn hình này.

**Minh họa:** tìm `cảm biến đo độ ẩm đất` → xem explanation → mở detail/compare; giới thiệu cart/checkout và một đơn đã chuẩn bị. Nếu admin đang ở chế độ chỉ đọc, chỉ minh họa xem đơn/lịch sử; thao tác ghi chỉ thực hiện trên môi trường đã chuẩn bị và kiểm tra trước.

### 3. Lời trình bày của BE

> Em xin tiếp nối phần giao diện bằng kiến trúc backend. Hai ứng dụng khách hàng và quản trị sử dụng API NestJS để truy cập dữ liệu sản phẩm, đơn hàng và tìm kiếm. Backend kết nối Supabase PostgreSQL, đồng thời tích hợp các dịch vụ model phía server. Cấu trúc này giúp tập trung việc kiểm tra dữ liệu và quy tắc nghiệp vụ.
>
> Về xác thực, hệ thống có API đăng nhập, đăng ký, refresh và hồ sơ người dùng, tích hợp với Supabase Auth. Những yêu cầu cần bảo vệ phải có token hợp lệ. Với quản trị viên, backend kiểm tra thêm role admin; với đơn hàng và thông báo, backend kiểm tra người sở hữu. Việc ẩn hoặc hiện nút trên giao diện chỉ hỗ trợ trải nghiệm, còn quyết định cho phép truy cập được thực hiện tại server.
>
> Với tạo đơn, backend lấy giá từ database và tính tổng theo quy tắc hiện hành. Khi request có giá người mua đã xác nhận, server đối chiếu để phát hiện thay đổi trước lúc tạo đơn. Giá của từng sản phẩm được lưu trong đơn tại thời điểm đặt, nên việc admin sửa giá sau đó không viết lại lịch sử đơn cũ.
>
> VNPay hiện được tích hợp ở môi trường sandbox. URL thanh toán gắn với đơn đã lưu; phản hồi phải được kiểm tra chữ ký, số tiền và trạng thái trước khi cập nhật. Đơn hàng có quy tắc chuyển trạng thái, lịch sử thay đổi và thông báo cho người dùng. Những phần này cần được kiểm thử cả luồng hợp lệ và các tình huống như giá thay đổi, thiếu quyền hoặc callback được gửi lại.
>
> Về vận hành, catalog kỹ thuật đang được quản lý qua pipeline offline; quản trị sản phẩm tập trung vào giá và lịch sử giá. Môi trường staging mặc định chặn thao tác ghi admin, nên việc demo thay đổi giá hoặc trạng thái cần chuẩn bị cấu hình phù hợp từ trước. Sau phần cơ chế vận hành, BA sẽ trình bày các yêu cầu và tiêu chí dùng để đánh giá những chức năng này.

**Minh họa:** dùng sơ đồ kiến trúc, ERD rút gọn và sequence checkout/VNPay. Không đọc lần lượt toàn bộ endpoint hoặc thực hiện thay đổi dữ liệu chỉ để minh họa kiến trúc.

### 4. Lời trình bày của BA

> Em phụ trách phân tích nghiệp vụ và tổng hợp tài liệu của nhóm. Bài toán của REECO AI Search là giúp người dùng tìm thiết bị phù hợp ngay cả khi chưa biết mã sản phẩm, đồng thời có cơ sở kiểm tra thông số trước khi mua. Các nhóm sử dụng chính là khách tìm kiếm, khách có tài khoản và quản trị viên.
>
> Phạm vi yêu cầu gồm tìm theo model hoặc nhu cầu, bổ sung điều kiện, xem bằng chứng, so sánh và thực hiện quy trình đơn hàng. Với mỗi use case, nhóm cần xác định người thực hiện, điều kiện bắt đầu, luồng chính, ngoại lệ và kết quả sau cùng. Cách mô tả này giúp giao diện, backend và AI thống nhất về hành vi cần có.
>
> Một số tiêu chí chấp nhận quan trọng là: điều kiện kỹ thuật bắt buộc phải được đối chiếu với bằng chứng; thiếu thông tin phải được thể hiện là chưa xác nhận; số tiền đơn hàng phải do server tính; và người dùng chỉ được truy cập dữ liệu thuộc quyền của mình. Các tiêu chí này được nối với chức năng, test case và bằng chứng trong ma trận nghiệm thu.
>
> Đối với tìm kiếm, chúng em phân biệt mức liên quan với xác nhận đáp ứng kỹ thuật. Đề xuất các thành phần theo chức năng cũng chưa đủ để khẳng định toàn bộ hệ thống ghép lại sẽ tương thích. Đối với đánh giá, report lịch sử cần được ghi đúng bộ dữ liệu và cấu hình, còn mức sẵn sàng của bản trình diễn cần được kiểm tra lại.
>
> Phần BA tổng hợp kết quả từ ba role kỹ thuật và giữ báo cáo nhất quán với phạm vi đã triển khai. Tiếp theo, AI Engineer sẽ trình bày nền tảng dữ liệu, cách truy xuất và kiểm chứng sản phẩm, cũng như bằng chứng đánh giá cho phần tìm kiếm.

**Minh họa:** một use case tìm kiếm có điều kiện và một hàng truy vết yêu cầu–API–test–bằng chứng. Chỉ ghi đạt khi đã có kết quả kiểm tra; chưa có UAT thực tế thì trình bày là kế hoạch nghiệm thu.

### 5. Lời trình bày của AI Engineer kiêm xử lý dữ liệu

> Em phụ trách toàn bộ xử lý dữ liệu và AI Search. Phần này bắt đầu từ catalog nguồn, chuẩn hóa định danh sản phẩm, thông số và đơn vị; sau đó làm giàu ngữ nghĩa song ngữ, tạo tài liệu tìm kiếm và embedding. Mục tiêu là để kết quả có thể tìm được bằng nhu cầu tự nhiên nhưng vẫn kiểm tra lại bằng thông số có nguồn.
>
> Theo báo cáo dữ liệu đã lưu, catalog có 89 sản phẩm active và 3.277 thông số. Trong đó, 1.012 thông số được chuyển thành cấu trúc; 2.265 thông số được giữ dạng text vì có mô tả hoặc điều kiện cần bảo toàn. Mỗi thông số giữ tham chiếu nguồn để có thể truy vết. Đây là số liệu trong repository, chưa phải số đếm lại database live hôm nay.
>
> Một phân biệt cần giữ là nhiệt độ vận hành và dải đo nhiệt độ. Thiết bị có thể hoạt động tại một mức nhiệt không đồng nghĩa đo được mọi đại lượng ở mức đó. Vì vậy, hệ thống chuẩn hóa ý nghĩa thông số và đối chiếu đúng loại yêu cầu. Những giá trị chưa đủ chắc chắn không được tự biến thành điều kiện số đã xác nhận.
>
> Với embedding, dự án sử dụng model có sẵn qua Ollama để chuyển văn bản tìm kiếm sản phẩm thành vector 1.536 chiều theo cấu hình hiện hành. Đây là suy luận tạo vector phục vụ truy xuất, không phải huấn luyện hoặc fine-tune model. Khi nội dung tìm kiếm thay đổi, vector cũ được vô hiệu hóa và cần backfill lại.
>
> Khi nhận câu hỏi, hệ thống chạy tìm kiếm từ khóa và ngữ nghĩa rồi hợp danh sách bằng RRF. Từ khóa hỗ trợ định danh và thuật ngữ cụ thể; embedding hỗ trợ các cách diễn đạt gần nghĩa. Sau truy xuất, parser và bộ kiểm chứng đối chiếu ý định, giao tiếp, nhiệt độ và những thông số được hỗ trợ. Các trạng thái MATCH, MISMATCH và UNKNOWN giúp phân biệt đáp ứng, không đáp ứng và chưa đủ bằng chứng. Với điều kiện giao tiếp hoặc nhiệt độ bắt buộc đang áp dụng trong luồng public, hệ thống yêu cầu bằng chứng MATCH.
>
> BGE reranker là bước tùy chọn để sắp lại tối đa năm ứng viên đầu với các cơ chế bảo vệ. Reranker không thể đưa về sản phẩm đã bị bỏ sót khỏi tập ứng viên. Sau xếp hạng, hệ thống tạo lời giải thích từ bằng chứng. Qwen có thể hỗ trợ diễn đạt, nhưng đầu ra phải qua kiểm chứng giữ ý, con số và trạng thái chưa xác nhận; khi lỗi hoặc không hợp lệ, hệ thống giữ lời giải thích theo quy tắc.
>
> Về đánh giá, benchmark v1.1 đã lưu gồm 100 truy vấn, có 93 truy vấn dùng tính chỉ số relevance và 7 truy vấn âm. Thí nghiệm BGE offline Top-5 ghi nhận nDCG@5 từ 0,941883 lên 0,948655. Một bộ kiểm tra explanation khác ghi nhận 160 lượt HTTP và 326 lời giải thích được LLM chấp nhận. Đây là kết quả của những lần chạy cụ thể; các chỉ số không được hiểu là phần trăm chính xác cho mọi truy vấn hoặc cho phiên bản hiện tại khi chưa chạy lại.
>
> Qua bốn phần, nhóm đã trình bày cách kết nối giao diện, backend, yêu cầu nghiệp vụ và dữ liệu–AI thành một hệ thống tìm kiếm có bằng chứng. Các bước tiếp theo là hoàn thiện hồ sơ nghiệm thu, kiểm tra lại môi trường trình diễn, mở rộng dữ liệu và bộ truy vấn đánh giá, đồng thời đo chất lượng và độ trễ trên cấu hình thực tế. Nhóm xin kết thúc báo cáo và tiếp nhận câu hỏi từ anh/chị quản lý.

**Minh họa:** raw → normalized/raw_ref → search document của một model; sơ đồ query → retrieval → RRF → technical check → optional rerank → explanation; một response có evidence. Nếu chứng minh LLM chạy thật, kiểm tra `source=llm` và `generation.status=accepted`; bật cờ hoặc có đoạn giải thích chưa đủ chứng minh.

## D. Nguồn đối chiếu và giới hạn sử dụng

| Nội dung | Nguồn chính |
|---|---|
| Phân công chi tiết | [Phân công bốn role](phan-cong-bao-cao-thuyet-trinh-4-nguoi.md) |
| Routing, màn hình | [Client App](../apps/client/src/App.js), [Admin App](../apps/admin/src/App.js) |
| Auth API | [Auth controller](../apps/api/src/modules/auth/auth.controller.ts) |
| Catalog chỉ sửa giá, chặn import | [Admin schema](../apps/api/src/modules/admin/admin-product-update.schema.ts), [Imports service](../apps/api/src/modules/imports/imports.service.ts) |
| Backend/giá/đơn và cập nhật frontend | [API contract](api-contract.md), [Commerce fixes](commerce-fixes-2026-10-14.md); đối chiếu code nếu mô tả lịch sử khác hiện trạng |
| Staging chỉ đọc admin | [Local staging](../scripts/staging/local.mjs), [API bootstrap](../apps/api/src/main.ts) |
| Số lượng catalog và thông số | [Product master report](../data/reports/product-master-report.json), [Normalization report](../data/reports/spec-normalization-report.json) |
| Embedding và search | [Ollama provider](../apps/api/src/ai/ollama-embedding.provider.ts), [Search service](../apps/api/src/modules/search/search.service.ts), [RRF](../apps/api/src/modules/search/search-score.service.ts) |
| Explanation và cờ model | [Explanation service](../apps/api/src/modules/search/explanation.service.ts), [Wording validation](../apps/api/src/modules/search/explanation-wording.ts), [Configuration](../apps/api/src/config/configuration.ts) |
| Benchmark và BGE offline | [Baseline v1.1](search-quality-baseline-v1.1.md), [BGE evaluation](reranker-bge-evaluation-v1.md) |
| Explanation HTTP | [Explanation report](../output/explanation-cases-complete/report.md) |
| Chuẩn bị demo | [Demo checklist](demo-ai-search-checklist.md) |

Chưa thực hiện trong lần soạn này: chạy ứng dụng/model, benchmark mới, giao dịch VNPay, nghiệm thu UAT hoặc kiểm tra deployment hiện tại. Các nguồn lịch sử phản ánh cấu hình và dữ liệu lúc đo; không gộp số test hoặc chỉ số từ những lần chạy khác nhau thành kết luận chung.

Rủi ro cần quản lý: AI Engineer kiêm dữ liệu có phạm vi rộng; model local ảnh hưởng thời gian phản hồi; staging mặc định chặn ghi admin; catalog chưa bảo đảm tương thích hệ thống nhiều thiết bị. Nhóm cần kiểm tra các điểm này trước khi đánh giá sẵn sàng demo hoặc nghiệm thu.

## E. File sơ đồ và hướng dẫn sử dụng

- [Danh mục 11 sơ đồ, vị trí chèn, caption và ưu tiên chính/phụ](diagrams/README.md).
- [File draw.io tổng hợp 12 trang theo thứ tự FE → BE → BA → AI](diagrams/reeco-tat-ca-so-do.drawio).
- [Tải bộ file draw.io dạng ZIP](diagrams/reeco-drawio.zip).

Các file là sơ đồ native có thể chỉnh sửa từng ô và đường nối. ERD gồm hai trang để đọc rõ catalog/search và commerce/tài khoản. Vị trí chèn tính theo đoạn văn, không tính các dòng hướng dẫn sơ đồ; có thể chuyển sơ đồ phụ sang phụ lục khi cần giữ báo cáo gửi quản lý ngắn gọn.
