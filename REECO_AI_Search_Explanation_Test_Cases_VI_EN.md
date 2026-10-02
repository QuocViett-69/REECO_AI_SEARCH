# REECO AI Search – Explanation Test Cases (VI–EN)

Tài liệu này dùng để test phần **Explanation** trong hệ thống REECO AI Search.

Mục tiêu là kiểm tra AI có thể:

- Hiểu nhu cầu thực tế của người dùng thay vì chỉ match keyword.
- Xác định đúng loại thiết bị cần tìm.
- Đề xuất sản phẩm phù hợp.
- Giải thích vì sao sản phẩm phù hợp.
- Dẫn chứng các thông số kỹ thuật liên quan.
- Nêu rõ hạn chế hoặc yêu cầu chưa được đáp ứng.
- Phân biệt giữa thiết bị đo lường, ghi dữ liệu và truyền dữ liệu.
- Xử lý được câu hỏi bằng cả tiếng Việt và tiếng Anh.
- Xử lý các câu hỏi mang tính hệ thống, cần nhiều thiết bị phối hợp.

---

## Suggested Explanation Output

Mỗi test case có thể được đánh giá theo cấu trúc sau:

```text
1. Detected Intent
2. Detected Application / Use Case
3. Required Measurement
4. Recommended Device Category
5. Recommended Product(s)
6. Why This Product
7. Supporting Specifications / Evidence
8. Limitations / Missing Requirements
9. Optional Related Equipment
```

Ví dụ:

```text
User query:
"Hồ cá tôi đang bị bẩn, tôi muốn cải thiện chất lượng nước nên dùng thiết bị gì?"

Expected reasoning direction:

Detected Intent:
Monitor pond water quality.

Detected problem:
Water appears dirty / turbid.

Required measurement:
Turbidity.

Recommended device category:
Water-quality / turbidity sensor.

Explanation:
Recommend a turbidity sensor because turbidity is directly related to suspended
particles that make water appear cloudy.

Important clarification:
The sensor does not clean the water directly. It measures and monitors water
conditions so the user can detect deterioration and evaluate treatment actions.
```

---

# 1. Water Sensors / Cảm biến nước

## TC-WATER-001

**VI:**  
Hồ cá của tôi đang bị bẩn và nước ngày càng đục, tôi nên dùng thiết bị gì để theo dõi chất lượng nước?

**EN:**  
My fish pond is getting dirty and the water is becoming increasingly turbid. What device should I use to monitor water quality?

---

## TC-WATER-002

**VI:**  
Tôi muốn biết nước trong hồ có đang trở nên đục hơn theo thời gian hay không, nên dùng cảm biến nào?

**EN:**  
I want to know whether the water in my pond is becoming more turbid over time. Which sensor should I use?

---

## TC-WATER-003

**VI:**  
Tôi cần theo dõi độ đục của nước liên tục ngoài trời, thiết bị nào phù hợp và tại sao?

**EN:**  
I need to continuously monitor water turbidity outdoors. Which device is suitable and why?

---

## TC-WATER-004

**VI:**  
Tôi đang quản lý một hồ nuôi cá và muốn phát hiện sớm khi chất lượng nước xấu đi. Tôi nên lắp thiết bị gì?

**EN:**  
I manage a fish pond and want to detect early deterioration in water quality. What device should I install?

---

## TC-WATER-005

**VI:**  
Nước sông sau mưa thường rất đục. Tôi muốn đo sự thay đổi này tự động thì nên dùng cảm biến nào?

**EN:**  
River water becomes very turbid after rain. Which sensor should I use to automatically measure these changes?

---

## TC-WATER-006

**VI:**  
Tôi cần đo chất lượng nước ở một con suối xa khu dân cư. Thiết bị nào phù hợp để giám sát lâu dài?

**EN:**  
I need to monitor water quality in a remote stream. What equipment is suitable for long-term monitoring?

---

## TC-WATER-007

**VI:**  
Tôi muốn nghiên cứu ảnh hưởng của mưa đến độ đục của nước, tôi cần những thiết bị nào?

**EN:**  
I want to study how rainfall affects water turbidity. What equipment do I need?

---

## TC-WATER-008

**VI:**  
Tôi cần cảm biến nước có thể hoạt động lâu ngoài hiện trường mà không phải kiểm tra thường xuyên. Nên chọn loại nào?

