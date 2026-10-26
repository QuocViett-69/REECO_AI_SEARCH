# Kịch bản thuyết trình REECO AI Search

**Cách dùng:** Phần A là lời thuyết trình có thể đọc và luyện nói trực tiếp; các dòng trong ngoặc vuông là gợi ý trình chiếu hoặc thao tác, không đọc thành lời. Phần B dành cho demo; phần C dành cho phản biện; phần D giúp mở đúng mã nguồn khi cần chứng minh.

**Thời lượng gợi ý:** khoảng 18–22 phút cho phần nói, tùy tốc độ và mức giải thích; demo riêng khoảng 3 phút. Khoảng 85% nội dung tập trung vào dữ liệu và AI Search. Nếu chỉ có 15 phút, rút phần kiểm thử còn một ví dụ, lược công thức RRF và chuyển demo thành hình minh họa.

**Căn cứ:** mã nguồn và dữ liệu trong repository được đọc ngày 25/10/2026. Các số liệu đánh giá là những lần chạy đã lưu trong repository, không phải kết quả vừa đo lại. Cấu hình mẫu tắt reranker và LLM explanation; cần kiểm tra cấu hình môi trường thực tế trước buổi trình bày.

## A. Lời thuyết trình

### 1. Mở đầu và bài toán

[Chiếu trang chủ và ô tìm kiếm của REECO.]

Kính thưa thầy cô, hôm nay em xin trình bày đồ án REECO AI Search, một hệ thống hỗ trợ tìm kiếm và lựa chọn thiết bị đo đạc, quan trắc môi trường.

Đối tượng sản phẩm của hệ thống gồm cảm biến, bộ ghi dữ liệu, thiết bị truyền thông và thiết bị nguồn. Đây là những sản phẩm có nhiều thông số kỹ thuật, trong khi người dùng thường chỉ biết nhu cầu sử dụng, chưa biết tên hay mã thiết bị.

Ví dụ, người dùng có thể nhập: “Tôi cần cảm biến đo độ ẩm đất có hỗ trợ SDI-12”. Nếu chỉ tìm theo tên sản phẩm, câu hỏi này có thể không trùng với cách mô tả trong catalog tiếng Anh. Ngược lại, nếu chỉ dựa vào sự tương đồng về ý nghĩa, hệ thống có thể tìm đúng nhóm cảm biến nhưng chưa chắc đáp ứng giao tiếp người dùng yêu cầu.

Vì vậy, mục tiêu của đồ án là kết hợp khả năng tìm theo ngữ nghĩa với việc kiểm tra bằng dữ liệu kỹ thuật. Người dùng có thể mô tả nhu cầu bằng tiếng Việt hoặc tiếng Anh, nhận danh sách sản phẩm và xem bằng chứng giải thích cho kết quả đó.

Trong phần trình bày này, em tập trung vào quá trình xử lý dữ liệu, xây dựng tìm kiếm và tích hợp các model AI. Backend, database và chức năng thương mại sẽ được giới thiệu ngắn để làm rõ hệ thống tổng thể.

### 2. Tổng quan kiến trúc và ba vai trò của model

[Chiếu luồng: Giao diện React → API NestJS → PostgreSQL/pgvector và các dịch vụ AI cục bộ.]

Hệ thống có giao diện khách hàng và giao diện quản trị viết bằng React. Backend sử dụng NestJS, còn dữ liệu được lưu trên Supabase PostgreSQL, có phần mở rộng pgvector để lưu và tìm kiếm vector.

Ở phần AI, em phân biệt ba vai trò.

Thứ nhất là model `qwen3-embedding:4b`, được gọi qua Ollama để chuyển văn bản sản phẩm và câu truy vấn thành vector. Model này phục vụ tìm kiếm ngữ nghĩa.

Thứ hai là `BAAI/bge-reranker-v2-m3`, một model chấm mức độ liên quan giữa câu hỏi và từng ứng viên. Đây là bước tùy chọn để sắp xếp lại một nhóm kết quả đầu.

Thứ ba là model sinh ngôn ngữ chạy qua Ollama, với model được hướng dẫn dùng trong dự án là `qwen3:4b-instruct-2507-q4_K_M`. Vai trò của model này là hỗ trợ diễn đạt lời giải thích dựa trên nội dung đã có bằng chứng.

Ba model giải quyết ba việc khác nhau: biểu diễn ý nghĩa, đánh giá độ liên quan và diễn đạt kết quả. Các quyết định về giao tiếp, dải nhiệt độ hay yêu cầu kỹ thuật vẫn có lớp xử lý bằng quy tắc và dữ liệu có cấu trúc.

### 3. Dữ liệu đầu vào và xây dựng Product Master

[Chiếu các thư mục data/raw, data/master, data/normalized, data/enriched và data/search-documents.]

Trước khi tích hợp model, em xây dựng nền dữ liệu cho hệ thống. Trong repository, dữ liệu đầu vào của pipeline là các file JSON thông số sản phẩm. Một số file có ghi lại nguồn bảng tính, tên sheet và dòng dữ liệu để đối chiếu.

Dữ liệu thô có những vấn đề như một file chứa nhiều model, tên trường khác nhau, đơn vị được viết theo nhiều cách và các biến thể sản phẩm có hậu tố gần giống nhau. Nếu ghép nhầm model hoặc nhầm biến thể, các bước AI phía sau vẫn có thể tạo ra kết quả nghe hợp lý nhưng sai thông số.

Bước đầu tiên là xây dựng Product Master, tức danh mục định danh thống nhất. Mỗi sản phẩm có mã sản phẩm, model, tên, nhóm thiết bị và trạng thái. Script đối chiếu danh mục với bản ghi thô, kiểm tra trùng lặp và xung đột định danh hoặc phân loại.

Sản phẩm chỉ được đưa vào trạng thái active khi ánh xạ đủ rõ ràng theo quy tắc kiểm tra. Những trường hợp chưa xác định được nguồn hoặc còn xung đột được giữ ở trạng thái review. Các hậu tố thể hiện biến thể có ý nghĩa kỹ thuật được kiểm tra để tránh dùng thông số của phiên bản này cho phiên bản khác.

Catalog hiện có trong repository gồm 89 sản phẩm, đều ở trạng thái active. Đây là quy mô bộ dữ liệu của đồ án; nó không đại diện cho toàn bộ catalog của nhà sản xuất.

### 4. Chuẩn hóa thông số và giữ khả năng truy xuất nguồn

[Chiếu một thông số có value_raw, canonical_key, normalized và raw_ref.]

Sau khi thống nhất định danh, bước tiếp theo là chuẩn hóa thông số kỹ thuật.

Hệ thống giữ lại tên và giá trị gốc của thông số. Đồng thời, mỗi thông số được gán một khóa chuẩn, chẳng hạn `operating_temperature_range` cho dải nhiệt độ vận hành. Những giá trị đủ rõ được chuyển thành số, khoảng giá trị, boolean, danh sách hoặc giao tiếp.

Ví dụ minh họa, chuỗi “âm 40 đến 70 độ C” có thể được biểu diễn thành cận dưới âm 40, cận trên 70 và đơn vị độ C. Nhờ đó backend có thể kiểm tra một điều kiện nằm trong dải cho phép bằng phép so sánh số.

Tuy nhiên, nhiều thông số có điều kiện đi kèm, nhiều chế độ đo hoặc mô tả dài. Với trường hợp chưa thể chuyển đổi chắc chắn, pipeline giữ nguyên dạng văn bản để tránh làm mất ý nghĩa.

Theo báo cáo chuẩn hóa đã lưu, hệ thống có 3.277 thông số; 1.012 thông số được chuyển sang các kiểu có cấu trúc và 2.265 thông số được giữ dạng text. Việc giữ text là một phần của chính sách bảo toàn dữ liệu, không đồng nghĩa tất cả những dòng đó đều bị xử lý lỗi.

Mỗi thông số còn có `raw_ref`, cho biết file nguồn, vị trí sản phẩm, vị trí thông số và dòng dữ liệu. Khi hệ thống đưa ra một kết luận kỹ thuật, em có thể lần lại thông tin gốc để kiểm tra.

Một phân biệt rất quan trọng là nhiệt độ vận hành, nhiệt độ bảo quản và dải đo nhiệt độ. Thiết bị hoạt động được ở 70 độ C không có nghĩa nó đo được nhiệt độ nước đến 70 độ C. Vì vậy, những thông số này có vai trò riêng trong bước đối chiếu yêu cầu.

### 5. Làm giàu ngữ nghĩa và tạo tài liệu tìm kiếm

[Chiếu một Search Document: measurements, capabilities, applications, supported_protocols, search_text.]

Dữ liệu kỹ thuật sau chuẩn hóa vẫn chưa đủ thuận tiện cho tìm kiếm bằng ngôn ngữ tự nhiên. Người dùng có thể gọi cùng một khái niệm bằng nhiều cách, chẳng hạn “độ ẩm đất”, “lượng nước trong đất” hoặc “soil moisture”.

Vì vậy, pipeline có bước làm giàu ngữ nghĩa: bổ sung nhãn tiếng Việt và tiếng Anh, đại lượng đo, khả năng, ứng dụng, tên gọi tương đương và thông tin giao tiếp.

Phần này trong dự án chủ yếu được xây dựng bằng các quy tắc, bảng ánh xạ và từ vựng miền dựa trên dữ liệu sản phẩm. Các nhãn và quan hệ được suy ra theo những nguồn đã xác định; em không đưa toàn bộ dữ liệu cho LLM tự viết lại thông số.

Hệ thống cũng phân biệt giao tiếp được hỗ trợ với giao tiếp được ghi rõ là không hỗ trợ. Ví dụ, cụm “không hỗ trợ Modbus” không được biến thành một bằng chứng dương rằng sản phẩm có Modbus chỉ vì xuất hiện từ đó.

Sau bước này, mỗi sản phẩm active có một Search Document. Tài liệu tập hợp định danh, phân loại, đại lượng đo, khả năng, ứng dụng, giao tiếp, biến thể và một số thông số quan trọng. Từ đó hệ thống tạo văn bản tìm kiếm song ngữ trong trường `search_text`.

Mỗi Search Document có mã băm nội dung để phát hiện thay đổi. Khi import lại mà nội dung không đổi, hệ thống có thể bỏ qua cập nhật tương ứng. Khi nội dung chỉ mục thay đổi, importer xóa embedding cũ để bước backfill tạo vector mới, tránh tìm kiếm bằng vector không còn phản ánh dữ liệu hiện tại.

### 6. Tạo embedding và quản lý vector

[Chiếu mô hình chuyển search_text → Ollama → vector 1.536 chiều → product_search_index.]

Sau khi có văn bản tìm kiếm, em dùng `qwen3-embedding:4b` qua Ollama để tạo embedding. Có thể hiểu embedding là một dãy số biểu diễn nội dung văn bản, giúp so sánh các mô tả có liên quan về ý nghĩa dù không trùng hoàn toàn từ ngữ.