**EN:**  
I need a water sensor that can operate in the field for long periods with minimal maintenance. What should I choose?

---

## TC-WATER-009

**VI:**  
Nếu mục tiêu chính của tôi là đo độ đục thì tại sao tôi nên dùng cảm biến độ đục thay vì cảm biến mực nước?

**EN:**  
If my main goal is measuring turbidity, why should I use a turbidity sensor instead of a water-level sensor?

---

## TC-WATER-010

**VI:**  
Tôi cần đo cả độ đục và nhiệt độ nước. Có thiết bị nào phù hợp không?

**EN:**  
I need to measure both turbidity and water temperature. Is there a suitable device?

---

# 2. Soil Sensors / Cảm biến đất

## TC-SOIL-001

**VI:**  
Cây của tôi thường bị thiếu nước nhưng tôi không biết khi nào nên tưới. Tôi nên dùng cảm biến gì?

**EN:**  
My plants often suffer from water stress, but I don't know when to irrigate. What sensor should I use?

---

## TC-SOIL-002

**VI:**  
Tôi muốn hệ thống tưới chỉ hoạt động khi đất thực sự khô. Tôi cần thiết bị nào?

**EN:**  
I want my irrigation system to run only when the soil is actually dry. What device do I need?

---

## TC-SOIL-003

**VI:**  
Tôi đang trồng cây trong nhà kính và muốn theo dõi độ ẩm đất liên tục. Cảm biến nào phù hợp?

**EN:**  
I grow crops in a greenhouse and want to continuously monitor soil moisture. Which sensor is suitable?

---

## TC-SOIL-004

**VI:**  
Tôi cần biết đất có quá ướt sau khi tưới hay không. Thiết bị nào có thể giúp tôi?

**EN:**  
I need to know whether the soil becomes too wet after irrigation. What device can help me?

---

## TC-SOIL-005

**VI:**  
Tôi muốn đo cả độ ẩm và nhiệt độ đất bằng một thiết bị, nên chọn loại nào?

**EN:**  
I want to measure both soil moisture and soil temperature with one device. What should I choose?

---

## TC-SOIL-006

**VI:**  
Trang trại của tôi có nhiều khu vực đất khác nhau. Tôi muốn so sánh độ ẩm giữa các khu vực thì cần hệ thống gì?

**EN:**  
My farm has several different soil zones. What system should I use to compare soil moisture across them?

---

## TC-SOIL-007

**VI:**  
Tôi muốn giảm lượng nước tưới nhưng vẫn đảm bảo cây không thiếu nước. Cảm biến nào sẽ hữu ích nhất?

**EN:**  
I want to reduce irrigation water while preventing plant water stress. Which sensor would be most useful?

---

## TC-SOIL-008

**VI:**  
Tôi cần cảm biến chôn trong đất và hoạt động ngoài trời nhiều tháng. Tôi nên chọn thiết bị dựa trên tiêu chí nào?

**EN:**  
I need a sensor that can remain buried in soil and operate outdoors for months. What criteria should I use to choose one?

---

## TC-SOIL-009

**VI:**  
Vì sao cảm biến độ ẩm đất phù hợp hơn cảm biến thời tiết nếu tôi muốn quyết định thời điểm tưới?

**EN:**  
Why is a soil-moisture sensor more appropriate than a weather sensor when deciding when to irrigate?

---

## TC-SOIL-010

**VI:**  
Tôi đang nghiên cứu quá trình nước thấm xuống đất sau mưa. Tôi nên dùng cảm biến nào?

**EN:**  
I am studying how water infiltrates the soil after rainfall. Which sensor should I use?

---

# 3. Weather Sensors / Cảm biến thời tiết

## TC-WEATHER-001

**VI:**  
Tôi muốn xây dựng một trạm thời tiết cho trang trại. Tôi cần những cảm biến nào?

**EN:**  
I want to build a weather station for my farm. Which sensors do I need?

---

## TC-WEATHER-002

**VI:**  
Tôi muốn biết lượng mưa thực tế tại trang trại thay vì dựa vào dự báo thời tiết. Tôi cần thiết bị gì?

**EN:**  
I want to know the actual rainfall at my farm instead of relying on weather forecasts. What device do I need?

---

## TC-WEATHER-003

**VI:**  
Tôi cần đo tốc độ và hướng gió để đánh giá điều kiện phun thuốc. Nên dùng cảm biến nào?

**EN:**  
I need to measure wind speed and direction to evaluate spraying conditions. Which sensor should I use?

---

## TC-WEATHER-004

**VI:**  
Tôi muốn theo dõi nhiệt độ và độ ẩm không khí trong khu vực trồng cây. Thiết bị nào phù hợp?

**EN:**  
I want to monitor air temperature and humidity in a crop-growing area. Which device is suitable?

---

## TC-WEATHER-005

**VI:**  
Tôi muốn biết lượng ánh sáng mặt trời mà cây nhận được mỗi ngày. Tôi cần cảm biến nào?

**EN:**  
I want to know how much solar radiation my crops receive each day. Which sensor do I need?

---

## TC-WEATHER-006

**VI:**  
Trang trại của tôi thường có gió mạnh. Tôi muốn ghi lại các đợt gió cực đại thì nên dùng thiết bị nào?

**EN:**  
My farm frequently experiences strong winds. What device should I use to record peak wind events?

---

## TC-WEATHER-007

**VI:**  
Tôi cần theo dõi lượng mưa trong nhiều tháng mà không có người trực tại hiện trường. Nên thiết kế hệ thống như thế nào?

**EN:**  
I need to monitor rainfall for several months without personnel on site. How should the system be designed?

---

## TC-WEATHER-008

**VI:**  
Tôi muốn nghiên cứu mối quan hệ giữa nhiệt độ, độ ẩm và lượng mưa. Tôi cần những cảm biến nào?

**EN:**  
I want to study the relationship between temperature, humidity, and rainfall. Which sensors do I need?

---

## TC-WEATHER-009

**VI:**  
Vì sao tôi cần cả cảm biến mưa và cảm biến độ ẩm đất nếu đã có một trong hai?

**EN:**  
Why would I need both a rain gauge and a soil-moisture sensor instead of just one?

---

## TC-WEATHER-010

**VI:**  
Tôi chỉ cần đo lượng mưa, có cần mua cả trạm thời tiết hoàn chỉnh không?

**EN:**  
I only need to measure rainfall. Do I need a complete weather station?

---

# 4. Dataloggers / Bộ ghi dữ liệu

## TC-DATALOGGER-001

**VI:**  
Tôi có nhiều cảm biến ngoài hiện trường và muốn thu thập dữ liệu tự động. Tôi cần thiết bị gì?

**EN:**  
I have multiple field sensors and want to collect their data automatically. What device do I need?

---

## TC-DATALOGGER-002

**VI:**  
Tôi muốn dữ liệu từ cảm biến được lưu lại ngay cả khi mất kết nối Internet. Tôi nên dùng thiết bị nào?

**EN:**  
I want sensor data to remain stored even when the Internet connection is lost. What device should I use?

---

## TC-DATALOGGER-003

**VI:**  
Tôi có cảm biến nhiệt độ, độ ẩm đất và lượng mưa. Bộ ghi dữ liệu nào có thể kết nối tất cả chúng?

**EN:**  
I have temperature, soil-moisture, and rainfall sensors. Which datalogger can connect all of them?

---

## TC-DATALOGGER-004

**VI:**  
Trạm quan trắc của tôi cần hoạt động 24/7 ngoài trời. Tôi nên chọn datalogger theo tiêu chí nào?

**EN:**  
My monitoring station needs to operate outdoors 24/7. What criteria should I use to choose a datalogger?

---

## TC-DATALOGGER-005

**VI:**  
Tôi cần ghi dữ liệu mỗi phút trong vài tháng. Làm sao biết datalogger nào có đủ bộ nhớ?

**EN:**  
I need to record data every minute for several months. How can I determine which datalogger has enough memory?

---

## TC-DATALOGGER-006

**VI:**  
Tôi có 10 cảm biến cần kết nối vào cùng một hệ thống. Datalogger nào phù hợp?

**EN:**  
I have 10 sensors that need to connect to the same system. Which datalogger is suitable?

---

## TC-DATALOGGER-007

**VI:**  
Vì sao tôi cần datalogger nếu cảm biến đã có thể đo dữ liệu?

**EN:**  
Why do I need a datalogger if the sensor can already take measurements?

---

## TC-DATALOGGER-008

**VI:**  
Tôi muốn tính trung bình nhiệt độ mỗi 10 phút nhưng vẫn lưu giá trị cực đại. Datalogger có làm được không?