Dự án cấu hình đầu ra 1.536 chiều. Văn bản dùng để tạo vector là `product_search_index.search_text`; hệ thống không đưa toàn bộ object sản phẩm, hình ảnh hoặc URL vào model embedding.

Quá trình này có hai thời điểm. Với sản phẩm, vector được tạo trước bằng script backfill và lưu vào database. Khi người dùng tìm kiếm, backend tạo vector cho câu truy vấn bằng cùng cấu hình model để so sánh với các vector đã lưu.

Mỗi vector được lưu cùng tên model, số chiều, phiên bản embedding và thời điểm tạo. Khi tìm kiếm, database lọc theo model và phiên bản mà backend yêu cầu để tránh trộn những biểu diễn không tương thích.

Script backfill xử lý theo batch, mặc định là 8 văn bản một lần, và bỏ qua những embedding đã đúng metadata hiện hành. Trước khi ghi kết quả, script còn kiểm tra mã băm nguồn và phiên bản chỉ mục. Nếu dữ liệu nguồn đổi trong lúc model đang tính, vector của nguồn cũ không được ghi đè vào bản mới.

Ở ranh giới gọi model, backend kiểm tra số lượng vector, số chiều và các phần tử có phải số hữu hạn hay không. Như vậy, việc tích hợp bao gồm cả kiểm soát đầu vào, đầu ra và tình trạng lỗi của dịch vụ AI.

### 7. Hybrid Search: kết hợp từ khóa và ngữ nghĩa

[Chiếu hai nhánh Keyword Search và Semantic Search cùng đi vào RRF.]

Khi nhận một yêu cầu tìm kiếm, hệ thống kiểm tra câu truy vấn rồi phân tích các tín hiệu như model, đại lượng cần đo, vai trò thiết bị và điều kiện kỹ thuật. Với những nhu cầu đã nhận diện được, hệ thống có thể chuyển sang các khái niệm chuẩn để phục vụ truy xuất.

Sau đó, hai nhánh tìm kiếm được thực hiện song song.

Nhánh từ khóa sử dụng PostgreSQL Full-text Search. Nhánh này hữu ích khi người dùng nhập đúng tên model, giao tiếp hoặc từ khóa kỹ thuật. Mã nguồn còn có bước mở rộng bằng khái niệm chuẩn khi kết quả thưa và tìm trực tiếp một số thông số gốc để tránh bỏ sót giá trị kỹ thuật không có trong bản văn tóm tắt.

Nhánh ngữ nghĩa tạo embedding cho câu truy vấn rồi gọi hàm tìm kiếm trong PostgreSQL. pgvector so sánh khoảng cách cosine giữa vector câu hỏi và vector sản phẩm để lấy ứng viên liên quan.

Hai nhánh có thang điểm khác nhau, nên em dùng Reciprocal Rank Fusion, viết tắt là RRF, để hợp nhất theo thứ hạng. Với mỗi nhánh có chứa sản phẩm, đóng góp của sản phẩm là một chia cho K cộng thứ hạng. Giá trị K mặc định trong dự án là 60.

Ví dụ, sản phẩm được xếp cao ở cả nhánh từ khóa lẫn nhánh ngữ nghĩa sẽ nhận đóng góp từ cả hai. Cách này kết hợp được ưu điểm tìm chính xác và tìm theo cách diễn đạt nhu cầu. Giá trị K là cấu hình nền hiện tại; em không khẳng định đây là giá trị tối ưu cho mọi bộ dữ liệu.

Nếu một nhánh lỗi, hệ thống vẫn có thể trả kết quả từ nhánh còn lại và ghi rõ chế độ keyword hoặc semantic. Nếu cả hai đều thất bại, API trả lỗi dịch vụ tạm thời. Một lần tìm thành công nhưng không có sản phẩm vẫn được phân biệt với lỗi kỹ thuật.

### 8. Kiểm chứng yêu cầu kỹ thuật sau truy xuất

[Chiếu ví dụ: “cảm biến đo độ ẩm đất, hỗ trợ SDI-12, hoạt động ở âm 40 độ C”.]

Danh sách sau Hybrid Search là tập ứng viên. Để quyết định ứng viên nào đáp ứng yêu cầu đã nhận diện, hệ thống có thêm lớp kiểm chứng bằng dữ liệu có cấu trúc.

Với ví dụ trên, hệ thống cần kiểm tra ba việc: thiết bị có đo độ ẩm đất hay không, có hỗ trợ SDI-12 hay không và dải nhiệt độ vận hành có bao phủ âm 40 độ C hay không.

`TechnicalQueryParserService` nhận diện model, giao tiếp và ràng buộc nhiệt độ. `TechnicalMatchService` đối chiếu các yêu cầu với bằng chứng của sản phẩm. Các kết quả đánh giá có ba trạng thái: MATCH là có bằng chứng đáp ứng, MISMATCH là có bằng chứng không đáp ứng và UNKNOWN là chưa đủ dữ liệu để kết luận.

Trong luồng tìm kiếm hiện tại, yêu cầu giao tiếp và các ràng buộc nhiệt độ được nhận diện với độ tin cậy cao phải có MATCH để ứng viên đi tiếp. UNKNOWN vẫn có ý nghĩa riêng trong đánh giá và lời giải thích; nó không được trình bày thành “đã đáp ứng”.

Sau bước lọc, thứ tự kỹ thuật ưu tiên định danh chính xác và các điều kiện đã xác nhận, sau đó dùng thứ hạng truy xuất làm tiêu chí tiếp theo. Những nhãn như hỗ trợ SDI-12 chỉ được tạo từ bằng chứng dương.

Parser hiện có hỗ trợ nhiều giao tiếp như SDI-12, RS-485, Modbus, RS-232, USB và một số giao tiếp khác. Một số biểu thức nhiệt độ Fahrenheit hoặc Kelvin có thể được quy đổi về Celsius. Tuy vậy, khả năng hiểu truy vấn vẫn phụ thuộc các cú pháp và quy tắc đã triển khai.

Nếu câu hỏi thiếu môi trường đo hoặc chưa rõ ràng, hệ thống có thể yêu cầu làm rõ. Nếu chưa tìm được ứng viên có bằng chứng đáp ứng toàn bộ điều kiện, hệ thống thông báo điều đó; kết quả rỗng không chứng minh toàn bộ catalog không có giải pháp.

### 9. Reranker BGE và cách tích hợp có kiểm soát

[Chiếu nhãn “Tùy chọn — chỉ sắp xếp lại tối đa 5 ứng viên đầu”.]

Sau lớp kỹ thuật, dự án có thể gọi model BGE reranker. Khác với embedding là mã hóa riêng từng văn bản, reranker nhận câu truy vấn cùng mô tả của từng ứng viên để chấm mức độ liên quan của cặp đó.

Model được chạy trong một dịch vụ Python dùng FastAPI, Transformers và PyTorch. NestJS gửi câu truy vấn cùng thông tin gọn của ứng viên qua HTTP, sau đó nhận thứ tự đã chấm lại.

Phạm vi runtime được giới hạn tối đa 5 ứng viên đầu. Reranker không tự bổ sung sản phẩm ngoài tập đã nhận. Backend kiểm tra danh sách ID trả về, điểm số và đúng phiên bản model; đồng thời giữ sản phẩm được nhận diện chính xác ở vị trí ưu tiên.

Nếu dịch vụ chưa sẵn sàng, hết thời gian hoặc trả dữ liệu không hợp lệ, hệ thống dùng lại thứ tự trước rerank. Cấu hình mẫu mặc định tắt chức năng này, nên khi demo em cần xác nhận nó đã được bật trước khi nói rằng kết quả đang sử dụng BGE.

Một giới hạn của reranker là nó chỉ sửa thứ tự trong những ứng viên đã có. Nếu bước truy xuất bỏ sót sản phẩm phù hợp, reranker không tự khôi phục sản phẩm đó.

### 10. Tích hợp LLM để giải thích kết quả

[Chiếu phần giải thích sản phẩm, bằng chứng và trạng thái yêu cầu.]

Sau khi có kết quả, hệ thống cần trả lời một câu hỏi quan trọng: vì sao sản phẩm này được đề xuất cho nhu cầu của người dùng?

Phần này được xử lý bởi `ExplanationService`. Đầu tiên, backend dựng lời giải thích theo quy tắc từ thông tin sản phẩm và kết quả đối chiếu. Nội dung có thể gồm đại lượng đo đã xác nhận, giao tiếp được hỗ trợ, dải nhiệt độ liên quan và những yêu cầu chưa có đủ bằng chứng.

LLM được tích hợp sau khi đã có nội dung nền đó. Khi request có `explain: true`, cờ `LLM_EXPLANATION_ENABLED` được bật và đã cấu hình `LLM_MODEL`, backend mới gọi Ollama qua endpoint `/api/chat`.

Dữ liệu gửi sang model gồm câu hỏi, các phương án diễn đạt đã chuẩn bị, bằng chứng cần thiết và trạng thái yêu cầu. Prompt hướng dẫn model chỉ dùng các câu đã được chuẩn bị, có thể chọn cách diễn đạt hoặc thay đổi thứ tự, nhưng phải giữ nguyên đầy đủ thông tin, con số, đơn vị, phủ định và sự không chắc chắn.

Đầu ra được yêu cầu ở dạng JSON có chỉ số kết quả và đoạn văn. Sau khi nhận, backend không dùng ngay mà kiểm tra bằng hàm `verifiedWording`. Hàm này đưa những cách diễn đạt được cho phép về dạng tương đương và đối chiếu các câu với nội dung gốc. Nếu thêm một thông số mới, bỏ mất câu cảnh báo hoặc sửa nội dung ngoài phạm vi cho phép, kết quả sẽ không được chấp nhận.

Đây là một phạm vi sử dụng LLM khá chặt: hỗ trợ cách diễn đạt cho những sự thật đã được dựng từ catalog. Danh sách sản phẩm và kết luận kỹ thuật không được giao cho model sinh tự do quyết định.

Để giới hạn độ trễ, mỗi lần gọi chỉ xử lý tối đa ba kết quả có bằng chứng; ngân sách nội dung còn có thể làm giảm số kết quả gửi đi. Thời gian chờ mặc định của bước giải thích là 20 giây. Nếu model lỗi, hết thời gian hoặc đầu ra không qua kiểm tra, lời giải thích theo quy tắc vẫn được giữ lại.

Phản hồi còn có nguồn giải thích và trạng thái generation. Chỉ khi nguồn là `llm` và trạng thái là `accepted` mới có căn cứ nói cách diễn đạt của model đã được sử dụng. Việc bật cờ cấu hình chưa đủ để chứng minh một phản hồi cụ thể do LLM tạo ra.