**EN:**  
I want to calculate 10-minute average temperature while also storing maximum values. Can a datalogger do this?

---

## TC-DATALOGGER-009

**VI:**  
Tôi muốn dùng một datalogger cho cả cảm biến analog và digital. Tôi nên tìm thông số nào?

**EN:**  
I want to use one datalogger with both analog and digital sensors. What specifications should I look for?

---

## TC-DATALOGGER-010

**VI:**  
Tôi có một trạm quan trắc nhỏ chỉ với hai cảm biến. Tôi có cần datalogger công suất lớn không?

**EN:**  
I have a small monitoring station with only two sensors. Do I need a high-capacity datalogger?

---

# 5. Communication Devices / Thiết bị truyền thông

## TC-COMM-001

**VI:**  
Trạm quan trắc của tôi nằm cách xa văn phòng. Tôi muốn xem dữ liệu từ xa thì cần thiết bị gì?

**EN:**  
My monitoring station is far from the office. What device do I need to access the data remotely?

---

## TC-COMM-002

**VI:**  
Khu vực đặt trạm không có Wi-Fi nhưng có sóng di động. Tôi nên truyền dữ liệu bằng cách nào?

**EN:**  
The monitoring site has no Wi-Fi but has cellular coverage. How should I transmit the data?

---

## TC-COMM-003

**VI:**  
Trạm của tôi nằm ở nơi rất xa và không có Internet. Có cách nào gửi dữ liệu về không?

**EN:**  
My station is in a very remote area with no Internet access. Is there a way to transmit the data?

---

## TC-COMM-004

**VI:**  
Tôi muốn nhận dữ liệu từ trạm quan trắc mỗi giờ mà không phải đến hiện trường. Tôi cần hệ thống gì?

**EN:**  
I want to receive data from the monitoring station every hour without visiting the site. What system do I need?

---

## TC-COMM-005

**VI:**  
Tôi có nhiều trạm quan trắc ở các vị trí khác nhau. Làm sao thu dữ liệu về một nơi?

**EN:**  
I have multiple monitoring stations at different locations. How can I collect their data in one place?

---

## TC-COMM-006

**VI:**  
Khi mạng di động bị mất, tôi có bị mất toàn bộ dữ liệu quan trắc không? Tôi cần thiết bị nào để tránh điều đó?

**EN:**  
If the cellular network goes down, will I lose all monitoring data? What equipment can prevent this?

---

## TC-COMM-007

**VI:**  
Tôi nên dùng Ethernet, Wi-Fi hay mạng di động cho trạm quan trắc của mình?

**EN:**  
Should I use Ethernet, Wi-Fi, or cellular communication for my monitoring station?

---

## TC-COMM-008

**VI:**  
Tôi muốn truyền dữ liệu từ một trạm ở vùng núi về máy chủ. Giải pháp truyền thông nào phù hợp?

**EN:**  
I want to transmit data from a mountain monitoring station to a server. Which communication solution is suitable?

---

## TC-COMM-009

**VI:**  
Vì sao tôi cần thiết bị truyền thông nếu datalogger đã lưu được dữ liệu?

**EN:**  
Why do I need a communication device if the datalogger already stores the data?

---

## TC-COMM-010

**VI:**  
Tôi cần kiểm tra dữ liệu từ xa nhưng muốn hệ thống tiêu thụ điện thấp. Nên chọn giải pháp truyền thông nào?

**EN:**  
I need remote data access while keeping power consumption low. Which communication solution should I choose?

---

# 6. Multi-Device / System-Level Questions

Các case này dùng để test khả năng AI hiểu một bài toán cần **nhiều thiết bị phối hợp**, thay vì chỉ trả về một sản phẩm.

## TC-SYSTEM-001

**VI:**  
Tôi muốn xây một hệ thống tự động theo dõi chất lượng nước hồ và xem dữ liệu từ nhà. Tôi cần những thiết bị nào?

**EN:**  
I want to build an automatic pond water-quality monitoring system and view the data from home. What equipment do I need?

---

## TC-SYSTEM-002

**VI:**  
Tôi muốn theo dõi độ ẩm đất, lượng mưa và nhiệt độ để tối ưu việc tưới cây. Hệ thống nên gồm những gì?

**EN:**  
I want to monitor soil moisture, rainfall, and temperature to optimize irrigation. What should the system include?

---

## TC-SYSTEM-003