### 11. Hội thoại tiếp nối và nhu cầu gồm nhiều thiết bị

[Chiếu truy vấn ban đầu và một câu hỏi bổ sung.]

Ngoài tìm kiếm một lượt, giao diện cho phép người dùng bổ sung yêu cầu, ví dụ sau khi tìm cảm biến độ ẩm đất thì hỏi tiếp: “Chỉ lấy loại hỗ trợ SDI-12”.

Frontend gửi câu truy vấn gốc, câu đã giải quyết ở lượt trước và tối đa năm ID sản phẩm làm phạm vi ngữ cảnh. Backend nhận diện các trường hợp tiếp nối được hỗ trợ rồi đối chiếu lại yêu cầu. Vì vậy, hội thoại ở đây là ngữ cảnh được quản lý rõ trong request, chưa phải bộ nhớ tư vấn dài hạn do LLM tự quản lý.

Với một số nhu cầu gồm đo, ghi và truyền dữ liệu, hệ thống có thể tách thành các nhóm chức năng như cảm biến, bộ ghi và thiết bị truyền thông bằng quy tắc đã triển khai, sau đó tìm ứng viên cho từng nhóm.

Các ứng viên này mới xác nhận được vai trò tương ứng. Khả năng ghép thành một hệ thống hoàn chỉnh vẫn cần kiểm tra tương thích, số kênh, nguồn cấp và điều kiện lắp đặt. Khi chưa rõ một ràng buộc áp dụng cho thành phần nào, hệ thống yêu cầu người dùng làm rõ.

### 12. Kiểm thử và cách đọc kết quả đánh giá

[Chiếu số liệu kèm tên bộ đánh giá, tránh dùng nhãn “độ chính xác toàn hệ thống”.]

Để đánh giá, dự án có kiểm thử ở nhiều tầng: parser, kiểm tra thông số, hợp nhất kết quả, fallback, reranker và giải thích. Việc tách tầng giúp xác định lỗi đến từ truy xuất, lọc kỹ thuật hay diễn đạt.

Về dữ liệu, các báo cáo kiểm tra định danh, tham chiếu nguồn, kiểu giá trị, đơn vị và tính nhất quán của Search Document. Về tìm kiếm, benchmark có các truy vấn đúng model, theo nhu cầu, giao tiếp và điều kiện kỹ thuật.

Trong bộ benchmark v1.1 đã lưu, có 100 truy vấn, gồm 93 truy vấn dùng tính chỉ số relevance và 7 truy vấn âm có chủ đích. Một lần đánh giá BGE offline trên bộ này cho thấy nDCG@5 tăng từ khoảng 0,942 lên 0,949 khi rerank Top-5. Chỉ số này phản ánh chất lượng thứ tự theo nhãn của bộ đánh giá; nó không phải phần trăm chính xác cho mọi người dùng.

Một báo cáo giải thích khác lưu 160 lượt truy vấn HTTP, gồm tiếng Việt, tiếng Anh và các lượt có ngữ cảnh. Báo cáo ghi nhận 326 lời giải thích được chấp nhận từ LLM, đồng thời có các đầu ra không hợp lệ được giữ ở lời giải thích theo quy tắc. Đây là số lượng lời giải thích, không phải số request dùng LLM.

Các kết quả trên là bằng chứng của những lần chạy đã lưu, với dữ liệu và cấu hình lúc đo. Muốn kết luận cho phiên bản đang chạy, cần chạy lại đúng bộ kiểm tra. Em cũng không dùng kiểm thử hợp đồng hoặc kiểm tra bằng chứng để khẳng định mọi suy luận ngữ nghĩa đều đúng tuyệt đối.

### 13. Backend, database và chức năng phụ

[Chiếu kiến trúc tổng thể; chỉ giới thiệu trong khoảng một phút.]

Backend NestJS là đầu mối nhận yêu cầu từ giao diện, kiểm tra dữ liệu bằng các schema dùng chung, điều phối tìm kiếm và gọi dịch vụ AI. Các khóa dịch vụ và việc gọi model được giữ ở phía server. API còn có xác thực, phân quyền quản trị và giới hạn tần suất truy cập cho tìm kiếm.

Database tách dữ liệu sản phẩm, thông số, tài liệu tìm kiếm, hình ảnh và chỉ mục tìm kiếm. Chỉ mục lưu cả dữ liệu phục vụ từ khóa lẫn vector. Với quy mô hiện tại, semantic search dùng phép quét vector chính xác; dự án chưa tạo chỉ mục HNSW hay IVFFlat.

Ngoài AI Search, người dùng có thể xem chi tiết, so sánh thông số, lưu yêu thích, dùng giỏ hàng, đặt hàng, thanh toán VNPay sandbox và theo dõi đơn. Phía quản trị có luồng xem sản phẩm, cập nhật giá và xử lý đơn hàng. Catalog kỹ thuật của bản demo được giữ chỉ đọc; cập nhật nội dung và embedding đi qua pipeline dữ liệu offline.

Những chức năng này tạo bối cảnh sử dụng hoàn chỉnh: tìm thiết bị phù hợp, kiểm tra thông số và tiếp tục quy trình mua hàng. Trọng tâm kỹ thuật của đồ án vẫn là chuỗi dữ liệu và AI Search.

### 14. Kết thúc

[Quay lại kết quả tìm kiếm có phần giải thích.]

Qua đồ án, em xây dựng được một luồng từ dữ liệu sản phẩm thô đến tìm kiếm có giải thích: chuẩn hóa định danh và thông số, làm giàu ngữ nghĩa, tạo embedding, kết hợp từ khóa với ngữ nghĩa, kiểm chứng điều kiện kỹ thuật và sử dụng model để hỗ trợ xếp hạng hoặc diễn đạt khi được bật.

Đóng góp chính của đồ án nằm ở cách kết nối các thành phần đó với dữ liệu có thể kiểm tra nguồn gốc. Hệ thống cho người dùng biết sản phẩm liên quan ở điểm nào, yêu cầu nào đã có bằng chứng và phần nào cần xác nhận thêm.

Hướng phát triển tiếp theo là mở rộng dữ liệu và bộ truy vấn đánh giá, tăng độ bao phủ của parser, kiểm tra tương thích giữa các thành phần và tối ưu độ trễ trên môi trường triển khai thực tế.

Em xin kết thúc phần trình bày và chuyển sang minh họa luồng tìm kiếm. Em cảm ơn thầy cô đã lắng nghe.

## B. Demo AI Search khoảng 3 phút

Các câu dưới đây là kịch bản thao tác. Kết quả và thứ tự cụ thể cần được kiểm tra trước buổi bảo vệ, không đọc trước tên sản phẩm nếu màn hình chưa trả về.

| Thao tác | Câu nhập hoặc nội dung mở | Lời nói gợi ý |
|---|---|---|
| 1. Tìm theo nhu cầu | `cảm biến đo độ ẩm đất` | “Người dùng mô tả đại lượng cần đo mà không cần biết trước mã sản phẩm. Hệ thống phân tích nhu cầu và kết hợp tìm kiếm từ khóa với ngữ nghĩa.” |
| 2. Bổ sung điều kiện trong cùng luồng | `Chỉ lấy loại hỗ trợ SDI-12` | “Lượt này có ngữ cảnh của truy vấn trước. Điều kiện giao tiếp được đối chiếu lại với bằng chứng sản phẩm.” |
| 3. Mở phần giải thích của một kết quả | Nút giải thích trên sản phẩm đang hiển thị | “Ở đây có lý do đề xuất, thông tin được xác nhận và những yêu cầu chưa đủ bằng chứng. Phần hiển thị lấy đánh giá từ backend.” |
| 4. Tìm kiếm mới có ràng buộc | `cảm biến đo độ ẩm đất hỗ trợ SDI-12 hoạt động ở -40°C` | “Ngoài đại lượng đo và giao tiếp, hệ thống kiểm tra riêng dải nhiệt độ vận hành. Đây là điều kiện hoạt động, không tự xác nhận mọi dải đo của thiết bị.” |
| 5. Tìm kiếm mới theo model | `CS655` | “Nếu người dùng đã biết model, hệ thống nhận diện định danh trong catalog và giới hạn kết quả tương ứng.” |

Nếu cần chứng minh LLM chạy thật, mở response của `POST /api/v1/search` trong Network, tìm `explanation.source` và `explanation.generation.status`. Chỉ mô tả là đã dùng LLM khi nhận `llm` và `accepted`; nếu là `rule`, giải thích cơ chế fallback theo đúng response.

Trước buổi demo, dùng hướng dẫn có sẵn trong [demo-ai-search-checklist.md](./demo-ai-search-checklist.md): kiểm tra embedding, warmup model và chạy search smoke. Không chạy import hay sửa catalog chỉ để minh họa trên dữ liệu dùng chung. Nếu dùng chế độ mock của giao diện, cần nói rõ đó là minh họa UI; nó không chứng minh model đang hoạt động.

## C. Câu hỏi phản biện và câu trả lời ngắn

**1. Em có tự huấn luyện hoặc fine-tune model không?**

Trong mã nguồn em đã đối chiếu, dự án sử dụng các model có sẵn để suy luận, chưa có pipeline huấn luyện hoặc fine-tune. Phần em xây dựng là xử lý dữ liệu, tổ chức chỉ mục, kết hợp truy xuất, kiểm chứng kỹ thuật, tích hợp model và kiểm soát đầu ra.

**2. AI ở đâu nếu nhiều bước dùng quy tắc?**

Embedding hỗ trợ biểu diễn và tìm mức liên quan ngữ nghĩa. BGE đánh giá từng cặp câu hỏi–ứng viên khi được bật. LLM hỗ trợ diễn đạt lời giải thích. Các quy tắc giữ vai trò chuẩn hóa và xác nhận các điều kiện kỹ thuật mà sự tương đồng ngữ nghĩa chưa chứng minh được.

**3. Đây có phải RAG không?**

Có thể giải thích là một luồng truy xuất rồi dùng bằng chứng để hỗ trợ bước ngôn ngữ, có điểm tương đồng với RAG. Mô tả chính xác của bản hiện tại là Hybrid Search kết hợp kiểm chứng cấu trúc và lời giải thích có kiểm soát. LLM bị giới hạn ở các cách diễn đạt tương đương của nội dung đã chuẩn bị, chưa phải chatbot RAG sinh câu trả lời tự do từ một tập tài liệu lớn.

**4. Có dùng LangChain hoặc framework agent không?**

Luồng chính đang gọi Ollama bằng HTTP và dùng các service NestJS để điều phối. Reranker được gọi qua dịch vụ Python. Không cần một framework agent để hoàn thành phạm vi tìm kiếm hiện tại.

**5. Tại sao không chỉ dùng semantic search?**