**VI:**  
Tôi muốn xây trạm thời tiết ở nơi không có điện lưới và gửi dữ liệu về Internet. Tôi cần những thành phần nào?

**EN:**  
I want to build a weather station in an off-grid location and send data to the Internet. What components do I need?

---

## TC-SYSTEM-004

**VI:**  
Tôi muốn biết sau mỗi trận mưa, độ ẩm đất thay đổi như thế nào. Tôi cần thiết bị nào và tại sao?

**EN:**  
I want to know how soil moisture changes after each rainfall event. What equipment do I need and why?

---

## TC-SYSTEM-005

**VI:**  
Tôi muốn kiểm tra xem mưa lớn có làm nước sông đục hơn hay không. Hệ thống quan trắc nào phù hợp?

**EN:**  
I want to determine whether heavy rainfall increases river turbidity. What monitoring system would be suitable?

---

## TC-SYSTEM-006

**VI:**  
Tôi cần một hệ thống hoạt động tự động sáu tháng ở vùng xa và chỉ thỉnh thoảng mới bảo trì. Nên chọn thiết bị như thế nào?

**EN:**  
I need a system that can operate automatically for six months in a remote area with infrequent maintenance. How should I select the equipment?

---

## TC-SYSTEM-007

**VI:**  
Tôi có cảm biến rồi nhưng chưa biết làm thế nào để lưu và truyền dữ liệu về server. Tôi cần thêm những thiết bị nào?

**EN:**  
I already have sensors but don't know how to store and transmit the data to a server. What additional equipment do I need?

---

## TC-SYSTEM-008

**VI:**  
Tôi muốn xây một hệ thống cảnh báo khi đất quá khô. Tôi cần cảm biến, datalogger và thiết bị truyền thông nào?

**EN:**  
I want to build an alert system for excessively dry soil. Which sensor, datalogger, and communication equipment do I need?

---

## TC-SYSTEM-009

**VI:**  
Tôi muốn xây hệ thống cảnh báo khi nước hồ trở nên quá đục. Hệ thống nên hoạt động như thế nào?

**EN:**  
I want to build an alert system for excessive pond turbidity. How should the system work?

---

## TC-SYSTEM-010

**VI:**  
Tôi muốn theo dõi toàn bộ điều kiện môi trường của một trang trại từ xa. Tôi nên bắt đầu với những thiết bị nào?

**EN:**  
I want to remotely monitor the overall environmental conditions of a farm. Which devices should I start with?

---

# 7. Explanation-Focused Questions

Các câu hỏi này dùng để kiểm tra riêng khả năng **giải thích recommendation** của AI Search.

## TC-EXPLAIN-001

**VI:**  
Tại sao sản phẩm này phù hợp với nhu cầu của tôi?

**EN:**  
Why is this product suitable for my application?

---

## TC-EXPLAIN-002

**VI:**  
Những thông số kỹ thuật nào của sản phẩm khiến nó phù hợp với yêu cầu của tôi?

**EN:**  
Which technical specifications make this product suitable for my requirements?

---

## TC-EXPLAIN-003

**VI:**  
Giải thích tại sao bạn đề xuất sản phẩm này thay vì sản phẩm còn lại.

**EN:**  
Explain why you recommended this product instead of the other one.

---

## TC-EXPLAIN-004

**VI:**  
Yêu cầu nào trong câu hỏi của tôi được sản phẩm này đáp ứng?

**EN:**  
Which requirements from my query does this product satisfy?

---

## TC-EXPLAIN-005

**VI:**  
Có yêu cầu nào của tôi mà sản phẩm này không đáp ứng không?

**EN:**  
Are there any requirements from my query that this product does not satisfy?

---

## TC-EXPLAIN-006

**VI:**  
Nếu tôi sử dụng thiết bị này ngoài trời lâu dài thì có phù hợp không? Vì sao?

**EN:**  
Is this device suitable for long-term outdoor use? Why?

---

## TC-EXPLAIN-007

**VI:**  
Giải thích các ưu điểm của thiết bị này đối với trường hợp sử dụng của tôi.

**EN:**  
Explain the advantages of this device for my use case.

---

## TC-EXPLAIN-008

**VI:**  
Hạn chế của thiết bị này trong trường hợp của tôi là gì?

**EN:**  
What are the limitations of this device for my use case?

---

## TC-EXPLAIN-009