Semantic search hữu ích với cách diễn đạt nhu cầu, nhưng độ gần vector không xác nhận một model có đúng giao tiếp hay dải đo. Từ khóa giúp truy xuất các định danh, thuật ngữ cụ thể; lớp kỹ thuật kiểm tra điều kiện bằng dữ liệu.

**6. Tại sao dùng RRF thay vì cộng trực tiếp điểm?**

Điểm từ khóa và điểm cosine có thang đo khác nhau. RRF kết hợp theo thứ hạng, giúp tránh phải giả định hai loại điểm có thể cộng trực tiếp. K bằng 60 là cấu hình nền trong dự án, chưa phải kết quả tối ưu hóa cho mọi trường hợp.

**7. Vì sao vector là 1.536 chiều?**

Đó là số chiều đầu ra mà dự án yêu cầu và kiểm tra thống nhất ở provider, backend và cột vector. Em không khẳng định đây là số chiều tự nhiên duy nhất của model hoặc tối ưu hơn các lựa chọn khác nếu chưa có thí nghiệm so sánh.

**8. Đưa sản phẩm vào embedding có phải huấn luyện model không?**

Không. Đây là chạy suy luận để mã hóa văn bản và lưu vector cho truy xuất. Nó không cập nhật trọng số của model.

**9. Nếu thay model embedding thì sao?**

Cần tạo lại vector sản phẩm bằng cấu hình tương ứng, cập nhật metadata và bảo đảm câu truy vấn dùng cùng không gian biểu diễn. Nếu số chiều thay đổi thì còn phải cập nhật hợp đồng và cấu trúc database; không thể chỉ thay tên model rồi dùng chung vector cũ.

**10. LLM có thể bịa thông số không?**

Model vẫn có thể trả nội dung sai, nên backend giới hạn prompt và xác minh đầu ra bằng `verifiedWording`. Chỉ những cách diễn đạt bảo toàn các câu gốc theo tập phép thay thế được cho phép mới được dùng. Đầu ra bị từ chối sẽ giữ lời giải thích theo quy tắc. Cơ chế này giảm phạm vi rủi ro, còn độ đúng của bằng chứng vẫn phụ thuộc chất lượng dữ liệu và các bước xử lý trước đó.

**11. UNKNOWN có được xem là đáp ứng không?**

Không. UNKNOWN nghĩa là chưa đủ dữ liệu để kết luận. Trong luồng tìm kiếm hiện tại, giao tiếp và các ràng buộc nhiệt độ độ tin cậy cao phải được xác nhận MATCH để đi tiếp. Khi giải thích một sản phẩm đã chọn, hệ thống vẫn có thể trình bày yêu cầu chưa xác nhận hoặc không đáp ứng để người dùng hiểu giới hạn.

**12. Reranker có luôn cải thiện kết quả không?**

Không. Nó có thể đổi thứ tự theo hướng không phù hợp và không sửa được lỗi bỏ sót ứng viên. Vì vậy dự án giới hạn Top-5, giữ ưu tiên định danh chính xác, kiểm tra response và có fallback. Các thí nghiệm offline với Top-10 hoặc Top-20 trong repository cũng có trường hợp giảm chất lượng hoặc phát sinh hồi quy giao tiếp.

**13. Nếu Ollama ngừng chạy thì hệ thống thế nào?**

Nếu nhánh embedding thất bại nhưng nhánh từ khóa còn hoạt động, API có thể trả kết quả keyword. Nếu bước LLM explanation không hoạt động, dùng lời giải thích theo quy tắc. Nếu cả hai nhánh truy xuất thất bại thì trả lỗi tạm thời, không giả lập một danh sách thành công.

**14. Các điểm similarity có phải phần trăm độ tin cậy không?**

Không. Điểm cosine, điểm từ khóa, RRF và điểm BGE phục vụ so sánh hoặc xếp hạng. Chúng chưa được hiệu chuẩn thành xác suất sản phẩm đáp ứng nhu cầu. Không nên đổi một điểm 0,8 thành tuyên bố “đúng 80%”.

**15. Có xử lý được mọi câu tiếng Việt và điều kiện phủ định không?**

Chưa. Từ vựng miền, parser, quy tắc ngữ cảnh và loại trừ đều có phạm vi hỗ trợ cụ thể. Mã hiện tại đã có một số xử lý loại trừ, nhưng chưa phải bộ hiểu điều kiện phủ định tổng quát. Những cấu trúc chưa hỗ trợ có thể cần làm rõ hoặc bị từ chối.

**16. Có tìm bằng HNSW hoặc cơ sở dữ liệu vector riêng không?**

Hiện dùng PostgreSQL với pgvector và phép quét vector chính xác. Chưa có chỉ mục HNSW hay IVFFlat trong migration hiện tại. Khi dữ liệu và tải tăng, cần đo hiệu năng trước khi chọn cách đánh chỉ mục hoặc đổi hạ tầng.

**17. Gợi ý nhiều thành phần có bảo đảm ghép thành hệ thống được không?**

Chưa. Hệ thống tìm ứng viên theo vai trò từ catalog. Tương thích, số kênh, công suất, nguồn và cấu hình lắp đặt cần được kiểm chứng thêm. Cùng hỗ trợ một giao tiếp chưa đủ chứng minh toàn bộ hệ thống hoạt động.

**18. Vì sao giữ hơn hai nghìn thông số dạng text?**

Nhiều giá trị có điều kiện, mô tả hoặc cấu trúc chưa thể chuyển đổi chắc chắn. Giữ nguyên text và nguồn giúp bảo toàn ý nghĩa. Những giá trị đó vẫn có thể phục vụ hiển thị, tìm literal hoặc giải thích phù hợp, nhưng không tự động được dùng như một khoảng số đã xác nhận.

**19. Đóng góp của em nếu dùng model có sẵn là gì?**

Đóng góp nằm ở giải pháp cho bài toán miền cụ thể: thống nhất catalog, chuẩn hóa và truy xuất nguồn thông số, tạo tài liệu song ngữ, quản lý vector theo phiên bản, kết hợp truy xuất, kiểm chứng yêu cầu, tích hợp các model theo vai trò và xây dựng kiểm thử để đánh giá từng tầng.

## D. Đối chiếu mã nguồn và các điểm phải nói đúng

| Nội dung | Nơi kiểm tra trong repository |
|---|---|
| Quy tắc ghép định danh, active/review | [product-master/lib.mjs](../scripts/product-master/lib.mjs) |
| Chuẩn hóa thông số | [spec-normalization/lib.mjs](../scripts/spec-normalization/lib.mjs) |
| Làm giàu ngữ nghĩa bằng quy tắc | [semantic-enrichment/lib.mjs](../scripts/semantic-enrichment/lib.mjs) |
| Tạo search_text và content_hash | [search-documents/lib.mjs](../scripts/search-documents/lib.mjs) |
| Import, phát hiện đổi nguồn và xóa vector cũ | [import-data-foundation.mjs](../scripts/supabase/import-data-foundation.mjs) |
| Provider Ollama, kiểm tra vector | [ollama-embedding.provider.ts](../apps/api/src/ai/ollama-embedding.provider.ts) |
| Backfill, bỏ qua vector hiện hành, kiểm tra nguồn trước ghi | [create-embeddings/lib.mjs](../scripts/create-embeddings/lib.mjs) |
| Điều phối toàn bộ tìm kiếm và lọc yêu cầu hiện hành | [search.service.ts](../apps/api/src/modules/search/search.service.ts) |
| Từ khóa, mở rộng khái niệm, literal specification | [keyword-search.service.ts](../apps/api/src/modules/search/keyword-search.service.ts) |
| Query embedding và semantic RPC | [semantic-search.service.ts](../apps/api/src/modules/search/semantic-search.service.ts) |
| Hai nhánh song song và fallback | [hybrid-search.service.ts](../apps/api/src/modules/search/hybrid-search.service.ts) |
| Công thức RRF | [search-score.service.ts](../apps/api/src/modules/search/search-score.service.ts) |
| Parser và đối chiếu kỹ thuật | [technical-query-parser.service.ts](../apps/api/src/modules/search/technical-query-parser.service.ts), [technical-match.service.ts](../apps/api/src/modules/search/technical-match.service.ts) |
| Ý định, tách nhu cầu thành nhóm thành phần | [search-intent.ts](../apps/api/src/modules/search/search-intent.ts) |
| Điều phối BGE và dịch vụ model | [reranker.service.ts](../apps/api/src/modules/search/reranker.service.ts), [reranker/app.py](../services/reranker/app.py) |
| Prompt, JSON, giới hạn ba kết quả, trạng thái generation | [explanation.service.ts](../apps/api/src/modules/search/explanation.service.ts) |
| Xác minh các câu diễn đạt của LLM | [explanation-wording.ts](../apps/api/src/modules/search/explanation-wording.ts) |
| Hợp đồng request, response và context | [api-contract.ts](../packages/shared/src/schemas/api-contract.ts) |
| Cấu hình model và feature flags mặc định | [configuration.ts](../apps/api/src/config/configuration.ts), [.env.example](../apps/api/.env.example) |
| Vector cosine, active-only, model/version matching | [semantic search migration](../supabase/migrations/20260916080205_step7_semantic_search_foundation.sql) |
| Số lượng và trạng thái sản phẩm | [product-master-report.json](../data/reports/product-master-report.json) |
| 3.277 thông số, kiểu cấu trúc và text | [spec-normalization-report.json](../data/reports/spec-normalization-report.json) |
| Benchmark v1.1 và kết quả BGE offline | [search-quality-baseline-v1.1.md](./search-quality-baseline-v1.1.md), [reranker-bge-evaluation-v1.md](./reranker-bge-evaluation-v1.md) |
| Lần kiểm tra 160 truy vấn và 326 explanation được LLM chấp nhận | [explanation report](../output/explanation-cases-complete/report.md) |

Lưu ý khi tham khảo tài liệu cũ: một số trang còn mô tả parser chỉ hỗ trợ Celsius và bốn giao tiếp, giữ UNKNOWN trong kết quả tìm kiếm, hoặc mô tả LLM chỉ trả chỉ số lựa chọn. Kịch bản này theo mã nguồn đã đối chiếu: parser được mở rộng; luồng tìm kiếm yêu cầu xác nhận với các điều kiện kỹ thuật nêu ở trên; LLM trả `index` cùng `text`, và đoạn text phải qua `verifiedWording`.

Không gọi bản demo là hệ thống tự huấn luyện model, tư vấn tương thích hoàn chỉnh hoặc có độ chính xác tuyệt đối. Không lấy các số liệu từ những benchmark khác nhau ghép thành một kết luận chung về hiệu quả hiện tại.

Phạm vi kiểm tra khi soạn: đã đọc và đối chiếu luồng dữ liệu, AI Search, cấu hình, migration, giao diện liên quan và các báo cáo; chưa khởi chạy lại API, model hay benchmark. Trạng thái bật model và chất lượng demo phải được xác nhận trên môi trường trình bày.