**VI:**  
Thông số nào ảnh hưởng nhiều nhất đến việc lựa chọn thiết bị này?

**EN:**  
Which specification had the greatest impact on selecting this device?

---

## TC-EXPLAIN-010

**VI:**  
Nếu bỏ qua yếu tố giá, tại sao thiết bị này phù hợp về mặt kỹ thuật?

**EN:**  
Ignoring price, why is this device technically suitable?

---

# Recommended Evaluation Criteria

Codex hoặc automated test có thể chấm mỗi query dựa trên các tiêu chí dưới đây.

## A. Intent Understanding

AI phải hiểu đúng mục tiêu thực tế của người dùng.

Ví dụ:

```text
"Nước hồ bị đục"
```

không nên được hiểu đơn giản là keyword `water`.

AI nên suy ra:

```text
problem = turbid / cloudy water
measurement need = turbidity
device category = turbidity sensor
```

---

## B. Correct Device Category

AI phải chọn đúng nhóm sản phẩm:

```text
Water Sensor
Soil Sensor
Weather Sensor
Datalogger
Communication Device
```

Nếu bài toán cần nhiều nhóm thiết bị, AI phải nêu đầy đủ các thành phần cần thiết.

---

## C. Specification Grounding

Explanation phải dựa trên dữ liệu kỹ thuật có trong database.

Không được tự tạo thông số.

Ví dụ explanation tốt:

```text
This product is suitable because it supports SDI-12,
which is compatible with the selected datalogger.
```

chỉ hợp lệ nếu thông tin `SDI-12` thực sự tồn tại trong dữ liệu sản phẩm.

---

## D. Query-to-Spec Mapping

AI cần liên kết rõ:

```text
User requirement
    ↓
Relevant specification
    ↓
Product suitability
```

Ví dụ:

```text
User requires outdoor deployment
    ↓
Operating temperature / environmental rating
    ↓
Product is suitable for field deployment
```

---

## E. No Hallucination

AI không được:

```text
- Invent specifications.
- Invent supported protocols.
- Invent measurement ranges.
- Invent compatibility.
- Invent product capabilities.
```

Nếu database không đủ thông tin, AI nên trả lời:

```text
The available product data does not provide enough information
to confirm this requirement.
```

---

## F. Limitation Awareness

AI không chỉ giải thích ưu điểm mà phải phát hiện giới hạn.

Ví dụ:

```text
This sensor can monitor turbidity, but it does not directly
clean or treat the pond water.
```

---

## G. Sensor vs Datalogger vs Communication

AI phải hiểu đúng vai trò:

```text
Sensor
    -> measures physical/environmental variables

Datalogger
    -> reads, processes and stores sensor data

Communication Device
    -> sends stored or real-time data to another location
```

AI không nên đề xuất modem để đo độ ẩm đất, hoặc datalogger để đo trực tiếp độ đục nếu không có sensor phù hợp.

---

## H. Multi-Device Reasoning

Với câu hỏi hệ thống, AI nên reasoning theo dạng:

```text
Measurement
    ↓
Sensor
    ↓
Data acquisition
    ↓
Datalogger
    ↓
Communication
    ↓
Remote server / application
```

Ví dụ:

```text
Soil monitoring system

Soil Moisture Sensor
        ↓
Datalogger
        ↓
Cellular / Ethernet / Radio
        ↓
Server
```

---

# Recommended Pass/Fail Checks

Mỗi query có thể kiểm tra tối thiểu:

```json
{
  "intent_detected": true,
  "correct_device_category": true,
  "relevant_product_returned": true,
  "explanation_present": true,
  "specification_evidence_present": true,
  "no_hallucinated_specs": true,
  "limitations_present_when_needed": true,
  "language_correct": true
}
```

Một response được xem là **PASS** khi:

```text
1. Hiểu đúng intent.
2. Chọn đúng nhóm thiết bị.
3. Recommendation hợp lý.
4. Explanation liên quan trực tiếp đến query.
5. Có evidence từ specification.
6. Không bịa thông số.
7. Nêu limitation nếu cần.
8. Giữ đúng ngôn ngữ của query.
```

---

# Total Test Cases

```text
Water Sensors:            10
Soil Sensors:             10
Weather Sensors:          10
Dataloggers:              10
Communication Devices:    10
Multi-Device Systems:     10
Explanation-Focused:      10
--------------------------------
TOTAL:                    70
```
