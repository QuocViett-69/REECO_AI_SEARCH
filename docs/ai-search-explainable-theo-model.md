# Nền tảng explanation theo từng model

Đối chiếu 89 model active với dữ liệu local, 408 kiểm tra VI/EN. Đây là kiểm tra dữ liệu và quy tắc, không phải xác nhận độc lập toàn bộ datasheet của nhà sản xuất.

API đọc dữ liệu Supabase; cần import search documents và backfill embedding khi search text thay đổi.

Tái tạo: `npm run search:catalog:audit`.

## 105E

Soil Temperature Sensor · CSI_105E

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ đất.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: 

**Ví dụ explanation tiếng Việt**

Khớp chính xác model 105E. 105E đo nhiệt độ đất, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số accuracy: Refer to the Thermocouple Measurement section in the data logger manual. Thông số operating temperature range: -55°C to +125°C, limited by the TPE outer jacket.

**Ví dụ explanation tiếng Anh**

Exact model match: 105E. 105E measures soil temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. accuracy: Refer to the Thermocouple Measurement section in the data logger manual. operating temperature range: -55°C to +125°C, limited by the TPE outer jacket.

**Thông số nguồn để đối chiếu**

- **Type**: Chromel-Constantan — data/raw/CSI_105E.json · record 0 · spec 0 · dòng 2
- **Typical Output**: 60 µV/°C — data/raw/CSI_105E.json · record 0 · spec 1 · dòng 3
- **Accuracy**: Refer to the Thermocouple Measurement section in the data logger manual — data/raw/CSI_105E.json · record 0 · spec 2 · dòng 4
- **Operating Temperature Range**: -55°C to +125°C, limited by the TPE outer jacket — data/raw/CSI_105E.json · record 0 · spec 3 · dòng 5
- **Probe Diameter**: 0.8 cm (0.3 in.) — data/raw/CSI_105E.json · record 0 · spec 4 · dòng 6
- **Plug Dimensions**: 1.8 × 3.3 × 1.0 cm (0.7 × 1.3 × 0.4 in.) — data/raw/CSI_105E.json · record 0 · spec 5 · dòng 7
- **Weight**: 90 g (0.2 lb) with 3.05 m (10 ft) cable — data/raw/CSI_105E.json · record 0 · spec 6 · dòng 8

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## 109

Sensor · CSI_109

Nguồn catalog: https://www.campbellsci.com/products/109

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model 109. 109 đo nhiệt độ, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Operating Temperature Range: -50°C to +70°C. Thông số Temperature Measurement Range: -50°C to +70°C.

**Ví dụ explanation tiếng Anh**

Exact model match: 109. 109 measures temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Operating Temperature Range: -50°C to +70°C. Temperature Measurement Range: -50°C to +70°C.

**Thông số nguồn để đối chiếu**

- **Output**: Analog — data/raw/109.json · record 0 · spec 0 · dòng 2
- **Operating Temperature Range**: -50°C to +70°C — data/raw/109.json · record 0 · spec 1 · dòng 3
- **Sensor Description**: Measurement Specialties™ 10K3A1iA Thermistor — data/raw/109.json · record 0 · spec 2 · dòng 4
- **Tolerance**: ±0.2°C over 0°C to 70°C range — data/raw/109.json · record 0 · spec 3 · dòng 5
- **Temperature Measurement Range**: -50°C to +70°C — data/raw/109.json · record 0 · spec 4 · dòng 6
- **Steinhart-Hart Equation Error**: ≤0.03°C from -50°C to +70°C — data/raw/109.json · record 0 · spec 5 · dòng 7
- **Interchangeability Error**: ±0.1°C over 0°C to 70°C range, increasing to ±0.5°C at -50°C — data/raw/109.json · record 0 · spec 6 · dòng 8
- **Time Constant in Air**: 30 to 60 s, in a wind speed of 5 m/s — data/raw/109.json · record 0 · spec 7 · dòng 9
- **Maximum Submergence**: 15 m (50 ft) — data/raw/109.json · record 0 · spec 8 · dòng 10
- **Maximum Cable Length**: 305 m (1000 ft) — data/raw/109.json · record 0 · spec 9 · dòng 11
- **Probe Length**: 10.4 cm (4.1 in.) — data/raw/109.json · record 0 · spec 10 · dòng 12
- **Probe Diameter**: 0.76 cm (0.3 in.) — data/raw/109.json · record 0 · spec 11 · dòng 13
- **Weight**: 136 g (5 oz) with 3.05 m (10 ft) cable — data/raw/109.json · record 0 · spec 12 · dòng 14

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## 43347

Air Temperature Sensor · CSI_43347

Nguồn catalog: https://www.campbellsci.com/products/43347

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model 43347. 43347 đo nhiệt độ, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số accuracy: ±0.3°C at 0°C.

**Ví dụ explanation tiếng Anh**

Exact model match: 43347. 43347 measures temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. accuracy: ±0.3°C at 0°C.

**Thông số nguồn để đối chiếu**

- **Model Number**: 43347 — data/raw/43347.json · record 0 · spec 0 · dòng 2
- **Probe Tip Material**: Stainless steel — data/raw/43347.json · record 0 · spec 1 · dòng 3
- **Probe Tip Sheath Diameter**: 0.478 cm (0.188 in.) — data/raw/43347.json · record 0 · spec 2 · dòng 4
- **Stainless Steel Sheath Length**: 6.12 cm (2.41 in.) — data/raw/43347.json · record 0 · spec 3 · dòng 5
- **Total Probe Tip Length**: 10.08 cm (3.97 in.) — data/raw/43347.json · record 0 · spec 4 · dòng 6
- **Overall Length**: 17.8 cm (7 in.) — data/raw/43347.json · record 0 · spec 5 · dòng 7
- **Sensing Element**: HY-CAL 1000 Ω Platinum RTD — data/raw/43347.json · record 0 · spec 6 · dòng 8
- **Temperature Range**: ±50°C — data/raw/43347.json · record 0 · spec 7 · dòng 9
- **Accuracy**: ±0.3°C at 0°C — data/raw/43347.json · record 0 · spec 8 · dòng 10
- **Accuracy**: ±0.1°C with NIST calibration — data/raw/43347.json · record 0 · spec 9 · dòng 11
- **Temperature Coefficient**: 0.00375 Ω/Ω/°C — data/raw/43347.json · record 0 · spec 10 · dòng 12

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## 52202

Precipitation Sensor · CSI_52202

Nguồn catalog: https://www.campbellsci.com/products/pn52202

Đại lượng có bằng chứng: Lượng mưa.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model 52202. 52202 đo lượng mưa, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số measurement uncertainty: 2% for up to 25 mm/h (1 in./h). Thông số operating temperature range: -20°C to +50°C, heated.

**Ví dụ explanation tiếng Anh**

Exact model match: 52202. 52202 measures precipitation, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Installation suitability for your specific use case remains unconfirmed. measurement uncertainty: 2% for up to 25 mm/h (1 in./h). operating temperature range: -20°C to +50°C, heated.

**Thông số nguồn để đối chiếu**

- **Sensor Type**: Tipping bucket with magnetic reed switch, normally open — data/raw/52202.json · record 0 · spec 0 · dòng 2
- **Measurement Uncertainty**: 2% for up to 25 mm/h (1 in./h) — data/raw/52202.json · record 0 · spec 1 · dòng 3
- **Measurement Uncertainty**: 3% for up to 50 mm/h (2 in./h) — data/raw/52202.json · record 0 · spec 2 · dòng 4
- **Rainfall per Tip**: 0.1 mm (0.004 in.) — data/raw/52202.json · record 0 · spec 3 · dòng 5
- **Operating Temperature Range**: -20°C to +50°C, heated — data/raw/52202.json · record 0 · spec 4 · dòng 6
- **Humidity Range**: 0 to 100% — data/raw/52202.json · record 0 · spec 5 · dòng 7
- **Power**: 18 W at 24 Vac, for heater only — data/raw/52202.json · record 0 · spec 6 · dòng 8
- **Heater Thermostat Set Point**: 10°C ±3°C — data/raw/52202.json · record 0 · spec 7 · dòng 9
- **Contact Rating**: 24 Vac/dc, 400 mA maximum — data/raw/52202.json · record 0 · spec 8 · dòng 10
- **Compliance with Standards**: 2015/863/EU RoHS Phthalates Amendment — data/raw/52202.json · record 0 · spec 9 · dòng 11
- **Compliance with Standards**: 2011/65/EU RoHS Directive — data/raw/52202.json · record 0 · spec 10 · dòng 12
- **Mounting Pipe**: 30.5 cm (12 in.) length; 1 in. IPS; aluminum; unthreaded — data/raw/52202.json · record 0 · spec 11 · dòng 13
- **Catchment Area**: 200 cm² (31 in²) — data/raw/52202.json · record 0 · spec 12 · dòng 14
- **Orifice Diameter**: 16 cm (6.3 in.) — data/raw/52202.json · record 0 · spec 13 · dòng 15
- **Diameter**: 18.5 cm (7.3 in.) — data/raw/52202.json · record 0 · spec 14 · dòng 16
- **Height**: 30 cm (11.8 in.) — data/raw/52202.json · record 0 · spec 15 · dòng 17
- **Power Plug Weight**: 0.43 kg (0.95 lb) — data/raw/52202.json · record 0 · spec 16 · dòng 18
- **Weight**: 1.16 kg (2.55 lb) — data/raw/52202.json · record 0 · spec 17 · dòng 19

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## AM16/32B-ST

Multiplexer · CSI_AM16_32B_ST

Nguồn catalog: https://www.campbellsci.com/products/am16-32b

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Version: Standard Temperature; Operating Temperature Range: -25°C to +50°C, standard; Active: 11 mA typical in 4×16 mode; 6 mA typical in 2×32 mode; Active: 3.3 to 8 V

**Ví dụ explanation tiếng Việt**

Khớp chính xác model AM16/32B-ST. AM16/32B-ST được phân loại là Multiplexer. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Operating Temperature Range: -25°C to +50°C, standard.

**Ví dụ explanation tiếng Anh**

Exact model match: AM16/32B-ST. AM16/32B-ST is classified as a Multiplexer. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. Operating Temperature Range: -25°C to +50°C, standard.

**Thông số nguồn để đối chiếu**

- **Version**: Standard Temperature — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 0 · dòng 4
- **Note**: Protection on the reset, clock, and +12 V inputs is provided by 18 V TVS diodes — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 1 · dòng 5
- **Power**: Unregulated 9.6 to 16 Vdc — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 2 · dòng 6
- **Scan Advance**: Occurs on the leading edge of the clock pulse transition, from below 1.5 V to above 3.3 V — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 3 · dòng 7
- **Minimum Clock Pulse Width**: 1 ms — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 4 · dòng 8
- **Maximum Actuation Time for Relay**: 20 ms — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 5 · dòng 9
- **Relay Operation**: Break before make — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 6 · dòng 10
- **Initial Relay Resistance, Closed**: 0.1 Ω — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 7 · dòng 11
- **Maximum Switching Current**: 500 mA — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 8 · dòng 12
- **Maximum Switching Current Note**: Switching currents greater than 30 mA are occasionally acceptable but will degrade the contact surfaces of the mechanical relays and increase their resistance — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 9 · dòng 13
- **Maximum Switching Voltage**: 50 Vdc — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 10 · dòng 14
- **Maximum Switching Voltage Note**: A voltage divider such as the VDIV10:1 may be needed between the AM16/32B and the data logger to stay within the input limits of the data logger channel — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 11 · dòng 15
- **Minimum Contact Life**: 5 × 10⁷ operations — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 12 · dòng 16
- **Maximum Contact Voltage Rating**: 70 V — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 13 · dòng 17
- **Maximum Voltage**: 8 Vdc, clock level — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 14 · dòng 18
- **CE Compliance**: EN 55022:1998 Class B; EN 61326:1998 — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 15 · dòng 19
- **Surge**: Complies with IEC 61000-4-5, test level 3, ±2 kV, 2 Ω coupling impedance — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 16 · dòng 20
- **Operating Temperature Range**: -25°C to +50°C, standard — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 17 · dòng 21
- **Dimensions**: 23.9 × 10.2 × 4.6 cm (9.4 × 4.0 × 1.8 in.) — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 18 · dòng 22
- **Weight**: Approximately 680 g (approximately 1.5 lb) — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 19 · dòng 23
- **Air Discharge**: Complies with IEC 61000-4-2, test level 4, ±15 kV — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 20 · dòng 25
- **Contact Discharge**: Complies with IEC 61000-4-2, test level 4, ±8 kV — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 21 · dòng 26
- **Quiescent**: <210 µA — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 22 · dòng 28
- **Active**: 11 mA typical in 4×16 mode; 6 mA typical in 2×32 mode — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 23 · dòng 29
- **Inactive**: <0.9 V — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 24 · dòng 31
- **Active**: 3.3 to 8 V — data/raw/CSI_AM16_32B_ST.json · record 0 · spec 25 · dòng 32

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## Aspen10-CELL-ST

Data Logger / Edge Device · CSI_ASPEN10_CELL_ST

Nguồn catalog: https://www.campbellsci.com/products/aspen10

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: HTTP (supported), MQTT (supported), SDI-12 (supported).

Cấu hình model: Operating Temperature Range: -20°C to +60°C (standard); outdoor environment; Weight: 395 g (0.9 lb); Battery Option: 3.2 Vdc, 7.2 Ah, Li-Po PHD26650

**Ví dụ explanation tiếng Việt**

Khớp chính xác model Aspen10-CELL-ST. Aspen10-CELL-ST là bộ ghi dữ liệu, hỗ trợ phần ghi nhận số liệu trong nhu cầu theo dõi của bạn. Cần kiểm tra cảm biến và giao thức tương thích; bộ ghi không thay thế cảm biến đo. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: HTTP, MQTT, SDI-12. Thông số memory: 2 MB flash; 640 KB SRAM.

**Ví dụ explanation tiếng Anh**

Exact model match: Aspen10-CELL-ST. Aspen10-CELL-ST is a data logger for recording monitoring data. Check compatible sensors and protocols; a logger does not replace a measurement sensor. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: HTTP, MQTT, SDI-12. memory: 2 MB flash; 640 KB SRAM.

**Thông số nguồn để đối chiếu**

- **Processor**: 32-bit Arm Cortex (CPU) — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 0 · dòng 2
- **Memory**: 2 MB flash; 640 KB SRAM — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 1 · dòng 3
- **Program Execution Period**: 1 s to 1 day; 1 s increments — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 2 · dòng 4
- **Real-Time Clock Resolution**: ±1 s — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 3 · dòng 5
- **Real-Time Clock Accuracy**: Synchronized with CampbellCloud once per day — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 4 · dòng 6
- **Operating Temperature Range**: -20°C to +60°C (standard); outdoor environment — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 5 · dòng 7
- **Maximum Scan Rate**: 1 s — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 6 · dòng 8
- **Communications Protocols**: SDI-12, HTTP(S), MQTT — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 7 · dòng 9
- **Case Material**: High-impact-resistant and UV-resistant ASA, recycle code 7; IP65 water-resistant rated; Gore-Tex breathability — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 8 · dòng 10
- **Digital I/O**: Terminals configured for SDI-12 — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 9 · dòng 11
- **Certifications**: CB Certificate Number NO127343 — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 10 · dòng 12
- **Dimensions**: 16.2 × 8.0 × 5.8 cm (6.4 × 3.2 × 2.3 in.) — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 11 · dòng 13
- **Weight**: 395 g (0.9 lb) — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 12 · dòng 14
- **Battery**: Charge and discharge characteristics are controlled internally according to battery type — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 13 · dòng 16
- **Battery Option**: 3.2 Vdc, 7.2 Ah, Li-Po PHD26650 — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 14 · dòng 17
- **Average Current Drain**: <0.35 µA (deep sleep) | 30 mA for 12 Vdc sensor power supply | 14.3 mA for 8 Vdc sensor power supply | 5 mA for 5 Vdc sensor power supply | 10 µA (ultra-low power) for 5 Vdc sensor power supply | <1 mA (idle) — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 15 · dòng 18, 19, 20, 21, 22, 23
- **Power Output Note**: Regulated 5, 8, or 12 Vdc; disabled when battery capacity <0.5 Ah — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 16 · dòng 25
- **5 Vdc Current Limit**: 210 mA; 30 mA (ultra-low power) — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 17 · dòng 26
- **8 Vdc Current Limit**: 210 mA — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 18 · dòng 27
- **12 Vdc Current Limit**: 210 mA — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 19 · dòng 28
- **Protocols**: SDI-12 — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 20 · dòng 30
- **Internet Protocols**: HTTP(S), MQTT — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 21 · dòng 31
- **Near Field Communication (NFC)**: Target device compatible with CampbellGo; maximum distance of 50 m (165 ft) — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 22 · dòng 32
- **Bluetooth Low Energy (BLE)**: Compatible with CampbellGo — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 23 · dòng 33
- **SDI-12**: One SDI-12-compliant terminal meets SDI-12 Standard v1.4 — data/raw/CSI_ASPEN10_CELL_ST.json · record 0 · spec 24 · dòng 34

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## AVW200-ST

Vibrating Wire Analyzer · CSI_AVW200_ST

Nguồn catalog: https://www.campbellsci.com/products/avw200

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: ASCII (supported), SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model AVW200-ST. AVW200-ST được phân loại là Vibrating Wire Analyzer. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số basic resolution c8c0fa2f: 24-bit. Thông số measurement resolution 2869a731: 0.001 Hz RMS, from -55°C to +85°C. Thông số vibrating wire inputs accuracy: ±0.13% of reading, from -55°C to +85°C.

**Ví dụ explanation tiếng Anh**

Exact model match: AVW200-ST. AVW200-ST is classified as a Vibrating Wire Analyzer. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. basic resolution c8c0fa2f: 24-bit. measurement resolution 2869a731: 0.001 Hz RMS, from -55°C to +85°C. vibrating wire inputs accuracy: ±0.13% of reading, from -55°C to +85°C.

**Thông số nguồn để đối chiếu**

- **Measurement Speed**: AVW200 vibrating-wire measurement and half-bridge thermistor measurement combined take less than 2 s per measurement — data/raw/AVW200_ST_XT.json · record 0 · spec 0 · dòng 3
- **DF Measurement Time**: Selectable frequency range: 1.4 to 1.6 s — data/raw/AVW200_ST_XT.json · record 0 · spec 1 · dòng 4
- **Half-Bridge Thermistor Measurement Time**: 60 ms or 70 ms depending on integration time selected — data/raw/AVW200_ST_XT.json · record 0 · spec 2 · dòng 5
- **Thermistor Integration Time**: 20 ms (50 Hz) or 16.66 ms (60 Hz) with positive excitation, followed by 20 ms or 16.66 ms with negative excitation — data/raw/AVW200_ST_XT.json · record 0 · spec 3 · dòng 6
- **Description**: Differential Coil+ (V+) and Coil− (V−) outputs/inputs for direct connection, excitation, and resonant-frequency measurement of vibrating-wire transducers — data/raw/AVW200_ST_XT.json · record 0 · spec 4 · dòng 8
- **Excitation Voltage**: ±2.5 V (5 V peak-to-peak) or ±6 V (12 V peak-to-peak), logarithmic sine wave — data/raw/AVW200_ST_XT.json · record 0 · spec 5 · dòng 9
- **Excitation Frequency Range**: 100 Hz to 6.5 kHz — data/raw/AVW200_ST_XT.json · record 0 · spec 6 · dòng 10
- **Basic Resolution**: 24-bit — data/raw/AVW200_ST_XT.json · record 0 · spec 7 · dòng 11
- **Input Voltage Range**: ±250 mV differential — data/raw/AVW200_ST_XT.json · record 0 · spec 8 · dòng 12
- **Measurement Resolution**: 0.001 Hz RMS, from -55°C to +85°C — data/raw/AVW200_ST_XT.json · record 0 · spec 9 · dòng 13
- **Accuracy**: ±0.13% of reading, from -55°C to +85°C — data/raw/AVW200_ST_XT.json · record 0 · spec 10 · dòng 14
- **Input Resistance**: 4.75 kΩ — data/raw/AVW200_ST_XT.json · record 0 · spec 11 · dòng 15
- **Description**: Half-bridge ratiometric measurement; returned value is in ohms and can be used for temperature correction of the vibrating-wire measurement — data/raw/AVW200_ST_XT.json · record 0 · spec 12 · dòng 17
- **Basic Resolution**: 24-bit — data/raw/AVW200_ST_XT.json · record 0 · spec 13 · dòng 18
- **Input Voltage Range**: ±2500 mV single-ended — data/raw/AVW200_ST_XT.json · record 0 · spec 14 · dòng 19
- **Measurement Resolution**: 0.001 Ω RMS, from -55°C to +85°C — data/raw/AVW200_ST_XT.json · record 0 · spec 15 · dòng 20
- **Accuracy**: ±0.25% of reading, from -55°C to +85°C — data/raw/AVW200_ST_XT.json · record 0 · spec 16 · dòng 21
- **Input Resistance**: 5 kΩ for thermistor input T−; 5 kΩ, 0.1% completion resistor — data/raw/AVW200_ST_XT.json · record 0 · spec 17 · dòng 22
- **Description**: Three digital control ports, C1 to C3 — data/raw/AVW200_ST_XT.json · record 0 · spec 18 · dòng 24
- **C1 Function**: SDI-12 I/O communication port — data/raw/AVW200_ST_XT.json · record 0 · spec 19 · dòng 25
- **C2 Function**: Clock output for multiplexer control — data/raw/AVW200_ST_XT.json · record 0 · spec 20 · dòng 26
- **C3 Function**: Reset output for multiplexer control — data/raw/AVW200_ST_XT.json · record 0 · spec 21 · dòng 27
- **Input State High**: 2.5 to 5.3 V — data/raw/AVW200_ST_XT.json · record 0 · spec 22 · dòng 28
- **Input State Low**: -0.3 to 1.0 V — data/raw/AVW200_ST_XT.json · record 0 · spec 23 · dòng 29
- **Input Hysteresis**: 1.32 V — data/raw/AVW200_ST_XT.json · record 0 · spec 24 · dòng 30
- **Input Resistance**: 100 kΩ — data/raw/AVW200_ST_XT.json · record 0 · spec 25 · dòng 31
- **Output Voltage High**: 5.0 V ±0.1 V, no load — data/raw/AVW200_ST_XT.json · record 0 · spec 26 · dòng 32
- **Output Voltage Low**: <0.1 V, no load — data/raw/AVW200_ST_XT.json · record 0 · spec 27 · dòng 33
- **Output Resistance**: 330 Ω — data/raw/AVW200_ST_XT.json · record 0 · spec 28 · dòng 34
- **RS-232**: Non-isolated — data/raw/AVW200_ST_XT.json · record 0 · spec 29 · dòng 36
- **Baud Rates**: Selectable from 1200 to 38.4 kbps — data/raw/AVW200_ST_XT.json · record 0 · spec 30 · dòng 37
- **RS-232 Protocol**: ASCII; one start bit, one stop bit, eight data bits, no parity — data/raw/AVW200_ST_XT.json · record 0 · spec 31 · dòng 38
- **SDI-12**: Control Port 1 configured for SDI-12 sensor asynchronous communication; meets SDI-12 Standard version 1.3 — data/raw/AVW200_ST_XT.json · record 0 · spec 32 · dòng 39
- **Program Execution Interval**: 1 s — data/raw/AVW200_ST_XT.json · record 0 · spec 33 · dòng 41
- **Processor**: Hitachi H8S 2334, 16-bit CPU with 32-bit internal core — data/raw/AVW200_ST_XT.json · record 0 · spec 34 · dòng 42
- **Memory**: 128 or 512 kB SRAM; 2 MB OS Flash — data/raw/AVW200_ST_XT.json · record 0 · spec 35 · dòng 43
- **Clock Accuracy**: ±10 minutes per month; synchronized with data logger clock every execution interval — data/raw/AVW200_ST_XT.json · record 0 · spec 36 · dòng 44
- **Standard**: IEC 61326:2002 — data/raw/AVW200_ST_XT.json · record 0 · spec 37 · dòng 46
- **Voltage**: 9.6 to 32 Vdc — data/raw/AVW200_ST_XT.json · record 0 · spec 38 · dòng 48
- **Typical Current Drain — Quiescent, Radio Off**: Approximately 0.3 mA at 12 Vdc — data/raw/AVW200_ST_XT.json · record 0 · spec 39 · dòng 49
- **Typical Current Drain — Radio Duty Cycling**: Approximately 3 mA at 12 Vdc, 1 s duty cycle including quiescent current — data/raw/AVW200_ST_XT.json · record 0 · spec 40 · dòng 50
- **Typical Current Drain — Radio Always On**: Approximately 26 mA at 12 Vdc; radio transmit current 100 mA — data/raw/AVW200_ST_XT.json · record 0 · spec 41 · dòng 51
- **Typical Current Drain — Active RS-232 Communication**: Approximately 6 mA at 12 Vdc; approximately 3 s after communication stops, current drops to quiescent level — data/raw/AVW200_ST_XT.json · record 0 · spec 42 · dòng 52
- **Typical Current Drain — Measurement**: Approximately 25 mA averaged over 2 s — data/raw/AVW200_ST_XT.json · record 0 · spec 43 · dòng 53
- **Operating Temperature Range**: -25°C to +50°C, standard — data/raw/AVW200_ST_XT.json · record 0 · spec 44 · dòng 55
- **Dimensions**: 21.6 × 11.18 × 3.18 cm (8.5 × 4.5 × 1.2 in.) — data/raw/AVW200_ST_XT.json · record 0 · spec 45 · dòng 57
- **Weight**: 0.43 kg (0.95 lb) — data/raw/AVW200_ST_XT.json · record 0 · spec 46 · dòng 58
- **Warranty**: One year against defects in materials and workmanship — data/raw/AVW200_ST_XT.json · record 0 · spec 47 · dòng 60

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## BaroVue10

Barometric Pressure Sensor · CSI_BAROVUE10

Nguồn catalog: https://www.campbellsci.com/products/barovue10

Đại lượng có bằng chứng: Áp suất khí quyển.

Giao thức được ghi nhận: RS-232 (supported), SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model BaroVue10. BaroVue10 đo áp suất khí quyển, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, SDI-12. Thông số calibration uncertainty: ±0.15 hPa. Thông số uncertainty: ±0.3 hPa at 20°C. Thông số total uncertainty: ±0.5 hPa from -40°C to +60°C.

**Ví dụ explanation tiếng Anh**

Exact model match: BaroVue10. BaroVue10 measures barometric pressure, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, SDI-12. calibration uncertainty: ±0.15 hPa. uncertainty: ±0.3 hPa at 20°C. total uncertainty: ±0.5 hPa from -40°C to +60°C.

**Thông số nguồn để đối chiếu**

- **Note**: These specifications assume the recommended desiccation is used — data/raw/BaroVue10.json · record 0 · spec 0 · dòng 2
- **Pressure Range**: 500 to 1100 hPa — data/raw/BaroVue10.json · record 0 · spec 1 · dòng 3
- **Temperature Range**: -40°C to +60°C — data/raw/BaroVue10.json · record 0 · spec 2 · dòng 4
- **Supply Voltage**: 9 to 28 Vdc — data/raw/BaroVue10.json · record 0 · spec 3 · dòng 5
- **Elevation**: Approximately 609.6 m (2,000 ft) below sea level, as in a mine, to 4,572 m (15,000 ft) above sea level — data/raw/BaroVue10.json · record 0 · spec 4 · dòng 6
- **Current Consumption**: 200 µA, sleep mode — data/raw/BaroVue10.json · record 0 · spec 5 · dòng 7
- **Current Consumption**: <5 mA, active — data/raw/BaroVue10.json · record 0 · spec 6 · dòng 8
- **Digital Output**: SDI-12, RS-232 serial — data/raw/BaroVue10.json · record 0 · spec 7 · dòng 9
- **Pressure Fitting**: Barbed fitting for 0.318 cm (0.125 in.) — data/raw/BaroVue10.json · record 0 · spec 8 · dòng 10
- **Dimensions**: 2.2 × 9.0 × 10.2 cm (0.87 × 3.54 × 4.02 in.) — data/raw/BaroVue10.json · record 0 · spec 9 · dòng 11
- **Weight**: 226.8 g (0.5 lb) — data/raw/BaroVue10.json · record 0 · spec 10 · dòng 12
- **Calibration Uncertainty**: ±0.15 hPa — data/raw/BaroVue10.json · record 0 · spec 11 · dòng 14
- **Uncertainty**: ±0.3 hPa at 20°C — data/raw/BaroVue10.json · record 0 · spec 12 · dòng 15
- **Total Uncertainty**: ±0.5 hPa from -40°C to +60°C — data/raw/BaroVue10.json · record 0 · spec 13 · dòng 16
- **Long-Term Stability**: ±0.1 hPa/year — data/raw/BaroVue10.json · record 0 · spec 14 · dòng 17
- **Power Supply Rejection**: Negligible — data/raw/BaroVue10.json · record 0 · spec 15 · dòng 18
- **Measurement Noise**: 0.05 hPa RMS — data/raw/BaroVue10.json · record 0 · spec 16 · dòng 19
- **Resolution**: 0.1 hPa — data/raw/BaroVue10.json · record 0 · spec 17 · dòng 20

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## BLACKGLOBE

Black Globe Temperature Sensor · CSI_BLACKGLOBE

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Worst-Case Accuracy: ±0.3°C from -3°C to 90°C; Worst-Case Accuracy: ±0.7°C from -5°C to 95°C; Interchangeability Error: ±0.10°C from 0°C to 70°C; Interchangeability Error: ±0.14°C at -5°C; Interchangeability Error: ±0.25°C at 85°C; Interchangeability Error: ±0.35°C at 95°C

**Ví dụ explanation tiếng Việt**

Khớp chính xác model BLACKGLOBE. BLACKGLOBE đo nhiệt độ, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Temperature Measurement Range: -5°C to +95°C. Thông số worst case accuracy: ±0.3°C from -3°C to 90°C.

**Ví dụ explanation tiếng Anh**

Exact model match: BLACKGLOBE. BLACKGLOBE measures temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Temperature Measurement Range: -5°C to +95°C. worst case accuracy: ±0.3°C from -3°C to 90°C.

**Thông số nguồn để đối chiếu**

- **BlackGlobe Near Normal Emittance**: 0.957 — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 0 · dòng 2
- **Sensor Element**: Measurement Specialties 100K6A1iA thermistor — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 1 · dòng 3
- **Temperature Survival Range**: -50°C to +100°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 2 · dòng 4
- **Temperature Measurement Range**: -5°C to +95°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 3 · dòng 5
- **Time Constant in Air**: 200 ±10 s — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 4 · dòng 6
- **Maximum Cable Length**: 305 m (1000 ft) — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 5 · dòng 7
- **Worst-Case Accuracy**: ±0.3°C from -3°C to 90°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 6 · dòng 8
- **Worst-Case Accuracy**: ±0.7°C from -5°C to 95°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 7 · dòng 9
- **Interchangeability Error**: ±0.10°C from 0°C to 70°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 8 · dòng 10
- **Interchangeability Error**: ±0.14°C at -5°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 9 · dòng 11
- **Interchangeability Error**: ±0.25°C at 85°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 10 · dòng 12
- **Interchangeability Error**: ±0.35°C at 95°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 11 · dòng 13
- **Steinhart-Hart Equation Error**: ≤±0.01°C from -35°C to 50°C — data/raw/CSI_BLACKGLOBE.json · record 0 · spec 12 · dòng 14

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CELL205-AT

Cellular Modem / Router · CSI_CELL205_AT

Nguồn catalog: https://www.campbellsci.com/products/cell205

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), RS-232 (supported), USB (supported).

Cấu hình model: Provisioning Option: Provisioned for AT&T North America; Provisioning Status: Provisioned

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CELL205-AT. CELL205-AT là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232, USB. Thông số Low Power Mode: 300 µA. Thông số output power: 24 dBm on UMTS; 23 dBm on LTE; 27 dBm on EDGE; 33 dBm on GSM.

**Ví dụ explanation tiếng Anh**

Exact model match: CELL205-AT. CELL205-AT is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232, USB. Low Power Mode: 300 µA. output power: 24 dBm on UMTS; 23 dBm on LTE; 27 dBm on EDGE; 33 dBm on GSM.

**Thông số nguồn để đối chiếu**

- **Product Series**: CELL200 Series — data/raw/Cell205.json · record 0 · spec 0 · dòng 2
- **Product Model**: CELL205 — data/raw/Cell205.json · record 0 · spec 1 · dòng 3
- **Product Type**: 4G LTE cellular device — data/raw/Cell205.json · record 0 · spec 2 · dòng 4
- **Network Technology**: 4G LTE CAT-1 with automatic fallback to 3G — data/raw/Cell205.json · record 0 · spec 3 · dòng 5
- **Transmission Distance or Area**: Dependent upon antenna used and LTE, WCDMA, GSM EDGE, and GSM GPRS coverage — data/raw/Cell205.json · record 0 · spec 4 · dòng 6
- **Certifications**: IC (Industry Canada) 10224A-201611EC21A — data/raw/Cell205.json · record 0 · spec 5 · dòng 7
- **Host Interface**: CS I/O communications port, DB9 male; RS-232 serial port, DB9 female; USB version 2.0 with micro-B connector — data/raw/Cell205.json · record 0 · spec 6 · dòng 8
- **RF Connectors**: 2 SMA antenna connectors, primary and diversity — data/raw/Cell205.json · record 0 · spec 7 · dòng 9
- **Operating Temperature Range**: -40°C to +80°C — data/raw/Cell205.json · record 0 · spec 8 · dòng 10
- **SIM Interface**: 3FF, 6 position/contacts; supports SIMs requiring 1.8 or 3 Vdc — data/raw/Cell205.json · record 0 · spec 9 · dòng 11
- **Service Requirements**: Network coverage at the data logger site and cellular data service plan — data/raw/Cell205.json · record 0 · spec 10 · dòng 12
- **Dimensions**: 13.46 × 8.1 × 2.86 cm (5.3 × 3.19 × 1.13 in.) — data/raw/Cell205.json · record 0 · spec 11 · dòng 13
- **Weight**: 215.5 g (7.6 oz) — data/raw/Cell205.json · record 0 · spec 12 · dòng 14
- **Carrier Approval**: AT&T, T-Mobile USA, Rogers, Bell, Telus — data/raw/Cell205.json · record 0 · spec 13 · dòng 15
- **LTE Bands**: 1900 (B2), AWS (B4), 700 (B12) — data/raw/Cell205.json · record 0 · spec 14 · dòng 16
- **WCDMA Bands**: 1900 (B2), AWS (B4), 850 (B5) — data/raw/Cell205.json · record 0 · spec 15 · dòng 17
- **LTE Download Speed**: Max 10 Mbps — data/raw/Cell205.json · record 0 · spec 16 · dòng 18
- **LTE Upload Speed**: Max 5 Mbps — data/raw/Cell205.json · record 0 · spec 17 · dòng 19
- **WCDMA Download Speed**: Max 384 Kbps — data/raw/Cell205.json · record 0 · spec 18 · dòng 20
- **WCDMA Upload Speed**: Max 384 Kbps — data/raw/Cell205.json · record 0 · spec 19 · dòng 21
- **GSM EDGE Upload Speed**: Max 236.8 Kbps — data/raw/Cell205.json · record 0 · spec 20 · dòng 22
- **GSM EDGE Download Speed**: Max 296 Kbps — data/raw/Cell205.json · record 0 · spec 21 · dòng 23
- **GSM GPRS Download Speed**: Max 107 Kbps — data/raw/Cell205.json · record 0 · spec 22 · dòng 24
- **GSM GPRS Upload Speed**: Max 85.6 Kbps — data/raw/Cell205.json · record 0 · spec 23 · dòng 25
- **RS-232 or CS I/O**: 9600 bps to 460.8 kbps — data/raw/Cell205.json · record 0 · spec 24 · dòng 26
- **Low Power Mode**: 300 µA — data/raw/Cell205.json · record 0 · spec 25 · dòng 27
- **Idle Current**: 14 mA — data/raw/Cell205.json · record 0 · spec 26 · dòng 28
- **Active Current**: 39 mA — data/raw/Cell205.json · record 0 · spec 27 · dòng 29
- **Output Power**: 24 dBm on UMTS; 23 dBm on LTE; 27 dBm on EDGE; 33 dBm on GSM — data/raw/Cell205.json · record 0 · spec 28 · dòng 30
- **Sensitivity Range**: -99.5 to 110.5 dBm (10 M) — data/raw/Cell205.json · record 0 · spec 29 · dòng 31
- **Provisioning Option**: Provisioned for AT&T North America — data/raw/Cell205.json · record 0 · spec 30 · dòng 32
- **Provisioning Status**: Provisioned — data/raw/Cell205.json · record 0 · spec 31 · dòng 33

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CELL210-V

Cellular Modem / Router · CSI_CELL210_V

Nguồn catalog: https://www.campbellsci.com/products/cell210

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), RS-232 (supported), USB (supported).

Cấu hình model: Provisioning Option: Provisioned for Verizon US; Provisioning Status: Provisioned

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CELL210-V. CELL210-V là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232, USB. Thông số Low Power Mode: 300 µA. Thông số output power: 23 dBm on LTE.

**Ví dụ explanation tiếng Anh**

Exact model match: CELL210-V. CELL210-V is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232, USB. Low Power Mode: 300 µA. output power: 23 dBm on LTE.

**Thông số nguồn để đối chiếu**

- **Product Series**: CELL200 Series — data/raw/CSI_CELL210_V.json · record 0 · spec 0 · dòng 2
- **Product Model**: CELL210 — data/raw/CSI_CELL210_V.json · record 0 · spec 1 · dòng 3
- **Product Type**: 4G LTE CAT-1 Cellular Module for Verizon — data/raw/CSI_CELL210_V.json · record 0 · spec 2 · dòng 4
- **Transmission Distance or Area**: Dependent upon antenna used and LTE, WCDMA, GSM EDGE, and GSM GPRS coverage — data/raw/CSI_CELL210_V.json · record 0 · spec 3 · dòng 5
- **Certifications**: IC (Industry Canada) 10224A-201611EC21A — data/raw/CSI_CELL210_V.json · record 0 · spec 4 · dòng 6
- **Host Interface**: RS-232 serial port, DB9 female; CS I/O communications port, DB9 male; USB version 2.0 with micro-B connector — data/raw/CSI_CELL210_V.json · record 0 · spec 5 · dòng 7
- **RF Connectors**: 2 SMA antenna connectors, primary and diversity — data/raw/CSI_CELL210_V.json · record 0 · spec 6 · dòng 8
- **Operating Temperature Range**: -40°C to +80°C — data/raw/CSI_CELL210_V.json · record 0 · spec 7 · dòng 9
- **SIM Interface**: 3FF, 6 position/contacts; supports SIMs that require 1.8 or 3 Vdc — data/raw/CSI_CELL210_V.json · record 0 · spec 8 · dòng 10
- **Service Requirements**: Network coverage at the data logger site and cellular data service plan — data/raw/CSI_CELL210_V.json · record 0 · spec 9 · dòng 11
- **Dimensions**: 13.46 × 8.1 × 2.86 cm (5.3 × 3.19 × 1.13 in.) — data/raw/CSI_CELL210_V.json · record 0 · spec 10 · dòng 12
- **Weight**: 215.5 g (7.6 oz) — data/raw/CSI_CELL210_V.json · record 0 · spec 11 · dòng 13
- **Network Technology**: 4G LTE CAT-1 — data/raw/CSI_CELL210_V.json · record 0 · spec 12 · dòng 15
- **Carrier Approval**: Verizon — data/raw/CSI_CELL210_V.json · record 0 · spec 13 · dòng 16
- **LTE Bands**: AWS (B4), 700 (B13) — data/raw/CSI_CELL210_V.json · record 0 · spec 14 · dòng 17
- **LTE Download Speed**: Max 10 Mbps — data/raw/CSI_CELL210_V.json · record 0 · spec 15 · dòng 19
- **LTE Upload Speed**: Max 5 Mbps — data/raw/CSI_CELL210_V.json · record 0 · spec 16 · dòng 20
- **WCDMA Download Speed**: Max 384 Kbps — data/raw/CSI_CELL210_V.json · record 0 · spec 17 · dòng 21
- **WCDMA Upload Speed**: Max 384 Kbps — data/raw/CSI_CELL210_V.json · record 0 · spec 18 · dòng 22
- **GSM EDGE Download Speed**: Max 296 Kbps — data/raw/CSI_CELL210_V.json · record 0 · spec 19 · dòng 23
- **GSM EDGE Upload Speed**: Max 236.8 Kbps — data/raw/CSI_CELL210_V.json · record 0 · spec 20 · dòng 24
- **GSM GPRS Download Speed**: Max 107 Kbps — data/raw/CSI_CELL210_V.json · record 0 · spec 21 · dòng 25
- **GSM GPRS Upload Speed**: Max 85.6 Kbps — data/raw/CSI_CELL210_V.json · record 0 · spec 22 · dòng 26
- **RS-232 or CS I/O**: 9600 bps to 460.8 kbps — data/raw/CSI_CELL210_V.json · record 0 · spec 23 · dòng 27
- **Low Power Mode**: 300 µA — data/raw/CSI_CELL210_V.json · record 0 · spec 24 · dòng 29
- **Idle Current**: 14 mA — data/raw/CSI_CELL210_V.json · record 0 · spec 25 · dòng 30
- **Active Current**: 25 mA — data/raw/CSI_CELL210_V.json · record 0 · spec 26 · dòng 31
- **Output Power**: 23 dBm on LTE — data/raw/CSI_CELL210_V.json · record 0 · spec 27 · dòng 33
- **Provisioning Option**: Provisioned for Verizon US — data/raw/CSI_CELL210_V.json · record 0 · spec 28 · dòng 35
- **Provisioning Status**: Provisioned — data/raw/CSI_CELL210_V.json · record 0 · spec 29 · dòng 36

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CELL215-IT1A

Cellular Modem / Router · CSI_CELL215_IT1A

Nguồn catalog: https://www.campbellsci.com/products/cell215

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), RS-232 (supported), USB (supported).

Cấu hình model: Provisioning Option: Provisioned for International 1A; Provisioning Status: Provisioned

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CELL215-IT1A. CELL215-IT1A là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232, USB. Thông số Low Power Mode: 300 µA. Thông số output power: 27 dBm on EDGE; 24 dBm on UMTS; 33 dBm on GSM; 23 dBm on LTE.

**Ví dụ explanation tiếng Anh**

Exact model match: CELL215-IT1A. CELL215-IT1A is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232, USB. Low Power Mode: 300 µA. output power: 27 dBm on EDGE; 24 dBm on UMTS; 33 dBm on GSM; 23 dBm on LTE.

**Thông số nguồn để đối chiếu**

- **Product Series**: CELL200 Series — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 0 · dòng 2
- **Product Model**: CELL215 — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 1 · dòng 3
- **Product Type**: 4G LTE CAT-1 Cellular Module for EMEA Countries — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 2 · dòng 4
- **Certifications**: IC (Industry Canada) 10224A-201611EC21A — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 3 · dòng 5
- **Host Interface**: CS I/O communications port, DB9 male; USB version 2.0 with micro-B connector; RS-232 serial port, DB9 female — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 4 · dòng 6
- **RF Connectors**: 2 SMA antenna connectors, primary and diversity — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 5 · dòng 7
- **Operating Temperature Range**: -40°C to +80°C — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 6 · dòng 8
- **SIM Interface**: 3FF, 6 position/contacts; supports SIMs that require 1.8 or 3 Vdc — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 7 · dòng 9
- **Dimensions**: 13.46 × 8.1 × 2.86 cm (5.3 × 3.19 × 1.13 in.) — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 8 · dòng 10
- **Weight**: 215.5 g (7.6 oz) — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 9 · dòng 11
- **Network Technology**: 4G LTE CAT-1 with automatic fallback to 3G and 2G — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 10 · dòng 13
- **Carrier Approval**: Vodafone — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 11 · dòng 14
- **4G LTE Bands**: 2100(B1), 1800(B3), 850(B5), 2600(B7), 900(B8), 800(B20) — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 12 · dòng 15
- **WCDMA (3G) Bands**: 2100(B1), 850(B5), 900(B8) — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 13 · dòng 16
- **GSM (2G) Bands**: 1800(B3), 900(B8) — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 14 · dòng 17
- **LTE Download Speed**: Max 10 Mbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 15 · dòng 19
- **LTE Upload Speed**: Max 5 Mbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 16 · dòng 20
- **WCDMA Download Speed**: Max 384 Kbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 17 · dòng 21
- **WCDMA Upload Speed**: Max 384 Kbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 18 · dòng 22
- **GSM EDGE Download Speed**: Max 296 Kbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 19 · dòng 23
- **GSM EDGE Upload Speed**: Max 236.8 Kbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 20 · dòng 24
- **GSM GPRS Download Speed**: Max 107 Kbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 21 · dòng 25
- **GSM GPRS Upload Speed**: Max 85.6 Kbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 22 · dòng 26
- **RS-232 or CS I/O**: 9600 bps to 460.8 kbps — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 23 · dòng 27
- **Low Power Mode**: 300 µA — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 24 · dòng 29
- **Idle Current**: 14 mA — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 25 · dòng 30
- **Active Current**: 39 mA — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 26 · dòng 31
- **Output Power**: 27 dBm on EDGE; 24 dBm on UMTS; 33 dBm on GSM; 23 dBm on LTE — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 27 · dòng 33
- **Sensitivity Range**: -99.5 to 110.5 dBm (10 M) — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 28 · dòng 34
- **Provisioning Option**: Provisioned for International 1A — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 29 · dòng 36
- **Provisioning Status**: Provisioned — data/raw/CSI_CELL215_IT1A.json · record 0 · spec 30 · dòng 37

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CELL220-IT1A

Cellular Modem / Router · CSI_CELL220_IT1A

Nguồn catalog: https://www.campbellsci.com/products/cell220

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), RS-232 (supported), USB (supported).

Cấu hình model: LTE Bands: 2100(B1), 1800(B3), 850(B5), 2600(B7), 700(B28); WCDMA Bands: 1900(B1), 850(B5); LTE Bands: LTE 2100(B1), 1900(B2), 1800(B3), 1700/2100(B4), 2600(B7), 900(B8), 700(B28); WCDMA Bands: 2100(B1), 1900(B2), 850(B5), 900(B8); Provisioning Option: Australia Provisioned for International 1A; Provisioning Status: Provisioned

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CELL220-IT1A. CELL220-IT1A là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232, USB. Thông số Low Power Mode: 300 µA. Thông số output power: 23 dBm on LTE; 24 dBm on UMTS.

**Ví dụ explanation tiếng Anh**

Exact model match: CELL220-IT1A. CELL220-IT1A is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232, USB. Low Power Mode: 300 µA. output power: 23 dBm on LTE; 24 dBm on UMTS.

**Thông số nguồn để đối chiếu**

- **Product Model**: CELL220 — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 0 · dòng 2
- **Product Type**: 4G LTE CAT-1 Cellular Module for Australia and New Zealand — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 1 · dòng 3
- **Certifications**: IC (Industry Canada) 10224A-201611EC21A — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 2 · dòng 4
- **Host Interface**: USB version 2.0 with micro-B connector; CS I/O communications port, DB9 male; RS-232 serial port, DB9 female — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 3 · dòng 5
- **RF Connectors**: 2 SMA antenna connectors, primary and diversity — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 4 · dòng 6
- **Operating Temperature Range**: -40°C to +80°C — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 5 · dòng 7
- **SIM Interface**: 3FF, 6 position/contacts; supports SIMs that require 1.8 or 3 Vdc — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 6 · dòng 8
- **Dimensions**: 13.46 × 8.1 × 2.86 cm (5.3 × 3.19 × 1.13 in.) — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 7 · dòng 9
- **Weight**: 215.5 g (7.6 oz) — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 8 · dòng 10
- **Network Technology**: 4G LTE CAT-1 with automatic fallback to 3G — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 9 · dòng 12
- **Carrier Approval**: Telstra — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 10 · dòng 13
- **LTE Bands**: 2100(B1), 1800(B3), 850(B5), 2600(B7), 700(B28) — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 11 · dòng 14
- **WCDMA Bands**: 1900(B1), 850(B5) — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 12 · dòng 15
- **Network Technology**: 4G LTE CAT-1 with automatic fallback to 3G — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 13 · dòng 17
- **Carrier Approval**: Telstra — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 14 · dòng 18
- **LTE Bands**: LTE 2100(B1), 1900(B2), 1800(B3), 1700/2100(B4), 2600(B7), 900(B8), 700(B28) — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 15 · dòng 19
- **WCDMA Bands**: 2100(B1), 1900(B2), 850(B5), 900(B8) — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 16 · dòng 20
- **LTE Download Speed**: Max 10 Mbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 17 · dòng 22
- **LTE Upload Speed**: Max 5 Mbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 18 · dòng 23
- **WCDMA Download Speed**: Max 384 Kbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 19 · dòng 24
- **WCDMA Upload Speed**: Max 384 Kbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 20 · dòng 25
- **GSM EDGE Download Speed**: Max 296 Kbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 21 · dòng 26
- **GSM EDGE Upload Speed**: Max 236.8 Kbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 22 · dòng 27
- **GSM GPRS Download Speed**: Max 107 Kbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 23 · dòng 28
- **GSM GPRS Upload Speed**: Max 85.6 Kbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 24 · dòng 29
- **RS-232 or CS I/O**: 9600 bps to 460.8 kbps — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 25 · dòng 30
- **Low Power Mode**: 300 µA — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 26 · dòng 32
- **Idle Current**: 14 mA — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 27 · dòng 33
- **Active Current**: 39 mA — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 28 · dòng 34
- **Output Power**: 23 dBm on LTE; 24 dBm on UMTS — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 29 · dòng 36
- **Sensitivity Range**: -99.5 to 110.5 dBm (10 M) — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 30 · dòng 37
- **Provisioning Option**: Australia Provisioned for International 1A — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 31 · dòng 39
- **Provisioning Status**: Provisioned — data/raw/CSI_CELL220_IT1A.json · record 0 · spec 32 · dòng 40

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CELL225-IT1A

Cellular Modem / Router · CSI_CELL225_IT1A

Nguồn catalog: https://www.campbellsci.com/products/cell225

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), RS-232 (supported), USB (supported).

Cấu hình model: Provisioning Option: Provisioned for International 1A; Provisioning Status: Provisioned

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CELL225-IT1A. CELL225-IT1A là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232, USB. Thông số Low Power Mode: 300 µA. Thông số output power: 23 dBm on LTE.

**Ví dụ explanation tiếng Anh**

Exact model match: CELL225-IT1A. CELL225-IT1A is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232, USB. Low Power Mode: 300 µA. output power: 23 dBm on LTE.

**Thông số nguồn để đối chiếu**

- **Product Model**: CELL225 — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 0 · dòng 2
- **Product Type**: 4G LTE CAT-1 Cellular Module for Japan — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 1 · dòng 3
- **Certifications**: IC (Industry Canada) 10224A-201611EC21A — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 2 · dòng 4
- **Host Interface**: RS-232 serial port, DB9 female; CS I/O communications port, DB9 male; USB version 2.0 with micro-B connector — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 3 · dòng 5
- **RF Connectors**: 2 SMA antenna connectors, primary and diversity — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 4 · dòng 6
- **Operating Temperature Range**: -40°C to +80°C — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 5 · dòng 7
- **SIM Interface**: 3FF, 6 position/contacts; supports SIMs that require 1.8 or 3 Vdc — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 6 · dòng 8
- **Dimensions**: 13.46 × 8.1 × 2.86 cm (5.3 × 3.19 × 1.13 in.) — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 7 · dòng 9
- **Weight**: 215.5 g (7.6 oz) — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 8 · dòng 10
- **Network Technology**: 4G LTE CAT-1 — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 9 · dòng 12
- **Carrier Approval**: JATE / TELEC / DOCOMO — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 10 · dòng 13
- **LTE Bands**: 2100(B1), 1800(B3), 900(B8), 800 Lower(B18), 800 Upper(B19), 850+(B26) — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 11 · dòng 14
- **LTE Upload Speed**: Max 5 Mbps — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 12 · dòng 16
- **LTE Download Speed**: Max 10 Mbps — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 13 · dòng 17
- **RS-232 or CS I/O**: 9600 bps to 460.8 kbps — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 14 · dòng 18
- **Low Power Mode**: 300 µA — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 15 · dòng 20
- **Idle Current**: 14 mA — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 16 · dòng 21
- **Active Current**: 39 mA — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 17 · dòng 22
- **Output Power**: 23 dBm on LTE — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 18 · dòng 24
- **Sensitivity Range**: -99.5 to 110.5 dBm (10 M) — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 19 · dòng 25
- **Provisioning Option**: Provisioned for International 1A — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 20 · dòng 27
- **Provisioning Status**: Provisioned — data/raw/CSI_CELL225_IT1A.json · record 0 · spec 21 · dòng 28

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CH200

Charge Regulator / DC Adapter · CSI_CH200

Nguồn catalog: https://www.campbellsci.com/products/ch200

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CH200. CH200 là Charge Regulator / DC Adapter, dùng cho phần cấp nguồn. Cần đối chiếu điện áp, dòng điện, pin và tải; chưa xác nhận thời gian hoạt động của hệ thống. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Input Voltage Range: 15 to 40 Vdc. Thông số maximum charging current: 4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger). Thông số no battery connected: 2 mA maximum.

**Ví dụ explanation tiếng Anh**

Exact model match: CH200. CH200 is a Charge Regulator / DC Adapter for system power. Check voltage, current, batteries and load; system runtime is not established. Installation suitability for your specific use case remains unconfirmed. Input Voltage Range: 15 to 40 Vdc. maximum charging current: 4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger). no battery connected: 2 mA maximum.

**Thông số nguồn để đối chiếu**

- **Operational Temperature**: -40°C to +60°C; VRLA battery manufacturers state that “heat kills batteries” and recommend operating batteries at ≤50°C — data/raw/ch200_201_ps200.json · record 0 · spec 0 · dòng 3
- **Dimensions**: 7.5 × 3.7 × 10.0 cm (3 × 1.5 × 3.9 in.) — data/raw/ch200_201_ps200.json · record 0 · spec 1 · dòng 5
- **AC**: 18 to 24 VRMS, internally limited to 1.2 ARMS maximum — data/raw/ch200_201_ps200.json · record 0 · spec 2 · dòng 8
- **DC**: 16 to 40 Vdc, internally limited to 1.1 Adc maximum — data/raw/ch200_201_ps200.json · record 0 · spec 3 · dòng 9
- **Note**: Battery voltages below 8.7 V may result in less than 3.0 A current limit because of fold-back current limit — data/raw/ch200_201_ps200.json · record 0 · spec 4 · dòng 11
- **Input Voltage Range**: 15 to 40 Vdc — data/raw/ch200_201_ps200.json · record 0 · spec 5 · dòng 12
- **Maximum Charging Current**: 4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger) — data/raw/ch200_201_ps200.json · record 0 · spec 6 · dòng 13
- **No Charge Source Present**: 300 µA maximum — data/raw/ch200_201_ps200.json · record 0 · spec 7 · dòng 17
- **No Battery Connected**: 2 mA maximum — data/raw/ch200_201_ps200.json · record 0 · spec 8 · dòng 18
- **Battery Charging Note**: Two-step temperature-compensated constant-voltage charging for valve-regulated lead-acid batteries; cycle and float charging voltage parameters are programmable with default values listed — data/raw/ch200_201_ps200.json · record 0 · spec 9 · dòng 20
- **CYCLE Charging**: Vbatt(T) = 14.70 V − (24 mV) × (T − 25°C) — data/raw/ch200_201_ps200.json · record 0 · spec 10 · dòng 21
- **FLOAT Charging**: Vbatt(T) = 13.65 V − (18 mV) × (T − 25°C) — data/raw/ch200_201_ps200.json · record 0 · spec 11 · dòng 22
- **Charging Voltage Accuracy**: ±1% on charging voltage over -40°C to +60°C — data/raw/ch200_201_ps200.json · record 0 · spec 12 · dòng 23
- **Voltage**: Unregulated 12 V from battery — data/raw/ch200_201_ps200.json · record 0 · spec 13 · dòng 25
- **Output Protection**: 4 A self-resettable thermal fuse — data/raw/ch200_201_ps200.json · record 0 · spec 14 · dòng 26
- **Fuse Hold Current Limit**: >4 A (<20°C); 2.7 A (60°C); 3.1 A (50°C); 4.0 A (20°C) — data/raw/ch200_201_ps200.json · record 0 · spec 15 · dòng 27
- **Measurement Temperature Note**: At -40°C to +60°C — data/raw/ch200_201_ps200.json · record 0 · spec 16 · dòng 30
- **Average Battery Voltage**: ±(1% of reading + 15 mV) — data/raw/ch200_201_ps200.json · record 0 · spec 17 · dòng 31
- **Average Battery/Load Current**: ±(2% of reading + 2 mA) — data/raw/ch200_201_ps200.json · record 0 · spec 18 · dòng 32
- **Solar**: ±(1% of reading − 0.25 V) / −(1% of reading + 1 V) — data/raw/ch200_201_ps200.json · record 0 · spec 19 · dòng 40
- **Solar Negative Offset Note**: 1.0 V negative offset is worst-case due to reversal protection diode on input; typical diode drop is 0.35 V — data/raw/ch200_201_ps200.json · record 0 · spec 20 · dòng 41
- **Continuous**: ±(1% of reading − 0.5 V) / −(1% of reading + 2 V) — data/raw/ch200_201_ps200.json · record 0 · spec 21 · dòng 42
- **Continuous Negative Offset Note**: 2.0 V negative offset is worst-case due to two series diodes in AC full-bridge; typical diode drops are 0.35 each for 0.7 V total — data/raw/ch200_201_ps200.json · record 0 · spec 22 · dòng 43
- **Charger Temperature**: ±2°C — data/raw/ch200_201_ps200.json · record 0 · spec 23 · dòng 44

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## ClariVue10

Turbidity Sensor · CSI_CLARIVUE10

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ, Độ đục.

Giao thức được ghi nhận: SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model ClariVue10. ClariVue10 đo nhiệt độ, độ đục, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số Operating temperature range: −2 to 40 °C. Thông số Measurement range: 0 to 4000 FNU. Thông số Resolution: 0.2 FNU.

**Ví dụ explanation tiếng Anh**

Exact model match: ClariVue10. ClariVue10 measures temperature, turbidity, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. Operating temperature range: −2 to 40 °C. Measurement range: 0 to 4000 FNU. Resolution: 0.2 FNU.

**Thông số nguồn để đối chiếu**

- **Standards**: Meets ISO 7027-1:2016 (side scatter) standard for turbidity measurements — data/raw/Clari10_20.json · record 1 · spec 0 · dòng 2
- **Signal type**: SDI-12 v1.4 — data/raw/Clari10_20.json · record 1 · spec 1 · dòng 3
- **Operating temperature range**: −2 to 40 °C — data/raw/Clari10_20.json · record 1 · spec 2 · dòng 6
- **Power requirements**: 9.6 to 18 VDC — data/raw/Clari10_20.json · record 1 · spec 3 · dòng 8
- **Power consumption – Idle**: <300 µA — data/raw/Clari10_20.json · record 1 · spec 4 · dòng 11
- **Power consumption – Measurement**: <35 mA — data/raw/Clari10_20.json · record 1 · spec 5 · dòng 12
- **Measurement range**: 0 to 4000 FNU — data/raw/Clari10_20.json · record 1 · spec 6 · dòng 13
- **SDI-12 measurement response time**: 9 to 22 s depending on the SDI-12 command — data/raw/Clari10_20.json · record 1 · spec 7 · dòng 14
- **Resolution**: 0.2 FNU — data/raw/Clari10_20.json · record 1 · spec 8 · dòng 15
- **Particle size**: 0.1 to 0.5 µm — data/raw/Clari10_20.json · record 1 · spec 9 · dòng 16
- **Accuracy**: ±2% or 0.5 FNU, whichever is greater — data/raw/Clari10_20.json · record 1 · spec 10 · dòng 17
- **Housing material**: Delrin® plastic — data/raw/Clari10_20.json · record 1 · spec 11 · dòng 18
- **Head material**: Marine-grade bronze — data/raw/Clari10_20.json · record 1 · spec 12 · dòng 19
- **Optics**: Sapphire lens — data/raw/Clari10_20.json · record 1 · spec 13 · dòng 20
- **Connector description**: MCBH-5-FS, marine-grade bronze, 3 gold-plated pins, wet-mateable — data/raw/Clari10_20.json · record 1 · spec 14 · dòng 21
- **Cable type**: 3-conductor, polyurethane jacket with water block — data/raw/Clari10_20.json · record 1 · spec 15 · dòng 22
- **Optical assembly**: Sealed with double O-rings — data/raw/Clari10_20.json · record 1 · spec 16 · dòng 23
- **Internal temperature measurement**: ±0.2 °C accuracy — data/raw/Clari10_20.json · record 1 · spec 17 · dòng 24
- **Maximum depth**: 30 m (100 ft) — data/raw/Clari10_20.json · record 1 · spec 18 · dòng 25
- **Diameter**: 3.0 cm (1.2 in) — data/raw/Clari10_20.json · record 1 · spec 19 · dòng 26
- **Length**: 16.6 cm (6.5 in) — data/raw/Clari10_20.json · record 1 · spec 20 · dòng 27
- **Weight**: 158.76 g (0.35 lb) — data/raw/Clari10_20.json · record 1 · spec 21 · dòng 28

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## ClimaVue40

All-in-One Weather Sensor · CSI_CLIMAVUE40

Nguồn catalog: https://www.campbellsci.com/products/climavue40

Đại lượng có bằng chứng: Nhiệt độ không khí, Độ ẩm tương đối, Lượng mưa, Tốc độ gió, Hướng gió.

Giao thức được ghi nhận: Modbus (supported), RS-485 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model ClimaVue40. ClimaVue40 đo nhiệt độ không khí, độ ẩm tương đối, lượng mưa, tốc độ gió, hướng gió, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Số đo gió hỗ trợ đánh giá điều kiện tại điểm lắp đặt. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Modbus, RS-485. Thông số Operating Temperature Range: -50° to +60°C. Thông số Precipitation Resolution: 0.017 mm. Thông số precipitation uncertainty: ±5% of measurement (from 0 to 1,000 mm/h).

**Ví dụ explanation tiếng Anh**

Exact model match: ClimaVue40. ClimaVue40 measures air temperature, relative humidity, precipitation, wind speed, wind direction, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Wind readings support assessing conditions at the installation point. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Modbus, RS-485. Operating Temperature Range: -50° to +60°C. Precipitation Resolution: 0.017 mm. precipitation uncertainty: ±5% of measurement (from 0 to 1,000 mm/h).

**Thông số nguồn để đối chiếu**

- **Measurements Made**: Air temperature, precipitation, relative humidity, and wind direction and speed — data/raw/ClimaVue40&52G2.json · record 0 · spec 0 · dòng 3
- **Measurement Scan Rate**: 1 s — data/raw/ClimaVue40&52G2.json · record 0 · spec 1 · dòng 4
- **Input Supply Voltage**: 9 to 15 Vdc — data/raw/ClimaVue40&52G2.json · record 0 · spec 2 · dòng 6
- **Operating Temperature Range**: -50° to +60°C — data/raw/ClimaVue40&52G2.json · record 0 · spec 3 · dòng 9
- **Average Current Drain @ 12 Vdc**: 6 mA — data/raw/ClimaVue40&52G2.json · record 0 · spec 4 · dòng 10
- **Communications**: RS-485 Modbus — data/raw/ClimaVue40&52G2.json · record 0 · spec 5 · dòng 12
- **Connector**: M12 five pin — data/raw/ClimaVue40&52G2.json · record 0 · spec 6 · dòng 13
- **Diameter**: 10 cm (4 in.) including rain gage funnel — data/raw/ClimaVue40&52G2.json · record 0 · spec 7 · dòng 18
- **Height**: 34 cm (13.4 in.) including rain gage funnel — data/raw/ClimaVue40&52G2.json · record 0 · spec 8 · dòng 19
- **Ingress Protection**: The ClimaVue 40 is intended for year-round, unattended outdoor use in meteorological and environmental monitoring applications. It tolerates continuous exposure to wind, heavy rain, dust, and solar radiation. When installed properly, the instrument housing provides environmental protection functionally equivalent to an IP65 rating, though no official certification is claimed. This device should not be subjected to high-pressure water streams, submersion in liquid, or corrosive gases. — data/raw/ClimaVue40&52G2.json · record 0 · spec 9 · dòng 21
- **Application of Council Directive(s)**: 2014/30/EU: Electromagnetic Compatibility Directive (EMC)2015/863/EU: Amending Annex II of RoHS Directive 2011/65/EU: Phthalates Restrictions (EU)2011/65/EU: Restrictions of Hazardous Substances Directive (RoHS2) — data/raw/ClimaVue40&52G2.json · record 0 · spec 10 · dòng 22
- **Standards to Which Conformity Is Declared**: EN 61326-1:2013: Electrical equipment for measurement, control, and laboratory use—EMC requirements—for use in industrial locationsEN 63000:2018: Technical documentation for the assessment of electrical and electronic products with respect to the restriction of hazardous substances — data/raw/ClimaVue40&52G2.json · record 0 · spec 11 · dòng 23
- **Precipitation Range**: 0 to 1,500 mm/h — data/raw/ClimaVue40&52G2.json · record 0 · spec 12 · dòng 30
- **Precipitation Resolution**: 0.017 mm — data/raw/ClimaVue40&52G2.json · record 0 · spec 13 · dòng 32
- **Precipitation Uncertainty**: ±5% of measurement (from 0 to 1,000 mm/h) — data/raw/ClimaVue40&52G2.json · record 0 · spec 14 · dòng 33
- **Vapor Pressure Range**: 0 to 47 kPa — data/raw/ClimaVue40&52G2.json · record 0 · spec 15 · dòng 36
- **Vapor Pressure Resolution**: 0.01 kPa — data/raw/ClimaVue40&52G2.json · record 0 · spec 16 · dòng 38
- **Vapor Pressure Uncertainty**: Varies with temperature and humidity — data/raw/ClimaVue40&52G2.json · record 0 · spec 17 · dòng 39
- **Air Temperature Range**: -50° to +60°C — data/raw/ClimaVue40&52G2.json · record 0 · spec 18 · dòng 42
- **Air Temperature Resolution**: 0.1°C — data/raw/ClimaVue40&52G2.json · record 0 · spec 19 · dòng 44
- **Air Temperature Sensor Uncertainty**: ±0.2°C at 25°C — data/raw/ClimaVue40&52G2.json · record 0 · spec 20 · dòng 45
- **Air Temperature Measurement Uncertainty**: ±0.6°C from -20° to +50°C — data/raw/ClimaVue40&52G2.json · record 0 · spec 21 · dòng 46
- **Relative Humidity Measurement Range**: 0 to 100% — data/raw/ClimaVue40&52G2.json · record 0 · spec 22 · dòng 49
- **Relative Humidity Resolution**: 0.1 — data/raw/ClimaVue40&52G2.json · record 0 · spec 23 · dòng 50
- **Relative Humidity Uncertainty**: ±3% RH typical (varies with temperature and humidity) — data/raw/ClimaVue40&52G2.json · record 0 · spec 24 · dòng 51
- **Barometric Pressure Range**: 1 to 120 kPa — data/raw/ClimaVue40&52G2.json · record 0 · spec 25 · dòng 55
- **Barometric Pressure Resolution**: 0.01 kPa — data/raw/ClimaVue40&52G2.json · record 0 · spec 26 · dòng 57
- **Barometric Pressure Uncertainty**: ±0.05 kPa at 25°C — data/raw/ClimaVue40&52G2.json · record 0 · spec 27 · dòng 58
- **Barometric Pressure Equilibration**: < 10 ms — data/raw/ClimaVue40&52G2.json · record 0 · spec 28 · dòng 60
- **Barometric Pressure Long-Term Drift**: < 0.1 kPa/year, typical — data/raw/ClimaVue40&52G2.json · record 0 · spec 29 · dòng 61
- **Horizontal Wind Speed Range**: 0 to 60 m/s — data/raw/ClimaVue40&52G2.json · record 0 · spec 30 · dòng 63
- **Horizontal Wind Speed Resolution**: 0.01 m/s — data/raw/ClimaVue40&52G2.json · record 0 · spec 31 · dòng 64
- **Horizontal Wind Speed Uncertainty**: 0.3 m/s or 6% of measurement, whichever is greater — data/raw/ClimaVue40&52G2.json · record 0 · spec 32 · dòng 65
- **Wind Gust Range**: 0 to 60 m/s — data/raw/ClimaVue40&52G2.json · record 0 · spec 33 · dòng 72
- **Wind Gust Resolution**: 0.01 m/s — data/raw/ClimaVue40&52G2.json · record 0 · spec 34 · dòng 73
- **Wind Gust Uncertainty**: 0.3 m/s or 6% of measurement, whichever is greater — data/raw/ClimaVue40&52G2.json · record 0 · spec 35 · dòng 74
- **Wind Direction Range**: 0° to 359° — data/raw/ClimaVue40&52G2.json · record 0 · spec 36 · dòng 76
- **Wind Direction Resolution**: 1° — data/raw/ClimaVue40&52G2.json · record 0 · spec 37 · dòng 78
- **Wind Direction Uncertainty**: ±5° — data/raw/ClimaVue40&52G2.json · record 0 · spec 38 · dòng 79
- **Tilt Range**: 0° to 180° — data/raw/ClimaVue40&52G2.json · record 0 · spec 39 · dòng 87
- **Tilt Resolution**: 0.1° — data/raw/ClimaVue40&52G2.json · record 0 · spec 40 · dòng 89
- **Tilt Uncertainty**: ±1° — data/raw/ClimaVue40&52G2.json · record 0 · spec 41 · dòng 90
- **Lightning Strike Count Range**: 0 to 65,535 strikes — data/raw/ClimaVue40&52G2.json · record 0 · spec 42 · dòng 93
- **Lightning Strike Count Resolution**: 1 strike — data/raw/ClimaVue40&52G2.json · record 0 · spec 43 · dòng 95
- **Lightning Strike Count Uncertainty**: >25% detection at <10 km typical (variable with distance) — data/raw/ClimaVue40&52G2.json · record 0 · spec 44 · dòng 96
- **Lightning Average Distance Range**: 0 to 40 km — data/raw/ClimaVue40&52G2.json · record 0 · spec 45 · dòng 99
- **Lightning Average Distance Resolution**: 3 km — data/raw/ClimaVue40&52G2.json · record 0 · spec 46 · dòng 101
- **Lightning Average Distance Uncertainty**: Variable — data/raw/ClimaVue40&52G2.json · record 0 · spec 47 · dòng 102

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.
- Bảng thông số nguồn có áp suất/sét nhưng danh sách Measurements Made không xác nhận các đại lượng này. Giữ ở trạng thái cần đối chiếu theo đúng model.

## ClimaVue50G2

All-in-One Weather Sensor · CSI_CLIMAVUE50G2

Nguồn catalog: https://www.campbellsci.com/products/climavue50-g2

Đại lượng có bằng chứng: Nhiệt độ không khí, Độ ẩm tương đối, Áp suất khí quyển, Lượng mưa, Độ dẫn điện của nước mưa, Tốc độ gió, Hướng gió, Bức xạ mặt trời, Khoảng cách sét, Số lần sét đánh, Độ nghiêng.

Giao thức được ghi nhận: SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model ClimaVue50G2. ClimaVue50G2 đo nhiệt độ không khí, độ ẩm tương đối, áp suất khí quyển, lượng mưa, độ dẫn điện của nước mưa, tốc độ gió, hướng gió, bức xạ mặt trời, khoảng cách sét, số lần sét đánh, độ nghiêng, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Số đo gió hỗ trợ đánh giá điều kiện tại điểm lắp đặt. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số operating temperature range: -50° to +60°C (generally)0° to +60°C (precipitation sensor, but will not measure solid precipitation)-40° to +60°C (barometer and RH sensors). Thông số precipitation measurement range: 0 to 1,500 mm/h (60 in./h). Thông số Precipitation Resolution: 0.017 mm.

**Ví dụ explanation tiếng Anh**

Exact model match: ClimaVue50G2. ClimaVue50G2 measures air temperature, relative humidity, barometric pressure, precipitation, precipitation electrical conductivity, wind speed, wind direction, solar radiation, lightning distance, lightning strike count, tilt, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Wind readings support assessing conditions at the installation point. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. operating temperature range: -50° to +60°C (generally)0° to +60°C (precipitation sensor, but will not measure solid precipitation)-40° to +60°C (barometer and RH sensors). precipitation measurement range: 0 to 1,500 mm/h (60 in./h). Precipitation Resolution: 0.017 mm.

**Thông số nguồn để đối chiếu**

- **Measurements Made**: Air temperature, barometric pressure, lightning average distance, lightning strike count, precipitation, precipitation electrical conductivity (EC), relative humidity, solar radiation, tilt, wind direction, and wind speed — data/raw/ClimaVue40&52G2.json · record 1 · spec 0 · dòng 3
- **Output**: SDI-12 — data/raw/ClimaVue40&52G2.json · record 1 · spec 1 · dòng 5
- **Minimum Supply Voltage**: 3.6 Vdc continuous — data/raw/ClimaVue40&52G2.json · record 1 · spec 2 · dòng 7
- **Maximum Supply Voltage**: 15.0 Vdc continuous — data/raw/ClimaVue40&52G2.json · record 1 · spec 3 · dòng 8
- **Operating Temperature Range**: -50° to +60°C (generally)0° to +60°C (precipitation sensor, but will not measure solid precipitation)-40° to +60°C (barometer and RH sensors) — data/raw/ClimaVue40&52G2.json · record 1 · spec 4 · dòng 9
- **Typical Current Drain @ 12 Vdc**: < 1 mA (average) — data/raw/ClimaVue40&52G2.json · record 1 · spec 5 · dòng 11
- **Typical Measurement Duration**: 110 ms — data/raw/ClimaVue40&52G2.json · record 1 · spec 6 · dòng 14
- **Maximum Measurement Duration**: 3,000 ms — data/raw/ClimaVue40&52G2.json · record 1 · spec 7 · dòng 15
- **Maximum Polling Frequency**: 10 s — data/raw/ClimaVue40&52G2.json · record 1 · spec 8 · dòng 16
- **Connection Description**: 1.25 m (4 ft) pigtail with 8-pin M12 (male) connectorMarine-grade 316 stainless-steel knurl — data/raw/ClimaVue40&52G2.json · record 1 · spec 9 · dòng 17
- **Diameter**: 10 cm (4 in.) including rain gauge funnel — data/raw/ClimaVue40&52G2.json · record 1 · spec 10 · dòng 18
- **Height**: 28 cm (11 in.) including rain gauge funnel — data/raw/ClimaVue40&52G2.json · record 1 · spec 11 · dòng 19
- **Weight**: 850 g (1.87 lb) — data/raw/ClimaVue40&52G2.json · record 1 · spec 12 · dòng 20
- **Ingress Protection**: The ClimaVue 50 G2 is intended for year-round, unattended outdoor use in meteorological and environmental monitoring applications. It tolerates continuous exposure to wind, heavy rain, dust, and solar radiation. When installed properly, the instrument housing provides environmental protection functionally equivalent to an IP65 rating, though no official certification is claimed. This device should not be subjected to high-pressure water streams, submersion in liquid, or corrosive gases. — data/raw/ClimaVue40&52G2.json · record 1 · spec 13 · dòng 21
- **Application of Council Directive(s)**: 2014/30/EU: Electromagnetic Compatibility Directive (EMC)2011/65/EU: Restrictions of Hazardous Substances Directive (RoHS2)2015/863/EU: Amending Annex II of RoHS Directive 2011/65/EU: Phthalates Restrictions (EU) — data/raw/ClimaVue40&52G2.json · record 1 · spec 14 · dòng 22
- **Standards to Which Conformity Is Declared**: EN 61326-1:2013: Electrical equipment for measurement, control, and laboratory use—EMC requirements—for use in industrial locationsEN 63000:2018: Technical documentation for the assessment of electrical and electronic products with respect to the restriction of hazardous substances — data/raw/ClimaVue40&52G2.json · record 1 · spec 15 · dòng 23
- **Quiescent**: 0.3 mA — data/raw/ClimaVue40&52G2.json · record 1 · spec 16 · dòng 25
- **Maximum Peak Current**: 33 mA — data/raw/ClimaVue40&52G2.json · record 1 · spec 17 · dòng 26
- **Average Using the R7! Command every 10 s**: 1.0 mA — data/raw/ClimaVue40&52G2.json · record 1 · spec 18 · dòng 27
- **Average Using the R7! Command every 60 s (or slower)**: 0.4 mA — data/raw/ClimaVue40&52G2.json · record 1 · spec 19 · dòng 28
- **Precipitation Measurement Range**: 0 to 1,500 mm/h (60 in./h) — data/raw/ClimaVue40&52G2.json · record 1 · spec 20 · dòng 31
- **Precipitation Resolution**: 0.017 mm — data/raw/ClimaVue40&52G2.json · record 1 · spec 21 · dòng 32
- **Precipitation Accuracy**: ±5% of measurement (from 0 to 1,000 mm/h or 0 to 40 in./h) — data/raw/ClimaVue40&52G2.json · record 1 · spec 22 · dòng 34
- **Vapor Pressure Measurement Range**: 0 to 47 kPa — data/raw/ClimaVue40&52G2.json · record 1 · spec 23 · dòng 37
- **Vapor Pressure Resolution**: 0.01 kPa — data/raw/ClimaVue40&52G2.json · record 1 · spec 24 · dòng 38
- **Vapor Pressure Accuracy or Repeatability**: Varies with temperature and humidity±0.2 kPa typical below 40°C — data/raw/ClimaVue40&52G2.json · record 1 · spec 25 · dòng 40
- **Air Temperature Measurement Range**: -50° to +60°C — data/raw/ClimaVue40&52G2.json · record 1 · spec 26 · dòng 43
- **Air Temperature Resolution**: 0.1°C — data/raw/ClimaVue40&52G2.json · record 1 · spec 27 · dòng 44
- **Air Temperature Accuracy**: ±0.6°C — data/raw/ClimaVue40&52G2.json · record 1 · spec 28 · dòng 47
- **Relative Humidity Measurement Range**: 0 to 100% — data/raw/ClimaVue40&52G2.json · record 1 · spec 29 · dòng 49
- **Relative Humidity Resolution**: 0.001 — data/raw/ClimaVue40&52G2.json · record 1 · spec 30 · dòng 50
- **Relative Humidity Accuracy**: ±2.5% RH typical (varies with temperature and humidity) — data/raw/ClimaVue40&52G2.json · record 1 · spec 31 · dòng 52
- **Barometer Operating Temperature Range**: -40° to +60°C — data/raw/ClimaVue40&52G2.json · record 1 · spec 32 · dòng 54
- **Barometric Pressure Measurement Range**: 10 to 1200 hPa — data/raw/ClimaVue40&52G2.json · record 1 · spec 33 · dòng 56
- **Barometric Pressure Resolution**: 0.1 hPa — data/raw/ClimaVue40&52G2.json · record 1 · spec 34 · dòng 57
- **Barometric Pressure Accuracy**: ±0.5 hPa (over the range of -40° to +60°C)±0.1 hPa (over the range of -10° to +50°C) — data/raw/ClimaVue40&52G2.json · record 1 · spec 35 · dòng 59
- **Barometric Pressure Long-Term Drift**: < 1 hPa/year — data/raw/ClimaVue40&52G2.json · record 1 · spec 36 · dòng 61
- **Wind Speed Maximum**: 3 s gust — data/raw/ClimaVue40&52G2.json · record 1 · spec 37 · dòng 67
- **Wind Speed Measurement Range**: 0 to 60 m/s (0 to 135 mph) — data/raw/ClimaVue40&52G2.json · record 1 · spec 38 · dòng 68
- **Wind Speed Resolution**: 0.01 m/s (0.02 mph) — data/raw/ClimaVue40&52G2.json · record 1 · spec 39 · dòng 69
- **Wind Speed Accuracy or Repeatability**: 0.3 m/s (0.67 mph) or 6%, whichever is greater — data/raw/ClimaVue40&52G2.json · record 1 · spec 40 · dòng 70
- **Wind Direction Measurement Range**: 0° to 359° — data/raw/ClimaVue40&52G2.json · record 1 · spec 41 · dòng 77
- **Wind Direction Resolution**: 1° — data/raw/ClimaVue40&52G2.json · record 1 · spec 42 · dòng 78
- **Wind Direction Accuracy**: ±5° — data/raw/ClimaVue40&52G2.json · record 1 · spec 43 · dòng 80
- **Solar Radiation Measurement Range**: 0 to 1750 W m⁻² — data/raw/ClimaVue40&52G2.json · record 1 · spec 44 · dòng 82
- **Solar Radiation Resolution**: 1 W m⁻² — data/raw/ClimaVue40&52G2.json · record 1 · spec 45 · dòng 83
- **Solar Radiation Accuracy**: ±5% of measurement (typical) — data/raw/ClimaVue40&52G2.json · record 1 · spec 46 · dòng 84
- **Solar Radiation Spectral Range**: 300 to 1150 nm — data/raw/ClimaVue40&52G2.json · record 1 · spec 47 · dòng 85
- **Tilt Measurement Range**: 0° to 180° — data/raw/ClimaVue40&52G2.json · record 1 · spec 48 · dòng 88
- **Tilt Resolution**: 0.1° — data/raw/ClimaVue40&52G2.json · record 1 · spec 49 · dòng 89
- **Tilt Accuracy**: ±1° — data/raw/ClimaVue40&52G2.json · record 1 · spec 50 · dòng 91
- **Lightning Strike Count Measurement Range**: 0 to 65,535 strikes — data/raw/ClimaVue40&52G2.json · record 1 · spec 51 · dòng 94
- **Lightning Strike Count Resolution**: 1 strike — data/raw/ClimaVue40&52G2.json · record 1 · spec 52 · dòng 95
- **Lightning Strike Count Accuracy**: >25% detection at <10 km typical (variable with distance) — data/raw/ClimaVue40&52G2.json · record 1 · spec 53 · dòng 97
- **Lightning Average Distance Measurement Range**: 0 to 40 km (0 to 24.9 mi) — data/raw/ClimaVue40&52G2.json · record 1 · spec 54 · dòng 100
- **Lightning Average Distance Resolution**: 3 km (1.86 mi) — data/raw/ClimaVue40&52G2.json · record 1 · spec 55 · dòng 101
- **Lightning Average Distance Accuracy**: Variable — data/raw/ClimaVue40&52G2.json · record 1 · spec 56 · dòng 103

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## COM220-AU

Telephone Modem · CSI_COM220_AU

Nguồn catalog: https://www.campbellsci.com/products/com220

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Configuration: Set for Australia; Ships As: 43010, 16675, & 2365

**Ví dụ explanation tiếng Việt**

Khớp chính xác model COM220-AU. COM220-AU là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Operating Voltage: 12 Vdc.

**Ví dụ explanation tiếng Anh**

Exact model match: COM220-AU. COM220-AU is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Operating Voltage: 12 Vdc.

**Thông số nguồn để đối chiếu**

- **Configuration**: Set for Australia — data/raw/CSI_COM220_AU.json · record 0 · spec 0 · dòng 3
- **Ships As**: 43010, 16675, & 2365 — data/raw/CSI_COM220_AU.json · record 0 · spec 1 · dòng 4
- **Standards**: V.92, K56Flex, V.90, V.34, V.32bis, V.32, V.23, V.22bis, V.22, V.21, B212, B103 — data/raw/CSI_COM220_AU.json · record 0 · spec 2 · dòng 5
- **EU Declaration of Conformity**: www.campbellsci.com/com220 — data/raw/CSI_COM220_AU.json · record 0 · spec 3 · dòng 6
- **Operating Voltage**: 12 Vdc — data/raw/CSI_COM220_AU.json · record 0 · spec 4 · dòng 7
- **Operating Temperature**: -25° to +50°C — data/raw/CSI_COM220_AU.json · record 0 · spec 5 · dòng 8
- **Communication Rate Between Data Logger and COM220**: 9600, 38400, 57600, 115200 bps (selected by user) — data/raw/CSI_COM220_AU.json · record 0 · spec 6 · dòng 9
- **Operation**: Full-duplex over standard analog phone lines — data/raw/CSI_COM220_AU.json · record 0 · spec 7 · dòng 10
- **Dimensions**: 16.5 x 2.5 x 6.6 cm (6.5 x 1.0 x 2.6 in) — data/raw/CSI_COM220_AU.json · record 0 · spec 8 · dòng 11
- **Weight**: 0.16 kg (0.35 lb) — data/raw/CSI_COM220_AU.json · record 0 · spec 9 · dòng 12
- **FCC US**: 3A4M508BSM2-T-W — data/raw/CSI_COM220_AU.json · record 0 · spec 10 · dòng 14
- **IC**: 2377 A-SM2TW — data/raw/CSI_COM220_AU.json · record 0 · spec 11 · dòng 15
- **TBR21**: TBR21 — data/raw/CSI_COM220_AU.json · record 0 · spec 12 · dòng 16
- **Quiescent**: ~120 µA — data/raw/CSI_COM220_AU.json · record 0 · spec 13 · dòng 18
- **Active**: ~30 mA — data/raw/CSI_COM220_AU.json · record 0 · spec 14 · dòng 19

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## COM320-AU

Telephone Modem · CSI_COM320_AU

Nguồn catalog: https://www.campbellsci.com/products/com320

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported).

Cấu hình model: Configuration: Set for Australia; Ships As: 43005 / 16675 / 2365

**Ví dụ explanation tiếng Việt**

Khớp chính xác model COM320-AU. COM320-AU là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O. Thông số Operating Voltage: 12 Vdc.

**Ví dụ explanation tiếng Anh**

Exact model match: COM320-AU. COM320-AU is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O. Operating Voltage: 12 Vdc.

**Thông số nguồn để đối chiếu**

- **Configuration**: Set for Australia — data/raw/CSI_COM320_AU.json · record 0 · spec 0 · dòng 3
- **Ships As**: 43005 / 16675 / 2365 — data/raw/CSI_COM320_AU.json · record 0 · spec 1 · dòng 4
- **Transmission Distance or Area**: Worldwide — data/raw/CSI_COM320_AU.json · record 0 · spec 2 · dòng 6
- **Operation - Digital Communications**: 1200 to 115200 baud digital communications over phone lines — data/raw/CSI_COM320_AU.json · record 0 · spec 3 · dòng 7
- **Operation - Voice Response**: Touch-tone selection voice responses — data/raw/CSI_COM320_AU.json · record 0 · spec 4 · dòng 8
- **Operation - Voice Messaging**: Generated voice messaging for incoming or outgoing calling — data/raw/CSI_COM320_AU.json · record 0 · spec 5 · dòng 9
- **Operating Temperature Range**: -25° to +50°C (standard) — data/raw/CSI_COM320_AU.json · record 0 · spec 6 · dòng 10
- **Operating Voltage**: 12 Vdc — data/raw/CSI_COM320_AU.json · record 0 · spec 7 · dòng 11
- **Communication Rate**: 9600, 38400, 57600, 115200 bps (between data logger and COM320, and selected by user) — data/raw/CSI_COM320_AU.json · record 0 · spec 8 · dòng 12
- **Data Logger Interface**: CS I/O, SDC9 (not changeable) — data/raw/CSI_COM320_AU.json · record 0 · spec 9 · dòng 13
- **Standards**: V.92, K56Flex, V.90, V.34, V.32bis, V.32, V.23, V.22bis, V.22, V.21, B212, B103 — data/raw/CSI_COM320_AU.json · record 0 · spec 10 · dòng 14
- **Service Requirements**: If not available at the site, phone lines must be installed — data/raw/CSI_COM320_AU.json · record 0 · spec 11 · dòng 15
- **Dimensions**: 16.5 x 2.5 x 6.6 cm (6.5 x 1.0 x 2.6 in.) — data/raw/CSI_COM320_AU.json · record 0 · spec 12 · dòng 16
- **Weight**: 0.16 kg (0.35 lb) — data/raw/CSI_COM320_AU.json · record 0 · spec 13 · dòng 17
- **Quiescent**: ~100 µA — data/raw/CSI_COM320_AU.json · record 0 · spec 14 · dòng 19
- **Active**: ~35 mA — data/raw/CSI_COM320_AU.json · record 0 · spec 15 · dòng 20
- **IC**: 2377 A-SM2TW — data/raw/CSI_COM320_AU.json · record 0 · spec 16 · dòng 22
- **FCC US**: 3A4M508BSM2-T-W — data/raw/CSI_COM320_AU.json · record 0 · spec 17 · dòng 23
- **TBR21**: TBR21 — data/raw/CSI_COM320_AU.json · record 0 · spec 18 · dòng 24

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CPEC306-DW

Carbon Flux Measurement System · CSI_CPEC306_DW

Nguồn catalog: https://www.campbellsci.com/products/cpec306

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Configuration Option: Wired for CR6; Configuration Category: Data Logger / Wiring; Weight - Without Optional Granite Volt 116 Module: 13.72 kg (30.25 lb); Weight - With Optional Granite Volt 116 Module: 14.6 kg (32.2 lb) when configured with optional Granite Volt 116 module

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CPEC306-DW. CPEC306-DW được phân loại là Carbon Flux Measurement System. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Cấu hình CPEC306-DW: Configuration Option: Wired for CR6. Thông số Operating Temperature Range: -30° to +50°C.

**Ví dụ explanation tiếng Anh**

Exact model match: CPEC306-DW. CPEC306-DW is classified as a Carbon Flux Measurement System. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. CPEC306-DW configuration: Configuration Option: Wired for CR6. Operating Temperature Range: -30° to +50°C.

**Thông số nguồn để đối chiếu**

- **Configuration Option**: Wired for CR6 — data/raw/CSI_CPEC306_DW.json · record 0 · spec 0 · dòng 3
- **Configuration Category**: Data Logger / Wiring — data/raw/CSI_CPEC306_DW.json · record 0 · spec 1 · dòng 4
- **Operating Temperature Range**: -30° to +50°C — data/raw/CSI_CPEC306_DW.json · record 0 · spec 2 · dòng 6
- **Input Voltage Range**: 10.5 to 16.0 Vdc — data/raw/CSI_CPEC306_DW.json · record 0 · spec 3 · dòng 7
- **Power - Maximum**: 35 W (maximum, at cold startup) — data/raw/CSI_CPEC306_DW.json · record 0 · spec 4 · dòng 8
- **Power - Typical**: 12 W (typical) — data/raw/CSI_CPEC306_DW.json · record 0 · spec 5 · dòng 9
- **Dimensions**: 54 x 44.5 x 29.7 cm (21.3 x 17.5 x 11.7 in.) — data/raw/CSI_CPEC306_DW.json · record 0 · spec 6 · dòng 11
- **Weight - Without Optional Granite Volt 116 Module**: 13.72 kg (30.25 lb) — data/raw/CSI_CPEC306_DW.json · record 0 · spec 7 · dòng 12
- **Weight - With Optional Granite Volt 116 Module**: 14.6 kg (32.2 lb) when configured with optional Granite Volt 116 module — data/raw/CSI_CPEC306_DW.json · record 0 · spec 8 · dòng 13
- **Inlet Connection**: 3/8-in. Swagelok — data/raw/CSI_CPEC306_DW.json · record 0 · spec 9 · dòng 15
- **Pressure Sensor Range**: 15 to 115 kPa — data/raw/CSI_CPEC306_DW.json · record 0 · spec 10 · dòng 16
- **Pumping Speed**: 3 to 9 LPM (automatically controlled at the set point, typically 8 LPM) — data/raw/CSI_CPEC306_DW.json · record 0 · spec 11 · dòng 17

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CR1000Xe-XT-CC

Data Logger · CSI_CR1000XE_XT_CC

Nguồn catalog: https://www.campbellsci.com/products/cr1000xe

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: Auto-IP (supported), CPI (supported), CS I/O (supported), DHCP (supported), DNP3 (supported), DNS (supported), Ethernet (supported), FTP (supported), HTTP (supported), HTTPS (supported), ICMP (supported), IPv4 (supported), IPv6 (supported), Modbus (supported), MQTT (supported), NTP (supported), PakBus (supported), POP3 (supported), PPP (supported), RNDIS (supported), RS-232 (supported), RS-422 (supported), RS-485 (supported), SDI-12 (supported), SLAAC (supported), SMTP (supported), TCP (supported), Telnet (supported), TLS (supported), UDP (supported), USB (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CR1000Xe-XT-CC. CR1000Xe-XT-CC là bộ ghi dữ liệu, hỗ trợ phần ghi nhận số liệu trong nhu cầu theo dõi của bạn. Cần kiểm tra cảm biến và giao thức tương thích; bộ ghi không thay thế cảm biến đo. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CPI, CS I/O, Ethernet, HTTP. Thông số data storage slots: microSD. Thông số data storage: 4 MB SRAM + 72 MB flash (storage expansion of up to 16 GB with removable microSD flash memory card).

**Ví dụ explanation tiếng Anh**

Exact model match: CR1000Xe-XT-CC. CR1000Xe-XT-CC is a data logger for recording monitoring data. Check compatible sensors and protocols; a logger does not replace a measurement sensor. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CPI, CS I/O, Ethernet, HTTP. data storage slots: microSD. data storage: 4 MB SRAM + 72 MB flash (storage expansion of up to 16 GB with removable microSD flash memory card).

**Thông số nguồn để đối chiếu**

- **Configuration**: -55 to +85°C Campbell Calibration — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 0 · dòng 3
- **Temperature Version**: Extended — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 1 · dòng 4
- **Calibration Type**: Campbell Calibration — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 2 · dòng 5
- **Operating Temperature Range**: -55° to +85°C — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 3 · dòng 7
- **Storage Temperature Range**: -60° to +85°C — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 4 · dòng 8
- **Operating Humidity**: 0–100% RH, non-condensing environment — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 5 · dòng 9
- **Maximum Scan Rate**: 1000 Hz — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 6 · dòng 10
- **Case Material**: Anodized aluminum — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 7 · dòng 11
- **Analog Inputs**: 16 single-ended or 8 differential (individually configured). Two analog inputs can measure 4 to 20 mA or 0 to 20 mA natively — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 8 · dòng 12
- **Pulse Counters**: 10 (P1 to P2 and C1 to C8) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 9 · dòng 13
- **Voltage Excitation Terminals**: 4 (VX1 to VX4) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 10 · dòng 14
- **Maximum Source/Sink Current**: ±40 mA (voltage excitation) | 50 mA (regulated 3.3 or 5 V) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 11 · dòng 15
- **Communications Ports**: USB-C | Ethernet | RS-232 | RS-485 | CS I/O | RS-422 | CPI — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 12 · dòng 17
- **Internet Protocols**: Ethernet | PPP | RNDIS | ICMP/Ping | Auto-IP (APIPA) | IPv4 | IPv6 | UDP | TCP | TLS (v1.2) | DNS | DHCP | SLAAC | Telnet | HTTP(S) | SFTP | FTP(S) | POP3/TLS | NTP | SMTP/TLS | SNMPv3 | CS I/O IP | MQTT(S) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 13 · dòng 18
- **Communications Protocols**: CPI | PakBus | SDM | SDI-12 | Modbus | TCP | DNP3 outstation | UDP | NTCIP | NMEA 0183 | I2C | SPI | CampbellCloud HTTPS/MQTTS | and others — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 14 · dòng 19
- **Data Storage Slots**: microSD — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 15 · dòng 21
- **Switched 12 Volt**: 2 terminals, plus CS I/O pin 8 — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 16 · dòng 22
- **Digital I/O**: 8 terminals (C1 to C8) configurable for digital input and output. Includes status high/low, pulse width modulation, external interrupt, edge timing, switch closure pulse counting, high-frequency pulse counting, plus UART, RS-232, RS-485, SDM, SDI-12, I2C, and SPI serial-communications functions. Terminals are configurable in pairs for 5 V or 3.3 V logic for some functions. — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 17 · dòng 23
- **Input Limits**: ±5 V — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 18 · dòng 24
- **ADC**: 24-bit — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 19 · dòng 25
- **Analog Voltage Accuracy Note**: Accuracy specifications do not include sensor or measurement noise — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 20 · dòng 27
- **Analog Voltage Accuracy - Extended Temperature**: ±(0.08% of measurement + offset) at -55° to +85°C (extended temperature range) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 21 · dòng 28
- **Analog Voltage Accuracy - Standard Temperature**: ±(0.06% of measurement + offset) at -40° to +70°C — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 22 · dòng 29
- **Analog Voltage Accuracy - 0° to 40°C**: ±(0.04% of measurement + offset) at 0° to 40°C — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 23 · dòng 30
- **Power Requirements**: 10 to 36 Vdc input — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 24 · dòng 32
- **Real-Time Clock Accuracy**: ±3 min. per year (optional GPS connection to ±10 µs) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 25 · dòng 33
- **Idle Current Drain, Average**: < 2.0 mA (@ 12 Vdc) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 26 · dòng 34
- **Active Current Drain, Average - 20 Hz**: 57 mA (20 Hz scan @ 12 Vdc) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 27 · dòng 35
- **Active Current Drain, Average - 1 Hz @ 24 Vdc**: 1.1 mA (1 Hz scan @ 24 Vdc) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 28 · dòng 36
- **Active Current Drain, Average - 1 Hz @ 12 Vdc**: 2 mA (1 Hz scan @ 12 Vdc) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 29 · dòng 37
- **Battery-Backed SRAM for CPU Usage and Final Storage**: 4 MB — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 30 · dòng 39
- **Data Storage**: 4 MB SRAM + 72 MB flash (storage expansion of up to 16 GB with removable microSD flash memory card) — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 31 · dòng 40
- **Dimensions**: 23.8 x 10.1 x 6.2 cm (9.4 x 4.0 x 2.4 in.) | Additional clearance required for cables and wires — data/raw/CR1000Xe-XT-CC.json · record 0 · spec 32 · dòng 42

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CR310-NA

Data Logger · CSI_CR310_NA

Nguồn catalog: https://www.campbellsci.com/products/cr310

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: Auto-IP (supported), DHCP (supported), DNP3 (supported), DNS (supported), Ethernet (supported), FTP (supported), HTTP (supported), ICMP (supported), IPv4 (supported), IPv6 (supported), Modbus ASCII (supported), Modbus RTU (supported), Modbus TCP (supported), NTP (supported), PakBus (supported), POP3 (supported), PPP (supported), RJ45 (supported), RNDIS (supported), RS-232 (supported), SDI-12 (supported), SLAAC (supported), SMTP (supported), TCP (supported), Telnet (supported), TLS (supported), UDP (supported), USB (supported).

Cấu hình model: Configuration Description: No Additional Coms; Weight / Mass: 288 g (0.64 lb); Primary Specification Source: CR300-Series Specifications, Revision 05/2026; Base Model: CR310; Electrical Specification Validity: -40° to +70°C, non-condensing environment, unless otherwise specified; Recalibration Recommendation: Every three years; Analog Input Configuration: 6 single-ended (SE) or 3 differential (DIFF) terminals
Individually configurable for voltage, thermocouple, current loop, ratiometric, and period average measurements
24-bit ADC
One channel at a time is measured

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CR310-NA. CR310-NA là Data Logger; dữ liệu ghi nhận chức năng/đầu vào đo nhiệt độ. Cần phân biệt phép đo nội bộ và tín hiệu đầu vào với cảm biến đo trực tiếp môi trường; kiểm tra cảm biến, đấu dây và cấu hình tương ứng. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Ethernet, HTTP, Modbus ASCII, Modbus RTU. Cấu hình CR310-NA: Recalibration Recommendation: Every three years. Thông số data storage memory: 30 MB serial flash. Thông số operating system memory: 2 MB flash. Thông số settings per calibration per tls per system information memory: 3 MB serial flash.

**Ví dụ explanation tiếng Anh**

Exact model match: CR310-NA. CR310-NA is a Data Logger; the data records measurement functions/inputs for temperature. Distinguish internal measurements and input signals from direct environmental sensors; check sensors, wiring and configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Ethernet, HTTP, Modbus ASCII, Modbus RTU. CR310-NA configuration: Recalibration Recommendation: Every three years. data storage memory: 30 MB serial flash. operating system memory: 2 MB flash. settings per calibration per tls per system information memory: 3 MB serial flash.

**Thông số nguồn để đối chiếu**

- **Configuration Description**: No Additional Coms — data/raw/CR310-NA.json · record 0 · spec 0 · dòng 5
- **Operating Temperature Range - Product Page**: -40° to +70°C (standard) — data/raw/CR310-NA.json · record 0 · spec 1 · dòng 7
- **Maximum Scan Rate - Product Page**: 10 Hz — data/raw/CR310-NA.json · record 0 · spec 2 · dòng 8
- **Analog Inputs - Product Page**: 6 single-ended or 3 differential (individually configured) — data/raw/CR310-NA.json · record 0 · spec 3 · dòng 9
- **Communications Ports - Product Page**: USB Micro-B / RS-232 / 10/100 Ethernet RJ45 — data/raw/CR310-NA.json · record 0 · spec 4 · dòng 10
- **Dimensions - Product Page**: 16.26 x 7.62 x 5.68 cm (6.4 x 3.0 x 2.2 in.) — data/raw/CR310-NA.json · record 0 · spec 5 · dòng 11
- **Weight / Mass**: 288 g (0.64 lb) — data/raw/CR310-NA.json · record 0 · spec 6 · dòng 12
- **Primary Specification Source**: CR300-Series Specifications, Revision 05/2026 — data/raw/CR310-NA.json · record 0 · spec 7 · dòng 14
- **Base Model**: CR310 — data/raw/CR310-NA.json · record 0 · spec 8 · dòng 15
- **Electrical Specification Validity**: -40° to +70°C, non-condensing environment, unless otherwise specified — data/raw/CR310-NA.json · record 0 · spec 9 · dòng 16
- **Recalibration Recommendation**: Every three years — data/raw/CR310-NA.json · record 0 · spec 10 · dòng 17
- **Processor**: ARM Cortex M4 running at 144 MHz — data/raw/CR310-NA.json · record 0 · spec 11 · dòng 19
- **CPU Drive**: 80 MB serial flash — data/raw/CR310-NA.json · record 0 · spec 12 · dòng 20
- **Data Storage Memory**: 30 MB serial flash — data/raw/CR310-NA.json · record 0 · spec 13 · dòng 21
- **Operating System Memory**: 2 MB flash — data/raw/CR310-NA.json · record 0 · spec 14 · dòng 22
- **Settings / Calibration / TLS / System Information Memory**: 3 MB serial flash — data/raw/CR310-NA.json · record 0 · spec 15 · dòng 23
- **Background Tasks / Buffers / Variables Memory**: 756 KB RAM — data/raw/CR310-NA.json · record 0 · spec 16 · dòng 24
- **Program Execution Period**: 100 ms to 1 day — data/raw/CR310-NA.json · record 0 · spec 17 · dòng 25
- **Real-Time Clock - Backup**: Battery backed while external power is disconnected — data/raw/CR310-NA.json · record 0 · spec 18 · dòng 26
- **Real-Time Clock - Resolution**: 1 ms — data/raw/CR310-NA.json · record 0 · spec 19 · dòng 27
- **Real-Time Clock - Accuracy**: ±1 min. per month — data/raw/CR310-NA.json · record 0 · spec 20 · dòng 28
- **Wiring Panel Temperature**: Measured using a thermistor, located on the processor board — data/raw/CR310-NA.json · record 0 · spec 21 · dòng 29
- **Dimensions - CR310 (Specification Sheet)**: 16.3 x 8.4 x 5.6 cm (6.4 x 3.3 x 2.2 in.) / Additional clearance required for cables, wires and antennas — data/raw/CR310-NA.json · record 0 · spec 22 · dòng 31
- **Case Material**: Powder-coated aluminum — data/raw/CR310-NA.json · record 0 · spec 23 · dòng 32
- **Power Input Protection**: Protected against surge, over-voltage, over-current, and reverse power / IEC 61000-4 Class 4 level — data/raw/CR310-NA.json · record 0 · spec 24 · dòng 34
- **Charge Terminal (CHG+ / CHG-) - Input**: Input from power converter or solar panel — data/raw/CR310-NA.json · record 0 · spec 25 · dòng 35
- **Charge Terminal - Energy Source**: ES1 PS2 energy sources only — data/raw/CR310-NA.json · record 0 · spec 26 · dòng 36
- **Charge Terminal - Voltage**: 16 to 32 VDC — data/raw/CR310-NA.json · record 0 · spec 27 · dòng 37
- **Charge Terminal - Hold Current Limit**: 1.6 A @ 20°C — data/raw/CR310-NA.json · record 0 · spec 28 · dòng 38
- **Battery Terminal (BAT+ / BAT-) - Input**: Input from external battery, 7 Ah lead-acid typical — data/raw/CR310-NA.json · record 0 · spec 29 · dòng 39
- **Battery Terminal - Voltage**: 12 VDC only — data/raw/CR310-NA.json · record 0 · spec 30 · dòng 40
- **Battery Terminal - Hold Current Limit**: 1.6 A @ 20°C — data/raw/CR310-NA.json · record 0 · spec 31 · dòng 41
- **Internal Lithium Battery**: 3 V coin cell CR2032X for battery-backed clock — data/raw/CR310-NA.json · record 0 · spec 32 · dòng 42
- **Internal Lithium Battery Life**: 6-year life with no external power source — data/raw/CR310-NA.json · record 0 · spec 33 · dòng 43
- **Average Current Drain - Idle**: 1.5 mA @ 12 VDC BAT terminals — data/raw/CR310-NA.json · record 0 · spec 34 · dòng 44
- **Average Current Drain - Active 1 Hz**: 5 mA @ 12 VDC with one analog measurement — data/raw/CR310-NA.json · record 0 · spec 35 · dòng 45
- **Average Current Drain - CR310 Active**: 36 mA @ 12 VDC (processor always on) — data/raw/CR310-NA.json · record 0 · spec 36 · dòng 46
- **RS-232 Additional Current**: Active + 5 mA — data/raw/CR310-NA.json · record 0 · spec 37 · dòng 47
- **Ethernet Idle Additional Current**: Active + 5 mA — data/raw/CR310-NA.json · record 0 · spec 38 · dòng 48
- **Ethernet Linked Additional Current**: Active + 20 mA — data/raw/CR310-NA.json · record 0 · spec 39 · dòng 49
- **USB Power**: USB 5 VDC supports sending programs, adjusting data logger settings, and some measurements / If USB is the only power source, VX1/VX2 ranges are reduced to 150 to 2500 mV / SW12V is not operational / C1/C2 voltage output limited to 4.75 V — data/raw/CR310-NA.json · record 0 · spec 40 · dòng 50
- **System Power Out Current Limit @ -40°C**: 5.8 A — data/raw/CR310-NA.json · record 0 · spec 41 · dòng 52
- **System Power Out Current Limit @ 20°C**: 3.7 A — data/raw/CR310-NA.json · record 0 · spec 42 · dòng 53
- **System Power Out Current Limit @ 70°C**: 2.0 A — data/raw/CR310-NA.json · record 0 · spec 43 · dòng 54
- **VX Terminals**: Two independently configurable voltage terminals (VX1-VX2) / 12-bit DAC / Can provide switched, regulated 5 VDC — data/raw/CR310-NA.json · record 0 · spec 44 · dòng 55
- **VX Range**: 150 to 5000 mV — data/raw/CR310-NA.json · record 0 · spec 45 · dòng 56
- **VX Resolution**: 1.6 mV — data/raw/CR310-NA.json · record 0 · spec 46 · dòng 57
- **VX Maximum Source Current**: 50 mA total, concurrently or independently — data/raw/CR310-NA.json · record 0 · spec 47 · dòng 58
- **SW12V**: Unregulated 12 VDC power with voltage equal to BAT+ input voltage / Disabled when operating on USB power only — data/raw/CR310-NA.json · record 0 · spec 48 · dòng 59
- **SW12V Thermal Fuse Hold Current @ -40°C**: 1200 mA — data/raw/CR310-NA.json · record 0 · spec 49 · dòng 60
- **SW12V Thermal Fuse Hold Current @ 20°C**: 1100 mA — data/raw/CR310-NA.json · record 0 · spec 50 · dòng 61
- **SW12V Thermal Fuse Hold Current @ 70°C**: 830 mA — data/raw/CR310-NA.json · record 0 · spec 51 · dòng 62
- **Analog Input Configuration**: 6 single-ended (SE) or 3 differential (DIFF) terminals / Individually configurable for voltage, thermocouple, current loop, ratiometric, and period average measurements / 24-bit ADC / One channel at a time is measured — data/raw/CR310-NA.json · record 0 · spec 52 · dòng 64
- **Differential Terminals**: DIFF 1H/1L – 3H/3L — data/raw/CR310-NA.json · record 0 · spec 53 · dòng 65
- **Single-Ended Terminals**: SE1 – SE6 — data/raw/CR310-NA.json · record 0 · spec 54 · dòng 66
- **Input Resistance @ fN1 50/60 Hz**: 5 GΩ typical — data/raw/CR310-NA.json · record 0 · spec 55 · dòng 67
- **Input Resistance @ fN1 4000 Hz**: 300 MΩ typical — data/raw/CR310-NA.json · record 0 · spec 56 · dòng 68
- **Input Voltage Limits**: -100 to +2500 mV — data/raw/CR310-NA.json · record 0 · spec 57 · dòng 69
- **Sustained Input Voltage without Damage - SE1-SE2**: -6 V, +9 V — data/raw/CR310-NA.json · record 0 · spec 58 · dòng 70
- **Sustained Input Voltage without Damage - SE3-SE6**: ±17 V — data/raw/CR310-NA.json · record 0 · spec 59 · dòng 71
- **DC Common Mode Rejection - With Input Reversal**: >120 dB — data/raw/CR310-NA.json · record 0 · spec 60 · dòng 72
- **DC Common Mode Rejection - Without Input Reversal**: ≥90 dB — data/raw/CR310-NA.json · record 0 · spec 61 · dòng 73
- **Normal Mode Rejection @ 50 Hz**: >71 dB — data/raw/CR310-NA.json · record 0 · spec 62 · dòng 74
- **Normal Mode Rejection @ 60 Hz**: >74 dB — data/raw/CR310-NA.json · record 0 · spec 63 · dòng 75
- **Input Current @ 25°C - fN1 50/60 Hz**: ±0.08 nA typical — data/raw/CR310-NA.json · record 0 · spec 64 · dòng 76
- **Input Current @ 25°C - fN1 4000 Hz**: ±13 nA typical — data/raw/CR310-NA.json · record 0 · spec 65 · dòng 77
- **Filter First Notch Frequency (fN1) Range**: 50/60, 400, 4000 Hz (user specified) — data/raw/CR310-NA.json · record 0 · spec 66 · dòng 78
- **Analog Range/Resolution - 4000 Hz, -100 to +2500 mV, Diff with reversal**: 23 µV RMS | 16.8 bits — data/raw/CR310-NA.json · record 0 · spec 67 · dòng 79
- **Analog Range/Resolution - 4000 Hz, -34 to +34 mV, Diff with reversal**: 3.0 µV RMS | 14.5 bits — data/raw/CR310-NA.json · record 0 · spec 68 · dòng 80
- **Analog Range/Resolution - 4000 Hz, -100 to +2500 mV, No reversal**: 33 µV RMS | 16.3 bits — data/raw/CR310-NA.json · record 0 · spec 69 · dòng 81
- **Analog Range/Resolution - 4000 Hz, -34 to +34 mV, No reversal**: 4.2 µV RMS | 14.0 bits — data/raw/CR310-NA.json · record 0 · spec 70 · dòng 82
- **Analog Range/Resolution - 400 Hz, -100 to +2500 mV, Diff with reversal**: 3.8 µV RMS | 19.4 bits — data/raw/CR310-NA.json · record 0 · spec 71 · dòng 83
- **Analog Range/Resolution - 400 Hz, -34 to +34 mV, Diff with reversal**: 0.58 µV RMS | 16.8 bits — data/raw/CR310-NA.json · record 0 · spec 72 · dòng 84
- **Analog Range/Resolution - 400 Hz, -100 to +2500 mV, No reversal**: 5.4 µV RMS | 18.9 bits — data/raw/CR310-NA.json · record 0 · spec 73 · dòng 85
- **Analog Range/Resolution - 400 Hz, -34 to +34 mV, No reversal**: 0.82 µV RMS | 16.3 bits — data/raw/CR310-NA.json · record 0 · spec 74 · dòng 86
- **Analog Range/Resolution - 50/60 Hz, -100 to +2500 mV, Diff with reversal**: 1.6 µV RMS | 20.6 bits — data/raw/CR310-NA.json · record 0 · spec 75 · dòng 87
- **Analog Range/Resolution - 50/60 Hz, -34 to +34 mV, Diff with reversal**: 0.23 µV RMS | 18.2 bits — data/raw/CR310-NA.json · record 0 · spec 76 · dòng 88
- **Analog Range/Resolution - 50/60 Hz, -100 to +2500 mV, No reversal**: 2.3 µV RMS | 20.1 bits — data/raw/CR310-NA.json · record 0 · spec 77 · dòng 89
- **Analog Range/Resolution - 50/60 Hz, -34 to +34 mV, No reversal**: 0.33 µV RMS | 17.7 bits — data/raw/CR310-NA.json · record 0 · spec 78 · dòng 90
- **Voltage Measurement Accuracy @ 0 to 40°C**: ±(0.04% of measurement + offset) — data/raw/CR310-NA.json · record 0 · spec 79 · dòng 91
- **Voltage Measurement Accuracy @ -40 to 70°C**: ±(0.1% of measurement + offset) — data/raw/CR310-NA.json · record 0 · spec 80 · dòng 92
- **Voltage Accuracy Offset - -100 to +2500 mV**: Differential with input reversal: ±20 µV RMS / Differential without input reversal: ±40 µV RMS / Single-ended: ±60 µV RMS — data/raw/CR310-NA.json · record 0 · spec 81 · dòng 93
- **Voltage Accuracy Offset - -34 to +34 mV**: Differential with input reversal: ±6 µV RMS / Differential without input reversal: ±14 µV RMS / Single-ended: ±20 µV RMS — data/raw/CR310-NA.json · record 0 · spec 82 · dòng 94
- **Measurement Settling Time**: 10 µs to 50 ms / 500 µs default — data/raw/CR310-NA.json · record 0 · spec 83 · dòng 95
- **Multiplexed Measurement Time - 4000 Hz**: Differential with input reversal: 2.9 ms / Single-ended/differential without reversal: 1.4 ms — data/raw/CR310-NA.json · record 0 · spec 84 · dòng 96
- **Multiplexed Measurement Time - 400 Hz**: Differential with input reversal: 14.6 ms / Single-ended/differential without reversal: 7.3 ms — data/raw/CR310-NA.json · record 0 · spec 85 · dòng 97
- **Multiplexed Measurement Time - 50/60 Hz**: Differential with input reversal: 103 ms / Single-ended/differential without reversal: 51.5 ms — data/raw/CR310-NA.json · record 0 · spec 86 · dòng 98
- **Resistance Measurement Description**: Ratiometric-resistance measurements for four- and six-wire full-bridge circuits and two-, three-, and four-wire half-bridge circuits using voltage excitation — data/raw/CR310-NA.json · record 0 · spec 87 · dòng 100
- **Resistance Accuracy @ 0 to 40°C**: ±(0.05% of voltage measurement + offset) — data/raw/CR310-NA.json · record 0 · spec 88 · dòng 101
- **Resistance Accuracy @ -40 to 70°C**: ±(0.06% of voltage measurement + offset) — data/raw/CR310-NA.json · record 0 · spec 89 · dòng 102
- **Period-Averaging Terminals**: SE1-SE4 — data/raw/CR310-NA.json · record 0 · spec 90 · dòng 104
- **Period-Averaging Accuracy**: ±(0.01% of measurement + resolution) / Resolution = 0.13 µs divided by number of cycles measured — data/raw/CR310-NA.json · record 0 · spec 91 · dòng 105
- **Period-Averaging Voltage Range**: 0 to 3.3 V — data/raw/CR310-NA.json · record 0 · spec 92 · dòng 106
- **Period-Averaging Minimum Pulse Width**: 2.5 µs — data/raw/CR310-NA.json · record 0 · spec 93 · dòng 107
- **Period-Averaging Voltage Threshold**: Counts cycles on transition from <0.9 VDC to >2.1 VDC — data/raw/CR310-NA.json · record 0 · spec 94 · dòng 108
- **Current-Loop Description**: Two analog input terminals can be configured as independent, non-isolated 0-20 mA or 4-to-20 mA current-loop inputs referenced to ground / One channel at a time / 24-bit ADC — data/raw/CR310-NA.json · record 0 · spec 95 · dòng 110
- **Current-Loop Terminals**: SE1-SE2 — data/raw/CR310-NA.json · record 0 · spec 96 · dòng 111
- **Current-Loop Range**: 0 to 25 mA — data/raw/CR310-NA.json · record 0 · spec 97 · dòng 112
- **Current-Loop Accuracy @ 0 to 40°C**: ±0.14% of reading — data/raw/CR310-NA.json · record 0 · spec 98 · dòng 113
- **Current-Loop Accuracy @ -40 to 70°C**: ±0.26% of reading — data/raw/CR310-NA.json · record 0 · spec 99 · dòng 114
- **Switch-Closure Terminals**: P_SW / C1-C2 (requires external 100 kΩ resistor from terminal to VX1 or VX2) — data/raw/CR310-NA.json · record 0 · spec 100 · dòng 116
- **Switch-Closure Maximum Input Frequency**: 150 Hz — data/raw/CR310-NA.json · record 0 · spec 101 · dòng 117
- **Switch-Closure Minimum Switch Closed Time**: 3 ms — data/raw/CR310-NA.json · record 0 · spec 102 · dòng 118
- **Switch-Closure Minimum Switch Open Time**: 3 ms — data/raw/CR310-NA.json · record 0 · spec 103 · dòng 119
- **Switch-Closure Maximum Bounce Time**: 1 ms open without being counted — data/raw/CR310-NA.json · record 0 · spec 104 · dòng 120
- **High-Frequency Input Terminals**: SE1-SE4 / P_LL / P_SW / C1-C2 — data/raw/CR310-NA.json · record 0 · spec 105 · dòng 121
- **High-Frequency Maximum Input Frequency - SE1-SE4**: 35 kHz — data/raw/CR310-NA.json · record 0 · spec 106 · dòng 122
- **High-Frequency Maximum Input Frequency - P_LL**: 20 kHz — data/raw/CR310-NA.json · record 0 · spec 107 · dòng 123
- **High-Frequency Maximum Input Frequency - P_SW**: 35 kHz — data/raw/CR310-NA.json · record 0 · spec 108 · dòng 124
- **High-Frequency Maximum Input Frequency - C1-C2**: 3 kHz — data/raw/CR310-NA.json · record 0 · spec 109 · dòng 125
- **Low-Level AC Terminals**: P_LL — data/raw/CR310-NA.json · record 0 · spec 110 · dòng 126
- **Low-Level AC Maximum Input Voltage**: ±20 VDC — data/raw/CR310-NA.json · record 0 · spec 111 · dòng 127
- **Low-Level AC DC-Offset Rejection**: Internal AC coupling eliminates DC-offset voltages up to ±0.05 VDC — data/raw/CR310-NA.json · record 0 · spec 112 · dòng 128
- **Low-Level AC Input Hysteresis**: 12 mV at 1 Hz — data/raw/CR310-NA.json · record 0 · spec 113 · dòng 129
- **Low-Level AC Pulse Input Range - 20 mV RMS**: 1.0 to 20 Hz — data/raw/CR310-NA.json · record 0 · spec 114 · dòng 130
- **Low-Level AC Pulse Input Range - 200 mV RMS**: 0.5 to 200 Hz — data/raw/CR310-NA.json · record 0 · spec 115 · dòng 131
- **Low-Level AC Pulse Input Range - 2000 mV RMS**: 0.3 to 10,000 Hz — data/raw/CR310-NA.json · record 0 · spec 116 · dòng 132
- **Low-Level AC Pulse Input Range - 5000 mV RMS**: 0.3 to 20,000 Hz — data/raw/CR310-NA.json · record 0 · spec 117 · dòng 133
- **Quadrature Input Terminals**: SE1 and SE2 or C1 and C2 — data/raw/CR310-NA.json · record 0 · spec 118 · dòng 134
- **Quadrature Maximum Frequency**: 2.5 kHz — data/raw/CR310-NA.json · record 0 · spec 119 · dòng 135
- **Digital I/O Terminals**: SE1-SE4 / P_SW / C1-C2 — data/raw/CR310-NA.json · record 0 · spec 120 · dòng 137
- **Digital I/O Voltage Levels - C1/C2**: High: 5.0 V output / 3.3 V input / Low: 0 V / Current source: 10 mA at 3.5 V / Maximum input voltage: -10 V, +15 V — data/raw/CR310-NA.json · record 0 · spec 121 · dòng 138
- **Digital I/O Voltage Levels - SE1/SE2**: High: 3.3 V / Low: 0 V / Current source: 100 µA at 3.0 V / Maximum input voltage: -6 V, +9 V — data/raw/CR310-NA.json · record 0 · spec 122 · dòng 139
- **Digital I/O Voltage Levels - SE3/SE4/P_SW**: High: 3.3 V / Low: 0 V / Current source: 100 µA at 3.0 V / Maximum input voltage: ±17 V — data/raw/CR310-NA.json · record 0 · spec 123 · dòng 140
- **PWM Terminals**: SE1-SE4 — data/raw/CR310-NA.json · record 0 · spec 124 · dòng 141
- **PWM Period Maximum**: 2047 ms — data/raw/CR310-NA.json · record 0 · spec 125 · dòng 142
- **PWM Resolution - 0 to 5 ms**: 83.33 ns or 12 MHz — data/raw/CR310-NA.json · record 0 · spec 126 · dòng 143
- **PWM Resolution - 5 to 325 ms**: 5.00 µs or 200 kHz — data/raw/CR310-NA.json · record 0 · spec 127 · dòng 144
- **PWM Resolution - >325 ms**: 31.25 µs or 32 kHz — data/raw/CR310-NA.json · record 0 · spec 128 · dòng 145
- **Ethernet Port**: CR310 only / RJ45 jack / 10/100Base Mbps / Full and half duplex / Auto-MDIX / Magnetic isolation / TVS surge protection — data/raw/CR310-NA.json · record 0 · spec 129 · dòng 147
- **Internet Protocols**: Ethernet / PPP / RNDIS / ICMP/Ping / Auto-IP (APIPA) / IPv4 / IPv6 / UDP / TCP / TLS (v1.2) / DNS / DHCP / SLAAC / Telnet / HTTP(S) / FTP(S) / POP3/TLS / NTP / SMTP/TLS — data/raw/CR310-NA.json · record 0 · spec 130 · dòng 148
- **Additional Protocols**: PakBus / PakBus Encryption / SDI-12 / Modbus RTU / ASCII / TCP / DNP3 outstation / Custom user definable over serial — data/raw/CR310-NA.json · record 0 · spec 131 · dòng 149
- **USB Device**: Micro-B device for computer connectivity — data/raw/CR310-NA.json · record 0 · spec 132 · dòng 150
- **SDI-12**: C1 and C2 / Two independent SDI-12 compliant terminals / Meet SDI-12 Standard v1.4 — data/raw/CR310-NA.json · record 0 · spec 133 · dòng 151
- **Shock and Vibration**: ASTM D4169 — data/raw/CR310-NA.json · record 0 · spec 134 · dòng 153
- **Protection**: IP30 — data/raw/CR310-NA.json · record 0 · spec 135 · dòng 154
- **EMI/ESD - ESD Immunity**: IEC 61000-4-2 / ±15 kV air / ±8 kV contact discharge — data/raw/CR310-NA.json · record 0 · spec 136 · dòng 155
- **EMI/ESD - Radiated RF Immunity**: IEC 61000-4-3 / 10 V/m, 80-1000 MHz — data/raw/CR310-NA.json · record 0 · spec 137 · dòng 156
- **EMI/ESD - EFT Immunity**: IEC 61000-4-4 / 4 kV power / 4 kV I/O — data/raw/CR310-NA.json · record 0 · spec 138 · dòng 157
- **EMI/ESD - Surge Immunity**: IEC 61000-4-5 / 4 kV power / 4 kV I/O — data/raw/CR310-NA.json · record 0 · spec 139 · dòng 158
- **EMI/ESD - Conducted RF Immunity**: IEC 61000-4-6 / 10 V power / 10 V I/O — data/raw/CR310-NA.json · record 0 · spec 140 · dòng 159
- **Warranty**: Three years against defects in materials and workmanship — data/raw/CR310-NA.json · record 0 · spec 141 · dòng 160
- **Analog Input Function - Single-Ended Voltage**: SE1-SE6 — data/raw/CR310-NA.json · record 0 · spec 142 · dòng 162
- **Analog Input Function - Differential Voltage**: DIFF 1H/1L, 2H/2L, 3H/3L — data/raw/CR310-NA.json · record 0 · spec 143 · dòng 163
- **Analog Input Function - Ratiometric/Bridge**: SE1-SE6 — data/raw/CR310-NA.json · record 0 · spec 144 · dòng 164
- **Analog Input Function - Thermocouple**: SE1-SE6 — data/raw/CR310-NA.json · record 0 · spec 145 · dòng 165
- **Analog Input Function - Current Loop**: SE1-SE2 — data/raw/CR310-NA.json · record 0 · spec 146 · dòng 166
- **Pulse Function - Switch-Closure**: C1, C2, P_SW — data/raw/CR310-NA.json · record 0 · spec 147 · dòng 167
- **Pulse Function - High Frequency**: C1, C2, P_SW, P_LL, SE1-SE4 — data/raw/CR310-NA.json · record 0 · spec 148 · dòng 168
- **Pulse Function - Low-Level AC**: P_LL — data/raw/CR310-NA.json · record 0 · spec 149 · dòng 169
- **Pulse Function - Quadrature**: C1, C2, SE1, SE2 — data/raw/CR310-NA.json · record 0 · spec 150 · dòng 170
- **Pulse Function - Period Average**: SE1-SE4 — data/raw/CR310-NA.json · record 0 · spec 151 · dòng 171
- **Analog Output Function - Switched Voltage Excitation**: VX1, VX2 — data/raw/CR310-NA.json · record 0 · spec 152 · dòng 172
- **Voltage Output Function - 3.3 VDC**: SE1-SE4, VX1, VX2, P_SW — data/raw/CR310-NA.json · record 0 · spec 153 · dòng 173
- **Voltage Output Function - 5 VDC**: C1, C2, VX1, VX2 — data/raw/CR310-NA.json · record 0 · spec 154 · dòng 174
- **Voltage Output Function - BAT+**: SW12V — data/raw/CR310-NA.json · record 0 · spec 155 · dòng 175
- **Communications Terminal Function - SDI-12**: C1, C2 — data/raw/CR310-NA.json · record 0 · spec 156 · dòng 176
- **Communications Terminal Function - RS-232**: RS-232 — data/raw/CR310-NA.json · record 0 · spec 157 · dòng 177
- **Communications Terminal Function - RS-232 0-5V**: C1, C2 — data/raw/CR310-NA.json · record 0 · spec 158 · dòng 178
- **Communications Terminal Function - GPS Time Sync**: C1, C2, SE1-SE3 — data/raw/CR310-NA.json · record 0 · spec 159 · dòng 179
- **Communications Terminal Function - GPS NMEA Sentences**: C1: Rx / C2: Rx / RS-232: Rx — data/raw/CR310-NA.json · record 0 · spec 160 · dòng 180
- **Digital I/O Function - General I/O**: C1, C2, P_SW, SE1-SE4 — data/raw/CR310-NA.json · record 0 · spec 161 · dòng 181
- **Digital I/O Function - PWM Output**: SE1-SE4 — data/raw/CR310-NA.json · record 0 · spec 162 · dòng 182
- **Digital I/O Function - Interrupt**: C1, C2, SE1-SE3 — data/raw/CR310-NA.json · record 0 · spec 163 · dòng 183

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CR310-WIFI

Data Logger · CSI_CR310_WIFI

Nguồn catalog: https://www.campbellsci.com/products/cr310

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: Auto-IP (supported), DHCP (supported), DNP3 (supported), DNS (supported), Ethernet (supported), FTP (supported), HTTP (supported), ICMP (supported), IPv4 (supported), IPv6 (supported), Modbus ASCII (supported), Modbus RTU (supported), Modbus TCP (supported), NTP (supported), PakBus (supported), POP3 (supported), PPP (supported), RJ45 (supported), RNDIS (supported), RS-232 (supported), SDI-12 (supported), SLAAC (supported), SMTP (supported), TCP (supported), Telnet (supported), TLS (supported), UDP (supported), USB (supported), Wi-Fi (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CR310-WIFI. Dữ liệu sản phẩm xác nhận hỗ trợ Wi-Fi. Chưa xác nhận phù hợp với toàn bộ mục đích sử dụng được yêu cầu. CR310-WIFI là Data Logger; dữ liệu ghi nhận chức năng/đầu vào đo nhiệt độ. Cần phân biệt phép đo nội bộ và tín hiệu đầu vào với cảm biến đo trực tiếp môi trường; kiểm tra cảm biến, đấu dây và cấu hình tương ứng. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số data storage memory: 30 MB serial flash. Thông số operating system memory: 2 MB flash. Thông số settings per calibration per tls per system information memory: 3 MB serial flash.

**Ví dụ explanation tiếng Anh**

Exact model match: CR310-WIFI. Product data confirms support for Wi-Fi. This does not confirm suitability for the full requested use case. CR310-WIFI is a Data Logger; the data records measurement functions/inputs for temperature. Distinguish internal measurements and input signals from direct environmental sensors; check sensors, wiring and configuration. Installation suitability for your specific use case remains unconfirmed. data storage memory: 30 MB serial flash. operating system memory: 2 MB flash. settings per calibration per tls per system information memory: 3 MB serial flash.

**Thông số nguồn để đối chiếu**

- **Variant Code Suffix**: WIFI — data/raw/CR310-WIFI.json · record 0 · spec 0 · dòng 3
- **Communication Family**: WIFI — data/raw/CR310-WIFI.json · record 0 · spec 1 · dòng 4
- **Configuration Description**: w/Wireless Modem — data/raw/CR310-WIFI.json · record 0 · spec 2 · dòng 5
- **Operating Temperature Range - Product Page**: -40° to +70°C (standard) — data/raw/CR310-WIFI.json · record 0 · spec 3 · dòng 7
- **Maximum Scan Rate - Product Page**: 10 Hz — data/raw/CR310-WIFI.json · record 0 · spec 4 · dòng 8
- **Analog Inputs - Product Page**: 6 single-ended or 3 differential (individually configured) — data/raw/CR310-WIFI.json · record 0 · spec 5 · dòng 9
- **Communications Ports - Product Page**: USB Micro-B | RS-232 | 10/100 Ethernet RJ45 — data/raw/CR310-WIFI.json · record 0 · spec 6 · dòng 10
- **Dimensions - Product Page**: 16.26 x 7.62 x 5.68 cm (6.4 x 3.0 x 2.2 in.) — data/raw/CR310-WIFI.json · record 0 · spec 7 · dòng 11
- **Weight / Mass**: 306 g (0.68 lb) — data/raw/CR310-WIFI.json · record 0 · spec 8 · dòng 12
- **Primary Specification Source**: CR300-Series Specifications, Revision 05/2026 — data/raw/CR310-WIFI.json · record 0 · spec 9 · dòng 14
- **Base Model**: CR310 — data/raw/CR310-WIFI.json · record 0 · spec 10 · dòng 15
- **Electrical Specification Validity**: -40° to +70°C, non-condensing environment, unless otherwise specified — data/raw/CR310-WIFI.json · record 0 · spec 11 · dòng 16
- **Recalibration Recommendation**: Every three years — data/raw/CR310-WIFI.json · record 0 · spec 12 · dòng 17
- **Processor**: ARM Cortex M4 running at 144 MHz — data/raw/CR310-WIFI.json · record 0 · spec 13 · dòng 19
- **CPU Drive**: 80 MB serial flash — data/raw/CR310-WIFI.json · record 0 · spec 14 · dòng 20
- **Data Storage Memory**: 30 MB serial flash — data/raw/CR310-WIFI.json · record 0 · spec 15 · dòng 21
- **Operating System Memory**: 2 MB flash — data/raw/CR310-WIFI.json · record 0 · spec 16 · dòng 22
- **Settings / Calibration / TLS / System Information Memory**: 3 MB serial flash — data/raw/CR310-WIFI.json · record 0 · spec 17 · dòng 23
- **Background Tasks / Buffers / Variables Memory**: 756 KB RAM — data/raw/CR310-WIFI.json · record 0 · spec 18 · dòng 24
- **Program Execution Period**: 100 ms to 1 day — data/raw/CR310-WIFI.json · record 0 · spec 19 · dòng 25
- **Real-Time Clock - Backup**: Battery backed while external power is disconnected — data/raw/CR310-WIFI.json · record 0 · spec 20 · dòng 26
- **Real-Time Clock - Resolution**: 1 ms — data/raw/CR310-WIFI.json · record 0 · spec 21 · dòng 27
- **Real-Time Clock - Accuracy**: ±1 min. per month — data/raw/CR310-WIFI.json · record 0 · spec 22 · dòng 28
- **Wiring Panel Temperature**: Measured using a thermistor, located on the processor board — data/raw/CR310-WIFI.json · record 0 · spec 23 · dòng 29
- **Dimensions - CR310 (Specification Sheet)**: 16.3 x 8.4 x 5.6 cm (6.4 x 3.3 x 2.2 in.) | Additional clearance required for cables, wires and antennas — data/raw/CR310-WIFI.json · record 0 · spec 24 · dòng 31
- **Case Material**: Powder-coated aluminum — data/raw/CR310-WIFI.json · record 0 · spec 25 · dòng 32
- **Power Input Protection**: Protected against surge, over-voltage, over-current, and reverse power | IEC 61000-4 Class 4 level — data/raw/CR310-WIFI.json · record 0 · spec 26 · dòng 34
- **Charge Terminal (CHG+ / CHG-) - Input**: Input from power converter or solar panel — data/raw/CR310-WIFI.json · record 0 · spec 27 · dòng 35
- **Charge Terminal - Energy Source**: ES1 PS2 energy sources only — data/raw/CR310-WIFI.json · record 0 · spec 28 · dòng 36
- **Charge Terminal - Voltage**: 16 to 32 VDC — data/raw/CR310-WIFI.json · record 0 · spec 29 · dòng 37
- **Charge Terminal - Hold Current Limit**: 1.6 A @ 20°C — data/raw/CR310-WIFI.json · record 0 · spec 30 · dòng 38
- **Battery Terminal (BAT+ / BAT-) - Input**: Input from external battery, 7 Ah lead-acid typical — data/raw/CR310-WIFI.json · record 0 · spec 31 · dòng 39
- **Battery Terminal - Voltage**: 12 VDC only — data/raw/CR310-WIFI.json · record 0 · spec 32 · dòng 40
- **Battery Terminal - Hold Current Limit**: 1.6 A @ 20°C — data/raw/CR310-WIFI.json · record 0 · spec 33 · dòng 41
- **Internal Lithium Battery**: 3 V coin cell CR2032X for battery-backed clock — data/raw/CR310-WIFI.json · record 0 · spec 34 · dòng 42
- **Internal Lithium Battery Life**: 6-year life with no external power source — data/raw/CR310-WIFI.json · record 0 · spec 35 · dòng 43
- **Average Current Drain - Idle**: 1.5 mA @ 12 VDC BAT terminals — data/raw/CR310-WIFI.json · record 0 · spec 36 · dòng 44
- **Average Current Drain - Active 1 Hz**: 5 mA @ 12 VDC with one analog measurement — data/raw/CR310-WIFI.json · record 0 · spec 37 · dòng 45
- **Average Current Drain - CR310 Active**: 36 mA @ 12 VDC (processor always on) — data/raw/CR310-WIFI.json · record 0 · spec 38 · dòng 46
- **RS-232 Additional Current**: Active + 5 mA — data/raw/CR310-WIFI.json · record 0 · spec 39 · dòng 47
- **Ethernet Idle Additional Current**: Active + 5 mA — data/raw/CR310-WIFI.json · record 0 · spec 40 · dòng 48
- **Ethernet Linked Additional Current**: Active + 20 mA — data/raw/CR310-WIFI.json · record 0 · spec 41 · dòng 49
- **USB Power**: USB 5 VDC supports sending programs, adjusting data logger settings, and some measurements | If USB is the only power source, VX1/VX2 ranges are reduced to 150 to 2500 mV | SW12V is not operational | C1/C2 voltage output limited to 4.75 V — data/raw/CR310-WIFI.json · record 0 · spec 42 · dòng 50
- **System Power Out Current Limit @ -40°C**: 5.8 A — data/raw/CR310-WIFI.json · record 0 · spec 43 · dòng 52
- **System Power Out Current Limit @ 20°C**: 3.7 A — data/raw/CR310-WIFI.json · record 0 · spec 44 · dòng 53
- **System Power Out Current Limit @ 70°C**: 2.0 A — data/raw/CR310-WIFI.json · record 0 · spec 45 · dòng 54
- **VX Terminals**: Two independently configurable voltage terminals (VX1-VX2) | 12-bit DAC | Can provide switched, regulated 5 VDC — data/raw/CR310-WIFI.json · record 0 · spec 46 · dòng 55
- **VX Range**: 150 to 5000 mV — data/raw/CR310-WIFI.json · record 0 · spec 47 · dòng 56
- **VX Resolution**: 1.6 mV — data/raw/CR310-WIFI.json · record 0 · spec 48 · dòng 57
- **VX Maximum Source Current**: 50 mA total, concurrently or independently — data/raw/CR310-WIFI.json · record 0 · spec 49 · dòng 58
- **SW12V**: Unregulated 12 VDC power with voltage equal to BAT+ input voltage | Disabled when operating on USB power only — data/raw/CR310-WIFI.json · record 0 · spec 50 · dòng 59
- **SW12V Thermal Fuse Hold Current @ -40°C**: 1200 mA — data/raw/CR310-WIFI.json · record 0 · spec 51 · dòng 60
- **SW12V Thermal Fuse Hold Current @ 20°C**: 1100 mA — data/raw/CR310-WIFI.json · record 0 · spec 52 · dòng 61
- **SW12V Thermal Fuse Hold Current @ 70°C**: 830 mA — data/raw/CR310-WIFI.json · record 0 · spec 53 · dòng 62
- **Analog Input Configuration**: 6 single-ended (SE) or 3 differential (DIFF) terminals | Individually configurable for voltage, thermocouple, current loop, ratiometric, and period average measurements | 24-bit ADC | One channel at a time is measured — data/raw/CR310-WIFI.json · record 0 · spec 54 · dòng 64
- **Differential Terminals**: DIFF 1H/1L – 3H/3L — data/raw/CR310-WIFI.json · record 0 · spec 55 · dòng 65
- **Single-Ended Terminals**: SE1 – SE6 — data/raw/CR310-WIFI.json · record 0 · spec 56 · dòng 66
- **Input Resistance @ fN1 50/60 Hz**: 5 GΩ typical — data/raw/CR310-WIFI.json · record 0 · spec 57 · dòng 67
- **Input Resistance @ fN1 4000 Hz**: 300 MΩ typical — data/raw/CR310-WIFI.json · record 0 · spec 58 · dòng 68
- **Input Voltage Limits**: -100 to +2500 mV — data/raw/CR310-WIFI.json · record 0 · spec 59 · dòng 69
- **Sustained Input Voltage without Damage - SE1-SE2**: -6 V, +9 V — data/raw/CR310-WIFI.json · record 0 · spec 60 · dòng 70
- **Sustained Input Voltage without Damage - SE3-SE6**: ±17 V — data/raw/CR310-WIFI.json · record 0 · spec 61 · dòng 71
- **DC Common Mode Rejection - With Input Reversal**: >120 dB — data/raw/CR310-WIFI.json · record 0 · spec 62 · dòng 72
- **DC Common Mode Rejection - Without Input Reversal**: ≥90 dB — data/raw/CR310-WIFI.json · record 0 · spec 63 · dòng 73
- **Normal Mode Rejection @ 50 Hz**: >71 dB — data/raw/CR310-WIFI.json · record 0 · spec 64 · dòng 74
- **Normal Mode Rejection @ 60 Hz**: >74 dB — data/raw/CR310-WIFI.json · record 0 · spec 65 · dòng 75
- **Input Current @ 25°C - fN1 50/60 Hz**: ±0.08 nA typical — data/raw/CR310-WIFI.json · record 0 · spec 66 · dòng 76
- **Input Current @ 25°C - fN1 4000 Hz**: ±13 nA typical — data/raw/CR310-WIFI.json · record 0 · spec 67 · dòng 77
- **Filter First Notch Frequency (fN1) Range**: 50/60, 400, 4000 Hz (user specified) — data/raw/CR310-WIFI.json · record 0 · spec 68 · dòng 78
- **Analog Range/Resolution - 4000 Hz, -100 to +2500 mV, Diff with reversal**: 23 µV RMS | 16.8 bits — data/raw/CR310-WIFI.json · record 0 · spec 69 · dòng 79
- **Analog Range/Resolution - 4000 Hz, -34 to +34 mV, Diff with reversal**: 3.0 µV RMS | 14.5 bits — data/raw/CR310-WIFI.json · record 0 · spec 70 · dòng 80
- **Analog Range/Resolution - 4000 Hz, -100 to +2500 mV, No reversal**: 33 µV RMS | 16.3 bits — data/raw/CR310-WIFI.json · record 0 · spec 71 · dòng 81
- **Analog Range/Resolution - 4000 Hz, -34 to +34 mV, No reversal**: 4.2 µV RMS | 14.0 bits — data/raw/CR310-WIFI.json · record 0 · spec 72 · dòng 82
- **Analog Range/Resolution - 400 Hz, -100 to +2500 mV, Diff with reversal**: 3.8 µV RMS | 19.4 bits — data/raw/CR310-WIFI.json · record 0 · spec 73 · dòng 83
- **Analog Range/Resolution - 400 Hz, -34 to +34 mV, Diff with reversal**: 0.58 µV RMS | 16.8 bits — data/raw/CR310-WIFI.json · record 0 · spec 74 · dòng 84
- **Analog Range/Resolution - 400 Hz, -100 to +2500 mV, No reversal**: 5.4 µV RMS | 18.9 bits — data/raw/CR310-WIFI.json · record 0 · spec 75 · dòng 85
- **Analog Range/Resolution - 400 Hz, -34 to +34 mV, No reversal**: 0.82 µV RMS | 16.3 bits — data/raw/CR310-WIFI.json · record 0 · spec 76 · dòng 86
- **Analog Range/Resolution - 50/60 Hz, -100 to +2500 mV, Diff with reversal**: 1.6 µV RMS | 20.6 bits — data/raw/CR310-WIFI.json · record 0 · spec 77 · dòng 87
- **Analog Range/Resolution - 50/60 Hz, -34 to +34 mV, Diff with reversal**: 0.23 µV RMS | 18.2 bits — data/raw/CR310-WIFI.json · record 0 · spec 78 · dòng 88
- **Analog Range/Resolution - 50/60 Hz, -100 to +2500 mV, No reversal**: 2.3 µV RMS | 20.1 bits — data/raw/CR310-WIFI.json · record 0 · spec 79 · dòng 89
- **Analog Range/Resolution - 50/60 Hz, -34 to +34 mV, No reversal**: 0.33 µV RMS | 17.7 bits — data/raw/CR310-WIFI.json · record 0 · spec 80 · dòng 90
- **Voltage Measurement Accuracy @ 0 to 40°C**: ±(0.04% of measurement + offset) — data/raw/CR310-WIFI.json · record 0 · spec 81 · dòng 91
- **Voltage Measurement Accuracy @ -40 to 70°C**: ±(0.1% of measurement + offset) — data/raw/CR310-WIFI.json · record 0 · spec 82 · dòng 92
- **Voltage Accuracy Offset - -100 to +2500 mV**: Differential with input reversal: ±20 µV RMS | Differential without input reversal: ±40 µV RMS | Single-ended: ±60 µV RMS — data/raw/CR310-WIFI.json · record 0 · spec 83 · dòng 93
- **Voltage Accuracy Offset - -34 to +34 mV**: Differential with input reversal: ±6 µV RMS | Differential without input reversal: ±14 µV RMS | Single-ended: ±20 µV RMS — data/raw/CR310-WIFI.json · record 0 · spec 84 · dòng 94
- **Measurement Settling Time**: 10 µs to 50 ms | 500 µs default — data/raw/CR310-WIFI.json · record 0 · spec 85 · dòng 95
- **Multiplexed Measurement Time - 4000 Hz**: Differential with input reversal: 2.9 ms | Single-ended/differential without reversal: 1.4 ms — data/raw/CR310-WIFI.json · record 0 · spec 86 · dòng 96
- **Multiplexed Measurement Time - 400 Hz**: Differential with input reversal: 14.6 ms | Single-ended/differential without reversal: 7.3 ms — data/raw/CR310-WIFI.json · record 0 · spec 87 · dòng 97
- **Multiplexed Measurement Time - 50/60 Hz**: Differential with input reversal: 103 ms | Single-ended/differential without reversal: 51.5 ms — data/raw/CR310-WIFI.json · record 0 · spec 88 · dòng 98
- **Resistance Measurement Description**: Ratiometric-resistance measurements for four- and six-wire full-bridge circuits and two-, three-, and four-wire half-bridge circuits using voltage excitation — data/raw/CR310-WIFI.json · record 0 · spec 89 · dòng 100
- **Resistance Accuracy @ 0 to 40°C**: ±(0.05% of voltage measurement + offset) — data/raw/CR310-WIFI.json · record 0 · spec 90 · dòng 101
- **Resistance Accuracy @ -40 to 70°C**: ±(0.06% of voltage measurement + offset) — data/raw/CR310-WIFI.json · record 0 · spec 91 · dòng 102
- **Period-Averaging Terminals**: SE1-SE4 — data/raw/CR310-WIFI.json · record 0 · spec 92 · dòng 104
- **Period-Averaging Accuracy**: ±(0.01% of measurement + resolution) | Resolution = 0.13 µs divided by number of cycles measured — data/raw/CR310-WIFI.json · record 0 · spec 93 · dòng 105
- **Period-Averaging Voltage Range**: 0 to 3.3 V — data/raw/CR310-WIFI.json · record 0 · spec 94 · dòng 106
- **Period-Averaging Minimum Pulse Width**: 2.5 µs — data/raw/CR310-WIFI.json · record 0 · spec 95 · dòng 107
- **Period-Averaging Voltage Threshold**: Counts cycles on transition from <0.9 VDC to >2.1 VDC — data/raw/CR310-WIFI.json · record 0 · spec 96 · dòng 108
- **Current-Loop Description**: Two analog input terminals can be configured as independent, non-isolated 0-20 mA or 4-to-20 mA current-loop inputs referenced to ground | One channel at a time | 24-bit ADC — data/raw/CR310-WIFI.json · record 0 · spec 97 · dòng 110
- **Current-Loop Terminals**: SE1-SE2 — data/raw/CR310-WIFI.json · record 0 · spec 98 · dòng 111
- **Current-Loop Range**: 0 to 25 mA — data/raw/CR310-WIFI.json · record 0 · spec 99 · dòng 112
- **Current-Loop Accuracy @ 0 to 40°C**: ±0.14% of reading — data/raw/CR310-WIFI.json · record 0 · spec 100 · dòng 113
- **Current-Loop Accuracy @ -40 to 70°C**: ±0.26% of reading — data/raw/CR310-WIFI.json · record 0 · spec 101 · dòng 114
- **Switch-Closure Terminals**: P_SW | C1-C2 (requires external 100 kΩ resistor from terminal to VX1 or VX2) — data/raw/CR310-WIFI.json · record 0 · spec 102 · dòng 116
- **Switch-Closure Maximum Input Frequency**: 150 Hz — data/raw/CR310-WIFI.json · record 0 · spec 103 · dòng 117
- **Switch-Closure Minimum Switch Closed Time**: 3 ms — data/raw/CR310-WIFI.json · record 0 · spec 104 · dòng 118
- **Switch-Closure Minimum Switch Open Time**: 3 ms — data/raw/CR310-WIFI.json · record 0 · spec 105 · dòng 119
- **Switch-Closure Maximum Bounce Time**: 1 ms open without being counted — data/raw/CR310-WIFI.json · record 0 · spec 106 · dòng 120
- **High-Frequency Input Terminals**: SE1-SE4 | P_LL | P_SW | C1-C2 — data/raw/CR310-WIFI.json · record 0 · spec 107 · dòng 121
- **High-Frequency Maximum Input Frequency - SE1-SE4**: 35 kHz — data/raw/CR310-WIFI.json · record 0 · spec 108 · dòng 122
- **High-Frequency Maximum Input Frequency - P_LL**: 20 kHz — data/raw/CR310-WIFI.json · record 0 · spec 109 · dòng 123
- **High-Frequency Maximum Input Frequency - P_SW**: 35 kHz — data/raw/CR310-WIFI.json · record 0 · spec 110 · dòng 124
- **High-Frequency Maximum Input Frequency - C1-C2**: 3 kHz — data/raw/CR310-WIFI.json · record 0 · spec 111 · dòng 125
- **Low-Level AC Terminals**: P_LL — data/raw/CR310-WIFI.json · record 0 · spec 112 · dòng 126
- **Low-Level AC Maximum Input Voltage**: ±20 VDC — data/raw/CR310-WIFI.json · record 0 · spec 113 · dòng 127
- **Low-Level AC DC-Offset Rejection**: Internal AC coupling eliminates DC-offset voltages up to ±0.05 VDC — data/raw/CR310-WIFI.json · record 0 · spec 114 · dòng 128
- **Low-Level AC Input Hysteresis**: 12 mV at 1 Hz — data/raw/CR310-WIFI.json · record 0 · spec 115 · dòng 129
- **Low-Level AC Pulse Input Range - 20 mV RMS**: 1.0 to 20 Hz — data/raw/CR310-WIFI.json · record 0 · spec 116 · dòng 130
- **Low-Level AC Pulse Input Range - 200 mV RMS**: 0.5 to 200 Hz — data/raw/CR310-WIFI.json · record 0 · spec 117 · dòng 131
- **Low-Level AC Pulse Input Range - 2000 mV RMS**: 0.3 to 10,000 Hz — data/raw/CR310-WIFI.json · record 0 · spec 118 · dòng 132
- **Low-Level AC Pulse Input Range - 5000 mV RMS**: 0.3 to 20,000 Hz — data/raw/CR310-WIFI.json · record 0 · spec 119 · dòng 133
- **Quadrature Input Terminals**: SE1 and SE2 or C1 and C2 — data/raw/CR310-WIFI.json · record 0 · spec 120 · dòng 134
- **Quadrature Maximum Frequency**: 2.5 kHz — data/raw/CR310-WIFI.json · record 0 · spec 121 · dòng 135
- **Digital I/O Terminals**: SE1-SE4 | P_SW | C1-C2 — data/raw/CR310-WIFI.json · record 0 · spec 122 · dòng 137
- **Digital I/O Voltage Levels - C1/C2**: High: 5.0 V output / 3.3 V input | Low: 0 V | Current source: 10 mA at 3.5 V | Maximum input voltage: -10 V, +15 V — data/raw/CR310-WIFI.json · record 0 · spec 123 · dòng 138
- **Digital I/O Voltage Levels - SE1/SE2**: High: 3.3 V | Low: 0 V | Current source: 100 µA at 3.0 V | Maximum input voltage: -6 V, +9 V — data/raw/CR310-WIFI.json · record 0 · spec 124 · dòng 139
- **Digital I/O Voltage Levels - SE3/SE4/P_SW**: High: 3.3 V | Low: 0 V | Current source: 100 µA at 3.0 V | Maximum input voltage: ±17 V — data/raw/CR310-WIFI.json · record 0 · spec 125 · dòng 140
- **PWM Terminals**: SE1-SE4 — data/raw/CR310-WIFI.json · record 0 · spec 126 · dòng 141
- **PWM Period Maximum**: 2047 ms — data/raw/CR310-WIFI.json · record 0 · spec 127 · dòng 142
- **PWM Resolution - 0 to 5 ms**: 83.33 ns or 12 MHz — data/raw/CR310-WIFI.json · record 0 · spec 128 · dòng 143
- **PWM Resolution - 5 to 325 ms**: 5.00 µs or 200 kHz — data/raw/CR310-WIFI.json · record 0 · spec 129 · dòng 144
- **PWM Resolution - >325 ms**: 31.25 µs or 32 kHz — data/raw/CR310-WIFI.json · record 0 · spec 130 · dòng 145
- **Ethernet Port**: CR310 only | RJ45 jack | 10/100Base Mbps | Full and half duplex | Auto-MDIX | Magnetic isolation | TVS surge protection — data/raw/CR310-WIFI.json · record 0 · spec 131 · dòng 147
- **Internet Protocols**: Ethernet | PPP | RNDIS | ICMP/Ping | Auto-IP (APIPA) | IPv4 | IPv6 | UDP | TCP | TLS (v1.2) | DNS | DHCP | SLAAC | Telnet | HTTP(S) | FTP(S) | POP3/TLS | NTP | SMTP/TLS — data/raw/CR310-WIFI.json · record 0 · spec 132 · dòng 148
- **Additional Protocols**: PakBus | PakBus Encryption | SDI-12 | Modbus RTU / ASCII / TCP | DNP3 outstation | Custom user definable over serial — data/raw/CR310-WIFI.json · record 0 · spec 133 · dòng 149
- **USB Device**: Micro-B device for computer connectivity — data/raw/CR310-WIFI.json · record 0 · spec 134 · dòng 150
- **SDI-12**: C1 and C2 | Two independent SDI-12 compliant terminals | Meet SDI-12 Standard v1.4 — data/raw/CR310-WIFI.json · record 0 · spec 135 · dòng 151
- **Shock and Vibration**: ASTM D4169 — data/raw/CR310-WIFI.json · record 0 · spec 136 · dòng 153
- **Protection**: IP30 — data/raw/CR310-WIFI.json · record 0 · spec 137 · dòng 154
- **EMI/ESD - ESD Immunity**: IEC 61000-4-2 | ±15 kV air | ±8 kV contact discharge — data/raw/CR310-WIFI.json · record 0 · spec 138 · dòng 155
- **EMI/ESD - Radiated RF Immunity**: IEC 61000-4-3 | 10 V/m, 80-1000 MHz — data/raw/CR310-WIFI.json · record 0 · spec 139 · dòng 156
- **EMI/ESD - EFT Immunity**: IEC 61000-4-4 | 4 kV power | 4 kV I/O — data/raw/CR310-WIFI.json · record 0 · spec 140 · dòng 157
- **EMI/ESD - Surge Immunity**: IEC 61000-4-5 | 4 kV power | 4 kV I/O — data/raw/CR310-WIFI.json · record 0 · spec 141 · dòng 158
- **EMI/ESD - Conducted RF Immunity**: IEC 61000-4-6 | 10 V power | 10 V I/O — data/raw/CR310-WIFI.json · record 0 · spec 142 · dòng 159
- **Warranty**: Three years against defects in materials and workmanship — data/raw/CR310-WIFI.json · record 0 · spec 143 · dòng 160
- **Analog Input Function - Single-Ended Voltage**: SE1-SE6 — data/raw/CR310-WIFI.json · record 0 · spec 144 · dòng 162
- **Analog Input Function - Differential Voltage**: DIFF 1H/1L, 2H/2L, 3H/3L — data/raw/CR310-WIFI.json · record 0 · spec 145 · dòng 163
- **Analog Input Function - Ratiometric/Bridge**: SE1-SE6 — data/raw/CR310-WIFI.json · record 0 · spec 146 · dòng 164
- **Analog Input Function - Thermocouple**: SE1-SE6 — data/raw/CR310-WIFI.json · record 0 · spec 147 · dòng 165
- **Analog Input Function - Current Loop**: SE1-SE2 — data/raw/CR310-WIFI.json · record 0 · spec 148 · dòng 166
- **Pulse Function - Switch-Closure**: C1, C2, P_SW — data/raw/CR310-WIFI.json · record 0 · spec 149 · dòng 167
- **Pulse Function - High Frequency**: C1, C2, P_SW, P_LL, SE1-SE4 — data/raw/CR310-WIFI.json · record 0 · spec 150 · dòng 168
- **Pulse Function - Low-Level AC**: P_LL — data/raw/CR310-WIFI.json · record 0 · spec 151 · dòng 169
- **Pulse Function - Quadrature**: C1, C2, SE1, SE2 — data/raw/CR310-WIFI.json · record 0 · spec 152 · dòng 170
- **Pulse Function - Period Average**: SE1-SE4 — data/raw/CR310-WIFI.json · record 0 · spec 153 · dòng 171
- **Analog Output Function - Switched Voltage Excitation**: VX1, VX2 — data/raw/CR310-WIFI.json · record 0 · spec 154 · dòng 172
- **Voltage Output Function - 3.3 VDC**: SE1-SE4, VX1, VX2, P_SW — data/raw/CR310-WIFI.json · record 0 · spec 155 · dòng 173
- **Voltage Output Function - 5 VDC**: C1, C2, VX1, VX2 — data/raw/CR310-WIFI.json · record 0 · spec 156 · dòng 174
- **Voltage Output Function - BAT+**: SW12V — data/raw/CR310-WIFI.json · record 0 · spec 157 · dòng 175
- **Communications Terminal Function - SDI-12**: C1, C2 — data/raw/CR310-WIFI.json · record 0 · spec 158 · dòng 176
- **Communications Terminal Function - RS-232**: RS-232 — data/raw/CR310-WIFI.json · record 0 · spec 159 · dòng 177
- **Communications Terminal Function - RS-232 0-5V**: C1, C2 — data/raw/CR310-WIFI.json · record 0 · spec 160 · dòng 178
- **Communications Terminal Function - GPS Time Sync**: C1, C2, SE1-SE3 — data/raw/CR310-WIFI.json · record 0 · spec 161 · dòng 179
- **Communications Terminal Function - GPS NMEA Sentences**: C1: Rx | C2: Rx | RS-232: Rx — data/raw/CR310-WIFI.json · record 0 · spec 162 · dòng 180
- **Digital I/O Function - General I/O**: C1, C2, P_SW, SE1-SE4 — data/raw/CR310-WIFI.json · record 0 · spec 163 · dòng 181
- **Digital I/O Function - PWM Output**: SE1-SE4 — data/raw/CR310-WIFI.json · record 0 · spec 164 · dòng 182
- **Digital I/O Function - Interrupt**: C1, C2, SE1-SE3 — data/raw/CR310-WIFI.json · record 0 · spec 165 · dòng 183
- **Maximum Possible Over-the-Air Data Rates**: <11 Mbps over 802.11b | <54 Mbps over 802.11g | <72 Mbps over 802.11n — data/raw/CR310-WIFI.json · record 0 · spec 166 · dòng 211
- **Operating Frequency**: 2.4 GHz, 20 MHz bandwidth — data/raw/CR310-WIFI.json · record 0 · spec 167 · dòng 212
- **Antenna Connector**: Reverse Polarity SMA (RPSMA) — data/raw/CR310-WIFI.json · record 0 · spec 168 · dòng 213
- **Antenna**: Unity gain (0 dBd), 1/2 wave whip, omnidirectional | Articulating knuckle joint for vertical or right-angle orientation — data/raw/CR310-WIFI.json · record 0 · spec 169 · dòng 214
- **Supported Technologies**: 802.11 b/g/n | WPA/WPA2-Personal | WPA/WPA2-Enterprise Security | WEP — data/raw/CR310-WIFI.json · record 0 · spec 170 · dòng 215
- **Client Mode**: WPA/WPA2-Personal and Enterprise | WEP — data/raw/CR310-WIFI.json · record 0 · spec 171 · dòng 216
- **Access Point Mode**: WPA2-Personal — data/raw/CR310-WIFI.json · record 0 · spec 172 · dòng 217
- **Receive Sensitivity**: -97 dBm — data/raw/CR310-WIFI.json · record 0 · spec 173 · dòng 218
- **Wi-Fi Current - Client Communicating**: 70 mA typical @ 12 Vdc — data/raw/CR310-WIFI.json · record 0 · spec 174 · dòng 219
- **Wi-Fi Current - Client Idle**: 7 mA typical @ 12 Vdc — data/raw/CR310-WIFI.json · record 0 · spec 175 · dòng 220
- **Wi-Fi Current - Access Point Communicating**: 70 mA @ 12 Vdc — data/raw/CR310-WIFI.json · record 0 · spec 176 · dòng 221
- **Wi-Fi Current - Access Point Idle**: 62 mA typical @ 12 Vdc — data/raw/CR310-WIFI.json · record 0 · spec 177 · dòng 222
- **Wi-Fi Current - Idle**: <0.1 mA @ 12 Vdc — data/raw/CR310-WIFI.json · record 0 · spec 178 · dòng 223
- **Wi-Fi Compliance**: United States FCC ID: XF6-RS9113SB | Industry Canada (IC): 8407A-RS9113SB — data/raw/CR310-WIFI.json · record 0 · spec 179 · dòng 224

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CR350-NA

Data Logger · CSI_CR350_NA

Nguồn catalog: https://www.campbellsci.com/products/cr350

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: Auto-IP (supported), DHCP (supported), DNP3 (supported), DNS (supported), Ethernet (supported), FTP (supported), HTTP (supported), ICMP (supported), IPv4 (supported), IPv6 (supported), Modbus ASCII (supported), Modbus RTU (supported), Modbus TCP (supported), MQTT (supported), NTP (supported), PakBus (supported), POP3 (supported), PPP (supported), RNDIS (supported), RS-232 (supported), RS-485 (supported), SDI-12 (supported), SLAAC (supported), SMTP (supported), TCP (supported), Telnet (supported), TLS (supported), UDP (supported), USB (supported).

Cấu hình model: Configuration Description: No Additional Coms; Idle Current Drain, Average: 0.5 mA (@ 12 Vdc); Active Current Drain, Average: 1 Hz scan with 1 analog measurement: < 1.5 mA @ 12 Vdc | Processor always on: 8 mA @ 12 Vdc

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CR350-NA. CR350-NA là bộ ghi dữ liệu, hỗ trợ phần ghi nhận số liệu trong nhu cầu theo dõi của bạn. Cần kiểm tra cảm biến và giao thức tương thích; bộ ghi không thay thế cảm biến đo. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Ethernet, HTTP, Modbus ASCII, Modbus RTU. Thông số data storage: 50 MB serial flash.

**Ví dụ explanation tiếng Anh**

Exact model match: CR350-NA. CR350-NA is a data logger for recording monitoring data. Check compatible sensors and protocols; a logger does not replace a measurement sensor. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Ethernet, HTTP, Modbus ASCII, Modbus RTU. data storage: 50 MB serial flash.

**Thông số nguồn để đối chiếu**

- **Configuration Description**: No Additional Coms — data/raw/CR350-NA.json · record 0 · spec 0 · dòng 5
- **Model**: CR350 — data/raw/CR350-NA.json · record 0 · spec 1 · dòng 7
- **Product Type**: Measurement and Control Datalogger — data/raw/CR350-NA.json · record 0 · spec 2 · dòng 8
- **Operating Temperature Range**: Environment: Non-condensing | Range: -40° to +70°C — data/raw/CR350-NA.json · record 0 · spec 3 · dòng 9
- **Maximum Scan Rate**: 10 Hz — data/raw/CR350-NA.json · record 0 · spec 4 · dòng 10
- **Case Material**: High-impact-resistant polycarbonate, recycle code 7 — data/raw/CR350-NA.json · record 0 · spec 5 · dòng 11
- **Analog Inputs**: 4 single-ended or 2 differential (individually configured) — data/raw/CR350-NA.json · record 0 · spec 6 · dòng 12
- **Pulse Counters**: 8 (P_SW, P_LL, C1, C2, and SE1 to SE4) — data/raw/CR350-NA.json · record 0 · spec 7 · dòng 13
- **Voltage Excitation Terminals**: 2 (VX1, VX2) — data/raw/CR350-NA.json · record 0 · spec 8 · dòng 14
- **Communications Ports**: RS-232 | RS-485 | USB Type C 2.0 — data/raw/CR350-NA.json · record 0 · spec 9 · dòng 15
- **Switched 12 Volt**: 2 terminals — data/raw/CR350-NA.json · record 0 · spec 10 · dòng 16
- **Digital I/O**: 7 terminals (C1, C2, P_SW, and SE1 to SE4) configurable for digital input and output | Includes status high/low, pulse width modulation, external interrupt, and communications functions | Exception: C2 and P_SW do not do pulse-width modulation — data/raw/CR350-NA.json · record 0 · spec 11 · dòng 17
- **Analog Input Limits**: -100 to +2500 mV — data/raw/CR350-NA.json · record 0 · spec 12 · dòng 18
- **Analog Voltage Accuracy**: 0° to 40°C: ±(0.04% of measurement + offset) | -40° to +70°C: ±(0.1% of measurement + offset) | Note: Accuracy specifications do not include sensor or measurement noise — data/raw/CR350-NA.json · record 0 · spec 13 · dòng 19
- **ADC**: 24-bit — data/raw/CR350-NA.json · record 0 · spec 14 · dòng 20
- **Charge Terminal Characteristics (CHG+ and CHG-)**: Input: Power converter or solar panel, typical | Energy source: ES1 PS2 only | Hold current limit: 1.1 A @ 20°C | Voltage: 16 to 32 Vdc — data/raw/CR350-NA.json · record 0 · spec 15 · dòng 22
- **Battery Terminal Characteristics (BAT+ and BAT-)**: Hold current limit: 3.7 A @ 20°C | Input: External battery, 7 Ah lead-acid, typical | Voltage input: 12 Vdc only — data/raw/CR350-NA.json · record 0 · spec 16 · dòng 23
- **Internal Lithium Battery**: Battery: 3 V coin cell CR2032X for battery-backed clock | Life: 6 years with no external power source — data/raw/CR350-NA.json · record 0 · spec 17 · dòng 24
- **Real-Time Clock Accuracy**: ±3 min. per year — data/raw/CR350-NA.json · record 0 · spec 18 · dòng 25
- **CPU Drive/Programs**: 50 MB serial flash — data/raw/CR350-NA.json · record 0 · spec 19 · dòng 26
- **Data Storage**: 50 MB serial flash — data/raw/CR350-NA.json · record 0 · spec 20 · dòng 27
- **Idle Current Drain, Average**: 0.5 mA (@ 12 Vdc) — data/raw/CR350-NA.json · record 0 · spec 21 · dòng 28
- **Active Current Drain, Average**: 1 Hz scan with 1 analog measurement: < 1.5 mA @ 12 Vdc | Processor always on: 8 mA @ 12 Vdc — data/raw/CR350-NA.json · record 0 · spec 22 · dòng 29
- **Internet Protocols**: Ethernet | PPP | RNDIS | ICMP/Ping | Auto-IP (APIPA) | IPv4 | IPv6 | UDP | TCP | TLS (v1.2) | DNS | DHCP | SLAAC | NTP | Telnet | HTTP(S) | FTP(S) | SMTP/TLS | POP3/TLS | MQTT(S) — data/raw/CR350-NA.json · record 0 · spec 23 · dòng 31
- **Communications Protocols**: PakBus | PakBus Encryption | Modbus RTU/ASCII/TCP | DNP3 | SDI-12 | and others — data/raw/CR350-NA.json · record 0 · spec 24 · dòng 32
- **Dimensions**: 16.3 x 8.4 x 5.6 cm (6.4 x 3.3 x 2.2 in.) | Additional clearance required for cables and leads — data/raw/CR350-NA.json · record 0 · spec 25 · dòng 34
- **Weight**: 288 to 306 g (0.64 to 0.68 lb) depending on communications option selected — data/raw/CR350-NA.json · record 0 · spec 26 · dòng 35
- **Warranty**: 3 years — data/raw/CR350-NA.json · record 0 · spec 27 · dòng 36

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CR6-NA-ST-CC

Data Logger · CSI_CR6_NA_ST_CC

Nguồn catalog: https://www.campbellsci.com/products/cr6

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: 4-20 mA (supported), Auto-IP (supported), CPI (supported), CS I/O (supported), CS I/O (unsupported), DHCP (supported), DNP3 (supported), DNS (supported), Ethernet (supported), FTP (supported), HTTP (supported), ICMP (supported), IPv4 (supported), IPv6 (supported), Modbus ASCII (supported), Modbus RTU (supported), Modbus TCP (supported), MQTT (supported), NTP (supported), PakBus (supported), POP3 (supported), PPP (supported), RJ45 (supported), RNDIS (supported), RS-232 (supported), RS-422 (supported), RS-485 (supported), SDI-12 (supported), SLAAC (supported), SMTP (supported), TCP (supported), Telnet (supported), TLS (supported), UDP (supported), USB (supported), Wi-Fi (supported).

Cấu hình model: Configuration Description: No Additional Coms | Temperature: -40° to +70°C | Calibration: Campbell Calibration; Communication Option: NA; Temperature Version: Standard; Temperature Code: ST; Calibration Type: Campbell Calibration; Calibration Code: CC; Operating Temperature Range: -40° to +70°C; Electrical Specification Validity: -40° to +70°C, non-condensing environment; Weight / Mass: 0.42 kg (0.92 lb); System Power Out Current Limit @ 85°C: null; SW12 Current Limit @ 85°C: null; Voltage Excitation Accuracy @ Operating Temperature: -40° to +70°C: ±(0.1% of setting + 1.5 mV); Current Excitation Accuracy @ Operating Temperature: -40° to +70°C: ±(0.12% of setting + 2.5 µA); Analog Voltage Accuracy @ Operating Temperature: -40° to +70°C: ±(0.06% of measurement + offset); Resistance Accuracy @ Operating Temperature: -40° to +70°C: ±(0.025% of voltage measurement + offset); Antenna Connector: null; Radio Type: null; Frequency: null; Transmit Power Output: null; Channel Capacity: null; Receive Sensitivity: null; RF Data Rate: null; Maximum Nodes in Network: null; RF Additional Current - Transmit: null; RF Additional Current - Idle On: null; RF Additional Current - Idle 0.5 s Power Mode: null; RF Additional Current - Idle 1 s Power Mode: null; RF Additional Current - Idle 4 s Power Mode: null; Compliance: null; Maximum Possible Over-the-Air Data Rates: null; Operating Frequency: null; Antenna Connector: null; Antenna: null; Supported Technologies: null; Client Mode: null; Access Point Mode: null; Receive Sensitivity: null; Wi-Fi Additional Current - Client Idle: null; Wi-Fi Additional Current - Client Communicating: null; Wi-Fi Additional Current - Access Point Idle: null; Wi-Fi Additional Current - Access Point Communicating: null; Wi-Fi Additional Current - Sleep: null; Compliance: null; Warranty - Extended Optional: Additional four years | Total up to seven years

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CR6-NA-ST-CC. CR6-NA-ST-CC là Data Logger; dữ liệu ghi nhận chức năng/đầu vào đo nhiệt độ. Cần phân biệt phép đo nội bộ và tín hiệu đầu vào với cảm biến đo trực tiếp môi trường; kiểm tra cảm biến, đấu dây và cấu hình tương ứng. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CPI, CS I/O, Ethernet, HTTP. Cấu hình CR6-NA-ST-CC: Communication Option: NA. Cấu hình CR6-NA-ST-CC: Calibration Type: Campbell Calibration. Thông số memory total onboard: 128 MB flash + 4 MB battery-backed SRAM. Thông số memory data storage: 4 MB SRAM + 72 MB flash | Extended data storage automatically used for auto-allocated Data Tables not being written to a card. Thông số memory cpu drive: 30 MB flash.

**Ví dụ explanation tiếng Anh**

Exact model match: CR6-NA-ST-CC. CR6-NA-ST-CC is a Data Logger; the data records measurement functions/inputs for temperature. Distinguish internal measurements and input signals from direct environmental sensors; check sensors, wiring and configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CPI, CS I/O, Ethernet, HTTP. CR6-NA-ST-CC configuration: Communication Option: NA. CR6-NA-ST-CC configuration: Calibration Type: Campbell Calibration. memory total onboard: 128 MB flash + 4 MB battery-backed SRAM. memory data storage: 4 MB SRAM + 72 MB flash | Extended data storage automatically used for auto-allocated Data Tables not being written to a card. memory cpu drive: 30 MB flash.

**Thông số nguồn để đối chiếu**

- **Configuration Description**: No Additional Coms | Temperature: -40° to +70°C | Calibration: Campbell Calibration — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 0 · dòng 3
- **Communication Option**: NA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 1 · dòng 4
- **Temperature Version**: Standard — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 2 · dòng 5
- **Temperature Code**: ST — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 3 · dòng 6
- **Calibration Type**: Campbell Calibration — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 4 · dòng 7
- **Calibration Code**: CC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 5 · dòng 8
- **Operating Temperature Range**: -40° to +70°C — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 6 · dòng 9
- **Primary Specification Source**: CR6 Specifications, Revision 05/2026 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 7 · dòng 11
- **Electrical Specification Validity**: -40° to +70°C, non-condensing environment — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 8 · dòng 12
- **Recalibration Recommendation**: Every three years — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 9 · dòng 13
- **Processor**: Renesas RX63N (32-bit with hardware FPU, running at 100 MHz) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 10 · dòng 14
- **Memory - Total Onboard**: 128 MB flash + 4 MB battery-backed SRAM — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 11 · dòng 15
- **Memory - Data Storage**: 4 MB SRAM + 72 MB flash | Extended data storage automatically used for auto-allocated Data Tables not being written to a card — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 12 · dòng 16
- **Memory - CPU Drive**: 30 MB flash — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 13 · dòng 17
- **Memory - OS Load**: 8 MB flash — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 14 · dòng 18
- **Memory - Settings**: 1 MB flash — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 15 · dòng 19
- **Memory - Reserved**: 10 MB flash (not accessible) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 16 · dòng 20
- **Data Storage Expansion**: Removable microSD flash memory, up to 16 GB — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 17 · dòng 21
- **Legacy Memory Note**: CR6 serial numbers less than 7502: CPU Drive / Programs: 1 MB flash | USR Drive / Data: 4 MB SRAM (battery backed) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 18 · dòng 22
- **Program Execution Period**: 1 ms to 1 day — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 19 · dòng 23
- **Real-Time Clock - Backup**: Battery backed while external power is disconnected — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 20 · dòng 24
- **Real-Time Clock - Resolution**: 1 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 21 · dòng 25
- **Real-Time Clock - Accuracy**: ±3 min. per year | Optional GPS correction: ±10 µs | 5.7 ppm — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 22 · dòng 26
- **Wiring Panel Temperature**: Measured using a thermistor located on the analog board — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 23 · dòng 27
- **Dimensions**: 21.0 x 10.2 x 5.6 cm (8.3 x 4.0 x 2.2 in.) | Additional clearance required for cables, wires, and antennas — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 24 · dòng 29
- **Weight / Mass**: 0.42 kg (0.92 lb) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 25 · dòng 30
- **Case Material**: High-impact-resistant polycarbonate and UV-resistant TPE, recycle code 7 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 26 · dòng 31
- **Dust Plug Material**: UV-resistant TPE — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 27 · dòng 32
- **Power Input Protection**: Protected against surge, over-voltage, over-current, and reverse power | IEC 61000-4 Class 4 level — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 28 · dòng 34
- **CHG Terminal - Input**: Power converter or solar panel | ES1 PS2 energy sources only — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 29 · dòng 35
- **CHG Terminal - Voltage**: 16 to 32 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 30 · dòng 36
- **CHG Terminal - Input Current Hold Limit**: 1.2 A @ 20°C (at 12 VDC) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 31 · dòng 37
- **Battery Terminal - Voltage Input**: 12 VDC only — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 32 · dòng 38
- **Battery Terminal - Hold Current Limit**: 2.5 A @ 20°C — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 33 · dòng 39
- **External Batteries**: Float charge on BAT terminal | 12 VDC | Valve-regulated lead-acid (VRLA) | 2 to 24 Ah battery typical — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 34 · dòng 40
- **Vehicle Power Connection**: A second power supply or charge regulator may be required to overcome voltage drop at vehicle start-up — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 35 · dòng 41
- **USB Power**: USB 5 VDC supports sending programs, adjusting data logger settings, and some measurements | If USB is the only power source: CS I/O, 12V, and SW12 terminals are not operational — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 36 · dòng 42
- **Internal Lithium Battery**: AA, 2.4 Ah, 3.6 VDC (Tadiran TL 5903/S) for battery-backed SRAM and clock | Life: 3 years with no external power source — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 37 · dòng 43
- **Average Current Drain - Idle**: <1 mA @ 12 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 38 · dòng 44
- **Average Current Drain - Active 1 Hz Scan**: 3 mA @ 12 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 39 · dòng 45
- **Average Current Drain - Active 20 Hz Scan**: 67 mA @ 12 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 40 · dòng 46
- **Serial Additional Current**: RS-232/RS-485: Active + 25 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 41 · dòng 47
- **Ethernet Additional Current**: 1 Minute: Active + 1 mA | Idle: Active + 4 mA | Link: Active + 47 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 42 · dòng 48
- **System Power Out Current Limit @ -40°C**: 3.88 A — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 43 · dòng 50
- **System Power Out Current Limit @ 0°C**: 2.98 A — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 44 · dòng 51
- **System Power Out Current Limit @ 20°C**: 2.50 A — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 45 · dòng 52
- **System Power Out Current Limit @ 50°C**: 1.80 A — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 46 · dòng 53
- **System Power Out Current Limit @ 70°C**: 1.35 A — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 47 · dòng 54
- **System Power Out Current Limit @ 85°C**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 48 · dòng 55
- **12 V / SW12 V Output**: 12V, SW12-1, and SW12-2 provide unregulated 12 VDC power with voltage equal to the Power Input supply voltage | Disabled when operating on USB power only — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 49 · dòng 56
- **SW12 Current Limit @ -40°C**: 1600 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 50 · dòng 57
- **SW12 Current Limit @ 0°C**: 1290 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 51 · dòng 58
- **SW12 Current Limit @ 20°C**: 1100 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 52 · dòng 59
- **SW12 Current Limit @ 50°C**: 830 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 53 · dòng 60
- **SW12 Current Limit @ 70°C**: 640 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 54 · dòng 61
- **SW12 Current Limit @ 85°C**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 55 · dòng 62
- **C Terminals - Output Resistance**: 150 Ω — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 56 · dòng 63
- **C Terminals - 5 V Logic Level Drive Capacity**: 10 mA @ 3.5 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 57 · dòng 64
- **C Terminals - 3.3 V Logic Level Drive Capacity**: 10 mA @ 1.8 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 58 · dòng 65
- **U Odd Terminals - Voltage Excitation Max Current**: ±25 mA @ ±2500 mV — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 59 · dòng 66
- **U Even Terminals - Voltage Excitation Max Current**: ±25 mA @ ±2500 mV — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 60 · dòng 67
- **U Odd Terminals - Current Excitation Max Current**: ±2500 µA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 61 · dòng 68
- **U Even Terminals - Current Excitation Max Current**: ±2500 µA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 62 · dòng 69
- **U Odd Terminals - 5 V Logic Output Resistance**: 75 Ω — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 63 · dòng 70
- **U Even Terminals - 5 V Logic Output Resistance**: 150 Ω — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 64 · dòng 71
- **U Odd Terminals - 5 V Logic Max Current**: 20 mA @ 3.5 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 65 · dòng 72
- **U Even Terminals - 5 V Logic Max Current**: 10 mA @ 3.5 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 66 · dòng 73
- **U Odd Terminals - 3.3 V Logic Output Resistance**: 73 Ω — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 67 · dòng 74
- **U Even Terminals - 3.3 V Logic Output Resistance**: 145 Ω — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 68 · dòng 75
- **U Odd Terminals - 3.3 V Logic Max Current**: 20 mA @ 1.85 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 69 · dòng 76
- **U Even Terminals - 3.3 V Logic Max Current**: 10 mA @ 1.85 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 70 · dòng 77
- **CS I/O Pin 1 - 5 V Logic Max Current**: 200 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 71 · dòng 78
- **Excitation DAC**: 12-bit DAC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 72 · dòng 80
- **Voltage Excitation Terminals**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 73 · dòng 81
- **Voltage Excitation Range**: ±2500 mV — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 74 · dòng 82
- **Voltage Excitation Resolution**: 0.6 mV — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 75 · dòng 83
- **Voltage Excitation Accuracy @ 0 to 40°C**: ±(0.1% of setting + 1.2 mV) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 76 · dòng 84
- **Voltage Excitation Accuracy @ Operating Temperature**: -40° to +70°C: ±(0.1% of setting + 1.5 mV) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 77 · dòng 85
- **Voltage Excitation Maximum Source/Sink Current**: ±25 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 78 · dòng 86
- **Current Excitation Terminals**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 79 · dòng 87
- **Current Excitation Range**: ±2.5 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 80 · dòng 88
- **Current Excitation Resolution**: 0.6 µA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 81 · dòng 89
- **Current Excitation Accuracy @ 0 to 40°C**: ±(0.11% of setting + 2.0 µA) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 82 · dòng 90
- **Current Excitation Accuracy @ Operating Temperature**: -40° to +70°C: ±(0.12% of setting + 2.5 µA) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 83 · dòng 91
- **Current Excitation Compliance Voltage**: ±5 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 84 · dòng 92
- **Analog Measurement Terminals**: 12 universal (U) terminals individually configurable for voltage, thermocouple, thermistor, current loop, ratiometric, static vibrating wire, and period average measurements | 24-bit ADC | One channel at a time — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 85 · dòng 94
- **Differential Voltage Terminals**: U1/U2 to U11/U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 86 · dòng 95
- **Single-Ended Voltage Terminals**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 87 · dòng 96
- **Input Resistance**: 20 GΩ typical — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 88 · dòng 97
- **Input Voltage Limits**: ±5 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 89 · dòng 98
- **Sustained Input Voltage without Damage**: ±20 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 90 · dòng 99
- **DC Common Mode Rejection**: With input reversal: >120 dB | Without input reversal: ≥86 dB — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 91 · dòng 100
- **Normal Mode Rejection**: >70 dB @ 60 Hz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 92 · dòng 101
- **Input Current @ 25°C**: ±2 nA typical — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 93 · dòng 102
- **Filter First Notch Frequency (fN1) Range**: 5 Hz to 93 kHz (user specified) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 94 · dòng 103
- **Analog Range and Resolution - 15000 Hz | ±5000 mV | Differential with reversal**: 20.0 µV RMS | 19 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 95 · dòng 104
- **Analog Range and Resolution - 15000 Hz | ±1000 mV | Differential with reversal**: 4.0 µV RMS | 19 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 96 · dòng 105
- **Analog Range and Resolution - 15000 Hz | ±200 mV | Differential with reversal**: 1.6 µV RMS | 18 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 97 · dòng 106
- **Analog Range and Resolution - 15000 Hz | ±5000 mV | No reversal**: 30.0 µV RMS | 18 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 98 · dòng 107
- **Analog Range and Resolution - 15000 Hz | ±1000 mV | No reversal**: 5.5 µV RMS | 18 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 99 · dòng 108
- **Analog Range and Resolution - 15000 Hz | ±200 mV | No reversal**: 1.8 µV RMS | 17 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 100 · dòng 109
- **Analog Range and Resolution - 50/60 Hz | ±5000 mV | Differential with reversal**: 1.2 µV RMS | 23 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 101 · dòng 110
- **Analog Range and Resolution - 50/60 Hz | ±1000 mV | Differential with reversal**: 0.24 µV RMS | 23 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 102 · dòng 111
- **Analog Range and Resolution - 50/60 Hz | ±200 mV | Differential with reversal**: 0.10 µV RMS | 22 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 103 · dòng 112
- **Analog Range and Resolution - 50/60 Hz | ±5000 mV | No reversal**: 5.0 µV RMS | 20 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 104 · dòng 113
- **Analog Range and Resolution - 50/60 Hz | ±1000 mV | No reversal**: 1.1 µV RMS | 20 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 105 · dòng 114
- **Analog Range and Resolution - 50/60 Hz | ±200 mV | No reversal**: 0.24 µV RMS | 20 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 106 · dòng 115
- **Analog Range and Resolution - 5 Hz | ±5000 mV | Differential with reversal**: 0.60 µV RMS | 24 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 107 · dòng 116
- **Analog Range and Resolution - 5 Hz | ±1000 mV | Differential with reversal**: 0.12 µV RMS | 24 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 108 · dòng 117
- **Analog Range and Resolution - 5 Hz | ±200 mV | Differential with reversal**: 0.05 µV RMS | 23 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 109 · dòng 118
- **Analog Range and Resolution - 5 Hz | ±5000 mV | No reversal**: 4.9 µV RMS | 20 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 110 · dòng 119
- **Analog Range and Resolution - 5 Hz | ±1000 mV | No reversal**: 1.0 µV RMS | 20 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 111 · dòng 120
- **Analog Range and Resolution - 5 Hz | ±200 mV | No reversal**: 0.22 µV RMS | 20 bits — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 112 · dòng 121
- **Analog Voltage Accuracy @ 0 to 40°C**: ±(0.04% of measurement + offset) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 113 · dòng 122
- **Analog Voltage Accuracy @ Operating Temperature**: -40° to +70°C: ±(0.06% of measurement + offset) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 114 · dòng 123
- **Voltage Measurement Accuracy Offset - ±5000 mV**: Differential with input reversal: ±10 µV RMS | Single-ended or differential without input reversal: ±40 µV RMS — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 115 · dòng 124
- **Voltage Measurement Accuracy Offset - ±1000 mV**: Differential with input reversal: ±5 µV RMS | Single-ended or differential without input reversal: ±12 µV RMS — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 116 · dòng 125
- **Voltage Measurement Accuracy Offset - ±200 mV**: Differential with input reversal: ±2 µV RMS | Single-ended or differential without input reversal: ±6 µV RMS — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 117 · dòng 126
- **Measurement Settling Time**: 20 µs to 600 ms | Default: 500 µs — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 118 · dòng 127
- **Multiplexed Measurement Time - 15000 Hz**: Differential with input reversal: 2.8 ms | Single-ended/differential without reversal: 1.4 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 119 · dòng 128
- **Multiplexed Measurement Time - 60 Hz**: Differential with input reversal: 36 ms | Single-ended/differential without reversal: 18.1 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 120 · dòng 129
- **Multiplexed Measurement Time - 50 Hz**: Differential with input reversal: 42.07 ms | Single-ended/differential without reversal: 21.3 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 121 · dòng 130
- **Multiplexed Measurement Time - 5 Hz**: Differential with input reversal: 402.7 ms | Single-ended/differential without reversal: 201.4 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 122 · dòng 131
- **Resistance Measurement Description**: Ratiometric-resistance measurements for four- and six-wire full-bridge circuits and two-, three-, and four-wire half-bridge circuits using voltage excitation | Direct resistance measurements using current excitation | Excitation polarity reversal available — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 123 · dòng 133
- **Resistance Accuracy @ 0 to 40°C**: ±(0.02% of voltage measurement + offset) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 124 · dòng 134
- **Resistance Accuracy @ Operating Temperature**: -40° to +70°C: ±(0.025% of voltage measurement + offset) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 125 · dòng 135
- **Period-Averaging Terminals**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 126 · dòng 137
- **Period-Averaging Accuracy**: ±(0.01% of measurement + resolution) | Resolution: 0.13 µs divided by number of cycles measured — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 127 · dòng 138
- **Period-Averaging Range - Gain Code 0**: Voltage gain: 1 | Minimum peak-to-peak signal: 500 mV | Maximum peak-to-peak signal: 10 V | Minimum pulse width: 2.5 µs | Maximum frequency: 200 kHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 128 · dòng 139
- **Period-Averaging Range - Gain Code 1**: Voltage gain: 2.5 | Minimum peak-to-peak signal: 50 mV | Maximum peak-to-peak signal: 2 V | Minimum pulse width: 10 µs | Maximum frequency: 50 kHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 129 · dòng 140
- **Period-Averaging Range - Gain Code 2**: Voltage gain: 12.5 | Minimum peak-to-peak signal: 10 mV | Maximum peak-to-peak signal: 2 V | Minimum pulse width: 62 µs | Maximum frequency: 8 kHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 130 · dòng 141
- **Period-Averaging Range - Gain Code 3**: Voltage gain: 64 | Minimum peak-to-peak signal: 2 mV | Maximum peak-to-peak signal: 2 V | Minimum pulse width: 100 µs | Maximum frequency: 5 kHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 131 · dòng 142
- **Static Vibrating Wire Capacity**: Up to 6 measurements without thermistor measurements | Up to 3 measurements with thermistor measurements — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 132 · dòng 144
- **Static Vibrating Wire Terminals**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 133 · dòng 145
- **Static Vibrating Wire Input Resistance**: 4.75 kΩ — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 134 · dòng 146
- **Static Vibrating Wire Measurement Type**: Differential voltage — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 135 · dòng 147
- **Static Vibrating Wire Range**: ±200 mV — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 136 · dòng 148
- **Static Vibrating Wire Accuracy**: ±0.013% of reading — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 137 · dòng 149
- **Static Vibrating Wire Resolution**: 0.001 Hz RMS — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 138 · dòng 150
- **Static Vibrating Wire Measurement Speed**: <1 s (vibrating wire and thermistor combined) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 139 · dòng 151
- **Static Vibrating Wire Excitation**: Logarithmic sine-wave-frequency excitation adjustable up to ±6 V (12 V peak-to-peak) | Programmable from 100 Hz to 6.5 kHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 140 · dòng 152
- **Thermistor Capacity**: 6 U terminal pairs for direct two-wire thermistor measurement — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 141 · dòng 154
- **Thermistor Terminals**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 142 · dòng 155
- **Thermistor Input Resistance**: 5 kΩ ±0.1%, 10 ppm/°C completion resistor — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 143 · dòng 156
- **Thermistor Measurement Type**: Single-ended voltage — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 144 · dòng 157
- **Thermistor Range**: ±5000 mV — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 145 · dòng 158
- **Thermistor Resolution**: 0.001 Ω RMS — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 146 · dòng 159
- **Thermistor Accuracy**: ±0.25% of reading — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 147 · dòng 160
- **Current-Loop Availability Note**: Resistance-to-ground input for non-isolated 0-20 mA and 4-20 mA current loop measurements is available in CR6 dataloggers with serial numbers 7502 and greater — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 148 · dòng 162
- **Current-Loop Terminal**: RG — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 149 · dòng 163
- **Current-Loop Maximum Input Voltage**: ±16 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 150 · dòng 164
- **Current-Loop Resistance to Ground**: 101 Ω — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 151 · dòng 165
- **Current Measurement Shunt Resistance**: 10 Ω — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 152 · dòng 166
- **Maximum Current Measurement Range**: ±80 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 153 · dòng 167
- **Absolute Maximum Current**: ±160 mA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 154 · dòng 168
- **Current-Loop Resolution**: ≤20 nA — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 155 · dòng 169
- **Current-Loop Accuracy @ 0 to 40°C**: ±0.14% of reading — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 156 · dòng 170
- **Current-Loop Accuracy @ -40 to 70°C**: ±0.26% of reading — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 157 · dòng 171
- **Pulse Event**: Transition from logic low to logic high — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 158 · dòng 173
- **Pulse Logic Levels - 5 V Pair**: Logic low: ≤1.5 V | Logic high: ≥3.5 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 159 · dòng 174
- **Pulse Logic Levels - 3.3 V Pair**: Logic low: ≤0.8 V | Logic high: ≥2.0 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 160 · dòng 175
- **Pulse Sustained Input Voltage without Damage**: ±20 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 161 · dòng 176
- **Pulse Maximum Counts Per Scan**: 2^24 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 162 · dòng 177
- **Pulse Input Resistance**: 5 kΩ — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 163 · dòng 178
- **Pulse Accuracy**: ±(0.02% of reading + 1/scan) — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 164 · dòng 179
- **Low-Level AC Terminals**: U2 | U4 | U6 | U8 | U10 | U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 165 · dòng 180
- **Low-Level AC DC-Offset Rejection**: Internal AC coupling eliminates DC-offset voltages up to ±0.05 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 166 · dòng 181
- **Low-Level AC Input Hysteresis**: 12 mV at 1 Hz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 167 · dòng 182
- **Low-Level AC Range - 20 mV RMS**: 1.0 to 20 Hz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 168 · dòng 183
- **Low-Level AC Range - 200 mV RMS**: 0.5 to 200 Hz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 169 · dòng 184
- **Low-Level AC Range - 2000 mV RMS**: 0.3 to 10,000 Hz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 170 · dòng 185
- **Low-Level AC Range - 5000 mV RMS**: 0.3 to 20,000 Hz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 171 · dòng 186
- **Switch Closure Terminals**: C1-C4 | U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 172 · dòng 187
- **Switch Closure Resistance**: Configurable in terminal pairs with 100 kΩ pull-up or pull-down — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 173 · dòng 188
- **Switch Closure Maximum Input Frequency**: 150 Hz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 174 · dòng 189
- **Switch Closure Minimum Closed Time**: 5 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 175 · dòng 190
- **Switch Closure Minimum Open Time**: 6 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 176 · dòng 191
- **Switch Closure Maximum Bounce Time**: 1 ms open without being counted — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 177 · dòng 192
- **Switch Closure Software Debounce Time**: 3.3 ms — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 178 · dòng 193
- **High-Frequency Input Terminals**: C1-C4 | U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 179 · dòng 194
- **High-Frequency Input Resistance**: Configurable in terminal pairs with 100 kΩ pull-up or pull-down — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 180 · dòng 195
- **High-Frequency Typical Waveform**: 5 or 3.3 VDC square wave — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 181 · dòng 196
- **High-Frequency Maximum Input Frequency**: 1 MHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 182 · dòng 197
- **Digital I/O Supported Functions**: Status high/low | Pulse width modulation | External interrupt | Edge timing | Switch closure pulse counting | High-frequency pulse counting | UART | RS-232 | RS-422 | RS-485 | SDM | SDI-12 | I2C | SPI — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 183 · dòng 199
- **Digital I/O Sustained Logic Input Voltage without Damage**: ±20 VDC — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 184 · dòng 200
- **Digital I/O Logic Levels**: 5 V source: Logic low ≤1.5 V | Logic high ≥3.5 V | 3.3 V source: Logic low ≤0.8 V | Logic high ≥2.5 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 185 · dòng 201
- **Digital I/O Drive Current - C1-C4**: 5 V source: 10 mA @ 3.5 V | 3.3 V source: 10 mA @ 1.85 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 186 · dòng 202
- **Digital I/O Drive Current - U Odd**: 5 V source: 20 mA @ 3.5 V | 3.3 V source: 20 mA @ 1.85 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 187 · dòng 203
- **Digital I/O Drive Current - U Even**: 5 V source: 10 mA @ 3.5 V | 3.3 V source: 10 mA @ 1.85 V — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 188 · dòng 204
- **Edge Timing**: Terminals: C1-C4 | U1-U12 | Maximum input frequency: ≤1 kHz | Resolution: 520 ns — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 189 · dòng 205
- **Edge Counting**: Terminals: C1-C4 | U1-U12 | Maximum input frequency: ≤2.2 kHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 190 · dòng 206
- **Quadrature Input**: Terminals: C1-C4 and U1-U12 configured as digital pairs | Maximum frequency: 2.5 kHz | Resolution: 31.25 µs or 32 kHz | Minimum pulse width: 10 µs — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 191 · dòng 207
- **Pulse-Width Modulation**: Modulation voltage: Logic high | Maximum period: 128 seconds | 0 to ≤5 ms: 83.33 ns or 12 MHz | >5 to ≤300 ms: 5.33 µs or 187.62 kHz | >300 ms: 31.25 µs or 32 kHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 192 · dòng 208
- **Ethernet Port**: RJ45 jack | 10/100Base Mbps | Full and half duplex | Auto-MDIX | Magnetic isolation | TVS surge protection — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 193 · dòng 210
- **Internet Protocols**: Ethernet | PPP | RNDIS | ICMP/Ping | Auto-IP (APIPA) | IPv4 | IPv6 | UDP | TCP | TLS (v1.2) | DNS | DHCP | SLAAC | Telnet | HTTP(S) | SFTP | FTP(S) | POP3/TLS | NTP | SMTP/TLS | SNMPv3 | CS I/O IP | MQTT — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 194 · dòng 211
- **Additional Protocols**: CPI | PakBus | PakBus Encryption | SDM | SDI-12 | Modbus RTU / ASCII / TCP | DNP3 outstation | Custom user definable over serial | NTCIP | NMEA 0183 | I2C | SPI — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 195 · dòng 212
- **USB Device**: Micro-B device for computer connectivity — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 196 · dòng 213
- **CS I/O**: 9-pin D-sub connector for Campbell Scientific CS I/O peripherals — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 197 · dòng 214
- **0-5 V Serial**: U1-U12 and C1-C4 | Eight independent TX/RX pairs — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 198 · dòng 215
- **SDI-12**: C1 | C3 | U1 | U3 | U5 | U7 | U9 | U11 | Eight independent SDI-12 compliant terminals | Meets SDI-12 Standard v1.4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 199 · dòng 216
- **RS-485**: C1-C4 | Two half duplex — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 200 · dòng 217
- **RS-422**: C1-C4 | One full duplex or two half duplex — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 201 · dòng 218
- **RS-232/CPI**: Single RJ45 module port | Operates in CPI or RS-232 mode — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 202 · dòng 219
- **CPI**: One CPI bus | Up to 1 Mbps data rate | Device synchronization to 5 µs | Total cable length up to 610 m (2000 ft) | Up to 20 devices — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 203 · dòng 220
- **Antenna Connection Types**: Wi-Fi | SS 900 MHz | 2.4 GHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 204 · dòng 221
- **Wireless Communications**: Wi-Fi | VHF | UHF | Spread spectrum | ELOS — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 205 · dòng 222
- **Hardwired Communications**: Multi-drop | Short haul | RS-232 | Fiber optic — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 206 · dòng 223
- **Satellite Communications**: GOES | Argos | Inmarsat Hughes | Irridium — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 207 · dòng 224
- **Antenna Connector**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 208 · dòng 226
- **Radio Type**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 209 · dòng 227
- **Frequency**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 210 · dòng 228
- **Transmit Power Output**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 211 · dòng 229
- **Channel Capacity**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 212 · dòng 230
- **Receive Sensitivity**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 213 · dòng 231
- **RF Data Rate**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 214 · dòng 232
- **Maximum Nodes in Network**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 215 · dòng 233
- **RF Additional Current - Transmit**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 216 · dòng 234
- **RF Additional Current - Idle On**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 217 · dòng 235
- **RF Additional Current - Idle 0.5 s Power Mode**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 218 · dòng 236
- **RF Additional Current - Idle 1 s Power Mode**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 219 · dòng 237
- **RF Additional Current - Idle 4 s Power Mode**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 220 · dòng 238
- **Compliance**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 221 · dòng 239
- **Maximum Possible Over-the-Air Data Rates**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 222 · dòng 241
- **Operating Frequency**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 223 · dòng 242
- **Antenna Connector**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 224 · dòng 243
- **Antenna**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 225 · dòng 244
- **Supported Technologies**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 226 · dòng 245
- **Client Mode**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 227 · dòng 246
- **Access Point Mode**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 228 · dòng 247
- **Receive Sensitivity**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 229 · dòng 248
- **Wi-Fi Additional Current - Client Idle**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 230 · dòng 249
- **Wi-Fi Additional Current - Client Communicating**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 231 · dòng 250
- **Wi-Fi Additional Current - Access Point Idle**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 232 · dòng 251
- **Wi-Fi Additional Current - Access Point Communicating**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 233 · dòng 252
- **Wi-Fi Additional Current - Sleep**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 234 · dòng 253
- **Compliance**: null — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 235 · dòng 254
- **Shock and Vibration**: MIL-STD 810G methods 516.6 and 514.6 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 236 · dòng 256
- **Protection**: IP50 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 237 · dòng 257
- **EMI/ESD - ESD**: IEC 61000-4-2 | ±15 kV air | ±8 kV contact discharge — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 238 · dòng 258
- **EMI/ESD - Radiated RF**: IEC 61000-4-3 | 10 V/m, 80-1000 MHz — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 239 · dòng 259
- **EMI/ESD - EFT**: IEC 61000-4-4 | 4 kV power | 4 kV I/O — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 240 · dòng 260
- **EMI/ESD - Surge**: IEC 61000-4-5 | 4 kV power | 4 kV I/O — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 241 · dòng 261
- **EMI/ESD - Conducted RF**: IEC 61000-4-6 | 10 V power | 10 V I/O — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 242 · dòng 262
- **Warranty - Standard**: Three years against defects in materials and workmanship — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 243 · dòng 264
- **Warranty - Extended Optional**: Additional four years | Total up to seven years — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 244 · dòng 265
- **Analog Input - Single-Ended Voltage**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 245 · dòng 267
- **Analog Input - Differential Voltage**: U1/U2 | U3/U4 | U5/U6 | U7/U8 | U9/U10 | U11/U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 246 · dòng 268
- **Analog Input - Ratiometric/Bridge**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 247 · dòng 269
- **Analog Input - Vibrating Wire Static**: U2 | U4 | U6 | U8 | U10 | U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 248 · dòng 270
- **Analog Input - Vibrating Wire with Thermistor**: U2 | U6 | U10 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 249 · dòng 271
- **Analog Input - Thermistor**: U2 | U4 | U6 | U8 | U10 | U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 250 · dòng 272
- **Analog Input - Thermocouple**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 251 · dòng 273
- **Analog Input - Current Loop**: RG — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 252 · dòng 274
- **Analog Input - Period Average**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 253 · dòng 275
- **Pulse Counting - Switch Closure**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 254 · dòng 276
- **Pulse Counting - High Frequency**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 255 · dòng 277
- **Pulse Counting - Low-Level AC**: U2 | U4 | U6 | U8 | U10 | U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 256 · dòng 278
- **Analog Output - Switched Voltage Excitation**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 257 · dòng 279
- **Analog Output - Switched Current Excitation**: U1-U12 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 258 · dòng 280
- **Voltage Output - 3.3 VDC**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 259 · dòng 281
- **Voltage Output - 5 VDC**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 260 · dòng 282
- **Voltage Output - 12 VDC**: 12V | SW12-1 | SW12-2 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 261 · dòng 283
- **Communications Terminal - SDI-12**: U1 | U3 | U5 | U7 | U9 | U11 | C1 | C3 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 262 · dòng 284
- **Communications Terminal - GPS Time Sync**: U1: PPS | U2: Rx | C1: Tx | C2: Rx | C3: Tx | C4: Rx — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 263 · dòng 285
- **Communications Terminal - TTL 0-5 V**: U1-U12 and C1-C4 configurable as TX/RX pairs — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 264 · dòng 286
- **Communications Terminal - LVTTL 0-3.3 V**: U1-U12 and C1-C4 configurable as TX/RX pairs — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 265 · dòng 287
- **Communications Terminal - RS-232**: C1-C4 TX/RX | RS-232/CPI port — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 266 · dòng 288
- **Communications Terminal - RS-485 Half Duplex**: C1/C2: A-/B+ | C3/C4: A-/B+ — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 267 · dòng 289
- **Communications Terminal - RS-485 Full Duplex**: C1: Tx- | C2: Tx+ | C3: Rx- | C4: Rx+ — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 268 · dòng 290
- **Digital I/O - General I/O**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 269 · dòng 291
- **Digital I/O - PWM Output**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 270 · dòng 292
- **Digital I/O - Timer Input**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 271 · dòng 293
- **Digital I/O - Interrupt**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 272 · dòng 294
- **Digital I/O - Quadrature**: U1-U12 | C1-C4 — data/raw/CSI_CR6_NA_ST_CC.json · record 0 · spec 273 · dòng 295

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CRS451-WN

Water Level Recording Sensor · CSI_CRS451_WN

Nguồn catalog: https://www.campbellsci.com/products/crs451

Đại lượng có bằng chứng: Mực nước.

Giao thức được ghi nhận: HTTPS (supported), USB (supported).

Cấu hình model: Model cơ sở: CRS451; Mô tả cấu hình: w/Weighted Nose Cone; Nguồn chính: CRS451 brochure (03/19/2026); Kiểu thông khí: Unvented; Tuổi thọ pin: 5 years (when logging interval is once per hour); Vật liệu thân: 316L stainless steel; Dải đo - Độ sâu nước ngọt 0 đến 5.1 m: Pressure: 0 to 50 kPa | 0 to 7.25 psi; Dải đo - Độ sâu nước ngọt 0 đến 50.9 m: Pressure: 0 to 500 kPa | 0 to 72.5 psi; Dải đo - Độ sâu nước ngọt 0 đến 102 m: Pressure: 0 to 1000 kPa | 0 to 145 psi | crs451-crs456man.pdf | b_crs451.pdf | https://www.campbellsci.com/products/crs451

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CRS451-WN. CRS451-WN đo mực nước, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: HTTPS, USB.

**Ví dụ explanation tiếng Anh**

Exact model match: CRS451-WN. CRS451-WN measures water level, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: HTTPS, USB.

**Thông số nguồn để đối chiếu**

- **Model cơ sở**: CRS451 — data/raw/CSI_CRS451_WN.json · record 0 · spec 0 · dòng 3
- **Mô tả cấu hình**: w/Weighted Nose Cone — data/raw/CSI_CRS451_WN.json · record 0 · spec 1 · dòng 4
- **Nguồn chính**: CRS451 brochure (03/19/2026) — data/raw/CSI_CRS451_WN.json · record 0 · spec 2 · dòng 6
- **Kiểu thông khí**: Unvented — data/raw/CSI_CRS451_WN.json · record 0 · spec 3 · dòng 8
- **Thời gian đo**: < 1.0 s — data/raw/CSI_CRS451_WN.json · record 0 · spec 4 · dòng 9
- **Tùy chọn đầu ra**: micro USB — data/raw/CSI_CRS451_WN.json · record 0 · spec 5 · dòng 11
- **Bộ nhớ thu thập dữ liệu nội bộ**: 4 MB — data/raw/CSI_CRS451_WN.json · record 0 · spec 6 · dòng 12
- **Chế độ ghi/quét**: Standard | Delta | Wave | Logarithmic — data/raw/CSI_CRS451_WN.json · record 0 · spec 7 · dòng 13, 14, 15, 16
- **Độ phân giải**: 0.0035% FS — data/raw/CSI_CRS451_WN.json · record 0 · spec 8 · dòng 17
- **Dải nhiệt độ lưu trữ khô**: -10° to +80°C | Warning: Sensor could be damaged if encased in frozen ice — data/raw/CSI_CRS451_WN.json · record 0 · spec 9 · dòng 18, 19
- **Dải nhiệt độ hoạt động**: 0° to 60°C | Warning: Sensor could be damaged if encased in frozen ice — data/raw/CSI_CRS451_WN.json · record 0 · spec 10 · dòng 20, 21
- **Quá áp**: 2 x pressure range — data/raw/CSI_CRS451_WN.json · record 0 · spec 11 · dòng 22
- **Yêu cầu nguồn**: Internal user-replaceable lithium battery — data/raw/CSI_CRS451_WN.json · record 0 · spec 12 · dòng 23
- **Tuổi thọ pin**: 5 years (when logging interval is once per hour) — data/raw/CSI_CRS451_WN.json · record 0 · spec 13 · dòng 24
- **Vật liệu thân**: 316L stainless steel — data/raw/CSI_CRS451_WN.json · record 0 · spec 14 · dòng 26
- **Độ chính xác mực nước**: ±0.1% full-scale-range TEB | Includes combined errors due to nonlinearity, hysteresis, nonrepeatability, and thermal effects over the compensated temperature range, per ISA S51.1 — data/raw/CSI_CRS451_WN.json · record 0 · spec 15 · dòng 27, 28
- **Độ chính xác nhiệt độ**: ±0.2°C — data/raw/CSI_CRS451_WN.json · record 0 · spec 16 · dòng 29
- **Cấp bảo vệ**: Exceeds IP68 — data/raw/CSI_CRS451_WN.json · record 0 · spec 17 · dòng 30
- **Đường kính**: 2.22 cm (0.875 in.) — data/raw/CSI_CRS451_WN.json · record 0 · spec 18 · dòng 31
- **Chiều dài**: 22.23 cm (8.75 in.) — data/raw/CSI_CRS451_WN.json · record 0 · spec 19 · dòng 32
- **Khối lượng**: 230 g (0.51 lb) — data/raw/CSI_CRS451_WN.json · record 0 · spec 20 · dòng 33
- **Dòng tiêu thụ khi nghỉ**: < 80 µA — data/raw/CSI_CRS451_WN.json · record 0 · spec 21 · dòng 42
- **Dòng tiêu thụ khi đo/giao tiếp**: 4 mA (1 s measurement) — data/raw/CSI_CRS451_WN.json · record 0 · spec 22 · dòng 43
- **Dải đo - Độ sâu nước ngọt 0 đến 5.1 m**: Pressure: 0 to 50 kPa | 0 to 7.25 psi — data/raw/CSI_CRS451_WN.json · record 0 · spec 23 · dòng 45, 46
- **Dải đo - Độ sâu nước ngọt 0 đến 10.2 m**: Pressure: 0 to 100 kPa | 0 to 14.5 psi — data/raw/CSI_CRS451_WN.json · record 0 · spec 24 · dòng 47, 48
- **Dải đo - Độ sâu nước ngọt 0 đến 20.4 m**: Pressure: 0 to 200 kPa | 0 to 29 psi — data/raw/CSI_CRS451_WN.json · record 0 · spec 25 · dòng 49, 50
- **Dải đo - Độ sâu nước ngọt 0 đến 50.9 m**: Pressure: 0 to 500 kPa | 0 to 72.5 psi — data/raw/CSI_CRS451_WN.json · record 0 · spec 26 · dòng 51, 52
- **Dải đo - Độ sâu nước ngọt 0 đến 102 m**: Pressure: 0 to 1000 kPa | 0 to 145 psi | crs451-crs456man.pdf | b_crs451.pdf | https://www.campbellsci.com/products/crs451 — data/raw/CSI_CRS451_WN.json · record 0 · spec 27 · dòng 53, 54, 55, 56, 57

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CRVW3-NE

Vibrating Wire Data Logger · CSI_CRVW3_NE

Nguồn catalog: https://www.campbellsci.com/products/crvw3-ne

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: USB (supported).

Cấu hình model: Base Model: CRVW3-NE; Configuration Description: Vibrating-Wire Datalogger w/o Enclosure (-40 to +70°C) | NA No Additional Coms; Enclosure Configuration: Without enclosure; Ships As: 32145 | 43376; Configuration: Software configurable | No programming required; Measurement Excitation Options: 2 V (±1 V) | 5 V (±2.5 V) | 12 V (±6 V); Measurement Method: VSPECT (Spectral Analysis) | U.S. Patent No. 7,779,690 | Includes diagnostic data; Measurement Method: Half-bridge ratiometric | 24-bit ADC | Built-in completion resistor: 4.99 kΩ 0.1%; CE Approval: CE approved

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CRVW3-NE. CRVW3-NE là Vibrating Wire Data Logger; dữ liệu ghi nhận chức năng/đầu vào đo nhiệt độ. Cần phân biệt phép đo nội bộ và tín hiệu đầu vào với cảm biến đo trực tiếp môi trường; kiểm tra cảm biến, đấu dây và cấu hình tương ứng. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: USB. Thông số data storage: 16 MB serial flash | Up to 420,000 records (single channel) | Up to 160,000 records (3 channels).

**Ví dụ explanation tiếng Anh**

Exact model match: CRVW3-NE. CRVW3-NE is a Vibrating Wire Data Logger; the data records measurement functions/inputs for temperature. Distinguish internal measurements and input signals from direct environmental sensors; check sensors, wiring and configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: USB. data storage: 16 MB serial flash | Up to 420,000 records (single channel) | Up to 160,000 records (3 channels).

**Thông số nguồn để đối chiếu**

- **Base Model**: CRVW3-NE — data/raw/CSI_CRVW3_NE.json · record 0 · spec 0 · dòng 3
- **Configuration Description**: Vibrating-Wire Datalogger w/o Enclosure (-40 to +70°C) | NA No Additional Coms — data/raw/CSI_CRVW3_NE.json · record 0 · spec 1 · dòng 5
- **Enclosure Configuration**: Without enclosure — data/raw/CSI_CRVW3_NE.json · record 0 · spec 2 · dòng 6
- **Ships As**: 32145 | 43376 — data/raw/CSI_CRVW3_NE.json · record 0 · spec 3 · dòng 7, 8
- **Operating Temperature Range**: -40° to +70°C | Non-condensing environment — data/raw/CSI_CRVW3_NE.json · record 0 · spec 4 · dòng 10, 11
- **Processor**: ST ARM CORTEX-M4 (32-bit with hardware FPU, running at 144 MHz) — data/raw/CSI_CRVW3_NE.json · record 0 · spec 5 · dòng 12
- **Data Storage**: 16 MB serial flash | Up to 420,000 records (single channel) | Up to 160,000 records (3 channels) — data/raw/CSI_CRVW3_NE.json · record 0 · spec 6 · dòng 13, 14, 15
- **Real-Time Clock Accuracy**: ±3 min. per year — data/raw/CSI_CRVW3_NE.json · record 0 · spec 7 · dòng 16
- **Measurement Interval Range**: 1 s to 1 day — data/raw/CSI_CRVW3_NE.json · record 0 · spec 8 · dòng 17
- **USB Micro B**: Direct connect to PC | Supplies power for configuration and data collection | USB 2.0 full speed | 12 Mbps — data/raw/CSI_CRVW3_NE.json · record 0 · spec 9 · dòng 18, 19, 20, 21
- **Configuration**: Software configurable | No programming required — data/raw/CSI_CRVW3_NE.json · record 0 · spec 10 · dòng 22, 23
- **Compliance**: RoHS — data/raw/CSI_CRVW3_NE.json · record 0 · spec 11 · dòng 24
- **Warranty**: One year against defects in materials and workmanship — data/raw/CSI_CRVW3_NE.json · record 0 · spec 12 · dòng 25
- **Static Vibrating Wire Measurements**: Supported — data/raw/CSI_CRVW3_NE.json · record 0 · spec 13 · dòng 26
- **Mounting**: Mounting holes for easy mounting and installation in a Campbell Scientific enclosure — data/raw/CSI_CRVW3_NE.json · record 0 · spec 14 · dòng 27
- **Dimensions**: 18.4 x 12.7 x 4.5 cm | 7.25 x 5.0 x 1.75 in. — data/raw/CSI_CRVW3_NE.json · record 0 · spec 15 · dòng 28, 29
- **Weight**: 0.36 kg | 0.8 lb — data/raw/CSI_CRVW3_NE.json · record 0 · spec 16 · dòng 30, 31
- **Charge Terminal**: 16 to 28 Vdc | Source: solar panel or dc power converter | Typical solar panel applications: 10 to 20 W — data/raw/CSI_CRVW3_NE.json · record 0 · spec 17 · dòng 33, 34, 35
- **Battery Terminal**: Sealed, rechargeable, lead-acid batteries | Typical battery capacity: 7 Ah | Typical battery capacity: 12 Ah | Typical battery capacity: 24 Ah — data/raw/CSI_CRVW3_NE.json · record 0 · spec 18 · dòng 36, 37, 38, 39
- **Current Drain**: ~37.5 mA/s each time a channel is measured | 1 mA with no radio, basic operation — data/raw/CSI_CRVW3_NE.json · record 0 · spec 19 · dòng 40, 41
- **Channel Count**: 3 vibrating wire (VW) measurements | 3 thermistor/RTD (temperature) measurements — data/raw/CSI_CRVW3_NE.json · record 0 · spec 20 · dòng 43, 44
- **Measurement Speed**: 1 s per sensor | VW and temperature — data/raw/CSI_CRVW3_NE.json · record 0 · spec 21 · dòng 45, 46
- **Measurement Excitation Options**: 2 V (±1 V) | 5 V (±2.5 V) | 12 V (±6 V) — data/raw/CSI_CRVW3_NE.json · record 0 · spec 22 · dòng 48, 49, 50
- **Measurement (Frequency) Resolution**: 0.001 Hz RMS | Temperature range: -40° to +70°C — data/raw/CSI_CRVW3_NE.json · record 0 · spec 23 · dòng 51, 52
- **Time-series Basic Resolution**: 24-bit ADC — data/raw/CSI_CRVW3_NE.json · record 0 · spec 24 · dòng 53
- **Measurement Accuracy**: ±0.005% of reading | Temperature range: -40° to +70°C — data/raw/CSI_CRVW3_NE.json · record 0 · spec 25 · dòng 54, 55
- **Measurement Method**: VSPECT (Spectral Analysis) | U.S. Patent No. 7,779,690 | Includes diagnostic data — data/raw/CSI_CRVW3_NE.json · record 0 · spec 26 · dòng 56, 57, 58
- **Temperature Measurement Note**: Thermistor or RTD resistance can be scaled to Temperature (Deg C) per manufacturer specifications | Resulting temperature can be used as a correction factor for the sensor’s output — data/raw/CSI_CRVW3_NE.json · record 0 · spec 27 · dòng 60, 61
- **Measurement Method**: Half-bridge ratiometric | 24-bit ADC | Built-in completion resistor: 4.99 kΩ 0.1% — data/raw/CSI_CRVW3_NE.json · record 0 · spec 28 · dòng 62, 63, 64
- **Thermistor Precision**: 0.020 Ω RMS @ 3000 Ω | ~0.00015°C RMS for most vibrating wire thermistors — data/raw/CSI_CRVW3_NE.json · record 0 · spec 29 · dòng 65, 66
- **Accuracy**: ±0.15% of reading | Temperature range: -40° to +70°C — data/raw/CSI_CRVW3_NE.json · record 0 · spec 30 · dòng 67, 68
- **CE Approval**: CE approved — data/raw/CSI_CRVW3_NE.json · record 0 · spec 31 · dòng 82

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS106-PF

Barometric Pressure Sensor · CSI_CS106_PF

Nguồn catalog: https://www.campbellsci.com/products/cs106

Đại lượng có bằng chứng: Áp suất khí quyển.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Base Model: CS106; Configuration Description: Inch cable w/Ferrules on Wires; Cable End Configuration: Ferrules on wires

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS106-PF. CS106-PF đo áp suất khí quyển, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số accuracy: -40° to +60°C: ±1.5 hPa | +20°C: ±0.3 hPa | 0° to 40°C: ±0.6 hPa | -20° to +45°C: ±1.0 hPa | Accuracy refers to the root sum squared (RSS) of end point non-linearity, hysteresis, repeatability, and calibration uncertainty. Thông số calibration uncertainty: ±0.15 hPa.

**Ví dụ explanation tiếng Anh**

Exact model match: CS106-PF. CS106-PF measures barometric pressure, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. accuracy: -40° to +60°C: ±1.5 hPa | +20°C: ±0.3 hPa | 0° to 40°C: ±0.6 hPa | -20° to +45°C: ±1.0 hPa | Accuracy refers to the root sum squared (RSS) of end point non-linearity, hysteresis, repeatability, and calibration uncertainty. calibration uncertainty: ±0.15 hPa.

**Thông số nguồn để đối chiếu**

- **Base Model**: CS106 — data/raw/CSI_CS106_PF.json · record 0 · spec 0 · dòng 3
- **Configuration Description**: Inch cable w/Ferrules on Wires — data/raw/CSI_CS106_PF.json · record 0 · spec 1 · dòng 4
- **Cable End Configuration**: Ferrules on wires — data/raw/CSI_CS106_PF.json · record 0 · spec 2 · dòng 5
- **Pressure Range**: 500 to 1100 hPa | Note: 1 hPa = 1 mBar — data/raw/CSI_CS106_PF.json · record 0 · spec 3 · dòng 7, 8
- **Long-Term Stability**: ±0.1 hPa per year — data/raw/CSI_CS106_PF.json · record 0 · spec 4 · dòng 9
- **Settling Time**: 1 s to reach full accuracy after power-up — data/raw/CSI_CS106_PF.json · record 0 · spec 5 · dòng 10
- **Response Time**: 500 ms to reach full accuracy after a pressure step — data/raw/CSI_CS106_PF.json · record 0 · spec 6 · dòng 11
- **Output Voltage**: 0 to 2.5 Vdc — data/raw/CSI_CS106_PF.json · record 0 · spec 7 · dòng 12
- **Supply Voltage**: 10 to 30 Vdc — data/raw/CSI_CS106_PF.json · record 0 · spec 8 · dòng 13
- **Elevation**: Below sea level: ~609.6 m (2,000 ft) | Above sea level: 4,572 m (15,000 ft) — data/raw/CSI_CS106_PF.json · record 0 · spec 9 · dòng 14, 15
- **Accuracy**: -40° to +60°C: ±1.5 hPa | +20°C: ±0.3 hPa | 0° to 40°C: ±0.6 hPa | -20° to +45°C: ±1.0 hPa | Accuracy refers to the root sum squared (RSS) of end point non-linearity, hysteresis, repeatability, and calibration uncertainty — data/raw/CSI_CS106_PF.json · record 0 · spec 10 · dòng 16, 17, 18, 19, 20
- **Linearity**: ±0.25 hPa — data/raw/CSI_CS106_PF.json · record 0 · spec 11 · dòng 21
- **Hysteresis**: ±0.03 hPa — data/raw/CSI_CS106_PF.json · record 0 · spec 12 · dòng 22
- **Repeatability**: ±0.03 hPa — data/raw/CSI_CS106_PF.json · record 0 · spec 13 · dòng 23
- **Calibration Uncertainty**: ±0.15 hPa — data/raw/CSI_CS106_PF.json · record 0 · spec 14 · dòng 24
- **Current Consumption**: Quiescent: < 1 µA | Active: < 4 mA — data/raw/CSI_CS106_PF.json · record 0 · spec 15 · dòng 25, 26
- **Temperature Range**: -40° to +60°C — data/raw/CSI_CS106_PF.json · record 0 · spec 16 · dòng 27
- **Dimensions**: 6.8 x 9.7 x 2.8 cm | 2.7 x 3.8 x 1.1 in. — data/raw/CSI_CS106_PF.json · record 0 · spec 17 · dòng 28, 29
- **Cable Length**: 76.2 cm | 30 in. — data/raw/CSI_CS106_PF.json · record 0 · spec 18 · dòng 30, 31
- **Weight**: 90 g | 3.2 oz — data/raw/CSI_CS106_PF.json · record 0 · spec 19 · dòng 32, 33

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS120A-ST

Visibility Sensor · CSI_CS120A_ST

Nguồn catalog: https://www.campbellsci.com/products/cs120a

Đại lượng có bằng chứng: Tầm nhìn.

Giao thức được ghi nhận: RS-232 (supported), RS-485 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS120A-ST. CS120A-ST đo tầm nhìn, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, RS-485. Thông số Operating Temperature Range: -25° to +60°C. Thông số general per operational specifications accuracy: < 600 m (< 1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 10,000 to 15,000 m (32,808.4 to 49,212.6 ft): ±15% | 15,000 to 75,000 m (49,212.6 to 246,063 ft): ±20%. Thông số general per operational specifications resolution: 1 m | 3.3 ft.

**Ví dụ explanation tiếng Anh**

Exact model match: CS120A-ST. CS120A-ST measures visibility, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, RS-485. Operating Temperature Range: -25° to +60°C. general per operational specifications accuracy: < 600 m (< 1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 10,000 to 15,000 m (32,808.4 to 49,212.6 ft): ±15% | 15,000 to 75,000 m (49,212.6 to 246,063 ft): ±20%. general per operational specifications resolution: 1 m | 3.3 ft.

**Thông số nguồn để đối chiếu**

- **Base Model**: CS120A — data/raw/CS120A_CS125_Master.json · record 0 · spec 0 · dòng 3
- **Temperature Version**: ST — data/raw/CS120A_CS125_Master.json · record 0 · spec 1 · dòng 4
- **Configuration Description**: CS120A | Temperature version: ST | Operating temperature: -25° to +60°C — data/raw/CS120A_CS125_Master.json · record 0 · spec 2 · dòng 5
- **Cable Length Options**: 5 m (17 ft) per sensor | 10 m (33 ft) per sensor | 15 m (50 ft) per sensor | 30 m (100 ft) per sensor — data/raw/CS120A_CS125_Master.json · record 0 · spec 3 · dòng 6, 7, 8, 9
- **Warranty**: 2 years — data/raw/CS120A_CS125_Master.json · record 0 · spec 4 · dòng 10
- **Operating Temperature Range**: -25° to +60°C — data/raw/CS120A_CS125_Master.json · record 0 · spec 5 · dòng 12
- **Signal Type/Output**: RS-232 | RS-485 — data/raw/CS120A_CS125_Master.json · record 0 · spec 6 · dòng 14, 15
- **Measurement Description**: Meteorological Observable Range (MOR) — data/raw/CS120A_CS125_Master.json · record 0 · spec 7 · dòng 16
- **Maximum Reported Visibility**: 100 km | 62.1 mi — data/raw/CS120A_CS125_Master.json · record 0 · spec 8 · dòng 17, 18
- **Minimum Reported Visibility**: 5 m | 16.4 ft — data/raw/CS120A_CS125_Master.json · record 0 · spec 9 · dòng 19, 20
- **Accuracy**: < 600 m (< 1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 10,000 to 15,000 m (32,808.4 to 49,212.6 ft): ±15% | 15,000 to 75,000 m (49,212.6 to 246,063 ft): ±20% — data/raw/CS120A_CS125_Master.json · record 0 · spec 10 · dòng 21, 22, 23, 24
- **Resolution**: 1 m | 3.3 ft — data/raw/CS120A_CS125_Master.json · record 0 · spec 11 · dòng 25, 26
- **Mounting**: Stainless-steel V-bolt bracket | Pole outer diameter: 32 to 52.5 mm | Pole outer diameter: 1.25 to 2 in. — data/raw/CS120A_CS125_Master.json · record 0 · spec 12 · dòng 59, 60, 61
- **Electronics Supply Voltage**: 7 to 30 Vdc — data/raw/CS120A_CS125_Master.json · record 0 · spec 13 · dòng 64
- **Total Unit Power**: < 3 W while sampling continuously | Includes dew heaters — data/raw/CS120A_CS125_Master.json · record 0 · spec 14 · dòng 65, 66
- **Standards**: Frangible masts available to customer requirements to meet ICAO recommendations | Typical sample volume height: 2.5 m (8.2 ft) — data/raw/CS120A_CS125_Master.json · record 0 · spec 15 · dòng 67, 68
- **Sensor Dimensions**: 540 x 640 x 246 mm | 21.26 x 25.2 x 9.7 in. | Including mount — data/raw/CS120A_CS125_Master.json · record 0 · spec 16 · dòng 69, 70, 71
- **Sensor Weight**: ~3 kg | 6.6 lb | Depends on mounting system — data/raw/CS120A_CS125_Master.json · record 0 · spec 17 · dòng 72, 73, 74
- **LED Center Wavelength**: 850 nm — data/raw/CS120A_CS125_Master.json · record 0 · spec 18 · dòng 78
- **LED Spectral Bandwidth**: ±35 nm — data/raw/CS120A_CS125_Master.json · record 0 · spec 19 · dòng 79
- **Light Pulse Rate**: 1 kHz — data/raw/CS120A_CS125_Master.json · record 0 · spec 20 · dòng 80
- **Operating Humidity Range**: 0 to 100% — data/raw/CS120A_CS125_Master.json · record 0 · spec 21 · dòng 82
- **Sensor Sealing**: Rated to IP66 — data/raw/CS120A_CS125_Master.json · record 0 · spec 22 · dòng 83
- **Wind Speed**: Up to 60 m/s — data/raw/CS120A_CS125_Master.json · record 0 · spec 23 · dòng 84
- **Sensor Heater Threshold**: > 40°C: dew heater off | < 35°C: dew heater on | < 5°C: hood heater on | > 15°C: hood heater off — data/raw/CS120A_CS125_Master.json · record 0 · spec 24 · dòng 85, 86, 87, 88
- **DSP & Dew Heaters Power**: 2 x 0.6 W | Total: 1.4 W for dew heater — data/raw/CS120A_CS125_Master.json · record 0 · spec 25 · dòng 90, 91
- **Typical Current Consumption @ 12 Vdc**: Dew heaters active + RS-232 communications: 200 mA | Continuous sampling + dew heaters active: 200 mA | Continuous sampling + dew heaters disabled: 110 mA | No sampling + dew heaters disabled: 21 mA — data/raw/CS120A_CS125_Master.json · record 0 · spec 26 · dòng 92, 93, 94, 95
- **Hood Heater Supply Voltage**: 24 V dc or ac — data/raw/CS120A_CS125_Master.json · record 0 · spec 27 · dòng 96
- **Hood Heater Power**: 2 x 30 W | Total: 60 W — data/raw/CS120A_CS125_Master.json · record 0 · spec 28 · dòng 97, 98
- **Serial Interface**: RS-232 or RS-485 | 8 bit data bytes | 1 stop bit — data/raw/CS120A_CS125_Master.json · record 0 · spec 29 · dòng 99, 100, 101
- **Serial Data Rates**: 1200 to 115,200 bps | Default: 38,400 bps — data/raw/CS120A_CS125_Master.json · record 0 · spec 30 · dòng 102, 103

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS125-ST

Present Weather Sensor · CSI_CS125_ST

Nguồn catalog: https://www.campbellsci.com/products/cs125

Đại lượng có bằng chứng: Lượng mưa, Thời tiết hiện tại, Tầm nhìn.

Giao thức được ghi nhận: RS-232 (supported), RS-485 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS125-ST. CS125-ST đo lượng mưa, thời tiết hiện tại, tầm nhìn, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, RS-485. Thông số Operating Temperature Range: -25° to +60°C. Thông số general per operational specifications accuracy: Up to 600 m (1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 10,000 to 15,000 m (32,808.4 to 49,212.6 ft): ±15% | Above 15,000 m (49,212.6 ft): ±20%. Thông số general per operational specifications resolution: 1 m | 3.28 ft.

**Ví dụ explanation tiếng Anh**

Exact model match: CS125-ST. CS125-ST measures precipitation, present weather, visibility, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, RS-485. Operating Temperature Range: -25° to +60°C. general per operational specifications accuracy: Up to 600 m (1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 10,000 to 15,000 m (32,808.4 to 49,212.6 ft): ±15% | Above 15,000 m (49,212.6 ft): ±20%. general per operational specifications resolution: 1 m | 3.28 ft.

**Thông số nguồn để đối chiếu**

- **Base Model**: CS125 — data/raw/CS120A_CS125_Master.json · record 2 · spec 0 · dòng 3
- **Temperature Version**: ST — data/raw/CS120A_CS125_Master.json · record 2 · spec 1 · dòng 4
- **Configuration Description**: CS125 | Temperature version: ST | Operating temperature: -25° to +60°C — data/raw/CS120A_CS125_Master.json · record 2 · spec 2 · dòng 5
- **Cable Length Options**: 5 m (17 ft) per sensor | 10 m (33 ft) per sensor | 15 m (50 ft) per sensor | 30 m (100 ft) per sensor — data/raw/CS120A_CS125_Master.json · record 2 · spec 3 · dòng 6, 7, 8, 9
- **Warranty**: 2 years — data/raw/CS120A_CS125_Master.json · record 2 · spec 4 · dòng 10
- **Operating Temperature Range**: -25° to +60°C — data/raw/CS120A_CS125_Master.json · record 2 · spec 5 · dòng 12
- **Measurement Description**: Present Weather and Visibility — data/raw/CS120A_CS125_Master.json · record 2 · spec 6 · dòng 16
- **Maximum Reported Visibility**: 100 km | 62.1 mi — data/raw/CS120A_CS125_Master.json · record 2 · spec 7 · dòng 17, 18
- **Minimum Reported Visibility**: 5 m | 16.4 ft — data/raw/CS120A_CS125_Master.json · record 2 · spec 8 · dòng 19, 20
- **Accuracy**: Up to 600 m (1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 10,000 to 15,000 m (32,808.4 to 49,212.6 ft): ±15% | Above 15,000 m (49,212.6 ft): ±20% — data/raw/CS120A_CS125_Master.json · record 2 · spec 9 · dòng 21, 22, 23, 24
- **Resolution**: 1 m | 3.28 ft — data/raw/CS120A_CS125_Master.json · record 2 · spec 10 · dòng 25, 26
- **Outputs**: Present and past weather | Mist | Fog | Drizzle | Freezing drizzle | Drizzle and snow | Rain | Freezing rain | Rain and drizzle | Rain and snow | Snow | 57 SYNOP present weather codes | Associated METAR present weather codes | Associated NWS present weather codes | Hail detection | Past weather codes — data/raw/CS120A_CS125_Master.json · record 2 · spec 11 · dòng 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42
- **Precipitation Detection Sensitivity**: 0.05 mm/h — data/raw/CS120A_CS125_Master.json · record 2 · spec 12 · dòng 43
- **Accumulation Reporting Range**: 0 to 999.9 mm | 0 to 39.37 in. — data/raw/CS120A_CS125_Master.json · record 2 · spec 13 · dòng 44, 45
- **Accumulation Accuracy**: ±15% | Against factory calibration standards in the laboratory | For liquid precipitation — data/raw/CS120A_CS125_Master.json · record 2 · spec 14 · dòng 46, 47, 48
- **Accumulation Resolution**: 0.1 mm | 0.0039 in. — data/raw/CS120A_CS125_Master.json · record 2 · spec 15 · dòng 49, 50
- **Rain Intensity Range**: 0 to 999.9 mm/h | 0 to 39.37 in./h | Maximum reported intensity depends on mixture of precipitation falling — data/raw/CS120A_CS125_Master.json · record 2 · spec 16 · dòng 51, 52, 53
- **Intensity Accuracy**: ±15% | Against factory calibration standards in the laboratory | For liquid precipitation — data/raw/CS120A_CS125_Master.json · record 2 · spec 17 · dòng 54, 55, 56
- **Intensity Resolution**: 0.01 mm/h | 0.00039 in./h — data/raw/CS120A_CS125_Master.json · record 2 · spec 18 · dòng 57, 58
- **Mounting**: Stainless-steel clip on V-bolt mounting | Pole diameter: 32 to 52.5 mm | Pole diameter: 1.26 to 2.07 in. — data/raw/CS120A_CS125_Master.json · record 2 · spec 19 · dòng 59, 60, 61
- **Mounting Pole**: Optical mounting pole available | Recommended WMO sample volume height: 1.5 m (4.9 ft) — data/raw/CS120A_CS125_Master.json · record 2 · spec 20 · dòng 62, 63
- **Electronics Supply Voltage**: 7 to 30 Vdc — data/raw/CS120A_CS125_Master.json · record 2 · spec 21 · dòng 64
- **Total Unit Power**: < 3 W while sampling continuously | Includes dew heaters — data/raw/CS120A_CS125_Master.json · record 2 · spec 22 · dòng 65, 66
- **Standards**: Frangible masts available to customer requirements to meet ICAO recommendations | Typical sample volume height: 2.5 m (8.2 ft) — data/raw/CS120A_CS125_Master.json · record 2 · spec 23 · dòng 67, 68
- **Sensor Dimensions**: 540 x 640 x 246 mm | 21.26 x 25.2 x 9.7 in. | Including mount — data/raw/CS120A_CS125_Master.json · record 2 · spec 24 · dòng 69, 70, 71
- **Sensor Weight**: ~3 kg | 6.61 lb | Depends on mounting system — data/raw/CS120A_CS125_Master.json · record 2 · spec 25 · dòng 72, 73, 74
- **Cable Length**: 5 m | 16.4 ft — data/raw/CS120A_CS125_Master.json · record 2 · spec 26 · dòng 75, 76
- **Emitter Light Frequency**: 850 nm — data/raw/CS120A_CS125_Master.json · record 2 · spec 27 · dòng 81
- **Operating Humidity Range**: 0 to 100% — data/raw/CS120A_CS125_Master.json · record 2 · spec 28 · dòng 82
- **Sensor Sealing**: Rated to IP66 — data/raw/CS120A_CS125_Master.json · record 2 · spec 29 · dòng 83
- **Wind Speed**: Up to 60 m/s — data/raw/CS120A_CS125_Master.json · record 2 · spec 30 · dòng 84
- **DSP & Dew Heaters Power**: 2 x 0.6 W | Total: 1.2 W — data/raw/CS120A_CS125_Master.json · record 2 · spec 31 · dòng 90, 91
- **Hood Heater Supply Voltage**: 24 V dc or ac — data/raw/CS120A_CS125_Master.json · record 2 · spec 32 · dòng 96
- **Hood Heater Power**: 2 x 30 W | Total: 60 W — data/raw/CS120A_CS125_Master.json · record 2 · spec 33 · dòng 97, 98
- **Serial Interface**: RS-232 or RS-485 — data/raw/CS120A_CS125_Master.json · record 2 · spec 34 · dòng 99
- **Serial Data Rates**: 1200 to 115,200 bps | Default: 38,400 bps — data/raw/CS120A_CS125_Master.json · record 2 · spec 35 · dòng 102, 103
- **Alarm Outputs**: 2 x 0 to 5 V outputs | 32 mA max — data/raw/CS120A_CS125_Master.json · record 2 · spec 36 · dòng 104, 105
- **Material**: Stainless steel | Hard-anodized aluminum powder-coated — data/raw/CS120A_CS125_Master.json · record 2 · spec 37 · dòng 106, 107

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS140

Background Luminance Sensor · CSI_CS140

Nguồn catalog: https://www.campbellsci.com/products/cs140

Đại lượng có bằng chứng: Độ chói nền.

Giao thức được ghi nhận: RS-232 (supported), RS-485 (supported).

Cấu hình model: Product Name: Background Luminance Sensor; Model: CS140; Item Number: 34293; Warranty: 2 years

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS140. CS140 đo độ chói nền, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, RS-485. Thông số measurement range: 0 to 45,000 cd/m². Thông số accuracy: ±0.6 cd/m² (< 6 cd/m²) | ±10% (> 6 cd/m²). Thông số operating temperature: -25° to +60°C (standard) | -50° to +70°C (extended, optional) | -40° to +70°C (extended, optional).

**Ví dụ explanation tiếng Anh**

Exact model match: CS140. CS140 measures background luminance, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, RS-485. measurement range: 0 to 45,000 cd/m². accuracy: ±0.6 cd/m² (< 6 cd/m²) | ±10% (> 6 cd/m²). operating temperature: -25° to +60°C (standard) | -50° to +70°C (extended, optional) | -40° to +70°C (extended, optional).

**Thông số nguồn để đối chiếu**

- **Product Name**: Background Luminance Sensor — data/raw/CSI_CS140.json · record 0 · spec 0 · dòng 3
- **Model**: CS140 — data/raw/CSI_CS140.json · record 0 · spec 1 · dòng 4
- **Item Number**: 34293 — data/raw/CSI_CS140.json · record 0 · spec 2 · dòng 5
- **Warranty**: 2 years — data/raw/CSI_CS140.json · record 0 · spec 3 · dòng 6
- **Measurement Range**: 0 to 45,000 cd/m² — data/raw/CSI_CS140.json · record 0 · spec 4 · dòng 8
- **Accuracy**: ±0.6 cd/m² (< 6 cd/m²) | ±10% (> 6 cd/m²) — data/raw/CSI_CS140.json · record 0 · spec 5 · dòng 9, 10
- **Operating Temperature**: -25° to +60°C (standard) | -50° to +70°C (extended, optional) | -40° to +70°C (extended, optional) — data/raw/CSI_CS140.json · record 0 · spec 6 · dòng 11, 12, 13
- **Operating Humidity**: 0 to 100% — data/raw/CSI_CS140.json · record 0 · spec 7 · dòng 14
- **Wind Speed**: Up to 60 m/s — data/raw/CSI_CS140.json · record 0 · spec 8 · dòng 15
- **Sensor Sealing**: Rated to IP66 — data/raw/CSI_CS140.json · record 0 · spec 9 · dòng 16
- **Response Time**: 1 s — data/raw/CSI_CS140.json · record 0 · spec 10 · dòng 17
- **Mountings**: Stainless-steel V-bolt mounting to pole | Diameter 3.2 to 5.25 cm (1.26 to 2.07 in.) — data/raw/CSI_CS140.json · record 0 · spec 11 · dòng 18, 19
- **Sensor Dimensions**: 36 x 18 x 9 cm (14.2 x 7.1 x 3.5 in.) — data/raw/CSI_CS140.json · record 0 · spec 12 · dòng 20
- **Weight**: ~2.4 kg (~5.3 lb) dependent upon mounting system — data/raw/CSI_CS140.json · record 0 · spec 13 · dòng 21
- **Shipping Weight**: 3.5 kg (7.7 lb) — data/raw/CSI_CS140.json · record 0 · spec 14 · dòng 22
- **Electrical - NOTE**: Lower power states can be achieved by less frequent sampling and remote control of heaters. | Optional power supplies with battery back-up available. | A low-voltage shutdown level can be set to prevent back-up batteries from being damaged. — data/raw/CSI_CS140.json · record 0 · spec 15 · dòng 24, 25, 26
- **Electronics Supply Voltage**: 9 to 24 Vdc — data/raw/CSI_CS140.json · record 0 · spec 16 · dòng 27
- **Hood Heater Supply Voltage**: 24 V dc or ac — data/raw/CSI_CS140.json · record 0 · spec 17 · dòng 28
- **Hood Heater Power**: 48 W — data/raw/CSI_CS140.json · record 0 · spec 18 · dòng 29
- **Dew Heater Power**: 0.6 W — data/raw/CSI_CS140.json · record 0 · spec 19 · dòng 30
- **Total Unit Power**: < 1.5 W while sampling continuously (including dew heater) — data/raw/CSI_CS140.json · record 0 · spec 20 · dòng 31
- **Serial Interface**: RS-232 (full duplex, no hardware handshaking) | RS-485 (half duplex only) — data/raw/CSI_CS140.json · record 0 · spec 21 · dòng 33, 34
- **Serial Data Rates**: 1200 to 115,200 bps | 38,400 bps default rate — data/raw/CSI_CS140.json · record 0 · spec 22 · dòng 35, 36
- **Optical - NOTE**: Lens contamination circuitry monitors the window for contamination. | The sensor can be configured to adjust calibration for contamination. — data/raw/CSI_CS140.json · record 0 · spec 23 · dòng 38, 39
- **Field of View (FOV)**: 6° wide with sharp cut-off — data/raw/CSI_CS140.json · record 0 · spec 24 · dòng 40
- **Elevation Angle**: 6° with hood horizontal — data/raw/CSI_CS140.json · record 0 · spec 25 · dòng 41
- **Resolution**: 0.1 cd/m² — data/raw/CSI_CS140.json · record 0 · spec 26 · dòng 42

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS230

Temperature Profiler · CSI_CS230

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: SDI-12 (supported).

Cấu hình model: Product Name: SDI-12 Temperature Profiler; Model: CS230; Typical Accuracy: ±0.2°C (-40° to +85°C) includes lifetime drift; Worst Case Accuracy: ±0.5°C (-55° to -40°C) includes lifetime drift | ±0.4°C (−40° to +85°C) includes lifetime drift; Optional External Probes: 4 (maximum); Current Consumption: 1.0 mA (max) quiescent current draw per sensor | 20 mA + (# sensors * 1.0 mA) active current draw

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS230. CS230 đo nhiệt độ, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số Operating Temperature Range: -55° to +85°C. Thông số typical accuracy: ±0.2°C (-40° to +85°C) includes lifetime drift. Thông số worst case accuracy: ±0.5°C (-55° to -40°C) includes lifetime drift | ±0.4°C (−40° to +85°C) includes lifetime drift.

**Ví dụ explanation tiếng Anh**

Exact model match: CS230. CS230 measures temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. Operating Temperature Range: -55° to +85°C. typical accuracy: ±0.2°C (-40° to +85°C) includes lifetime drift. worst case accuracy: ±0.5°C (-55° to -40°C) includes lifetime drift | ±0.4°C (−40° to +85°C) includes lifetime drift.

**Thông số nguồn để đối chiếu**

- **Product Name**: SDI-12 Temperature Profiler — data/raw/CSI_CS230.json · record 0 · spec 0 · dòng 3
- **Model**: CS230 — data/raw/CSI_CS230.json · record 0 · spec 1 · dòng 4
- **Operating Temperature Range**: -55° to +85°C — data/raw/CSI_CS230.json · record 0 · spec 2 · dòng 8
- **Typical Accuracy**: ±0.2°C (-40° to +85°C) includes lifetime drift — data/raw/CSI_CS230.json · record 0 · spec 3 · dòng 9
- **Worst Case Accuracy**: ±0.5°C (-55° to -40°C) includes lifetime drift | ±0.4°C (−40° to +85°C) includes lifetime drift — data/raw/CSI_CS230.json · record 0 · spec 4 · dòng 10, 11
- **Resolution**: 0.0078°C — data/raw/CSI_CS230.json · record 0 · spec 5 · dòng 12
- **Communications**: SDI-12 — data/raw/CSI_CS230.json · record 0 · spec 6 · dòng 13
- **Maximum Sensors per Probe**: 32 — data/raw/CSI_CS230.json · record 0 · spec 7 · dòng 14
- **Minimum Spacing**: 5 cm (1.97 in.) — data/raw/CSI_CS230.json · record 0 · spec 8 · dòng 15
- **Optional External Probes**: 4 (maximum) — data/raw/CSI_CS230.json · record 0 · spec 9 · dòng 16
- **Supply Voltage**: 9 to 28 Vdc — data/raw/CSI_CS230.json · record 0 · spec 10 · dòng 17
- **Current Consumption**: 1.0 mA (max) quiescent current draw per sensor | 20 mA + (# sensors * 1.0 mA) active current draw — data/raw/CSI_CS230.json · record 0 · spec 11 · dòng 18, 19
- **Warm-up Time on Power up**: 10 s — data/raw/CSI_CS230.json · record 0 · spec 12 · dòng 20
- **Probe Diameter**: 2.13 cm (0.84 in.) — data/raw/CSI_CS230.json · record 0 · spec 13 · dòng 22
- **Standard External Probe Length**: 45 cm (18 in.) — data/raw/CSI_CS230.json · record 0 · spec 14 · dòng 23
- **Maximum Length**: 3.0 m (118 in.) — data/raw/CSI_CS230.json · record 0 · spec 15 · dòng 24
- **Maximum Cable Length**: 152 m (500 ft) — data/raw/CSI_CS230.json · record 0 · spec 16 · dòng 25
- **Electronics Sealing Classification**: IP68 — data/raw/CSI_CS230.json · record 0 · spec 17 · dòng 26

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS241DM

Back-of-Module Temperature Sensor · CSI_CS241DM

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: Modbus (supported), RS-485 (supported).

Cấu hình model: Product Name: Pt-1000 Class A, Precision Back-of-Module Temperature Sensor with Digital Modbus RS-485 Output, Second Generation; Model: CS241DM G2

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS241DM. CS241DM là Back-of-Module Temperature Sensor; dữ liệu ghi nhận chức năng/đầu vào đo nhiệt độ. Cần phân biệt phép đo nội bộ và tín hiệu đầu vào với cảm biến đo trực tiếp môi trường; kiểm tra cảm biến, đấu dây và cấu hình tương ứng. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Modbus, RS-485. Thông số Operating Temperature Range: -50° to +150°C. Thông số class a prt accuracy: ±(0.15 + 0.002T)°C. Thông số uncertainty: The temperature uncertainty is ±0.3° to 0.4°C in the measurement range of -40° to +150°C..

**Ví dụ explanation tiếng Anh**

Exact model match: CS241DM. CS241DM is a Back-of-Module Temperature Sensor; the data records measurement functions/inputs for temperature. Distinguish internal measurements and input signals from direct environmental sensors; check sensors, wiring and configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Modbus, RS-485. Operating Temperature Range: -50° to +150°C. class a prt accuracy: ±(0.15 + 0.002T)°C. uncertainty: The temperature uncertainty is ±0.3° to 0.4°C in the measurement range of -40° to +150°C..

**Thông số nguồn để đối chiếu**

- **Product Name**: Pt-1000 Class A, Precision Back-of-Module Temperature Sensor with Digital Modbus RS-485 Output, Second Generation — data/raw/CSI_CS241DM.json · record 0 · spec 0 · dòng 3
- **Model**: CS241DM G2 — data/raw/CSI_CS241DM.json · record 0 · spec 1 · dòng 4
- **Sensor Precision**: Precision 1,000 ohm Class A platinum sensing element (Pt-1000) — data/raw/CSI_CS241DM.json · record 0 · spec 2 · dòng 6
- **Operating Temperature Range**: -50° to +150°C — data/raw/CSI_CS241DM.json · record 0 · spec 3 · dòng 7
- **Class A PRT Accuracy**: ±(0.15 + 0.002T)°C — data/raw/CSI_CS241DM.json · record 0 · spec 4 · dòng 8
- **Temperature Coefficient**: TCR = 3,850 ppm/K — data/raw/CSI_CS241DM.json · record 0 · spec 5 · dòng 9
- **Long-Term Stability**: Maximum R0 drift 0.04% (after 1,000 h at 400°C) — data/raw/CSI_CS241DM.json · record 0 · spec 6 · dòng 10
- **Measuring Current**: 0.1 to 0.3 mA — data/raw/CSI_CS241DM.json · record 0 · spec 7 · dòng 11
- **Uncertainty**: The temperature uncertainty is ±0.3° to 0.4°C in the measurement range of -40° to +150°C. — data/raw/CSI_CS241DM.json · record 0 · spec 8 · dòng 12
- **Disk Material**: Anodized aluminum — data/raw/CSI_CS241DM.json · record 0 · spec 9 · dòng 13
- **Disk Diameter**: 2.54 cm (1.0 in.) — data/raw/CSI_CS241DM.json · record 0 · spec 10 · dòng 14
- **Height**: 0.419 cm (0.165 in.) — data/raw/CSI_CS241DM.json · record 0 · spec 11 · dòng 15
- **Weight**: ~27 g (0.06 lb) with connector and 1 m (3 ft) cable — data/raw/CSI_CS241DM.json · record 0 · spec 12 · dòng 16
- **Jacket Material**: Black semi-gloss PFA, shielded — data/raw/CSI_CS241DM.json · record 0 · spec 13 · dòng 18
- **Minimum Bend Radius**: 6 mm (0.25 in.) at least 6 mm (0.25 in.) away from sensor disk — data/raw/CSI_CS241DM.json · record 0 · spec 14 · dòng 19
- **Cable Diameter**: 0.216 cm (0.085 in.) — data/raw/CSI_CS241DM.json · record 0 · spec 15 · dòng 20
- **Cable Length**: 0.9144 m (3 ft) — data/raw/CSI_CS241DM.json · record 0 · spec 16 · dòng 21
- **Compliance - NOTE**: Compliance information can be found in the Documents section of the web page. — data/raw/CSI_CS241DM.json · record 0 · spec 17 · dòng 23
- **Approvals**: CSA AWM 600 V 105°C FTI / UL AWM 2586 1,000 V 105°C — data/raw/CSI_CS241DM.json · record 0 · spec 18 · dòng 24, 25
- **EMC Compliance**: Conforms to Electromagnetic Compatibility Directive (EMC) — data/raw/CSI_CS241DM.json · record 0 · spec 19 · dòng 26
- **RoHS2**: Conforms to the Restriction of Hazardous Substances Directive (RoHS2) — data/raw/CSI_CS241DM.json · record 0 · spec 20 · dòng 27
- **Industry Approvals**: Compliant with IEC 60751 / DIN EN 60751 / Industrial Design (IEC Class 4) (formerly known as IEC 751) — data/raw/CSI_CS241DM.json · record 0 · spec 21 · dòng 28, 29, 30
- **IP Rating**: IP68 rating (self-certified): 1 m submersion for 90 min — data/raw/CSI_CS241DM.json · record 0 · spec 22 · dòng 31

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS301

Solar Radiation Sensor · CSI_CS301

Nguồn catalog: https://www.campbellsci.com/products/cs301

Đại lượng có bằng chứng: Độ ẩm tương đối, Bức xạ mặt trời.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS301. CS301 đo độ ẩm tương đối, bức xạ mặt trời, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số measurement range: 0 to 2000 W/m² | Full sunlight ≈1000 W/m². Thông số absolute accuracy: ±5% for daily total radiation. Thông số Operating Temperature Range: -40° to +70°C.

**Ví dụ explanation tiếng Anh**

Exact model match: CS301. CS301 measures relative humidity, solar radiation, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. measurement range: 0 to 2000 W/m² | Full sunlight ≈1000 W/m². absolute accuracy: ±5% for daily total radiation. Operating Temperature Range: -40° to +70°C.

**Thông số nguồn để đối chiếu**

- **Sensor**: Silicon photovoltaic detector mounted in a cosine-corrected head — data/raw/CS301.json · record 0 · spec 0 · dòng 3
- **Measurement Description**: Measures sun plus sky radiation — data/raw/CS301.json · record 0 · spec 1 · dòng 4
- **ISO Classification**: Class C (second class) — data/raw/CS301.json · record 0 · spec 2 · dòng 5
- **Light Spectrum Waveband**: 360 to 1120 nm (wavelengths where response is 10% of maximum) — data/raw/CS301.json · record 0 · spec 3 · dòng 6
- **Measurement Range**: 0 to 2000 W/m² | Full sunlight ≈1000 W/m² — data/raw/CS301.json · record 0 · spec 4 · dòng 7, 8
- **Output Range**: 0 to 400 mV (full scale output) — data/raw/CS301.json · record 0 · spec 5 · dòng 9
- **Absolute Accuracy**: ±5% for daily total radiation — data/raw/CS301.json · record 0 · spec 6 · dòng 10
- **Spectral Range**: 360 to 1120 nm — data/raw/CS301.json · record 0 · spec 7 · dòng 11
- **Calibration Factor**: 5 W/m²/mV — data/raw/CS301.json · record 0 · spec 8 · dòng 12
- **Cosine Correction Error**: ±5% at 75° zenith angle | ±2% at 45° zenith angle — data/raw/CS301.json · record 0 · spec 9 · dòng 13, 14
- **Temperature Response**: 0.04 ± 0.04% per °C — data/raw/CS301.json · record 0 · spec 10 · dòng 15
- **Response Time**: < 1 ms — data/raw/CS301.json · record 0 · spec 11 · dòng 16
- **Long-Term Stability**: < 2% per year — data/raw/CS301.json · record 0 · spec 12 · dòng 17
- **Operating Temperature Range**: -40° to +70°C — data/raw/CS301.json · record 0 · spec 13 · dòng 18
- **Relative Humidity Range**: 0 to 100% — data/raw/CS301.json · record 0 · spec 14 · dòng 19
- **Sensitivity**: 0.2 mV/W/m² — data/raw/CS301.json · record 0 · spec 15 · dòng 20
- **Diameter**: 2.4 cm (0.9 in.) — data/raw/CS301.json · record 0 · spec 16 · dòng 21
- **Height**: 2.5 cm (1.0 in.) — data/raw/CS301.json · record 0 · spec 17 · dòng 22
- **Weight**: 65 g (2.3 oz) with 2-m (6.6-ft) lead wire — data/raw/CS301.json · record 0 · spec 18 · dòng 23

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS310

Quantum Sensor · CSI_CS310

Nguồn catalog: https://www.campbellsci.com/products/cs310

Đại lượng có bằng chứng: Mật độ thông lượng photon quang hợp.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: 

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS310. CS310 đo mật độ thông lượng photon quang hợp, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số calibration uncertainty: ±5% (for daily total radiation). Thông số measurement range: 0 to 4000 µmol m⁻² s⁻¹. Thông số uncertainty in daily total: < 5%.

**Ví dụ explanation tiếng Anh**

Exact model match: CS310. CS310 measures photosynthetic photon flux density, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. calibration uncertainty: ±5% (for daily total radiation). measurement range: 0 to 4000 µmol m⁻² s⁻¹. uncertainty in daily total: < 5%.

**Thông số nguồn để đối chiếu**

- **Sensor**: Blue-enhanced silicon photodiode and custom optical filters — data/raw/CSI_CS310.json · record 0 · spec 0 · dòng 3
- **Measurement Description**: Measures photosynthetic photon flux density (PPFD) in both natural and artificial light — data/raw/CSI_CS310.json · record 0 · spec 1 · dòng 4
- **Power Supply**: Self-powered — data/raw/CSI_CS310.json · record 0 · spec 2 · dòng 5
- **Sensitivity**: 0.01 mV per µmol m⁻² s⁻¹ — data/raw/CSI_CS310.json · record 0 · spec 3 · dòng 6
- **Calibration Factor (Reciprocal of Sensitivity)**: 100.0 µmol m⁻² s⁻¹ per mV — data/raw/CSI_CS310.json · record 0 · spec 4 · dòng 7
- **Calibration Uncertainty**: ±5% (for daily total radiation) — data/raw/CSI_CS310.json · record 0 · spec 5 · dòng 8
- **Calibrated Output Range**: 0 to 40 mV — data/raw/CSI_CS310.json · record 0 · spec 6 · dòng 9
- **Measurement Range**: 0 to 4000 µmol m⁻² s⁻¹ — data/raw/CSI_CS310.json · record 0 · spec 7 · dòng 10
- **Measurement Repeatability**: < 1% (up to 4000 μmol m⁻² s⁻¹) — data/raw/CSI_CS310.json · record 0 · spec 8 · dòng 11
- **Long-Term Drift**: < 2% per year — data/raw/CSI_CS310.json · record 0 · spec 9 · dòng 12
- **Non-Linearity**: < 1% (up to 4000 µmol m⁻² s⁻¹) — data/raw/CSI_CS310.json · record 0 · spec 10 · dòng 13
- **Response Time**: < 1 ms — data/raw/CSI_CS310.json · record 0 · spec 11 · dòng 14
- **Field of View (FOV)**: 180° — data/raw/CSI_CS310.json · record 0 · spec 12 · dòng 15
- **Spectral Range**: 389 to 692 nm ±5 nm (wavelengths where response is greater than 50% of maximum) — data/raw/CSI_CS310.json · record 0 · spec 13 · dòng 16
- **Spectral Selectivity**: < 10% from 412 to 682 nm ±5 nm — data/raw/CSI_CS310.json · record 0 · spec 14 · dòng 17
- **Directional (Cosine) Response**: ±5% (at 75° zenith angle) — data/raw/CSI_CS310.json · record 0 · spec 15 · dòng 18
- **Azimuth Error**: < 0.5% — data/raw/CSI_CS310.json · record 0 · spec 16 · dòng 19
- **Tilt Error**: < 0.5% — data/raw/CSI_CS310.json · record 0 · spec 17 · dòng 20
- **Temperature Response**: -0.11 ±0.04% per °C — data/raw/CSI_CS310.json · record 0 · spec 18 · dòng 21
- **Uncertainty in Daily Total**: < 5% — data/raw/CSI_CS310.json · record 0 · spec 19 · dòng 22
- **Detector**: Blue-enhanced silicon photodiode — data/raw/CSI_CS310.json · record 0 · spec 20 · dòng 23
- **Housing**: Anodized aluminum body with acrylic diffuser — data/raw/CSI_CS310.json · record 0 · spec 21 · dòng 24
- **IP Rating**: IP68 — data/raw/CSI_CS310.json · record 0 · spec 22 · dòng 25
- **Operating Temperature Range**: -40° to +70°C — data/raw/CSI_CS310.json · record 0 · spec 23 · dòng 26
- **Operating Environment**: 0 to 100% relative humidity — data/raw/CSI_CS310.json · record 0 · spec 24 · dòng 27
- **Cable**: 5 m of shielded, twisted-pair wire | Additional cable available in multiples of 5 m | Santoprene rubber jacket (high water resistance, high UV stability, flexibility in cold conditions) | Pigtail lead wires — data/raw/CSI_CS310.json · record 0 · spec 25 · dòng 28, 29, 30, 31
- **Warranty**: 4 years (against defects in materials and workmanship) — data/raw/CSI_CS310.json · record 0 · spec 26 · dòng 32
- **Diameter**: 2.4 cm (0.9 in.) — data/raw/CSI_CS310.json · record 0 · spec 27 · dòng 33
- **Height**: 3.5 cm (1.4 in.) — data/raw/CSI_CS310.json · record 0 · spec 28 · dòng 34
- **Weight**: 100 g with 5 m of lead wire (3.53 oz with 16.4 ft of lead wire) — data/raw/CSI_CS310.json · record 0 · spec 29 · dòng 35

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS451

Water Level, Stage, and Flow Sensor · CSI_CS451

Nguồn catalog: https://www.campbellsci.com/products/cs451

Đại lượng có bằng chứng: Mực nước.

Giao thức được ghi nhận: RS-232 (supported), SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS451. CS451 đo mực nước, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, SDI-12. Thông số water level resolution: 0.0035% FS. Thông số Worst-Case Temperature Resolution: 0.006°C. Thông số operating temperature range: 0° to 60°C | WARNING: Sensor could be damaged if encased in frozen ice..

**Ví dụ explanation tiếng Anh**

Exact model match: CS451. CS451 measures water level, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, SDI-12. water level resolution: 0.0035% FS. Worst-Case Temperature Resolution: 0.006°C. operating temperature range: 0° to 60°C | WARNING: Sensor could be damaged if encased in frozen ice..

**Thông số nguồn để đối chiếu**

- **Measurement Time**: < 1.5 s — data/raw/CS451.json · record 0 · spec 0 · dòng 3
- **Output Options**: SDI-12 (version 1.3) 1200 bps | RS-232 9600 bps — data/raw/CS451.json · record 0 · spec 1 · dòng 4, 5
- **Water-Level Resolution**: 0.0035% FS — data/raw/CS451.json · record 0 · spec 2 · dòng 6
- **Worst-Case Temperature Resolution**: 0.006°C — data/raw/CS451.json · record 0 · spec 3 · dòng 7
- **Dry Storage Temperature Range**: -40° to +100°C | WARNING: Sensor could be damaged if encased in frozen ice. — data/raw/CS451.json · record 0 · spec 4 · dòng 8, 9
- **Operating Temperature Range**: 0° to 60°C | WARNING: Sensor could be damaged if encased in frozen ice. — data/raw/CS451.json · record 0 · spec 5 · dòng 10, 11
- **Temperature Accuracy**: ±0.2°C — data/raw/CS451.json · record 0 · spec 6 · dòng 12
- **Overpressure**: 2 x pressure range — data/raw/CS451.json · record 0 · spec 7 · dòng 13
- **Power Requirements**: 6 to 18 Vdc — data/raw/CS451.json · record 0 · spec 8 · dòng 14
- **Cable Type**: Hytrel Jacket, five conductor, 26 AWG — data/raw/CS451.json · record 0 · spec 9 · dòng 15
- **NPT Fitting**: 1/4-in. NPS — data/raw/CS451.json · record 0 · spec 10 · dòng 16
- **Top Cone Material**: Delrin — data/raw/CS451.json · record 0 · spec 11 · dòng 17
- **Body Material**: 316L stainless steel — data/raw/CS451.json · record 0 · spec 12 · dòng 18
- **Element Material**: 316L stainless steel — data/raw/CS451.json · record 0 · spec 13 · dòng 19
- **Ingress Protection**: Exceeds IP68 — data/raw/CS451.json · record 0 · spec 14 · dòng 26
- **Diameter**: 21.34 mm (0.84 in.) — data/raw/CS451.json · record 0 · spec 15 · dòng 27
- **Cable Outer Diameter**: 0.589 cm (0.232 in.) nominal | 0.599 cm (0.236 in.) maximum — data/raw/CS451.json · record 0 · spec 16 · dòng 28, 29
- **Length**: 213.36 mm (6.875 in.) — data/raw/CS451.json · record 0 · spec 17 · dòng 30
- **Cable Weight**: 0.0421 kg/m (0.0283 lb/ft) — data/raw/CS451.json · record 0 · spec 18 · dòng 31
- **Weight**: 0.17 kg (0.37 lb) without cable — data/raw/CS451.json · record 0 · spec 19 · dòng 32
- **Quiescent**: < 50 µA — data/raw/CS451.json · record 0 · spec 20 · dòng 37
- **Measurement/Communication**: 8 mA (1 s measurement) — data/raw/CS451.json · record 0 · spec 21 · dòng 38
- **Maximum**: 40 mA — data/raw/CS451.json · record 0 · spec 22 · dòng 39
- **0 to 5.1 m (16.7 ft)**: 0 to 7.25 psig | 0 to 50 kPa — data/raw/CS451.json · record 0 · spec 23 · dòng 45, 46
- **0 to 10.2 m (33.4 ft)**: 0 to 14.5 psig | 0 to 100 kPa — data/raw/CS451.json · record 0 · spec 24 · dòng 47, 48
- **0 to 20.4 m (67 ft)**: 0 to 200 kPa | 0 to 29 psig — data/raw/CS451.json · record 0 · spec 25 · dòng 49, 50
- **0 to 50.9 m (167 ft)**: 0 to 500 kPa | 0 to 72.5 psig — data/raw/CS451.json · record 0 · spec 26 · dòng 51, 52
- **0 to 102 m (334.5 ft)**: 0 to 1000 kPa | 0 to 145 psig — data/raw/CS451.json · record 0 · spec 27 · dòng 53, 54
- **High Accuracy Option**: ±0.05% full-scale-range TEB | The high accuracy (±0.05% full-scale range) option is not available for the 0 to 2.9 psig range option. | Total Error Band (TEB) includes the combined errors due to nonlinearity, hysteresis, nonrepeatability, and thermal effects over the compensated temperature range, per ISA S51.1. — data/raw/CS451.json · record 0 · spec 28 · dòng 58, 59, 60
- **SDI-12**: 60 m (200 ft) | 10 sensors connected to a single port | ~457 m (1500 ft) | 1 sensor connected to a single port — data/raw/CS451.json · record 0 · spec 29 · dòng 62, 63, 64, 65
- **RS-232**: 60 m (200 ft) — data/raw/CS451.json · record 0 · spec 30 · dòng 66

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS456

Water-Level Sensor · CSI_CS456

Nguồn catalog: https://www.campbellsci.com/products/cs456

Đại lượng có bằng chứng: Mực nước.

Giao thức được ghi nhận: RS-232 (supported), SDI-12 (supported).

Cấu hình model: Output Options: SDI-12 (version 1.3) 1200 bps
RS-232 9600 bps; NPT Fitting: 1/4-in. NPS; Distance: 9.9 cm (3.9 in.)
Distance from black line etched on housing to end of weighted nose cone
2.54 cm (1 in.)
Distance from black line etched on housing to end of NPT fitting
2.3 cm (0.9 in.)
Distance from black line etched on housing to end of standard nose cone; 0 to 2.0 m (6.7 ft): 0 to 20 kPa
The high accuracy (±0.05% FS) option is not available for the 0 to 2.9 psig range option.
0 to 2.9 psig
The high accuracy (±0.05% FS) option is not available for the 0 to 2.9 psig range option.; Standard Accuracy Option: ±0.1% full-scale-range TEB; High Accuracy Option: ±0.05% full-scale-range TEB
The high accuracy (±0.05% full-scale range) option is not available for the 0 to 2.9 psig range option.; Standard & Weighted Nose Cone: 0.653 cm (0.257 in.); NPT Fitting: 2.72 cm (1.07 in.)

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS456. CS456 đo mực nước, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, SDI-12. Cấu hình CS456: Standard Accuracy Option: ±0.1% full-scale-range TEB. Cấu hình CS456: High Accuracy Option: ±0.05% full-scale-range TEB
The high accuracy (±0.05% full-scale range) option is not available for the 0 to 2.9 psig range option.. Thông số water level resolution: 0.0035% FS. Thông số Worst-Case Temperature Resolution: 0.006°C. Thông số operating temperature range: 0° to 60°C
WARNING: Sensor could be damaged if encased in frozen ice..

**Ví dụ explanation tiếng Anh**

Exact model match: CS456. CS456 measures water level, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, SDI-12. CS456 configuration: Standard Accuracy Option: ±0.1% full-scale-range TEB. CS456 configuration: High Accuracy Option: ±0.05% full-scale-range TEB
The high accuracy (±0.05% full-scale range) option is not available for the 0 to 2.9 psig range option.. water level resolution: 0.0035% FS. Worst-Case Temperature Resolution: 0.006°C. operating temperature range: 0° to 60°C
WARNING: Sensor could be damaged if encased in frozen ice..

**Thông số nguồn để đối chiếu**

- **Measurement Time**: < 1.5 s — data/raw/CSI_CS456.json · record 0 · spec 0 · dòng 3
- **Output Options**: SDI-12 (version 1.3) 1200 bps / RS-232 9600 bps — data/raw/CSI_CS456.json · record 0 · spec 1 · dòng 4, 5
- **Water-Level Resolution**: 0.0035% FS — data/raw/CSI_CS456.json · record 0 · spec 2 · dòng 6
- **Worst-Case Temperature Resolution**: 0.006°C — data/raw/CSI_CS456.json · record 0 · spec 3 · dòng 7
- **Dry Storage Temperature Range**: -10° to +80°C / WARNING: Sensor could be damaged if encased in frozen ice. — data/raw/CSI_CS456.json · record 0 · spec 4 · dòng 8, 9
- **Operating Temperature Range**: 0° to 60°C / WARNING: Sensor could be damaged if encased in frozen ice. — data/raw/CSI_CS456.json · record 0 · spec 5 · dòng 10, 11
- **Temperature Accuracy**: ±0.2°C — data/raw/CSI_CS456.json · record 0 · spec 6 · dòng 12
- **Overpressure**: 2 x pressure range — data/raw/CSI_CS456.json · record 0 · spec 7 · dòng 13
- **Power Requirements**: 6 to 18 Vdc — data/raw/CSI_CS456.json · record 0 · spec 8 · dòng 14
- **Cable Type**: Hytrel Jacket, five conductor, 26 AWG — data/raw/CSI_CS456.json · record 0 · spec 9 · dòng 15
- **NPT Fitting**: 1/4-in. NPS — data/raw/CSI_CS456.json · record 0 · spec 10 · dòng 16
- **Top Cone Material**: Delrin — data/raw/CSI_CS456.json · record 0 · spec 11 · dòng 17
- **Body Material**: Titanium — data/raw/CSI_CS456.json · record 0 · spec 12 · dòng 18
- **Element Material**: Hastelloy — data/raw/CSI_CS456.json · record 0 · spec 13 · dòng 19
- **Distance**: 9.9 cm (3.9 in.) / Distance from black line etched on housing to end of weighted nose cone / 2.54 cm (1 in.) / Distance from black line etched on housing to end of NPT fitting / 2.3 cm (0.9 in.) / Distance from black line etched on housing to end of standard nose cone — data/raw/CSI_CS456.json · record 0 · spec 14 · dòng 20, 21, 22, 23, 24, 25
- **Ingress Protection**: Exceeds IP68 — data/raw/CSI_CS456.json · record 0 · spec 15 · dòng 26
- **Diameter**: 21.34 mm (0.84 in.) — data/raw/CSI_CS456.json · record 0 · spec 16 · dòng 27
- **Length**: 213.36 mm (6.875 in.) — data/raw/CSI_CS456.json · record 0 · spec 17 · dòng 28
- **Cable Weight**: 0.0421 kg/m (0.0283 lb/ft) — data/raw/CSI_CS456.json · record 0 · spec 18 · dòng 29
- **Weight**: 0.10 kg (0.23 lb) without cable — data/raw/CSI_CS456.json · record 0 · spec 19 · dòng 30
- **Quiescent**: < 50 µA — data/raw/CSI_CS456.json · record 0 · spec 20 · dòng 32
- **Measurement/Communication**: 8 mA (1 s measurement) — data/raw/CSI_CS456.json · record 0 · spec 21 · dòng 33
- **Maximum**: 40 mA — data/raw/CSI_CS456.json · record 0 · spec 22 · dòng 34
- **0 to 2.0 m (6.7 ft)**: 0 to 20 kPa / The high accuracy (±0.05% FS) option is not available for the 0 to 2.9 psig range option. / 0 to 2.9 psig / The high accuracy (±0.05% FS) option is not available for the 0 to 2.9 psig range option. — data/raw/CSI_CS456.json · record 0 · spec 23 · dòng 36, 37, 38, 39
- **0 to 5.1 m (16.7 ft)**: 0 to 7.25 psig / 0 to 50 kPa — data/raw/CSI_CS456.json · record 0 · spec 24 · dòng 40, 41
- **0 to 10.2 m (33.4 ft)**: 0 to 14.5 psig / 0 to 100 kPa — data/raw/CSI_CS456.json · record 0 · spec 25 · dòng 42, 43
- **0 to 20.4 m (67 ft)**: 0 to 200 kPa / 0 to 29 psig — data/raw/CSI_CS456.json · record 0 · spec 26 · dòng 44, 45
- **0 to 50.9 m (167 ft)**: 0 to 500 kPa / 0 to 72.5 psig — data/raw/CSI_CS456.json · record 0 · spec 27 · dòng 46, 47
- **0 to 102 m (334.5 ft)**: 0 to 145 psig / 0 to 145 psig — data/raw/CSI_CS456.json · record 0 · spec 28 · dòng 48, 49
- **-NOTE-**: Includes the combined errors due to nonlinearity, hysteresis, nonrepeatability, and thermal effects over the compensated temperature range, per ISA S51.1. — data/raw/CSI_CS456.json · record 0 · spec 29 · dòng 51
- **Standard Accuracy Option**: ±0.1% full-scale-range TEB — data/raw/CSI_CS456.json · record 0 · spec 30 · dòng 52
- **High Accuracy Option**: ±0.05% full-scale-range TEB / The high accuracy (±0.05% full-scale range) option is not available for the 0 to 2.9 psig range option. — data/raw/CSI_CS456.json · record 0 · spec 31 · dòng 53, 54
- **SDI-12**: ~457 m (1500 ft) / 1 sensor connected to a single port / 60 m (200 ft) / 10 sensors connected to a single port — data/raw/CSI_CS456.json · record 0 · spec 32 · dòng 56, 57, 58, 59
- **RS-232**: 60 m (200 ft) — data/raw/CSI_CS456.json · record 0 · spec 33 · dòng 60
- **Standard & Weighted Nose Cone**: 0.653 cm (0.257 in.) — data/raw/CSI_CS456.json · record 0 · spec 34 · dòng 62
- **NPT Fitting**: 2.72 cm (1.07 in.) — data/raw/CSI_CS456.json · record 0 · spec 35 · dòng 63

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS506

Fuel Moisture Sensor · CSI_CS506

Nguồn catalog: https://www.campbellsci.com/products/cs506

Đại lượng có bằng chứng: Độ ẩm vật liệu cháy.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: 

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS506. CS506 đo độ ẩm vật liệu cháy, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn.

**Ví dụ explanation tiếng Anh**

Exact model match: CS506. CS506 measures fuel moisture, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed.

**Thông số nguồn để đối chiếu**

- **Operating Range**: 0 to 70% moisture content — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 0 · dòng 3
- **Power Supply**: 5 to 18 Vdc — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 1 · dòng 4
- **Enable Voltage**: on at 5 Vdc (> 4 Vdc; maximum 18 Vdc) | off at 0 Vdc (< 1 Vdc) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 2 · dòng 5, 6
- **Current Consumption**: 65 mA (active) | 45 μA (quiescent) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 3 · dòng 7, 8
- **Output Signal**: ±0.7 Vdc square wave (with an output frequency of approximately 31 to 58 kHz) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 4 · dòng 9
- **Dimensions**: 10.16 x 6.35 x 1.91 cm (4 x 2.5 x 0.75 in.) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 5 · dòng 10
- **Weight**: < 0.5 kg (< 1 lb) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 6 · dòng 11
- **0 to 10% Range**: ±1.25% (worst case) | ±0.74% (RMS error) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 7 · dòng 13, 14
- **10 to 20% Range**: ±0.9% (RMS error) | ±2% (worst case) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 8 · dòng 15, 16
- **20 to 30% Range**: ±3.4% (worst case) | ±1.94% (RMS error) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 9 · dòng 17, 18
- **30 to 50% Range**: ±2.27% (RMS error) | ±4.11% (worst case) — data/raw/CS506_Specifications_SplitCells.json · record 0 · spec 10 · dòng 19, 20

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS511

Dissolved Oxygen Sensor · CSI_CS511

Nguồn catalog: https://www.campbellsci.com/products/cs511

Đại lượng có bằng chứng: Oxy hòa tan.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS511. CS511 đo oxy hòa tan, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Operating Temperature Range: 0° to 50°C. Thông số Measurement Range: 0.5 to 50 ppm (for O₂). Thông số Accuracy: ±2%.

**Ví dụ explanation tiếng Anh**

Exact model match: CS511. CS511 measures dissolved oxygen, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Operating Temperature Range: 0° to 50°C. Measurement Range: 0.5 to 50 ppm (for O₂). Accuracy: ±2%.

**Thông số nguồn để đối chiếu**

- **Operating Temperature Range**: 0° to 50°C — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 0 · dòng 3
- **Measurement Range**: 0.5 to 50 ppm (for O₂) — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 1 · dòng 4
- **Accuracy**: ±2% — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 2 · dòng 5
- **Output**: 33 mV ± 9 mV (100% saturation) | < 2 mV (0% saturation) — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 3 · dòng 6, 7
- **Response Time**: 5 min from 100% to 0% oxygen — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 4 · dòng 8
- **Minimum Water Velocity**: 5 cm s⁻¹ (2 in. s⁻¹) across membrane — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 5 · dòng 9
- **Minimum Submersion Depth**: 6.35 cm (2.5 in.) — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 6 · dòng 10
- **Pressure**: 0 to 100 psig — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 7 · dòng 11
- **Temperature Compensation**: Automatic from 4° to 40°C — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 8 · dòng 12
- **Probe Electrolyte**: NaCl + glycerol (prevents freezing) — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 9 · dòng 13
- **Diameter**: 5.72 cm (2.25 in.) — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 10 · dòng 14
- **Height**: 17.78 cm (7 in.) from bottom of sensor to end of cable strain relief — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 11 · dòng 15
- **Shipping Weight**: 0.8 kg (1.75 lb) including sensor and shipping kit — data/raw/CS511_Specifications_SplitCells.json · record 0 · spec 12 · dòng 16

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS610

TDR Soil Moisture Probe · CSI_CS610

Nguồn catalog: https://www.campbellsci.com/products/cs610

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Application / Soil Type: For typical soils; Length: 30 cm (12 in); Diameter: 0.475 cm (0.187 in); Length: 10.8 cm (4.3 in); Width: 7.0 cm (2.8 in); Thickness: 1.9 cm (0.7 in); Cable Type: RG8 low loss; Maximum Soil Bulk Electrical Conductivity: 1.4 dS m⁻¹

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS610. CS610 được phân loại là TDR Soil Moisture Probe. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn.

**Ví dụ explanation tiếng Anh**

Exact model match: CS610. CS610 is classified as a TDR Soil Moisture Probe. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed.

**Thông số nguồn để đối chiếu**

- **Probe Type**: 3-rod TDR Probe — data/raw/CSI_CS610.json · record 0 · spec 0 · dòng 3
- **Application / Soil Type**: For typical soils — data/raw/CSI_CS610.json · record 0 · spec 1 · dòng 4
- **Length**: 30 cm (12 in) — data/raw/CSI_CS610.json · record 0 · spec 2 · dòng 6
- **Diameter**: 0.475 cm (0.187 in) — data/raw/CSI_CS610.json · record 0 · spec 3 · dòng 7
- **Length**: 10.8 cm (4.3 in) — data/raw/CSI_CS610.json · record 0 · spec 4 · dòng 9
- **Width**: 7.0 cm (2.8 in) — data/raw/CSI_CS610.json · record 0 · spec 5 · dòng 10
- **Thickness**: 1.9 cm (0.7 in) — data/raw/CSI_CS610.json · record 0 · spec 6 · dòng 11
- **Cable Type**: RG8 low loss — data/raw/CSI_CS610.json · record 0 · spec 7 · dòng 12
- **Maximum Soil Bulk Electrical Conductivity**: 1.4 dS m⁻¹ — data/raw/CSI_CS610.json · record 0 · spec 8 · dòng 13
- **Maximum Cable Length (measured from the tips of the probe's rods to the reflectometer)**: 25 m (82 ft) — data/raw/CSI_CS610.json · record 0 · spec 9 · dòng 14

**Cần kiểm tra tiếp**

- Chưa xác nhận đại lượng đo trong nguồn; không tự suy ra từ tên nhóm.
- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS616

Soil Moisture, Temperature, and EC Sensor · CSI_CS616

Nguồn catalog: https://www.campbellsci.com/products/cs616-reflectometer

Đại lượng có bằng chứng: Hàm lượng nước thể tích.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS616. CS616 đo hàm lượng nước thể tích, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Lượng nước trong đất giúp đánh giá đất khô/ướt; ngưỡng phù hợp còn phụ thuộc cây và loại đất. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số measurement range: 0% to saturation. Thông số water content accuracy: ±2.5% VWC (using standard calibration with bulk EC of ≤ 0.5 dS m⁻¹, bulk density of ≤ 1.55 g cm⁻³, and measurement range of 0% to 50% VWC). Thông số Operating Temperature Range: 0° to +70°C.

**Ví dụ explanation tiếng Anh**

Exact model match: CS616. CS616 measures volumetric water content, providing readings to monitor conditions before deciding on adjustments. Water content helps assess dry/wet soil; suitable thresholds depend on crops and soil. Installation suitability for your specific use case remains unconfirmed. measurement range: 0% to saturation. water content accuracy: ±2.5% VWC (using standard calibration with bulk EC of ≤ 0.5 dS m⁻¹, bulk density of ≤ 1.55 g cm⁻³, and measurement range of 0% to 50% VWC). Operating Temperature Range: 0° to +70°C.

**Thông số nguồn để đối chiếu**

- **Measurements Made**: Volumetric water content (VWC) of porous media (such as soil) — data/raw/CS616_CS650_CS655.json · record 0 · spec 0 · dòng 3
- **Measurement Range**: 0% to saturation — data/raw/CS616_CS650_CS655.json · record 0 · spec 1 · dòng 4
- **Water Content Accuracy**: ±2.5% VWC (using standard calibration with bulk EC of ≤ 0.5 dS m⁻¹, bulk density of ≤ 1.55 g cm⁻³, and measurement range of 0% to 50% VWC) — data/raw/CS616_CS650_CS655.json · record 0 · spec 2 · dòng 5
- **Required Equipment**: Measurement system — data/raw/CS616_CS650_CS655.json · record 0 · spec 3 · dòng 6
- **Soil Suitability**: Long rods and lower frequency are well-suited for soft soil with low electrical conductivity (< 2 dS/m). — data/raw/CS616_CS650_CS655.json · record 0 · spec 4 · dòng 7
- **Rods**: Not replaceable — data/raw/CS616_CS650_CS655.json · record 0 · spec 5 · dòng 8
- **Sensors**: Not interchangeable — data/raw/CS616_CS650_CS655.json · record 0 · spec 6 · dòng 9
- **Electromagnetic**: CE compliant (Meets EN61326 requirements for protection against electrostatic discharge.) — data/raw/CS616_CS650_CS655.json · record 0 · spec 7 · dòng 11
- **Operating Temperature Range**: 0° to +70°C — data/raw/CS616_CS650_CS655.json · record 0 · spec 8 · dòng 12
- **Probe-to-Probe Variability**: ±0.5% VWC in dry soil, ±1.5% VWC in typical saturated soil — data/raw/CS616_CS650_CS655.json · record 0 · spec 9 · dòng 13
- **Precision**: Better than 0.1% VWC — data/raw/CS616_CS650_CS655.json · record 0 · spec 10 · dòng 14
- **Resolution**: 0.1% VWC — data/raw/CS616_CS650_CS655.json · record 0 · spec 11 · dòng 15
- **Output**: ±0.7 V square wave (with frequency dependent on water content) — data/raw/CS616_CS650_CS655.json · record 0 · spec 12 · dòng 16
- **Power Supply Voltage**: 5 Vdc minimum | 18 Vdc maximum — data/raw/CS616_CS650_CS655.json · record 0 · spec 13 · dòng 24, 25
- **Enable Voltage**: 4 Vdc minimum | 18 Vdc maximum — data/raw/CS616_CS650_CS655.json · record 0 · spec 14 · dòng 26, 27
- **Rod Spacing**: 32 mm (1.3 in.) — data/raw/CS616_CS650_CS655.json · record 0 · spec 15 · dòng 29
- **Rod Diameter**: 3.2 mm (0.13 in.) — data/raw/CS616_CS650_CS655.json · record 0 · spec 16 · dòng 31
- **Rod Length**: 300 mm (11.8 in.) — data/raw/CS616_CS650_CS655.json · record 0 · spec 17 · dòng 32
- **Probe Head Dimensions**: 85 x 63 x 18 mm (3.3 x 2.5 x 0.7 in.) — data/raw/CS616_CS650_CS655.json · record 0 · spec 18 · dòng 33
- **Cable Weight**: 35 g per m (0.38 oz per ft) — data/raw/CS616_CS650_CS655.json · record 0 · spec 19 · dòng 34
- **Weight / Probe Weight**: 280 g (9.9 oz) without cable — data/raw/CS616_CS650_CS655.json · record 0 · spec 20 · dòng 35
- **Current Drain**: 65 mA @ 12 Vdc (when enabled) | 45 μA (quiescent typical) — data/raw/CS616_CS650_CS655.json · record 0 · spec 21 · dòng 40, 41

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS650

Soil Moisture, Temperature, and EC Sensor · CSI_CS650

Nguồn catalog: https://www.campbellsci.com/products/cs650

Đại lượng có bằng chứng: Nhiệt độ đất, Hàm lượng nước thể tích, Độ dẫn điện của đất, Hằng số điện môi.

Giao thức được ghi nhận: RS-232 (supported), SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS650. CS650 đo nhiệt độ đất, hàm lượng nước thể tích, độ dẫn điện của đất, hằng số điện môi, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Lượng nước trong đất giúp đánh giá đất khô/ướt; ngưỡng phù hợp còn phụ thuộc cây và loại đất. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, SDI-12. Thông số Operating Temperature Range: -50° to +70°C. Thông số electrical conductivity accuracy: ±(5% of reading + 0.05 dS/m). Thông số relative dielectric permittivity accuracy: ±(2% of reading + 0.6) from 1 to 40 for solution EC ≤ 3 dS/m | ±1.4 (from 40 to 81 for solution EC ≤ 1 dS/m).

**Ví dụ explanation tiếng Anh**

Exact model match: CS650. CS650 measures soil temperature, volumetric water content, soil electrical conductivity, dielectric permittivity, providing readings to monitor conditions before deciding on adjustments. Water content helps assess dry/wet soil; suitable thresholds depend on crops and soil. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, SDI-12. Operating Temperature Range: -50° to +70°C. electrical conductivity accuracy: ±(5% of reading + 0.05 dS/m). relative dielectric permittivity accuracy: ±(2% of reading + 0.6) from 1 to 40 for solution EC ≤ 3 dS/m | ±1.4 (from 40 to 81 for solution EC ≤ 1 dS/m).

**Thông số nguồn để đối chiếu**

- **Measurements Made**: Soil electrical conductivity (EC), relative dielectric permittivity, volumetric water content (VWC), soil temperature — data/raw/CS616_CS650_CS655.json · record 1 · spec 0 · dòng 3
- **Required Equipment**: Measurement system — data/raw/CS616_CS650_CS655.json · record 1 · spec 1 · dòng 6
- **Soil Suitability**: Long rods with large sensing volume (> 6 L) are suitable for soils with low to moderate electrical conductivity. — data/raw/CS616_CS650_CS655.json · record 1 · spec 2 · dòng 7
- **Rods**: Not replaceable — data/raw/CS616_CS650_CS655.json · record 1 · spec 3 · dòng 8
- **Sensors**: Not interchangeable — data/raw/CS616_CS650_CS655.json · record 1 · spec 4 · dòng 9
- **Sensing Volume**: 7800 cm³ (~7.5 cm radius around each probe rod and 4.5 cm beyond the end of the rods) — data/raw/CS616_CS650_CS655.json · record 1 · spec 5 · dòng 10
- **Electromagnetic**: CE compliant; Meets EN61326 requirements for protection against electrostatic discharge and surge. — data/raw/CS616_CS650_CS655.json · record 1 · spec 6 · dòng 11
- **Operating Temperature Range**: -50° to +70°C — data/raw/CS616_CS650_CS655.json · record 1 · spec 7 · dòng 12
- **Sensor Output**: SDI-12 | serial RS-232 — data/raw/CS616_CS650_CS655.json · record 1 · spec 8 · dòng 17, 18
- **Warm-up Time**: 3 s — data/raw/CS616_CS650_CS655.json · record 1 · spec 9 · dòng 19
- **Measurement Time**: 3 ms to measure | 600 ms to complete SDI-12 command — data/raw/CS616_CS650_CS655.json · record 1 · spec 10 · dòng 20, 21
- **Power Supply Requirements**: 6 to 18 Vdc | Must be able to supply 45 mA @ 12 Vdc. — data/raw/CS616_CS650_CS655.json · record 1 · spec 11 · dòng 22, 23
- **Maximum Cable Length**: 610 m (2000 ft) combined length for up to 25 sensors connected to the same data logger control port — data/raw/CS616_CS650_CS655.json · record 1 · spec 12 · dòng 28
- **Rod Spacing**: 32 mm (1.3 in.) — data/raw/CS616_CS650_CS655.json · record 1 · spec 13 · dòng 29
- **Ingress Protection Rating**: IP68 — data/raw/CS616_CS650_CS655.json · record 1 · spec 14 · dòng 30
- **Rod Diameter**: 3.2 mm (0.13 in.) — data/raw/CS616_CS650_CS655.json · record 1 · spec 15 · dòng 31
- **Rod Length**: 300 mm (11.8 in.) — data/raw/CS616_CS650_CS655.json · record 1 · spec 16 · dòng 32
- **Probe Head Dimensions**: 85 x 63 x 18 mm (3.3 x 2.5 x 0.7 in.) — data/raw/CS616_CS650_CS655.json · record 1 · spec 17 · dòng 33
- **Cable Weight**: 35 g per m (0.38 oz per ft) — data/raw/CS616_CS650_CS655.json · record 1 · spec 18 · dòng 34
- **Weight / Probe Weight**: 280 g (9.9 oz) without cable — data/raw/CS616_CS650_CS655.json · record 1 · spec 19 · dòng 35
- **Active (3 ms)**: 80 mA (@ 6 Vdc) | 45 mA typical (@ 12 Vdc) | 35 mA (@ 18 Vdc) — data/raw/CS616_CS650_CS655.json · record 1 · spec 20 · dòng 37, 38, 39
- **Quiescent**: 135 µA typical (@ 12 Vdc) — data/raw/CS616_CS650_CS655.json · record 1 · spec 21 · dòng 42
- **Range for Solution EC**: 0 to 3 dS/m — data/raw/CS616_CS650_CS655.json · record 1 · spec 22 · dòng 44
- **Range for Bulk EC**: 0 to 3 dS/m — data/raw/CS616_CS650_CS655.json · record 1 · spec 23 · dòng 45
- **Accuracy**: ±(5% of reading + 0.05 dS/m) — data/raw/CS616_CS650_CS655.json · record 1 · spec 24 · dòng 46
- **Precision**: 0.5% of BEC — data/raw/CS616_CS650_CS655.json · record 1 · spec 25 · dòng 47
- **Range**: 1 to 81 — data/raw/CS616_CS650_CS655.json · record 1 · spec 26 · dòng 49
- **Accuracy**: ±(2% of reading + 0.6) from 1 to 40 for solution EC ≤ 3 dS/m | ±1.4 (from 40 to 81 for solution EC ≤ 1 dS/m) — data/raw/CS616_CS650_CS655.json · record 1 · spec 27 · dòng 50, 51
- **Precision**: < 0.02 — data/raw/CS616_CS650_CS655.json · record 1 · spec 28 · dòng 52
- **Range**: 0 to 100% (with M4 command) — data/raw/CS616_CS650_CS655.json · record 1 · spec 29 · dòng 54
- **Water Content Accuracy**: ±3% (typical with factory VWC model) where solution EC < 3 dS/m | ±1% (with soil-specific calibration) — data/raw/CS616_CS650_CS655.json · record 1 · spec 30 · dòng 55, 56
- **Precision**: < 0.05% — data/raw/CS616_CS650_CS655.json · record 1 · spec 31 · dòng 57
- **Range**: -50° to +70°C — data/raw/CS616_CS650_CS655.json · record 1 · spec 32 · dòng 59
- **Resolution**: 0.001°C — data/raw/CS616_CS650_CS655.json · record 1 · spec 33 · dòng 60
- **Accuracy**: ±0.1°C (for typical soil temperatures [0 to 40°C] when probe body is buried in soil) — data/raw/CS616_CS650_CS655.json · record 1 · spec 34 · dòng 61
- **Precision**: ±0.5°C (for full temperature range) — data/raw/CS616_CS650_CS655.json · record 1 · spec 35 · dòng 62
- **Precision**: ±0.02°C — data/raw/CS616_CS650_CS655.json · record 1 · spec 36 · dòng 63

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CS655

Soil Moisture, Temperature, and EC Sensor · CSI_CS655

Nguồn catalog: https://www.campbellsci.com/products/cs655

Đại lượng có bằng chứng: Nhiệt độ đất, Hàm lượng nước thể tích, Độ dẫn điện của đất, Hằng số điện môi.

Giao thức được ghi nhận: RS-232 (supported), SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model CS655. CS655 đo nhiệt độ đất, hàm lượng nước thể tích, độ dẫn điện của đất, hằng số điện môi, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Lượng nước trong đất giúp đánh giá đất khô/ướt; ngưỡng phù hợp còn phụ thuộc cây và loại đất. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232, SDI-12. Thông số Operating Temperature Range: -50° to +70°C. Thông số electrical conductivity accuracy: ±(5% of reading + 0.05 dS/m). Thông số relative dielectric permittivity accuracy: ±(3% of reading + 0.8) from 1 to 40 for solution EC ≤ 8 dS/m | ±2 (from 40 to 81 for solution EC ≤ 2.8 dS/m).

**Ví dụ explanation tiếng Anh**

Exact model match: CS655. CS655 measures soil temperature, volumetric water content, soil electrical conductivity, dielectric permittivity, providing readings to monitor conditions before deciding on adjustments. Water content helps assess dry/wet soil; suitable thresholds depend on crops and soil. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232, SDI-12. Operating Temperature Range: -50° to +70°C. electrical conductivity accuracy: ±(5% of reading + 0.05 dS/m). relative dielectric permittivity accuracy: ±(3% of reading + 0.8) from 1 to 40 for solution EC ≤ 8 dS/m | ±2 (from 40 to 81 for solution EC ≤ 2.8 dS/m).

**Thông số nguồn để đối chiếu**

- **Measurements Made**: Soil electrical conductivity (EC), relative dielectric permittivity, volumetric water content (VWC), soil temperature — data/raw/CS616_CS650_CS655.json · record 2 · spec 0 · dòng 3
- **Required Equipment**: Measurement system — data/raw/CS616_CS650_CS655.json · record 2 · spec 1 · dòng 6
- **Soil Suitability**: Short rods are easy to install in hard soil. Suitable for soils with higher electrical conductivity. — data/raw/CS616_CS650_CS655.json · record 2 · spec 2 · dòng 7
- **Rods**: Not replaceable — data/raw/CS616_CS650_CS655.json · record 2 · spec 3 · dòng 8
- **Sensors**: Not interchangeable — data/raw/CS616_CS650_CS655.json · record 2 · spec 4 · dòng 9
- **Sensing Volume**: 3600 cm³ (~7.5 cm radius around each probe rod and 4.5 cm beyond the end of the rods) — data/raw/CS616_CS650_CS655.json · record 2 · spec 5 · dòng 10
- **Electromagnetic**: CE compliant (Meets EN61326 requirements for protection against electrostatic discharge and surge.) — data/raw/CS616_CS650_CS655.json · record 2 · spec 6 · dòng 11
- **Operating Temperature Range**: -50° to +70°C — data/raw/CS616_CS650_CS655.json · record 2 · spec 7 · dòng 12
- **Sensor Output**: SDI-12 | serial RS-232 — data/raw/CS616_CS650_CS655.json · record 2 · spec 8 · dòng 17, 18
- **Warm-up Time**: 3 s — data/raw/CS616_CS650_CS655.json · record 2 · spec 9 · dòng 19
- **Measurement Time**: 3 ms to measure | 600 ms to complete SDI-12 command — data/raw/CS616_CS650_CS655.json · record 2 · spec 10 · dòng 20, 21
- **Power Supply Requirements**: 6 to 18 Vdc | Must be able to supply 45 mA @ 12 Vdc. — data/raw/CS616_CS650_CS655.json · record 2 · spec 11 · dòng 22, 23
- **Maximum Cable Length**: 610 m (2000 ft) combined length for up to 25 sensors connected to the same data logger control port — data/raw/CS616_CS650_CS655.json · record 2 · spec 12 · dòng 28
- **Rod Spacing**: 32 mm (1.3 in.) — data/raw/CS616_CS650_CS655.json · record 2 · spec 13 · dòng 29
- **Ingress Protection Rating**: IP68 — data/raw/CS616_CS650_CS655.json · record 2 · spec 14 · dòng 30
- **Rod Diameter**: 3.2 mm (0.13 in.) — data/raw/CS616_CS650_CS655.json · record 2 · spec 15 · dòng 31
- **Rod Length**: 120 mm (4.7 in.) — data/raw/CS616_CS650_CS655.json · record 2 · spec 16 · dòng 32
- **Probe Head Dimensions**: 85 x 63 x 18 mm (3.3 x 2.5 x 0.7 in.) — data/raw/CS616_CS650_CS655.json · record 2 · spec 17 · dòng 33
- **Cable Weight**: 35 g per m (0.38 oz per ft) — data/raw/CS616_CS650_CS655.json · record 2 · spec 18 · dòng 34
- **Weight / Probe Weight**: 240 g (8.5 oz) without cable — data/raw/CS616_CS650_CS655.json · record 2 · spec 19 · dòng 35
- **Active (3 ms)**: 80 mA (@ 6 Vdc) | 45 mA typical (@ 12 Vdc) | 35 mA (@ 18 Vdc) — data/raw/CS616_CS650_CS655.json · record 2 · spec 20 · dòng 37, 38, 39
- **Quiescent**: 135 µA typical (@ 12 Vdc) — data/raw/CS616_CS650_CS655.json · record 2 · spec 21 · dòng 42
- **Range for Solution EC**: 0 to 8 dS/m — data/raw/CS616_CS650_CS655.json · record 2 · spec 22 · dòng 44
- **Range for Bulk EC**: 0 to 8 dS/m — data/raw/CS616_CS650_CS655.json · record 2 · spec 23 · dòng 45
- **Accuracy**: ±(5% of reading + 0.05 dS/m) — data/raw/CS616_CS650_CS655.json · record 2 · spec 24 · dòng 46
- **Precision**: 0.5% of BEC — data/raw/CS616_CS650_CS655.json · record 2 · spec 25 · dòng 47
- **Range**: 1 to 81 — data/raw/CS616_CS650_CS655.json · record 2 · spec 26 · dòng 49
- **Accuracy**: ±(3% of reading + 0.8) from 1 to 40 for solution EC ≤ 8 dS/m | ±2 (from 40 to 81 for solution EC ≤ 2.8 dS/m) — data/raw/CS616_CS650_CS655.json · record 2 · spec 27 · dòng 50, 51
- **Precision**: < 0.02 — data/raw/CS616_CS650_CS655.json · record 2 · spec 28 · dòng 52
- **Range**: 0 to 100% (with M4 command) — data/raw/CS616_CS650_CS655.json · record 2 · spec 29 · dòng 54
- **Water Content Accuracy**: ±3% (typical with factory VWC model) where solution EC < 10 dS/m | ±1% (with soil-specific calibration) where solution EC < 3 dS/m — data/raw/CS616_CS650_CS655.json · record 2 · spec 30 · dòng 55, 56
- **Precision**: < 0.05% — data/raw/CS616_CS650_CS655.json · record 2 · spec 31 · dòng 57
- **Range**: -50° to +70°C — data/raw/CS616_CS650_CS655.json · record 2 · spec 32 · dòng 59
- **Resolution**: 0.001°C — data/raw/CS616_CS650_CS655.json · record 2 · spec 33 · dòng 60
- **Accuracy**: ±0.1°C (for typical soil temperatures [0 to 40°C] when probe body is buried in soil) — data/raw/CS616_CS650_CS655.json · record 2 · spec 34 · dòng 61
- **Precision**: ±0.5°C (for full temperature range) — data/raw/CS616_CS650_CS655.json · record 2 · spec 35 · dòng 62
- **Precision**: ±0.02°C — data/raw/CS616_CS650_CS655.json · record 2 · spec 36 · dòng 63

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## CSAT3B-NC

Wind Speed and Wind Direction Sensor · CSI_CSAT3B_NC

Nguồn catalog: https://www.campbellsci.com/products/csat3b

Đại lượng có bằng chứng: Độ ẩm tương đối, Tốc độ gió, Hướng gió.

Giao thức được ghi nhận: ASCII (supported), CPI (supported), RS-485 (supported), USB (supported).

Cấu hình model: Configuration Suffix: NC; Carrying Case: No Carrying Case; Filter Bandwidths: 5, 10, or 25 Hz; Anemometer Head Weight: 1.45 kg (3.2 lb); Anemometer Dimensions: 60.64 x 12.2 x 43.0 cm (23.87 x 4.8 x 16.9 in.); -NOTE-: Accuracy specifications assume the following: | -40° to +50°C operating range | Wind speeds < 30 m s⁻¹ | Wind angles between ±170°; ux, uy: 1 mm s⁻¹ rms; uz: 0.5 mm s⁻¹ rms; Filtered Output (data-logger-prompted or unprompted to PC): 395 ms (with 10 Hz bandwidth filter) | 155 ms (with 25 Hz bandwidth filter) | 795 ms (with 5 Hz bandwidth filter); -NOTE-: Used for data-logger-based data acquisition.; Cable Length: 7.6 m (25 ft) max (@ 10 µs bit period) | 76 m (250 ft) max (@ 1 ms bit period); Address Range: 1 to 14; Bus Clocks per Sample: ~200; -NOTE-: Used for data-logger-based data acquisition.; Baud Rate: 50 kbps to 1 Mbps; Cable Length: 122 m (400 ft) max (@ 250 kbps) | 15 m (50 ft) max (@ 1 Mbps) | 853 m (2800 ft) max (@ 50 kbps); Address Range: 1 to 120; Bus Clocks per Sample: ~300; -NOTE-: Used for configuration or PC-based data acquisition.; Baud Rate: 9.6 kbps to 115.2 kbps; Cable Length: 610 m (2000 ft) max (@ 9.6 kbps) | 305 m (1000 ft) max (@ 115.2 kbps); Bus Clocks per Sample: ~500 (ASCII formatted); -NOTE-: Used for configuration or PC-based data acquisition.; Cable Length: 5 m (16.4 ft) maximum

**Ví dụ explanation tiếng Việt**

Khớp chính xác model CSAT3B-NC. CSAT3B-NC đo độ ẩm tương đối, tốc độ gió, hướng gió, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Số đo gió hỗ trợ đánh giá điều kiện tại điểm lắp đặt. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CPI, RS-485, USB. Thông số operating temperature range: -40 to +50°C (equivalent to 305 to 368 m s⁻¹ in speed of sound). Thông số Inclinometer Accuracy: ±1°. Thông số relative humidity accuracy: ±7% (over 90 to 100% range) | ±7% (over 0 to 10% range) | ±3% (over 10 to 90% range).

**Ví dụ explanation tiếng Anh**

Exact model match: CSAT3B-NC. CSAT3B-NC measures relative humidity, wind speed, wind direction, providing readings to monitor conditions before deciding on adjustments. Wind readings support assessing conditions at the installation point. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CPI, RS-485, USB. operating temperature range: -40 to +50°C (equivalent to 305 to 368 m s⁻¹ in speed of sound). Inclinometer Accuracy: ±1°. relative humidity accuracy: ±7% (over 90 to 100% range) | ±7% (over 0 to 10% range) | ±3% (over 10 to 90% range).

**Thông số nguồn để đối chiếu**

- **Configuration Suffix**: NC — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 0 · dòng 3
- **Carrying Case**: No Carrying Case — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 1 · dòng 4
- **Sensor**: 3-dimensional sonic anemometer — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 2 · dòng 6
- **Measurement Description**: Highest-quality wind speed and direction — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 3 · dòng 7
- **Operating Temperature Range**: -40 to +50°C (equivalent to 305 to 368 m s⁻¹ in speed of sound) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 4 · dòng 8
- **Outputs**: ux, uy, uz, Ts | ux, uy, uz are wind components referenced to the anemometer axes | Ts is sonic temperature in degrees Celsius. — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 5 · dòng 9, 10, 11
- **Signal Type/Output**: SDM, CPI, USB, RS-485 — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 6 · dòng 12
- **Speed of Sound**: Determined from three acoustic paths. | Corrected for crosswind effects. — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 7 · dòng 13, 14
- **Wind Direction Range**: 2.5 to 357.5° in CSAT3B coordinate system | 0 to 360° customized — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 8 · dòng 15, 16
- **Range**: ±65 m s⁻¹ (full-scale wind) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 9 · dòng 17
- **Filter Bandwidths**: 5, 10, or 25 Hz — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 10 · dòng 18
- **Measurement Path Length**: 10.0 cm (3.9 in.) vertical | 5.8 cm (2.3 in.) horizontal — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 11 · dòng 19, 20
- **Transducer Angle from Horizontal**: 60 degrees — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 12 · dòng 21
- **Ingress Protection**: IP67 — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 13 · dòng 22
- **Transducer Diameter**: 0.64 cm (0.25 in.) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 14 · dòng 23
- **Transducer Mounting Arm Diameter**: 0.84 cm (0.33 in.) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 15 · dòng 24
- **Support Arm Diameter**: 1.59 cm (0.63 in.) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 16 · dòng 25
- **Anemometer Head Weight**: 1.45 kg (3.2 lb) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 17 · dòng 26
- **Anemometer Dimensions**: 60.64 x 12.2 x 43.0 cm (23.87 x 4.8 x 16.9 in.) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 18 · dòng 27
- **-NOTE-**: Accuracy specifications assume the following: | -40° to +50°C operating range | Wind speeds < 30 m s⁻¹ | Wind angles between ±170° — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 19 · dòng 29, 30, 31, 32
- **Maximum Offset Error**: < ±8.0 cm s⁻¹ (ux, uy) | < ±4.0 cm s⁻¹ (uz) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 20 · dòng 33, 34
- **Maximum Gain Error**: < ±3% of reading (wind vector within ±10° of horizontal) | < ±2% of reading (wind vector within ±5° of horizontal) | < ±6% of reading (wind vector within ±20° of horizontal) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 21 · dòng 35, 36, 37
- **ux, uy**: 1 mm s⁻¹ rms — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 22 · dòng 39
- **uz**: 0.5 mm s⁻¹ rms — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 23 · dòng 40
- **Ts**: 0.002°C RMS (at 25°C) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 24 · dòng 41
- **Wind Direction**: < 0.058° (ux = uy ≤ 1 m s⁻¹) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 25 · dòng 42
- **Data Logger Triggered**: 1 to 100 Hz — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 26 · dòng 44
- **Unprompted Output (to PC)**: 10, 20, 50, or 100 Hz — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 27 · dòng 45
- **Internal Self-Trigger Rate**: 100 Hz — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 28 · dòng 46
- **Data Logger Triggered (no filter)**: 1 trigger period (1 scan interval) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 29 · dòng 48
- **Unprompted Output (no filter)**: 10 ms — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 30 · dòng 49
- **Filtered Output (data-logger-prompted or unprompted to PC)**: 395 ms (with 10 Hz bandwidth filter) | 155 ms (with 25 Hz bandwidth filter) | 795 ms (with 5 Hz bandwidth filter) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 31 · dòng 50, 51, 52
- **Update Rate**: 2 Hz — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 32 · dòng 55
- **Inclinometer Accuracy**: ±1° — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 33 · dòng 56
- **Relative Humidity Accuracy**: ±7% (over 90 to 100% range) | ±7% (over 0 to 10% range) | ±3% (over 10 to 90% range) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 34 · dòng 57, 58, 59
- **Board Temperature Accuracy**: ±2°C — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 35 · dòng 60
- **-NOTE-**: Used for data-logger-based data acquisition. — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 36 · dòng 62
- **Bit Period**: 10 µs to 1 ms — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 37 · dòng 63
- **Cable Length**: 7.6 m (25 ft) max (@ 10 µs bit period) | 76 m (250 ft) max (@ 1 ms bit period) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 38 · dòng 64, 65
- **Address Range**: 1 to 14 — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 39 · dòng 66
- **Bus Clocks per Sample**: ~200 — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 40 · dòng 67
- **-NOTE-**: Used for data-logger-based data acquisition. — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 41 · dòng 69
- **Baud Rate**: 50 kbps to 1 Mbps — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 42 · dòng 70
- **Cable Length**: 122 m (400 ft) max (@ 250 kbps) | 15 m (50 ft) max (@ 1 Mbps) | 853 m (2800 ft) max (@ 50 kbps) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 43 · dòng 71, 72, 73
- **Address Range**: 1 to 120 — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 44 · dòng 74
- **Bus Clocks per Sample**: ~300 — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 45 · dòng 75
- **-NOTE-**: Used for configuration or PC-based data acquisition. — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 46 · dòng 77
- **Baud Rate**: 9.6 kbps to 115.2 kbps — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 47 · dòng 78
- **Cable Length**: 610 m (2000 ft) max (@ 9.6 kbps) | 305 m (1000 ft) max (@ 115.2 kbps) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 48 · dòng 79, 80
- **Bus Clocks per Sample**: ~500 (ASCII formatted) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 49 · dòng 81
- **-NOTE-**: Used for configuration or PC-based data acquisition. — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 50 · dòng 83
- **Connection Speed**: USB 2.0 full speed 12 Mbps — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 51 · dòng 84
- **Cable Length**: 5 m (16.4 ft) maximum — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 52 · dòng 85
- **Voltage Supply / Anemometer Voltage Requirement**: 9.5 to 32 Vdc — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 53 · dòng 87
- **Current at 10 Hz Measurement Rate**: 65 mA (@ 24 Vdc) | 110 mA (@ 12 Vdc) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 54 · dòng 88, 89
- **Current at 100 Hz Measurement Rate**: 80 mA (@ 24 Vdc) | 145 mA (@ 12 Vdc) — data/raw/CSAT3B_CSAT3BH.json · record 0 · spec 55 · dòng 90, 91

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## EE181

Air Temperature and Relative Humidity Sensor · CSI_EE181

Nguồn catalog: https://www.campbellsci.com/products/ee181-l

Đại lượng có bằng chứng: Nhiệt độ không khí, Độ ẩm tương đối.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model EE181. EE181 đo nhiệt độ không khí, độ ẩm tương đối, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Operating Temperature Range: -40° to +60°C. Thông số Measurement Range: -40° to +60°C. Thông số air temperature accuracy: ±0.2°C (at +23°C).

**Ví dụ explanation tiếng Anh**

Exact model match: EE181. EE181 measures air temperature, relative humidity, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Operating Temperature Range: -40° to +60°C. Measurement Range: -40° to +60°C. air temperature accuracy: ±0.2°C (at +23°C).

**Thông số nguồn để đối chiếu**

- **Measurement Description**: Temperature | relative humidity — data/raw/EE181.json · record 0 · spec 0 · dòng 3, 4
- **Signal Type/Output**: Analog voltage — data/raw/EE181.json · record 0 · spec 1 · dòng 5
- **Supply Voltage**: 7 to 30 Vdc | typically powered by the datalogger’s 12 V supply — data/raw/EE181.json · record 0 · spec 2 · dòng 6, 7
- **Average Current Consumption**: < 1.2 mA — data/raw/EE181.json · record 0 · spec 3 · dòng 8
- **Filter Description**: 30 μm pore size | stainless-steel mesh — data/raw/EE181.json · record 0 · spec 4 · dòng 9, 10
- **Startup Time**: 2 s — data/raw/EE181.json · record 0 · spec 5 · dòng 11
- **Housing Body Material**: Plastic — data/raw/EE181.json · record 0 · spec 6 · dòng 12
- **Housing Classification**: IP65 — data/raw/EE181.json · record 0 · spec 7 · dòng 13
- **Field Replaceable Chip or Recalibrate**: Recalibrate — data/raw/EE181.json · record 0 · spec 8 · dòng 14
- **Operating Temperature Range**: -40° to +60°C — data/raw/EE181.json · record 0 · spec 9 · dòng 15
- **Sensor Diameter**: 2.1 cm (0.83 in.) — data/raw/EE181.json · record 0 · spec 10 · dòng 16
- **Length**: 16.0 cm (6.3 in.) — data/raw/EE181.json · record 0 · spec 11 · dòng 17
- **Weight**: 290 g (10.2 oz) with 5 m cable — data/raw/EE181.json · record 0 · spec 12 · dòng 18
- **Sensing Element**: 1000 Ω Platinum Resistance Thermometer (PRT) — data/raw/EE181.json · record 0 · spec 13 · dòng 20
- **Measurement Range**: -40° to +60°C — data/raw/EE181.json · record 0 · spec 14 · dòng 21
- **Storage Temperature Range**: -40° to +80°C — data/raw/EE181.json · record 0 · spec 15 · dòng 22
- **Output Signal Range**: 0 to 1 Vdc — data/raw/EE181.json · record 0 · spec 16 · dòng 23
- **Accuracy**: ±0.2°C (at +23°C) — data/raw/EE181.json · record 0 · spec 17 · dòng 24
- **Sensing Element**: Capacitance — data/raw/EE181.json · record 0 · spec 18 · dòng 26
- **Measurement Range**: 0 to 100% RH (non-condensing) — data/raw/EE181.json · record 0 · spec 19 · dòng 27
- **Output Signal Range**: 0 to 1 Vdc — data/raw/EE181.json · record 0 · spec 20 · dòng 28
- **Temperature Dependence**: Typically 0.03% RH/°C — data/raw/EE181.json · record 0 · spec 21 · dòng 29
- **Accuracy**: ± (1.5 + 0.015 • RH reading) % RH (at -40° to +60°C) | ± (1.4 + 0.01 • RH reading) % RH (at -25° to +60°C) | -NOTE- Accuracy specifications include hysteresis, non-linearity, and repeatability. | ±(1.3 + 0.003 • RH reading) % RH (at -15° to +40°C, 0 to 90% RH) | ± 2.3% RH (at -15° to +40°C, 90 to 100% RH) — data/raw/EE181.json · record 0 · spec 22 · dòng 30, 31, 32, 33, 34

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## HFP01

Heat Flux Plate · CSI_HFP01

Nguồn catalog: https://www.campbellsci.com/products/hfp01

Đại lượng có bằng chứng: Thông lượng nhiệt đất.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Sensor Type: Thermopile; Expected Typical Accuracy: Within -15% to +5% in most common soils (12 hour totals)

**Ví dụ explanation tiếng Việt**

Khớp chính xác model HFP01. HFP01 đo thông lượng nhiệt đất, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Measurement Range: ±2000 W m⁻². Thông số expected typical accuracy: Within -15% to +5% in most common soils (12 hour totals).

**Ví dụ explanation tiếng Anh**

Exact model match: HFP01. HFP01 measures soil heat flux, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Measurement Range: ±2000 W m⁻². expected typical accuracy: Within -15% to +5% in most common soils (12 hour totals).

**Thông số nguồn để đối chiếu**

- **Sensor Type**: Thermopile — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 0 · dòng 3
- **Sensitivity**: 50 μV W⁻¹ m⁻² (nominal) — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 1 · dòng 4
- **Nominal Resistance**: 2 Ω — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 2 · dòng 5
- **Temperature Range**: -30° to +70°C — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 3 · dòng 6
- **Sensor Thermal Resistance**: < 6.25 x 10⁻³ K m² W⁻¹ — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 4 · dòng 7
- **Measurement Range**: ±2000 W m⁻² — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 5 · dòng 8
- **Expected Typical Accuracy**: Within -15% to +5% in most common soils (12 hour totals) — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 6 · dòng 9
- **Plate Diameter**: 80 mm (3.15 in.) — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 7 · dòng 16
- **Plate Thickness**: 5 mm (0.20 in.) — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 8 · dòng 17
- **Weight**: 200 g (7.05 oz) without cable — data/raw/HFP01_HFP01SC_Specifications_SplitCells.json · record 0 · spec 9 · dòng 18

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## HMP60

Air Temperature and Relative Humidity Sensor · CSI_HMP60

Nguồn catalog: https://www.campbellsci.com/products/hmp60

Đại lượng có bằng chứng: Nhiệt độ không khí, Độ ẩm tương đối.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Sensing Element: Vaisala’s INTERCAP capacitive chip; Measurement Range: 0 to 100% RH (non-condensing); Sensing Element: 1000 ohm Platinum Resistance Thermometer (PRT); Measurement Range: -40° to +60°C

**Ví dụ explanation tiếng Việt**

Khớp chính xác model HMP60. HMP60 đo nhiệt độ không khí, độ ẩm tương đối, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số relative humidity measurement range: 0 to 100% RH (non-condensing). Thông số typical accuracy at 40 to 0 c: ±5% (0 to 90% RH)
±7% (90 to 100% RH). Thông số typical accuracy at 0 to 40 c: ±3% (0 to 90% RH)
±5% (90 to 100% RH).

**Ví dụ explanation tiếng Anh**

Exact model match: HMP60. HMP60 measures air temperature, relative humidity, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. relative humidity measurement range: 0 to 100% RH (non-condensing). typical accuracy at 40 to 0 c: ±5% (0 to 90% RH)
±7% (90 to 100% RH). typical accuracy at 0 to 40 c: ±3% (0 to 90% RH)
±5% (90 to 100% RH).

**Thông số nguồn để đối chiếu**

- **Supply Voltage**: 5 to 28 Vdc / typically powered by datalogger’s 12 V supply — data/raw/CSI_HMP60.json · record 0 · spec 0 · dòng 3, 4
- **Current Consumption**: 1 mA (typical) / 5 mA (maximum) — data/raw/CSI_HMP60.json · record 0 · spec 1 · dòng 5, 6
- **Filter Description**: 0.2 µm Teflon membrane — data/raw/CSI_HMP60.json · record 0 · spec 2 · dòng 7
- **Settling Time**: 1 s — data/raw/CSI_HMP60.json · record 0 · spec 3 · dòng 8
- **Housing Classification**: IP65 — data/raw/CSI_HMP60.json · record 0 · spec 4 · dòng 9
- **Housing Material**: AISI 316 stainless steel — data/raw/CSI_HMP60.json · record 0 · spec 5 · dòng 10
- **Filter Cap Material**: Chrome-coated ABS plastic — data/raw/CSI_HMP60.json · record 0 · spec 6 · dòng 11
- **Field-Replaceable Chip or Recalibrate**: Field-replaceable chip (RH only) — data/raw/CSI_HMP60.json · record 0 · spec 7 · dòng 12
- **Sensor Diameter**: 1.2 cm (0.5 in.) — data/raw/CSI_HMP60.json · record 0 · spec 8 · dòng 13
- **Filter Diameter**: 1.2 cm (0.5 in.) — data/raw/CSI_HMP60.json · record 0 · spec 9 · dòng 14
- **Length**: 7.1 cm (2.8 in.) — data/raw/CSI_HMP60.json · record 0 · spec 10 · dòng 15
- **Weight**: 0.05 kg (0.1 lb) with 1.83 m (6 ft) cable — data/raw/CSI_HMP60.json · record 0 · spec 11 · dòng 16
- **Sensing Element**: Vaisala’s INTERCAP capacitive chip — data/raw/CSI_HMP60.json · record 0 · spec 12 · dòng 18
- **Measurement Range**: 0 to 100% RH (non-condensing) — data/raw/CSI_HMP60.json · record 0 · spec 13 · dòng 19
- **Typical Accuracy at -40° to 0°C**: ±5% (0 to 90% RH) / ±7% (90 to 100% RH) — data/raw/CSI_HMP60.json · record 0 · spec 14 · dòng 20, 21
- **Typical Accuracy at 0° to 40°C**: ±3% (0 to 90% RH) / ±5% (90 to 100% RH) — data/raw/CSI_HMP60.json · record 0 · spec 15 · dòng 22, 23
- **Typical Accuracy at 40° to 60°C**: ±7% (90 to 100% RH) / ±5% (0 to 90% RH) — data/raw/CSI_HMP60.json · record 0 · spec 16 · dòng 24, 25
- **Output Signal Range**: 0 to 1 Vdc — data/raw/CSI_HMP60.json · record 0 · spec 17 · dòng 26
- **Sensing Element**: 1000 ohm Platinum Resistance Thermometer (PRT) — data/raw/CSI_HMP60.json · record 0 · spec 18 · dòng 28
- **Measurement Range**: -40° to +60°C — data/raw/CSI_HMP60.json · record 0 · spec 19 · dòng 29
- **Accuracy**: ±0.6°C — data/raw/CSI_HMP60.json · record 0 · spec 20 · dòng 30
- **Output Signal Range**: 0 to 1 Vdc — data/raw/CSI_HMP60.json · record 0 · spec 21 · dòng 31

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## HS2-12

Handheld Soil Moisture Meter · CSI_HS2_12

Nguồn catalog: https://www.campbellsci.com/products/hs2

Đại lượng có bằng chứng: Hàm lượng nước thể tích.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Configuration: CS659 Sensor & Rods; Weight: 340 g (12 oz); -NOTE-: The CS659 and CS658 cannot share rods.; Water Content Accuracy: 3% typical (Accuracy assumes solution EC of < 6.5 dS/m when using the CS659 12-cm probe.); Volumetric Water Content Resolution: < 0.05%; Volumetric Water Content Range: 0% to 50% VWC; Cable Type: Spiral; Cable Length: 250 cm (98 in.) extended; Rod Diameter: 5 mm (0.14 in.); Rod Length: 120 mm (4.7 in.) for the CS659 12-cm probe; Body Dimensions: 100 x 92 x 40 mm (3.9 x 3.6 x 1.6 in.); Weight: 450 g (15.9 oz)

**Ví dụ explanation tiếng Việt**

Khớp chính xác model HS2-12. HS2-12 đo hàm lượng nước thể tích, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Lượng nước trong đất giúp đánh giá đất khô/ướt; ngưỡng phù hợp còn phụ thuộc cây và loại đất. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số gps accuracy: ±1 ms time with GPS sync | ±5 m (16.4 ft) typical. Thông số water content accuracy: 3% typical (Accuracy assumes solution EC of < 6.5 dS/m when using the CS659 12-cm probe.). Thông số Volumetric Water Content Resolution: < 0.05%.

**Ví dụ explanation tiếng Anh**

Exact model match: HS2-12. HS2-12 measures volumetric water content, providing readings to monitor conditions before deciding on adjustments. Water content helps assess dry/wet soil; suitable thresholds depend on crops and soil. Installation suitability for your specific use case remains unconfirmed. gps accuracy: ±1 ms time with GPS sync | ±5 m (16.4 ft) typical. water content accuracy: 3% typical (Accuracy assumes solution EC of < 6.5 dS/m when using the CS659 12-cm probe.). Volumetric Water Content Resolution: < 0.05%.

**Thông số nguồn để đối chiếu**

- **Configuration**: CS659 Sensor & Rods — data/raw/CSI_HS2_12.json · record 0 · spec 0 · dòng 3
- **Measurements Made**: Volumetric water content (VWC) of porous media (such as soil) — data/raw/CSI_HS2_12.json · record 0 · spec 1 · dòng 5
- **Required Equipment**: HS2 is a complete system. — data/raw/CSI_HS2_12.json · record 0 · spec 2 · dòng 6
- **Soil Suitability**: Short rods are easy to install in hard soil. Suitable for soils with higher electrical conductivity. — data/raw/CSI_HS2_12.json · record 0 · spec 3 · dòng 7
- **Rods**: Replaceable — data/raw/CSI_HS2_12.json · record 0 · spec 4 · dòng 8
- **Sensors**: Interchangeable sensors; can swap the 12 cm and 20 cm sensors with the reader. — data/raw/CSI_HS2_12.json · record 0 · spec 5 · dòng 9
- **Display**: 128 x 64 pixel graphic LCD — data/raw/CSI_HS2_12.json · record 0 · spec 6 · dòng 11
- **Backlight**: Blue and white LED (brightness-adjustable) — data/raw/CSI_HS2_12.json · record 0 · spec 7 · dòng 12
- **GPS Accuracy**: ±1 ms time with GPS sync | ±5 m (16.4 ft) typical — data/raw/CSI_HS2_12.json · record 0 · spec 8 · dòng 13, 14
- **Bluetooth Range**: ~10 m (~30 ft) — data/raw/CSI_HS2_12.json · record 0 · spec 9 · dòng 15
- **Data Storage**: > 1000 records (ring memory) — data/raw/CSI_HS2_12.json · record 0 · spec 10 · dòng 16
- **Zone Storage**: > 100 records — data/raw/CSI_HS2_12.json · record 0 · spec 11 · dòng 17
- **Power Supply**: 6 Vdc, 4 AA batteries — data/raw/CSI_HS2_12.json · record 0 · spec 12 · dòng 18
- **Battery Life**: 6 to 12 months (typical usage) — data/raw/CSI_HS2_12.json · record 0 · spec 13 · dòng 19
- **Dimensions**: 200 x 100 x 58 mm (7.9 x 3.9 x 2.3 in.) — data/raw/CSI_HS2_12.json · record 0 · spec 14 · dòng 20
- **Weight**: 340 g (12 oz) — data/raw/CSI_HS2_12.json · record 0 · spec 15 · dòng 21
- **Sleep**: 20 µA — data/raw/CSI_HS2_12.json · record 0 · spec 16 · dòng 23
- **Backlight Off**: 2 mA — data/raw/CSI_HS2_12.json · record 0 · spec 17 · dòng 24
- **Backlight at 60%**: 18 mA — data/raw/CSI_HS2_12.json · record 0 · spec 18 · dòng 25
- **Backlight at 100%**: 30 mA — data/raw/CSI_HS2_12.json · record 0 · spec 19 · dòng 26
- **GPS Active**: 35 mA — data/raw/CSI_HS2_12.json · record 0 · spec 20 · dòng 27
- **Bluetooth Active**: 30 mA — data/raw/CSI_HS2_12.json · record 0 · spec 21 · dòng 28
- **-NOTE-**: The CS659 and CS658 cannot share rods. — data/raw/CSI_HS2_12.json · record 0 · spec 22 · dòng 30
- **Water Content Accuracy**: 3% typical (Accuracy assumes solution EC of < 6.5 dS/m when using the CS659 12-cm probe.) — data/raw/CSI_HS2_12.json · record 0 · spec 23 · dòng 31
- **Volumetric Water Content Resolution**: < 0.05% — data/raw/CSI_HS2_12.json · record 0 · spec 24 · dòng 32
- **Volumetric Water Content Range**: 0% to 50% VWC — data/raw/CSI_HS2_12.json · record 0 · spec 25 · dòng 33
- **Cable Type**: Spiral — data/raw/CSI_HS2_12.json · record 0 · spec 26 · dòng 34
- **Cable Length**: 250 cm (98 in.) extended — data/raw/CSI_HS2_12.json · record 0 · spec 27 · dòng 35
- **Rod Diameter**: 5 mm (0.14 in.) — data/raw/CSI_HS2_12.json · record 0 · spec 28 · dòng 36
- **Rod Length**: 120 mm (4.7 in.) for the CS659 12-cm probe — data/raw/CSI_HS2_12.json · record 0 · spec 29 · dòng 37
- **Body Dimensions**: 100 x 92 x 40 mm (3.9 x 3.6 x 1.6 in.) — data/raw/CSI_HS2_12.json · record 0 · spec 30 · dòng 38
- **Weight**: 450 g (15.9 oz) — data/raw/CSI_HS2_12.json · record 0 · spec 31 · dòng 39

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## HygroVue10

Air Temperature and Relative Humidity Sensor · CSI_HYGROVUE10

Nguồn catalog: https://www.campbellsci.com/products/hygrovue10

Đại lượng có bằng chứng: Nhiệt độ, Độ ẩm tương đối.

Giao thức được ghi nhận: SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model HygroVue10. HygroVue10 đo nhiệt độ, độ ẩm tương đối, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số temperature measurement accuracy: ±0.2 °C (−40 to 70 °C) | ±0.1 °C (20 to 60 °C). Thông số Reported resolution: 0.001 °C. Thông số accuracy at 25 c: ±1.5% (0 to 80% RH) | ±2% (80 to 100% RH).

**Ví dụ explanation tiếng Anh**

Exact model match: HygroVue10. HygroVue10 measures temperature, relative humidity, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. temperature measurement accuracy: ±0.2 °C (−40 to 70 °C) | ±0.1 °C (20 to 60 °C). Reported resolution: 0.001 °C. accuracy at 25 c: ±1.5% (0 to 80% RH) | ±2% (80 to 100% RH).

**Thông số nguồn để đối chiếu**

- **Compatibility**: Fully SDI-12 V1.3-compliant digital output (verified with an SDI-12 Verifier) | Compatible with SDI-12 V1.4 recorders including Campbell Scientific CR6, CR3000, CR1000X, CR800-series, CR300-series, and CR1000 data loggers. | A cable termination option allows the HygroVue 10 to connect to an Aspen 10 Edge Device. — data/raw/HygroVue10.json · record 0 · spec 0 · dòng 3, 4, 5
- **Sensor element**: Sensirion SHT35 derivative — data/raw/HygroVue10.json · record 0 · spec 1 · dòng 6
- **Calibration traceability**: NIST and NPL standards. | See Sensor element calibration (p. 36) for details of calibration traceability. — data/raw/HygroVue10.json · record 0 · spec 2 · dòng 7, 8
- **Supply voltage**: 7 to 28 VDC — data/raw/HygroVue10.json · record 0 · spec 3 · dòng 9
- **Current consumption**: 50 μA quiescent, typical | 0.6 mA during 0.5 s measurement typical — data/raw/HygroVue10.json · record 0 · spec 4 · dòng 10, 11
- **Warm-up time**: Sensor normally powered all the time; if power is switched, allow 1.8 s for sensor power-up. — data/raw/HygroVue10.json · record 0 · spec 5 · dòng 12
- **Diameter**: 12.5 mm (0.49 in) at sensor tip; maximum 18 mm (0.7 in) at connector — data/raw/HygroVue10.json · record 0 · spec 6 · dòng 13
- **Length**: 180 mm (7.1 in), sensor only, without cable — data/raw/HygroVue10.json · record 0 · spec 7 · dòng 14
- **Sensor body weight**: 50 g (1.8 oz) — data/raw/HygroVue10.json · record 0 · spec 8 · dòng 15
- **Weight**: 250 g (8.8 oz) with 5 m (16.4 ft) cable — data/raw/HygroVue10.json · record 0 · spec 9 · dòng 16
- **Housing material**: White PET-P — data/raw/HygroVue10.json · record 0 · spec 10 · dòng 17
- **Housing classification**: IP67 (electronics housing) — data/raw/HygroVue10.json · record 0 · spec 11 · dòng 18
- **Sensor protection**: Outer glass-filled polypropylene cap fitted with a stainless steel mesh dust filter with nominal pore size of <30 µm. | The sensor element is fitted with a PTFE protective film with a filtration efficiency of >99.99% for particles of 200 nm or larger size. — data/raw/HygroVue10.json · record 0 · spec 12 · dòng 19, 20
- **Sensor cable connector**: M12, male, 4-pole, A-coded — data/raw/HygroVue10.json · record 0 · spec 13 · dòng 21
- **EMC compliance**: Tested and conforms to IEC61326:2013 — data/raw/HygroVue10.json · record 0 · spec 14 · dòng 22
- **Calibration**: The sensor element is individually calibrated during manufacture. — data/raw/HygroVue10.json · record 0 · spec 15 · dòng 23
- **Compliance documents**: View at www.campbellsci.com/hygrovue10 — data/raw/HygroVue10.json · record 0 · spec 16 · dòng 24
- **Operating range**: −40 to 70 °C — data/raw/HygroVue10.json · record 0 · spec 17 · dòng 26
- **Accuracy***: ±0.2 °C (−40 to 70 °C) | ±0.1 °C (20 to 60 °C) — data/raw/HygroVue10.json · record 0 · spec 18 · dòng 27, 28
- **Long term drift**: ≤±0.03 °C/year — data/raw/HygroVue10.json · record 0 · spec 19 · dòng 29
- **Reported resolution**: 0.001 °C — data/raw/HygroVue10.json · record 0 · spec 20 · dòng 30
- **Repeatability****: 0.04 °C — data/raw/HygroVue10.json · record 0 · spec 21 · dòng 31
- **Response time**: 130 s (63% response time in air moving at 1 m/s) — data/raw/HygroVue10.json · record 0 · spec 22 · dòng 32
- **Units**: Degrees Celsius — data/raw/HygroVue10.json · record 0 · spec 23 · dòng 33
- **-NOTE-**: The accuracy figures quoted are relative to factory standards. | Values are 3 standard deviations of 25 measurements at constant temperature. — data/raw/HygroVue10.json · record 0 · spec 24 · dòng 34, 35
- **Operating range**: 0 to 100% RH — data/raw/HygroVue10.json · record 0 · spec 25 · dòng 37
- **Accuracy (at 25 °C)***: ±1.5% (0 to 80% RH) | ±2% (80 to 100% RH) — data/raw/HygroVue10.json · record 0 · spec 26 · dòng 38, 39
- **Temperature dependence**: < ±1% RH (−40 to 60 °C) — data/raw/HygroVue10.json · record 0 · spec 27 · dòng 40
- **Short term hysteresis**: < ±1% RH — data/raw/HygroVue10.json · record 0 · spec 28 · dòng 41
- **Long-term stability**: ±0.5% per year (drift in clean air conditions) — data/raw/HygroVue10.json · record 0 · spec 29 · dòng 42
- **Reported resolution**: 0.001% RH — data/raw/HygroVue10.json · record 0 · spec 30 · dòng 43
- **Repeatability****: 0.05% RH — data/raw/HygroVue10.json · record 0 · spec 31 · dòng 44
- **Response time with filter**: 8 s (63% response time in air moving at 1 m/s @ 25 °C) — data/raw/HygroVue10.json · record 0 · spec 32 · dòng 45
- **Environmental performance**: See Environmental performance (p. 24) — data/raw/HygroVue10.json · record 0 · spec 33 · dòng 46
- **-NOTE-**: The accuracy figures quoted are relative to factory standards. | Values are 3 standard deviations of 25 measurements at constant humidity. — data/raw/HygroVue10.json · record 0 · spec 34 · dòng 47, 48

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## HygroVue5

Temperature and Relative Humidity Sensor · CSI_HYGROVUE5

Nguồn catalog: https://www.campbellsci.com/products/hygrovue5

Đại lượng có bằng chứng: Nhiệt độ, Độ ẩm tương đối.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Measurement Range: -40 to +70°C; Accuracy: ±0.4°C (over the range -40° to +70°C) | ±0.3°C (over the range 20° to 60°C); Reported Resolution: 0.001°C; Measurement Range: 0 to 100% RH; Accuracy: ±3% (at 25°C, over the range 80 to 100% RH) | ±1.8% (at 25°C, over the range 0 to 80% RH); Reported Resolution: 0.001% RH

**Ví dụ explanation tiếng Việt**

Khớp chính xác model HygroVue5. HygroVue5 đo nhiệt độ, độ ẩm tương đối, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Measurement Range: -40 to +70°C. Thông số accuracy: ±0.4°C (over the range -40° to +70°C) | ±0.3°C (over the range 20° to 60°C). Thông số Reported Resolution: 0.001°C.

**Ví dụ explanation tiếng Anh**

Exact model match: HygroVue5. HygroVue5 measures temperature, relative humidity, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Measurement Range: -40 to +70°C. accuracy: ±0.4°C (over the range -40° to +70°C) | ±0.3°C (over the range 20° to 60°C). Reported Resolution: 0.001°C.

**Thông số nguồn để đối chiếu**

- **Sensing Element**: SHT35 derivative (specially coated for reliability) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 0 · dòng 3
- **Calibration Traceability**: NIST and NPL standards — data/raw/CSI_HYGROVUE5.json · record 0 · spec 1 · dòng 4
- **Supply Voltage**: 7 to 28 Vdc — data/raw/CSI_HYGROVUE5.json · record 0 · spec 2 · dòng 5
- **Warm-up Time**: Sensor is normally powered all the time. If power is switched off, allow 1.8 s for sensor to power up. — data/raw/CSI_HYGROVUE5.json · record 0 · spec 3 · dòng 6
- **Main Housing Material**: White PET-P — data/raw/CSI_HYGROVUE5.json · record 0 · spec 4 · dòng 7
- **Housing Classification**: IP67 (electronics housing) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 5 · dòng 8
- **Sensor Protection**: Outer glass-filled polypropylene cap fitted with a stainless-steel mesh dust filter with nominal pore size of < 30 µm. | The sensor element is fitted with a PTFE protective film with a filtration efficiency of > 99.99% for particles of 200 nm or larger size. — data/raw/CSI_HYGROVUE5.json · record 0 · spec 6 · dòng 9, 10
- **EMC Compliance**: Tested and conforms to IEC 61326:2013 — data/raw/CSI_HYGROVUE5.json · record 0 · spec 7 · dòng 11
- **Calibration**: The sensor element is individually calibrated during manufacture. — data/raw/CSI_HYGROVUE5.json · record 0 · spec 8 · dòng 12
- **Field-Replaceable Chip or Recalibrate**: Field-replaceable chip — data/raw/CSI_HYGROVUE5.json · record 0 · spec 9 · dòng 13
- **Diameter**: 12.5 mm (0.49 in.) at sensor tip | maximum 16 mm (0.63 in.) at the cable end — data/raw/CSI_HYGROVUE5.json · record 0 · spec 10 · dòng 14, 15
- **Length**: 115 mm (4.52 in.) sensor only, without cable — data/raw/CSI_HYGROVUE5.json · record 0 · spec 11 · dòng 16
- **Quiescent**: 50 μA typical — data/raw/CSI_HYGROVUE5.json · record 0 · spec 12 · dòng 18
- **During Measurement**: 0.6 mA (takes 0.5 s) typical — data/raw/CSI_HYGROVUE5.json · record 0 · spec 13 · dòng 19
- **Measurement Range**: -40 to +70°C — data/raw/CSI_HYGROVUE5.json · record 0 · spec 14 · dòng 21
- **Accuracy**: ±0.4°C (over the range -40° to +70°C) | ±0.3°C (over the range 20° to 60°C) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 15 · dòng 22, 23
- **Long-Term Drift**: < ±0.03°C per year — data/raw/CSI_HYGROVUE5.json · record 0 · spec 16 · dòng 24
- **Reported Resolution**: 0.001°C — data/raw/CSI_HYGROVUE5.json · record 0 · spec 17 · dòng 25
- **Repeatability**: 0.04°C | Values are 3 standard deviations of 25 measurements at constant temperature. — data/raw/CSI_HYGROVUE5.json · record 0 · spec 18 · dòng 26, 27
- **Response Time**: 130 s (63% response time in air moving at 1 m/s) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 19 · dòng 28
- **Units**: Degrees Celsius — data/raw/CSI_HYGROVUE5.json · record 0 · spec 20 · dòng 29
- **Measurement Range**: 0 to 100% RH — data/raw/CSI_HYGROVUE5.json · record 0 · spec 21 · dòng 31
- **Accuracy**: ±3% (at 25°C, over the range 80 to 100% RH) | ±1.8% (at 25°C, over the range 0 to 80% RH) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 22 · dòng 32, 33
- **Additional Errors at Other Temperatures**: < ±1% RH (over -40° to +60°C) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 23 · dòng 34
- **Short-Term Hysteresis**: < ±1% RH — data/raw/CSI_HYGROVUE5.json · record 0 · spec 24 · dòng 35
- **Long-Term Stability**: ±0.5% per year (maximum drift in clean air conditions) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 25 · dòng 36
- **Reported Resolution**: 0.001% RH — data/raw/CSI_HYGROVUE5.json · record 0 · spec 26 · dòng 37
- **Repeatibility**: 0.05% RH | Values are 3 standard deviations of 25 measurements at constant humidity. — data/raw/CSI_HYGROVUE5.json · record 0 · spec 27 · dòng 38, 39
- **Response Time with Filter**: 8 s (63% response time in air moving at 1 m/s at 25°C) — data/raw/CSI_HYGROVUE5.json · record 0 · spec 28 · dòng 40

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## LevelVueB10-15

Water-Level Continuous Flow Bubbler · CSI_LEVELVUEB10_15

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Mực nước.

Giao thức được ghi nhận: Modbus (supported), RS-485 (supported), SDI-12 (supported).

Cấu hình model: Pressure Range: 0 to 15 psi; Water Depth Range: 0 to 10.54 m (34.6 ft); Resolution: ±2.1 mm (0.007 ft); RS-485 Default Configuration: 19200 bps; 8 data bits; even parity; 1 stop bit

**Ví dụ explanation tiếng Việt**

Khớp chính xác model LevelVueB10-15. LevelVueB10-15 đo mực nước, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Modbus, RS-485, SDI-12. Thông số Resolution: ±2.1 mm (0.007 ft). Thông số accuracy: ≤0.02% of full-scale output (FSO) over temperature range. Thông số Operating Temperature Range: -40 to +60 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: LevelVueB10-15. LevelVueB10-15 measures water level, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Modbus, RS-485, SDI-12. Resolution: ±2.1 mm (0.007 ft). accuracy: ≤0.02% of full-scale output (FSO) over temperature range. Operating Temperature Range: -40 to +60 °C.

**Thông số nguồn để đối chiếu**

- **Base Model**: LevelVue B10 — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 0 · dòng 3
- **Product Type**: Water-Level Continuous Flow Bubbler with Integrated Screen — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 2 · dòng 5
- **Device Classification**: Primary measurement device / water-level bubbler sensor — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 3 · dòng 6
- **Primary Application**: Measurement of groundwater, surface water, or other liquid levels using a non-submersible continuous-air-flow bubbler system — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 4 · dòng 7
- **Measurement Principle**: Measures the pressure required to maintain constant airflow through a submerged orifice line; pressure is converted to water depth — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 5 · dòng 8
- **Pressure Range**: 0 to 15 psi — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 6 · dòng 9
- **Water Depth Range**: 0 to 10.54 m (34.6 ft) — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 7 · dòng 10
- **Resolution**: ±2.1 mm (0.007 ft) — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 8 · dòng 11
- **Accuracy**: ≤0.02% of full-scale output (FSO) over temperature range — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 9 · dòng 12
- **Sensor Overpressure Rating**: 2 × pressure range — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 10 · dòng 13
- **Long-Term Drift**: 0.1% FS / 6 months — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 11 · dòng 14
- **Operating Temperature Range**: -40 to +60 °C — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 12 · dòng 15
- **Storage Temperature Range**: -40 to +80 °C — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 13 · dòng 16
- **Relative Humidity**: 0 to 95% (non-condensing) — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 14 · dòng 17
- **Memory**: All settings and parameters stored in non-volatile memory — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 15 · dòng 18
- **Real-Time Clock**: Continues operation with lithium battery during power disconnects — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 16 · dòng 19
- **Enclosure Material**: Fiberglass — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 17 · dòng 20
- **Enclosure Dimensions**: 28.9 × 34 × 13 cm (11.4 × 13.4 × 5.2 in.) — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 18 · dòng 21
- **Enclosure Weight**: 7.5 kg (16.5 lb) — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 19 · dòng 22
- **Airflow Type**: Microprocessor-controlled constant airflow over full pressure range and temperature — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 20 · dòng 23
- **Bubble Rate**: 30 to 120 bubbles/min programmable; 60 bubbles/min default — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 21 · dòng 24
- **Purge Pressure**: 30 to 90 psi programmable — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 22 · dòng 25
- **Purge Sustain Time**: 0 to 30 s programmable — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 23 · dòng 26
- **Automatic Purge**: Once a day to once every 30 days; 1-day resolution — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 24 · dòng 27
- **Pressure Inlet**: 1/8 in. female NPT — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 25 · dòng 28
- **Orifice Line Outlet**: 1/8 in. female NPT — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 26 · dòng 29
- **Input Voltage Range**: 11.5 to 16.5 VDC — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 27 · dòng 30
- **Current – Standby**: 5 mA — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 28 · dòng 31
- **Current – Compressor Active**: 7 A typical; 10 A maximum — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 29 · dòng 32
- **Current – Startup Surge**: 18 A maximum — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 30 · dòng 33
- **Average Power Consumption**: <60 mA average at 60 bubbles/min with samples averaged over 10 s — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 31 · dòng 34
- **Power Protection**: Protected against surge, overvoltage, and reverse polarity up to 20 VDC — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 32 · dòng 35
- **Communication Interfaces**: SDI-12 and RS-485 Modbus — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 33 · dòng 36
- **SDI-12 Protocol**: SDI-12 V1.4 compliant — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 34 · dòng 37
- **SDI-12 Default Address**: 0 — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 35 · dòng 38
- **SDI-12 Measurement Response Time**: 10 s for M! command with default 5 s averaging time — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 36 · dòng 39
- **RS-485 Protocol**: Modbus — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 37 · dòng 40
- **RS-485 Default Address**: 1 — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 38 · dòng 41
- **RS-485 Default Configuration**: 19200 bps; 8 data bits; even parity; 1 stop bit — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 39 · dòng 42
- **RS-485 Data Type**: 32-bit float; byte order ABCD — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 40 · dòng 43
- **Keypad / Display**: Graphical 8-line × 20-character display; supports complete system setup — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 41 · dòng 44
- **Recommended Measurement Scan**: At least 30 s — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 42 · dòng 45
- **Compatible Campbell Scientific Data Loggers**: GRANITE series, CR6, CR1000X, CR350 series, CR300 series, CR1000, CR800 series — data/raw/CSI_LEVELVUEB10_15.json · record 0 · spec 43 · dòng 46

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## LWS

Leaf Wetness Sensor · CSI_LWS

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Độ ướt lá.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model LWS. LWS đo độ ướt lá, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Operating Temperature Range: -40 to +60 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: LWS. LWS measures leaf wetness, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Operating Temperature Range: -40 to +60 °C.

**Thông số nguồn để đối chiếu**

- **Product Type**: Dielectric Leaf Wetness Sensor — data/raw/LWS.json · record 0 · spec 0 · dòng 3
- **Device Classification**: Primary measurement device / leaf-wetness sensor — data/raw/LWS.json · record 0 · spec 1 · dòng 5
- **Primary Application**: Detection and estimation of leaf surface wetness, frost, and moisture in plant canopies or on weather-station masts — data/raw/LWS.json · record 0 · spec 2 · dòng 6
- **Measurement Principle**: Measures the dielectric constant near the upper sensor surface; output varies with the presence of water or ice — data/raw/LWS.json · record 0 · spec 3 · dòng 7
- **Measurement Description**: Dry, frosted, wet — data/raw/LWS.json · record 0 · spec 4 · dòng 8
- **Signal Type / Output**: Analog voltage — data/raw/LWS.json · record 0 · spec 5 · dòng 9
- **Measurement Time**: 10 ms — data/raw/LWS.json · record 0 · spec 6 · dòng 10
- **Settling Time**: 10 ms — data/raw/LWS.json · record 0 · spec 7 · dòng 11
- **Excitation Voltage**: 2.5 VDC at 2 mA to 5.0 VDC at 7 mA — data/raw/LWS.json · record 0 · spec 8 · dòng 12
- **Minimum Excitation Time**: 10 ms — data/raw/LWS.json · record 0 · spec 9 · dòng 13
- **Output Range**: Manual: 300 to 1250 mV depending on excitation voltage; 2026 brochure: 250 to 1500 mV — data/raw/LWS.json · record 0 · spec 10 · dòng 14
- **Operating Temperature Range**: -40 to +60 °C — data/raw/LWS.json · record 0 · spec 11 · dòng 15
- **Life Expectancy**: 2+ years under continuous outdoor use — data/raw/LWS.json · record 0 · spec 12 · dòng 16
- **Individual Calibration Required**: No — data/raw/LWS.json · record 0 · spec 13 · dòng 17
- **Painting Required**: No — data/raw/LWS.json · record 0 · spec 14 · dòng 18
- **Interchangeability**: Interchangeable without painting or individual calibration — data/raw/LWS.json · record 0 · spec 15 · dòng 19
- **Length**: 12.0 cm (4.7 in.) — data/raw/LWS.json · record 0 · spec 16 · dòng 20
- **Width**: 5.8 cm (2.3 in.) — data/raw/LWS.json · record 0 · spec 17 · dòng 21
- **Height**: 0.8 cm (0.3 in.) — data/raw/LWS.json · record 0 · spec 18 · dòng 22
- **Dimensions**: 12.0 × 5.8 × 0.8 cm (4.7 × 2.3 × 0.3 in.) — data/raw/LWS.json · record 0 · spec 19 · dòng 23
- **Weight**: 0.14 kg (5 oz) with 4.57 m (15 ft) cable — data/raw/LWS.json · record 0 · spec 20 · dòng 24
- **Maximum Cable Length**: 75 m (246 ft) — data/raw/LWS.json · record 0 · spec 21 · dòng 25
- **Typical Deployment**: Plant canopy or weather-station mast — data/raw/LWS.json · record 0 · spec 22 · dòng 26
- **Mounting**: Two mounting holes; attach to a small-diameter rod, pole, or branch using zip/twist ties or 4-40 bolts — data/raw/LWS.json · record 0 · spec 23 · dòng 27
- **Brown / White Wire Function**: Voltage excitation input — data/raw/LWS.json · record 0 · spec 24 · dòng 28
- **Orange / Red Wire Function**: Analog voltage output — data/raw/LWS.json · record 0 · spec 25 · dòng 29
- **Clear Wire Function**: Shield / analog ground — data/raw/LWS.json · record 0 · spec 26 · dòng 30
- **Recommended Measurement Instruction**: BRHalf() for most CRBasic data loggers; ExDelSE() for CR200(X) — data/raw/LWS.json · record 0 · spec 27 · dòng 31
- **Dry Threshold at 2500 mV Excitation**: <274 mV — data/raw/LWS.json · record 0 · spec 28 · dòng 32
- **Wet Threshold at 2500 mV Excitation**: ≥284 mV — data/raw/LWS.json · record 0 · spec 29 · dòng 33
- **Intermediate State**: 274 to <284 mV interpreted as wet or contaminated — data/raw/LWS.json · record 0 · spec 30 · dòng 34
- **Typical Response at 5 V Excitation**: Approximately 445 mV dry, approximately 475 mV frosted, >475 mV wet; example Boolean wetness threshold 500 mV — data/raw/LWS.json · record 0 · spec 31 · dòng 35
- **Recommended Sampling Frequency**: 15 minutes or less to accurately capture leaf-wetness duration — data/raw/LWS.json · record 0 · spec 32 · dòng 36
- **Maintenance**: Periodically clean sensing surface with a moist cloth when dust/debris causes elevated dry output — data/raw/LWS.json · record 0 · spec 33 · dòng 37
- **Compatible Campbell Scientific Data Loggers**: CR200(X) series, CR300 series, CR6 series, CR800 series, CR1000, CR1000X, CR3000, CR5000, CR9000(X) — data/raw/LWS.json · record 0 · spec 34 · dòng 38

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## MeteoPV

Solar Monitoring Station · CSI_METEOPV

Nguồn catalog: https://www.campbellsci.com/products/meteopv

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: Ethernet (supported), Modbus (supported), Modbus RTU (supported), Modbus TCP (supported), RJ45 (supported), RS-485 (supported), TCP (supported), TCP/IP (supported), USB (supported).

Cấu hình model: Maximum Sensor Configuration: Up to 4 pyranometers, 1 compact weather sensor, and up to 4 back-of-module temperature sensors; Configuration Interface: Onboard browser-based user interface; Configuration URL: www.linktodevice.com; Configuration File Management: Apply to Station; Save to File; Load from File; Remote Configuration Requirement: Administrator account required for configuration over Ethernet

**Ví dụ explanation tiếng Việt**

Khớp chính xác model MeteoPV. MeteoPV được phân loại là Solar Monitoring Station. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Ethernet, Modbus, Modbus RTU, Modbus TCP. Thông số Operating Temperature Range: -40 to +70 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: MeteoPV. MeteoPV is classified as a Solar Monitoring Station. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Ethernet, Modbus, Modbus RTU, Modbus TCP. Operating Temperature Range: -40 to +70 °C.

**Thông số nguồn để đối chiếu**

- **Product Name**: MeteoPV — data/raw/CSI_METEOPV.json · record 0 · spec 0 · dòng 2
- **Product Type**: Solar Resource Platform / Modbus TCP-to-Modbus RTU Gateway — data/raw/CSI_METEOPV.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_METEOPV.json · record 0 · spec 2 · dòng 4
- **Device Classification**: Primary communications and data-aggregation device / PV monitoring gateway — data/raw/CSI_METEOPV.json · record 0 · spec 3 · dòng 5
- **Primary Application**: Distributed photovoltaic monitoring and plane-of-array (POA) sunstations — data/raw/CSI_METEOPV.json · record 0 · spec 4 · dòng 6
- **Core Function**: Connects multiple RS-485 sensors, consolidates sensor data and metadata into a unified Modbus map, and exposes data to SCADA or other collection platforms over Modbus TCP/IP — data/raw/CSI_METEOPV.json · record 0 · spec 5 · dòng 7
- **Datalogger / Gateway Role**: Modbus/TCP-to-Modbus/RTU gateway; Modbus data aggregation platform — data/raw/CSI_METEOPV.json · record 0 · spec 6 · dòng 8
- **Supported Sensor Categories**: Pyranometers; reference cells; back-of-module temperature sensors; compact weather sensors — data/raw/CSI_METEOPV.json · record 0 · spec 7 · dòng 9
- **Maximum Sensor Configuration**: Up to 4 pyranometers, 1 compact weather sensor, and up to 4 back-of-module temperature sensors — data/raw/CSI_METEOPV.json · record 0 · spec 8 · dòng 10
- **SCADA Interface**: Ethernet / Modbus TCP/IP — data/raw/CSI_METEOPV.json · record 0 · spec 9 · dòng 11
- **Sensor Interface**: Half-duplex RS-485 / Modbus RTU — data/raw/CSI_METEOPV.json · record 0 · spec 10 · dòng 12
- **Ethernet Port**: RJ45, 10/100Base-TX, full and half duplex — data/raw/CSI_METEOPV.json · record 0 · spec 11 · dòng 13
- **Ethernet Features**: Auto-MDIX; IP Address, Netmask, and Gateway configuration; Modbus TCP/IP — data/raw/CSI_METEOPV.json · record 0 · spec 12 · dòng 14
- **RS-485 Maximum Cable Length**: 1200 m — data/raw/CSI_METEOPV.json · record 0 · spec 13 · dòng 15
- **RS-485 Output Voltage**: 12 V supplied by RS-485 terminals; varies with load — data/raw/CSI_METEOPV.json · record 0 · spec 14 · dòng 16
- **RS-485 Output Voltage – Minimum**: 11 V — data/raw/CSI_METEOPV.json · record 0 · spec 15 · dòng 17
- **RS-485 Output Voltage – Maximum**: 14.5 V — data/raw/CSI_METEOPV.json · record 0 · spec 16 · dòng 18
- **RS-485 Output Voltage – Typical**: 11.6 V under full load of 500 mA — data/raw/CSI_METEOPV.json · record 0 · spec 17 · dòng 19
- **RS-485 Current Supply Limit**: 500 mA — data/raw/CSI_METEOPV.json · record 0 · spec 18 · dòng 20
- **Operating Voltage**: 10 to 30 VDC per 2026 Getting Started guide; 2018 brochure states 9 to 30 VDC — data/raw/CSI_METEOPV.json · record 0 · spec 19 · dòng 21
- **Power Sources**: USB for configuration only; 10 to 30 VDC terminal supply; Power over Ethernet (PoE) — data/raw/CSI_METEOPV.json · record 0 · spec 20 · dòng 22
- **Power over Ethernet**: Supported; 2018 brochure states isolated PoE, IEEE 802.3af compliant — data/raw/CSI_METEOPV.json · record 0 · spec 21 · dòng 23
- **USB Power Behavior**: USB can power MeteoPV for configuration, but does not supply power to connected sensors — data/raw/CSI_METEOPV.json · record 0 · spec 22 · dòng 24
- **Sensor Power Behavior**: When powered by external DC or PoE, MeteoPV provides 12 VDC power to connected RS-485 sensors — data/raw/CSI_METEOPV.json · record 0 · spec 23 · dòng 25
- **Power Consumption**: 2018 brochure: ~30 mA at 12 VDC, excluding sensors — data/raw/CSI_METEOPV.json · record 0 · spec 24 · dòng 26
- **USB Interface**: Micro-B USB; configuration/computer connection — data/raw/CSI_METEOPV.json · record 0 · spec 25 · dòng 27
- **USB Data Rate**: 2018 brochure: USB 2.0 full-speed, 12 Mbps — data/raw/CSI_METEOPV.json · record 0 · spec 26 · dòng 28
- **CPU**: 2018 brochure: ARM Cortex-M4, 144 MHz — data/raw/CSI_METEOPV.json · record 0 · spec 27 · dòng 29
- **Operating Temperature Range**: -40 to +70 °C — data/raw/CSI_METEOPV.json · record 0 · spec 28 · dòng 30
- **Configuration Interface**: Onboard browser-based user interface — data/raw/CSI_METEOPV.json · record 0 · spec 29 · dòng 31
- **Default USB IP Address**: 192.168.66.1 — data/raw/CSI_METEOPV.json · record 0 · spec 30 · dòng 32
- **Configuration URL**: www.linktodevice.com — data/raw/CSI_METEOPV.json · record 0 · spec 31 · dòng 33
- **Station Metadata**: Station Name, Location, and Station Notes can be configured — data/raw/CSI_METEOPV.json · record 0 · spec 32 · dòng 34
- **Configuration File Management**: Apply to Station; Save to File; Load from File — data/raw/CSI_METEOPV.json · record 0 · spec 33 · dòng 35
- **User Account Levels**: None; Read only; Administrator — data/raw/CSI_METEOPV.json · record 0 · spec 34 · dòng 36
- **Remote Configuration Requirement**: Administrator account required for configuration over Ethernet — data/raw/CSI_METEOPV.json · record 0 · spec 35 · dòng 37
- **Default Anonymous Access**: Anonymous account is provided with read-only permissions by default — data/raw/CSI_METEOPV.json · record 0 · spec 36 · dòng 38
- **Installation Report**: Browser-based interface can generate a PDF installation report containing site data, sensor metadata, and configuration data — data/raw/CSI_METEOPV.json · record 0 · spec 37 · dòng 39
- **Programming Requirement**: No coding required for normal deployment/configuration — data/raw/CSI_METEOPV.json · record 0 · spec 38 · dòng 40
- **Mounting**: DIN-rail mounting — data/raw/CSI_METEOPV.json · record 0 · spec 39 · dòng 41
- **Surge / ESD Protection**: Integrated surge and ESD protection — data/raw/CSI_METEOPV.json · record 0 · spec 40 · dòng 42
- **EMC Immunity**: 2018 brochure: IEC 61000-4-2 Class 4 — data/raw/CSI_METEOPV.json · record 0 · spec 41 · dòng 43
- **Compatible Campbell Scientific Sensors**: CS240DM; MetSENS series; CS325DM (2018 brochure) — data/raw/CSI_METEOPV.json · record 0 · spec 42 · dòng 44
- **Other Compatible Sensors**: EKO MS-80M; Hukseflux SR30 and SR20-D2; Kipp & Zonen SMP series (2018 brochure) — data/raw/CSI_METEOPV.json · record 0 · spec 43 · dòng 45

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## MetSENS200-D2

Compact Weather Sensor · CSI_METSENS200_D2

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Tốc độ gió, Hướng gió, Hướng la bàn.

Giao thức được ghi nhận: RS-232 (supported).

Cấu hình model: Communication Configuration: RS-232 digital output; Primary Digital Interface: Serial RS-232; Default Communication Settings: 9600 baud; 8 data bits; even parity; 1 stop bit; Replacement Cable: METSENSCBL3 RS-232 Replacement Cable; Signal / Data Wiring: Green: RS-232 RXD; White: RS-232 TXD; Red: 12 VDC; Black: power and signal ground; Clear: shield; Direct Data Logger Connection: Green → C (odd); White → C (even); Red → 12V; Black/Clear → G; CRBasic Programming: SerialFlush(); Scan(); SerialOut(); SerialIn(); SplitStr(); Cable Length Options: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified

**Ví dụ explanation tiếng Việt**

Khớp chính xác model MetSENS200-D2. MetSENS200-D2 đo tốc độ gió, hướng gió, hướng la bàn, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Số đo gió hỗ trợ đánh giá điều kiện tại điểm lắp đặt. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232. Thông số Operating Temperature Range: -40 to +70 °C. Thông số Wind Speed Resolution: 0.01 m/s. Thông số wind speed accuracy: ±3% up to 40 m/s; ±5% up to 60 m/s.

**Ví dụ explanation tiếng Anh**

Exact model match: MetSENS200-D2. MetSENS200-D2 measures wind speed, wind direction, compass heading, providing readings to monitor conditions before deciding on adjustments. Wind readings support assessing conditions at the installation point. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232. Operating Temperature Range: -40 to +70 °C. Wind Speed Resolution: 0.01 m/s. wind speed accuracy: ±3% up to 40 m/s; ±5% up to 60 m/s.

**Thông số nguồn để đối chiếu**

- **Base Model**: MetSENS200 — data/raw/CSI_METSENS200_D2.json · record 0 · spec 0 · dòng 3
- **Product Type**: Compact Weather Sensor for Wind with Compass — data/raw/CSI_METSENS200_D2.json · record 0 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_METSENS200_D2.json · record 0 · spec 2 · dòng 5
- **Device Classification**: Primary measurement device / integrated weather sensor — data/raw/CSI_METSENS200_D2.json · record 0 · spec 3 · dòng 6
- **Primary Application**: Integrated ultrasonic measurement of wind speed and wind direction with electronic compass — data/raw/CSI_METSENS200_D2.json · record 0 · spec 4 · dòng 7
- **Measurements Made**: Wind speed; wind direction; compass heading — data/raw/CSI_METSENS200_D2.json · record 0 · spec 5 · dòng 8
- **Additional Derived Data**: WMO average wind speed and direction; gust data — data/raw/CSI_METSENS200_D2.json · record 0 · spec 6 · dòng 9
- **Communication Configuration**: RS-232 digital output — data/raw/CSI_METSENS200_D2.json · record 0 · spec 7 · dòng 10
- **Primary Digital Interface**: Serial RS-232 — data/raw/CSI_METSENS200_D2.json · record 0 · spec 8 · dòng 11
- **Default Communication Settings**: 9600 baud; 8 data bits; even parity; 1 stop bit — data/raw/CSI_METSENS200_D2.json · record 0 · spec 9 · dòng 12
- **Replacement Cable**: METSENSCBL3 RS-232 Replacement Cable — data/raw/CSI_METSENS200_D2.json · record 0 · spec 10 · dòng 14
- **Signal / Data Wiring**: Green: RS-232 RXD; White: RS-232 TXD; Red: 12 VDC; Black: power and signal ground; Clear: shield — data/raw/CSI_METSENS200_D2.json · record 0 · spec 11 · dòng 15
- **Direct Data Logger Connection**: Green → C (odd); White → C (even); Red → 12V; Black/Clear → G — data/raw/CSI_METSENS200_D2.json · record 0 · spec 12 · dòng 16
- **CRBasic Programming**: SerialFlush(); Scan(); SerialOut(); SerialIn(); SplitStr() — data/raw/CSI_METSENS200_D2.json · record 0 · spec 13 · dòng 17
- **Sampling Rate**: 1 Hz — data/raw/CSI_METSENS200_D2.json · record 0 · spec 14 · dòng 19
- **IP Rating**: IP66 — data/raw/CSI_METSENS200_D2.json · record 0 · spec 15 · dòng 20
- **Compliance**: CE and RoHS compliant; where applicable, individual parameters meet or exceed IEC 61724-1 (2017, 2021) — data/raw/CSI_METSENS200_D2.json · record 0 · spec 16 · dòng 21
- **Operating Temperature Range**: -40 to +70 °C — data/raw/CSI_METSENS200_D2.json · record 0 · spec 17 · dòng 22
- **Operating Voltage**: 5 to 30 VDC — data/raw/CSI_METSENS200_D2.json · record 0 · spec 18 · dòng 23
- **Typical Current Drain – Continuous High Mode**: 25 mA @ 12 VDC — data/raw/CSI_METSENS200_D2.json · record 0 · spec 19 · dòng 24
- **Typical Current Drain – Eco-Power Mode**: 0.7 mA @ 12 VDC (1 hour polled) — data/raw/CSI_METSENS200_D2.json · record 0 · spec 20 · dòng 25
- **Weight**: 0.5 kg (1.1 lb) — data/raw/CSI_METSENS200_D2.json · record 0 · spec 21 · dòng 26
- **Wind Speed Range**: 0.01 to 60 m/s — data/raw/CSI_METSENS200_D2.json · record 0 · spec 22 · dòng 27
- **Wind Speed Resolution**: 0.01 m/s — data/raw/CSI_METSENS200_D2.json · record 0 · spec 23 · dòng 28
- **Wind Speed Starting Threshold**: 0.01 m/s — data/raw/CSI_METSENS200_D2.json · record 0 · spec 24 · dòng 29
- **Wind Speed Accuracy**: ±3% up to 40 m/s; ±5% up to 60 m/s — data/raw/CSI_METSENS200_D2.json · record 0 · spec 25 · dòng 30
- **Wind Direction Range**: 0° to 359° — data/raw/CSI_METSENS200_D2.json · record 0 · spec 26 · dòng 31
- **Wind Direction Resolution**: 1° — data/raw/CSI_METSENS200_D2.json · record 0 · spec 27 · dòng 32
- **Wind Direction Accuracy**: ±3° up to 40 m/s; ±5° from 40 to 60 m/s — data/raw/CSI_METSENS200_D2.json · record 0 · spec 28 · dòng 33
- **Compass Range**: 0° to 359° — data/raw/CSI_METSENS200_D2.json · record 0 · spec 29 · dòng 34
- **Compass Resolution**: 1° — data/raw/CSI_METSENS200_D2.json · record 0 · spec 30 · dòng 35
- **Compass Accuracy**: ±3° — data/raw/CSI_METSENS200_D2.json · record 0 · spec 31 · dòng 36
- **Cable Length Options**: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified — data/raw/CSI_METSENS200_D2.json · record 0 · spec 32 · dòng 37

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## MetSENS300-D2

Compact Weather Sensor · CSI_METSENS300_D2

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ không khí, Độ ẩm tương đối, Áp suất khí quyển.

Giao thức được ghi nhận: RS-232 (supported).

Cấu hình model: Communication Configuration: RS-232 digital output; Primary Digital Interface: Serial RS-232; Default Communication Settings: 9600 baud; 8 data bits; even parity; 1 stop bit; Replacement Cable: METSENSCBL3 RS-232 Replacement Cable; Signal / Data Wiring: Green: RS-232 RXD; White: RS-232 TXD; Red: 12 VDC; Black: power and signal ground; Clear: shield; Direct Data Logger Connection: Green → C (odd); White → C (even); Red → 12V; Black/Clear → G; CRBasic Programming: SerialFlush(); Scan(); SerialOut(); SerialIn(); SplitStr(); Cable Length Options: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified

**Ví dụ explanation tiếng Việt**

Khớp chính xác model MetSENS300-D2. MetSENS300-D2 đo nhiệt độ không khí, độ ẩm tương đối, áp suất khí quyển, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232. Thông số Operating Temperature Range: -40 to +70 °C. Thông số Air Temperature Resolution: 0.1 °C. Thông số air temperature accuracy: ±0.3 °C @ +20 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: MetSENS300-D2. MetSENS300-D2 measures air temperature, relative humidity, barometric pressure, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232. Operating Temperature Range: -40 to +70 °C. Air Temperature Resolution: 0.1 °C. air temperature accuracy: ±0.3 °C @ +20 °C.

**Thông số nguồn để đối chiếu**

- **Base Model**: MetSENS300 — data/raw/CSI_METSENS300_D2.json · record 0 · spec 0 · dòng 3
- **Product Type**: Compact Weather Sensor for Temperature, RH, and Barometric Pressure — data/raw/CSI_METSENS300_D2.json · record 0 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_METSENS300_D2.json · record 0 · spec 2 · dòng 5
- **Device Classification**: Primary measurement device / integrated weather sensor — data/raw/CSI_METSENS300_D2.json · record 0 · spec 3 · dòng 6
- **Primary Application**: Integrated measurement of air temperature, relative humidity, and barometric pressure — data/raw/CSI_METSENS300_D2.json · record 0 · spec 4 · dòng 7
- **Measurements Made**: Air temperature; relative humidity; barometric pressure — data/raw/CSI_METSENS300_D2.json · record 0 · spec 5 · dòng 8
- **Additional Derived Data**: Absolute humidity; air density; wet bulb temperature — data/raw/CSI_METSENS300_D2.json · record 0 · spec 6 · dòng 9
- **Communication Configuration**: RS-232 digital output — data/raw/CSI_METSENS300_D2.json · record 0 · spec 7 · dòng 10
- **Primary Digital Interface**: Serial RS-232 — data/raw/CSI_METSENS300_D2.json · record 0 · spec 8 · dòng 11
- **Default Communication Settings**: 9600 baud; 8 data bits; even parity; 1 stop bit — data/raw/CSI_METSENS300_D2.json · record 0 · spec 9 · dòng 12
- **Replacement Cable**: METSENSCBL3 RS-232 Replacement Cable — data/raw/CSI_METSENS300_D2.json · record 0 · spec 10 · dòng 14
- **Signal / Data Wiring**: Green: RS-232 RXD; White: RS-232 TXD; Red: 12 VDC; Black: power and signal ground; Clear: shield — data/raw/CSI_METSENS300_D2.json · record 0 · spec 11 · dòng 15
- **Direct Data Logger Connection**: Green → C (odd); White → C (even); Red → 12V; Black/Clear → G — data/raw/CSI_METSENS300_D2.json · record 0 · spec 12 · dòng 16
- **CRBasic Programming**: SerialFlush(); Scan(); SerialOut(); SerialIn(); SplitStr() — data/raw/CSI_METSENS300_D2.json · record 0 · spec 13 · dòng 17
- **Sampling Rate**: 1 Hz — data/raw/CSI_METSENS300_D2.json · record 0 · spec 14 · dòng 19
- **IP Rating**: IP66 — data/raw/CSI_METSENS300_D2.json · record 0 · spec 15 · dòng 20
- **Compliance**: CE and RoHS compliant; where applicable, individual parameters meet or exceed IEC 61724-1 (2017, 2021) — data/raw/CSI_METSENS300_D2.json · record 0 · spec 16 · dòng 21
- **Operating Temperature Range**: -40 to +70 °C — data/raw/CSI_METSENS300_D2.json · record 0 · spec 17 · dòng 22
- **Operating Voltage**: 5 to 30 VDC — data/raw/CSI_METSENS300_D2.json · record 0 · spec 18 · dòng 23
- **Typical Current Drain – Continuous High Mode**: 25 mA @ 12 VDC — data/raw/CSI_METSENS300_D2.json · record 0 · spec 19 · dòng 24
- **Typical Current Drain – Eco-Power Mode**: 0.7 mA @ 12 VDC (1 hour polled) — data/raw/CSI_METSENS300_D2.json · record 0 · spec 20 · dòng 25
- **Weight**: 0.5 kg (1.1 lb) — data/raw/CSI_METSENS300_D2.json · record 0 · spec 21 · dòng 26
- **Overall Height**: 155 mm — data/raw/CSI_METSENS300_D2.json · record 0 · spec 22 · dòng 27
- **Maximum Diameter**: 142 mm — data/raw/CSI_METSENS300_D2.json · record 0 · spec 23 · dòng 28
- **Lower Body Diameter**: 44.5 mm — data/raw/CSI_METSENS300_D2.json · record 0 · spec 24 · dòng 29
- **Connector Section Diameter**: 38.5 mm — data/raw/CSI_METSENS300_D2.json · record 0 · spec 25 · dòng 30
- **Air Temperature Range**: -40 to +70 °C — data/raw/CSI_METSENS300_D2.json · record 0 · spec 26 · dòng 31
- **Air Temperature Resolution**: 0.1 °C — data/raw/CSI_METSENS300_D2.json · record 0 · spec 27 · dòng 32
- **Air Temperature Accuracy**: ±0.3 °C @ +20 °C — data/raw/CSI_METSENS300_D2.json · record 0 · spec 28 · dòng 33
- **Relative Humidity Range**: 0 to 100% — data/raw/CSI_METSENS300_D2.json · record 0 · spec 29 · dòng 34
- **Relative Humidity Resolution**: 1% (manual); brochure states 0.1 — data/raw/CSI_METSENS300_D2.json · record 0 · spec 30 · dòng 35
- **Relative Humidity Accuracy**: ±2% @ 20 °C (10 to 90% RH) — data/raw/CSI_METSENS300_D2.json · record 0 · spec 31 · dòng 36
- **Barometric Pressure Range**: 300 to 1100 hPa — data/raw/CSI_METSENS300_D2.json · record 0 · spec 32 · dòng 37
- **Barometric Pressure Resolution**: 0.1 hPa — data/raw/CSI_METSENS300_D2.json · record 0 · spec 33 · dòng 38
- **Barometric Pressure Accuracy**: ±0.5 hPa @ 25 °C — data/raw/CSI_METSENS300_D2.json · record 0 · spec 34 · dòng 39
- **Cable Length Options**: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified — data/raw/CSI_METSENS300_D2.json · record 0 · spec 35 · dòng 40

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## MetSENS500-DS

All-in-One Weather Sensor · CSI_METSENS500_DS

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ không khí, Độ ẩm tương đối, Áp suất khí quyển, Tốc độ gió, Hướng gió, Hướng la bàn.

Giao thức được ghi nhận: SDI-12 (supported).

Cấu hình model: Communication Configuration: SDI-12 digital output; Primary Digital Interface: SDI-12; Default Communication Settings: SDI-12 protocol; Default Address: SDI-12 address 0; Replacement Cable: METSENSCBL1 SDI-12 Replacement Cable; Signal / Data Wiring: Green: SDI-12 signal; Red: power; Black: power and signal ground; Clear: shield; Direct Data Logger Connection: Green → C / SDI-12 / U configured for SDI-12; Red → 12V; Black/Clear → G; CRBasic Programming: SDI12Recorder(); Cable Length Options: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified

**Ví dụ explanation tiếng Việt**

Khớp chính xác model MetSENS500-DS. MetSENS500-DS đo nhiệt độ không khí, độ ẩm tương đối, áp suất khí quyển, tốc độ gió, hướng gió, hướng la bàn, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Số đo gió hỗ trợ đánh giá điều kiện tại điểm lắp đặt. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số Operating Temperature Range: -40 to +70 °C. Thông số Air Temperature Resolution: 0.1 °C. Thông số air temperature accuracy: ±0.3 °C @ +20 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: MetSENS500-DS. MetSENS500-DS measures air temperature, relative humidity, barometric pressure, wind speed, wind direction, compass heading, providing readings to monitor conditions before deciding on adjustments. Wind readings support assessing conditions at the installation point. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. Operating Temperature Range: -40 to +70 °C. Air Temperature Resolution: 0.1 °C. air temperature accuracy: ±0.3 °C @ +20 °C.

**Thông số nguồn để đối chiếu**

- **Base Model**: MetSENS500 — data/raw/MetSENS500.json · record 2 · spec 0 · dòng 3
- **Product Type**: Compact Weather Sensor for Temperature, RH, Barometric Pressure, and Wind with Compass — data/raw/MetSENS500.json · record 2 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/MetSENS500.json · record 2 · spec 2 · dòng 5
- **Device Classification**: Primary measurement device / integrated weather sensor — data/raw/MetSENS500.json · record 2 · spec 3 · dòng 6
- **Primary Application**: Integrated measurement of common meteorological parameters — data/raw/MetSENS500.json · record 2 · spec 4 · dòng 7
- **Measurements Made**: Air temperature; relative humidity; barometric pressure; wind speed; wind direction; compass heading — data/raw/MetSENS500.json · record 2 · spec 5 · dòng 8
- **Communication Configuration**: SDI-12 digital output — data/raw/MetSENS500.json · record 2 · spec 6 · dòng 9
- **Primary Digital Interface**: SDI-12 — data/raw/MetSENS500.json · record 2 · spec 7 · dòng 10
- **Default Communication Settings**: SDI-12 protocol — data/raw/MetSENS500.json · record 2 · spec 8 · dòng 11
- **Default Address**: SDI-12 address 0 — data/raw/MetSENS500.json · record 2 · spec 9 · dòng 12
- **Replacement Cable**: METSENSCBL1 SDI-12 Replacement Cable — data/raw/MetSENS500.json · record 2 · spec 10 · dòng 13
- **Signal / Data Wiring**: Green: SDI-12 signal; Red: power; Black: power and signal ground; Clear: shield — data/raw/MetSENS500.json · record 2 · spec 11 · dòng 14
- **Direct Data Logger Connection**: Green → C / SDI-12 / U configured for SDI-12; Red → 12V; Black/Clear → G — data/raw/MetSENS500.json · record 2 · spec 12 · dòng 15
- **CRBasic Programming**: SDI12Recorder() — data/raw/MetSENS500.json · record 2 · spec 13 · dòng 16
- **Sampling Rate**: 1 Hz — data/raw/MetSENS500.json · record 2 · spec 14 · dòng 17
- **IP Rating**: IP66 — data/raw/MetSENS500.json · record 2 · spec 15 · dòng 18
- **Compliance**: CE and RoHS compliant; where applicable, individual parameters meet or exceed IEC 61724-1 (2017, 2021) — data/raw/MetSENS500.json · record 2 · spec 16 · dòng 19
- **Operating Temperature Range**: -40 to +70 °C — data/raw/MetSENS500.json · record 2 · spec 17 · dòng 20
- **Operating Voltage**: 5 to 30 VDC — data/raw/MetSENS500.json · record 2 · spec 18 · dòng 21
- **Typical Current Drain – Continuous High Mode**: 25 mA @ 12 VDC — data/raw/MetSENS500.json · record 2 · spec 19 · dòng 22
- **Typical Current Drain – Eco-Power Mode**: 0.7 mA @ 12 VDC (1 hour polled) — data/raw/MetSENS500.json · record 2 · spec 20 · dòng 23
- **Weight**: 0.7 kg (1.5 lb) — data/raw/MetSENS500.json · record 2 · spec 21 · dòng 24
- **Overall Height**: 222 mm — data/raw/MetSENS500.json · record 2 · spec 22 · dòng 25
- **Maximum Diameter**: 142 mm — data/raw/MetSENS500.json · record 2 · spec 23 · dòng 26
- **Air Temperature Range**: -40 to +70 °C — data/raw/MetSENS500.json · record 2 · spec 24 · dòng 27
- **Air Temperature Resolution**: 0.1 °C — data/raw/MetSENS500.json · record 2 · spec 25 · dòng 28
- **Air Temperature Accuracy**: ±0.3 °C @ +20 °C — data/raw/MetSENS500.json · record 2 · spec 26 · dòng 29
- **Relative Humidity Range**: 0 to 100% — data/raw/MetSENS500.json · record 2 · spec 27 · dòng 30
- **Relative Humidity Resolution**: 1% (manual); brochure states 0.1 — data/raw/MetSENS500.json · record 2 · spec 28 · dòng 31
- **Relative Humidity Accuracy**: ±2% @ 20 °C (10 to 90% RH) — data/raw/MetSENS500.json · record 2 · spec 29 · dòng 32
- **Barometric Pressure Range**: 300 to 1100 hPa — data/raw/MetSENS500.json · record 2 · spec 30 · dòng 33
- **Barometric Pressure Resolution**: 0.1 hPa — data/raw/MetSENS500.json · record 2 · spec 31 · dòng 34
- **Barometric Pressure Accuracy**: ±0.5 hPa @ 25 °C — data/raw/MetSENS500.json · record 2 · spec 32 · dòng 35
- **Wind Speed Range**: 0.01 to 60 m/s — data/raw/MetSENS500.json · record 2 · spec 33 · dòng 36
- **Wind Speed Resolution**: 0.01 m/s — data/raw/MetSENS500.json · record 2 · spec 34 · dòng 37
- **Wind Speed Starting Threshold**: 0.01 m/s — data/raw/MetSENS500.json · record 2 · spec 35 · dòng 38
- **Wind Speed Accuracy**: ±3% up to 40 m/s; ±5% up to 60 m/s — data/raw/MetSENS500.json · record 2 · spec 36 · dòng 39
- **Wind Direction Range**: 0° to 359° — data/raw/MetSENS500.json · record 2 · spec 37 · dòng 40
- **Wind Direction Resolution**: 1° — data/raw/MetSENS500.json · record 2 · spec 38 · dòng 41
- **Wind Direction Accuracy**: ±3° up to 40 m/s; ±5° from 40 to 60 m/s — data/raw/MetSENS500.json · record 2 · spec 39 · dòng 42
- **Compass Range**: 0° to 359° — data/raw/MetSENS500.json · record 2 · spec 40 · dòng 43
- **Compass Resolution**: 1° — data/raw/MetSENS500.json · record 2 · spec 41 · dòng 44
- **Compass Accuracy**: ±3° — data/raw/MetSENS500.json · record 2 · spec 42 · dòng 45
- **Cable Length Options**: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified — data/raw/MetSENS500.json · record 2 · spec 43 · dòng 46

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## MetSENS550-D2

Compact Weather Sensor · CSI_METSENS550_D2

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ không khí, Độ ẩm tương đối, Áp suất khí quyển, Lượng mưa, Tốc độ gió, Hướng gió, Hướng la bàn.

Giao thức được ghi nhận: RS-232 (supported).

Cấu hình model: Communication Configuration: RS-232 digital output; Primary Digital Interface: Serial RS-232; Default Communication Settings: 9600 baud; 8 data bits; even parity; 1 stop bit; Replacement Cable: METSENSCBL3 RS-232 Replacement Cable; Signal / Data Wiring: Green: RS-232 RXD; White: RS-232 TXD; Red: 12 VDC; Black: power and signal ground; Clear: shield; Direct Data Logger Connection: Green → C (odd); White → C (even); Red → 12V; Black/Clear → G; CRBasic Programming: SerialFlush(); Scan(); SerialOut(); SerialIn(); SplitStr(); Cable Length Options: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified

**Ví dụ explanation tiếng Việt**

Khớp chính xác model MetSENS550-D2. MetSENS550-D2 đo nhiệt độ không khí, độ ẩm tương đối, áp suất khí quyển, lượng mưa, tốc độ gió, hướng gió, hướng la bàn, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Số đo gió hỗ trợ đánh giá điều kiện tại điểm lắp đặt. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232. Thông số Operating Temperature Range: -40 to +70 °C. Thông số Air Temperature Resolution: 0.1 °C. Thông số air temperature accuracy: ±0.3 °C @ +20 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: MetSENS550-D2. MetSENS550-D2 measures air temperature, relative humidity, barometric pressure, precipitation, wind speed, wind direction, compass heading, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Wind readings support assessing conditions at the installation point. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232. Operating Temperature Range: -40 to +70 °C. Air Temperature Resolution: 0.1 °C. air temperature accuracy: ±0.3 °C @ +20 °C.

**Thông số nguồn để đối chiếu**

- **Base Model**: MetSENS550 — data/raw/CSI_METSENS550_D2.json · record 0 · spec 0 · dòng 3
- **Product Type**: Compact Weather Sensor for Temperature, RH, Barometric Pressure, and Wind with Precipitation Connector and Compass — data/raw/CSI_METSENS550_D2.json · record 0 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_METSENS550_D2.json · record 0 · spec 2 · dòng 5
- **Device Classification**: Primary measurement device / integrated weather sensor — data/raw/CSI_METSENS550_D2.json · record 0 · spec 3 · dòng 6
- **Primary Application**: Integrated measurement of common meteorological parameters with external tipping-bucket rain-gauge input — data/raw/CSI_METSENS550_D2.json · record 0 · spec 4 · dòng 7
- **Measurements Made**: Air temperature; relative humidity; barometric pressure; wind speed; wind direction; compass heading; precipitation input — data/raw/CSI_METSENS550_D2.json · record 0 · spec 5 · dòng 8
- **Communication Configuration**: RS-232 digital output — data/raw/CSI_METSENS550_D2.json · record 0 · spec 6 · dòng 9
- **Primary Digital Interface**: Serial RS-232 — data/raw/CSI_METSENS550_D2.json · record 0 · spec 7 · dòng 10
- **Default Communication Settings**: 9600 baud; 8 data bits; even parity; 1 stop bit — data/raw/CSI_METSENS550_D2.json · record 0 · spec 8 · dòng 11
- **Replacement Cable**: METSENSCBL3 RS-232 Replacement Cable — data/raw/CSI_METSENS550_D2.json · record 0 · spec 9 · dòng 13
- **Signal / Data Wiring**: Green: RS-232 RXD; White: RS-232 TXD; Red: 12 VDC; Black: power and signal ground; Clear: shield — data/raw/CSI_METSENS550_D2.json · record 0 · spec 10 · dòng 14
- **Direct Data Logger Connection**: Green → C (odd); White → C (even); Red → 12V; Black/Clear → G — data/raw/CSI_METSENS550_D2.json · record 0 · spec 11 · dòng 15
- **CRBasic Programming**: SerialFlush(); Scan(); SerialOut(); SerialIn(); SplitStr() — data/raw/CSI_METSENS550_D2.json · record 0 · spec 12 · dòng 16
- **Sampling Rate**: 1 Hz — data/raw/CSI_METSENS550_D2.json · record 0 · spec 13 · dòng 17
- **IP Rating**: IP66 — data/raw/CSI_METSENS550_D2.json · record 0 · spec 14 · dòng 18
- **Compliance**: CE and RoHS compliant; where applicable, individual parameters meet or exceed IEC 61724-1 (2017, 2021) — data/raw/CSI_METSENS550_D2.json · record 0 · spec 15 · dòng 19
- **Operating Temperature Range**: -40 to +70 °C — data/raw/CSI_METSENS550_D2.json · record 0 · spec 16 · dòng 20
- **Operating Voltage**: 5 to 30 VDC — data/raw/CSI_METSENS550_D2.json · record 0 · spec 17 · dòng 21
- **Typical Current Drain – Continuous High Mode**: 25 mA @ 12 VDC — data/raw/CSI_METSENS550_D2.json · record 0 · spec 18 · dòng 22
- **Typical Current Drain – Eco-Power Mode**: 0.7 mA @ 12 VDC (1 hour polled) — data/raw/CSI_METSENS550_D2.json · record 0 · spec 19 · dòng 23
- **Weight**: 0.7 kg (1.5 lb) — data/raw/CSI_METSENS550_D2.json · record 0 · spec 20 · dòng 24
- **Overall Height**: 222 mm — data/raw/CSI_METSENS550_D2.json · record 0 · spec 21 · dòng 25
- **Maximum Diameter**: 142 mm — data/raw/CSI_METSENS550_D2.json · record 0 · spec 22 · dòng 26
- **Air Temperature Range**: -40 to +70 °C — data/raw/CSI_METSENS550_D2.json · record 0 · spec 23 · dòng 27
- **Air Temperature Resolution**: 0.1 °C — data/raw/CSI_METSENS550_D2.json · record 0 · spec 24 · dòng 28
- **Air Temperature Accuracy**: ±0.3 °C @ +20 °C — data/raw/CSI_METSENS550_D2.json · record 0 · spec 25 · dòng 29
- **Relative Humidity Range**: 0 to 100% — data/raw/CSI_METSENS550_D2.json · record 0 · spec 26 · dòng 30
- **Relative Humidity Resolution**: 1% (manual); brochure states 0.1 — data/raw/CSI_METSENS550_D2.json · record 0 · spec 27 · dòng 31
- **Relative Humidity Accuracy**: ±2% @ 20 °C (10 to 90% RH) — data/raw/CSI_METSENS550_D2.json · record 0 · spec 28 · dòng 32
- **Barometric Pressure Range**: 300 to 1100 hPa — data/raw/CSI_METSENS550_D2.json · record 0 · spec 29 · dòng 33
- **Barometric Pressure Resolution**: 0.1 hPa — data/raw/CSI_METSENS550_D2.json · record 0 · spec 30 · dòng 34
- **Barometric Pressure Accuracy**: ±0.5 hPa @ 25 °C — data/raw/CSI_METSENS550_D2.json · record 0 · spec 31 · dòng 35
- **Wind Speed Range**: 0.01 to 60 m/s — data/raw/CSI_METSENS550_D2.json · record 0 · spec 32 · dòng 36
- **Wind Speed Resolution**: 0.01 m/s — data/raw/CSI_METSENS550_D2.json · record 0 · spec 33 · dòng 37
- **Wind Speed Starting Threshold**: 0.01 m/s — data/raw/CSI_METSENS550_D2.json · record 0 · spec 34 · dòng 38
- **Wind Speed Accuracy**: ±3% up to 40 m/s; ±5% up to 60 m/s — data/raw/CSI_METSENS550_D2.json · record 0 · spec 35 · dòng 39
- **Wind Direction Range**: 0° to 359° — data/raw/CSI_METSENS550_D2.json · record 0 · spec 36 · dòng 40
- **Wind Direction Resolution**: 1° — data/raw/CSI_METSENS550_D2.json · record 0 · spec 37 · dòng 41
- **Wind Direction Accuracy**: ±3° up to 40 m/s; ±5° from 40 to 60 m/s — data/raw/CSI_METSENS550_D2.json · record 0 · spec 38 · dòng 42
- **Precipitation Input Type**: Triggering / contact closure via M8 male, 4-pin connector — data/raw/CSI_METSENS550_D2.json · record 0 · spec 39 · dòng 43
- **Precipitation Input Range**: 0 to 1000 mm/h — data/raw/CSI_METSENS550_D2.json · record 0 · spec 40 · dòng 44
- **Precipitation Resolution**: From 0.01 mm — data/raw/CSI_METSENS550_D2.json · record 0 · spec 41 · dòng 45
- **Precipitation Cable Requirement**: User-supplied 20 m cable or mating female connector required — data/raw/CSI_METSENS550_D2.json · record 0 · spec 42 · dòng 46
- **Compass Range**: 0° to 359° — data/raw/CSI_METSENS550_D2.json · record 0 · spec 43 · dòng 47
- **Compass Resolution**: 1° — data/raw/CSI_METSENS550_D2.json · record 0 · spec 44 · dòng 48
- **Compass Accuracy**: ±3° — data/raw/CSI_METSENS550_D2.json · record 0 · spec 45 · dòng 49
- **Cable Length Options**: 5 m (17 ft), 15 m (50 ft), 46 m (150 ft), or user specified — data/raw/CSI_METSENS550_D2.json · record 0 · spec 46 · dòng 50

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## MS-80SH

Pyranometer · CSI_MS80SH

Nguồn catalog: https://www.campbellsci.com/products/ms-80sh

Đại lượng có bằng chứng: Bức xạ mặt trời.

Giao thức được ghi nhận: Modbus (supported), Modbus RTU (supported), RS-485 (supported), SDI-12 (supported).

Cấu hình model: Default RS-485 Configuration: 19200 baud; 8 data bits; even parity; 1 stop bit

**Ví dụ explanation tiếng Việt**

Khớp chính xác model MS-80SH. MS-80SH đo bức xạ mặt trời, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Modbus, Modbus RTU, RS-485, SDI-12. Thông số Operating Temperature Range: -40 to +80 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: MS-80SH. MS-80SH measures solar radiation, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Modbus, Modbus RTU, RS-485, SDI-12. Operating Temperature Range: -40 to +80 °C.

**Thông số nguồn để đối chiếu**

- **Product Name**: MS-80SH — data/raw/CSI_MS80SH.json · record 0 · spec 0 · dòng 2
- **Product Type**: Class A Digital Pyranometer with SDI-12 and Modbus Output — data/raw/CSI_MS80SH.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: EKO Instruments; supplied/cabled for Campbell Scientific systems — data/raw/CSI_MS80SH.json · record 0 · spec 2 · dòng 4
- **Device Classification**: Primary measurement device / solar radiation sensor — data/raw/CSI_MS80SH.json · record 0 · spec 3 · dòng 5
- **Primary Application**: Monitoring solar irradiance across the full solar spectrum — data/raw/CSI_MS80SH.json · record 0 · spec 4 · dòng 6
- **ISO Classification**: ISO 9060:2018 Class A spectrally flat and fast-response pyranometer (secondary standard) — data/raw/CSI_MS80SH.json · record 0 · spec 5 · dòng 7
- **Calibration**: ISO 17025-certified calibration — data/raw/CSI_MS80SH.json · record 0 · spec 6 · dòng 8
- **Sensor Construction**: Internal desiccation; single dome; quartz diffusor; thermally isolated thermopile detector — data/raw/CSI_MS80SH.json · record 0 · spec 7 · dòng 9
- **Integrated Sensors**: Tilt / roll sensor; internal temperature sensor; internal humidity sensor — data/raw/CSI_MS80SH.json · record 0 · spec 8 · dòng 10
- **Integrated Heater**: Controllable dome heater for dew and frost mitigation — data/raw/CSI_MS80SH.json · record 0 · spec 9 · dòng 11
- **Output**: SDI-12 and Modbus RTU over RS-485 (digital) — data/raw/CSI_MS80SH.json · record 0 · spec 10 · dòng 12
- **Default SDI-12 Address**: 0 — data/raw/CSI_MS80SH.json · record 0 · spec 11 · dòng 13
- **Default Modbus Address**: Last two digits of serial number — data/raw/CSI_MS80SH.json · record 0 · spec 12 · dòng 14
- **Default RS-485 Configuration**: 19200 baud; 8 data bits; even parity; 1 stop bit — data/raw/CSI_MS80SH.json · record 0 · spec 13 · dòng 15
- **Sensitivity**: ~10 µV/(W/m²) — data/raw/CSI_MS80SH.json · record 0 · spec 14 · dòng 16
- **Response Time – 95%**: <0.5 s (manual); brochure states <1 s — data/raw/CSI_MS80SH.json · record 0 · spec 15 · dòng 17
- **Response Time – 99%**: <1 s — data/raw/CSI_MS80SH.json · record 0 · spec 16 · dòng 18
- **Zero Offset A**: <1 W/m² (response to 200 W/m² net thermal radiation) — data/raw/CSI_MS80SH.json · record 0 · spec 17 · dòng 19
- **Zero Offset B**: ±1 W/m² (response to 5 K/h change in ambient temperature) — data/raw/CSI_MS80SH.json · record 0 · spec 18 · dòng 20
- **Non-Stability**: ±0.5% change in 5 years — data/raw/CSI_MS80SH.json · record 0 · spec 19 · dòng 21
- **Non-Linearity**: ±0.2% at 1000 W/m² — data/raw/CSI_MS80SH.json · record 0 · spec 20 · dòng 22
- **Directional Response**: ±10 W/m² at 1000 W/m² — data/raw/CSI_MS80SH.json · record 0 · spec 21 · dòng 23
- **Spectral Selectivity**: ±3% (0.35 to 1.5 µm) — data/raw/CSI_MS80SH.json · record 0 · spec 22 · dòng 24
- **Spectral Range**: 285 to 3000 nm — data/raw/CSI_MS80SH.json · record 0 · spec 23 · dòng 25
- **Irradiance Range**: 0 to 4000 W/m² — data/raw/CSI_MS80SH.json · record 0 · spec 24 · dòng 26
- **Temperature Response**: ±0.5% (-20 to +50 °C) per manual; brochure states <0.8% (-10 to +40 °C) and <1% (-20 to +50 °C) — data/raw/CSI_MS80SH.json · record 0 · spec 25 · dòng 27
- **Tilt Response**: ±0.2% at 1000 W/m² — data/raw/CSI_MS80SH.json · record 0 · spec 26 · dòng 28
- **Operating Temperature Range**: -40 to +80 °C — data/raw/CSI_MS80SH.json · record 0 · spec 27 · dòng 29
- **Supply Voltage**: 8 to 30 VDC — data/raw/CSI_MS80SH.json · record 0 · spec 28 · dòng 30
- **Wiring Power Input**: 8 to 32 VDC — data/raw/CSI_MS80SH.json · record 0 · spec 29 · dòng 31
- **Power Consumption**: <0.2 W without heater; <1.4 W with heater — data/raw/CSI_MS80SH.json · record 0 · spec 30 · dòng 32
- **Diameter – Including Sun Screen**: 9.6 cm (3.8 in.) — data/raw/CSI_MS80SH.json · record 0 · spec 31 · dòng 33
- **Body Height**: 7.3 cm (2.9 in.) — data/raw/CSI_MS80SH.json · record 0 · spec 32 · dòng 34
- **Dome Height**: 1.2 cm (0.5 in.) — data/raw/CSI_MS80SH.json · record 0 · spec 33 · dòng 35
- **Leveling Screw Height**: 1.6 cm (0.6 in.) — data/raw/CSI_MS80SH.json · record 0 · spec 34 · dòng 36
- **Weight**: 0.41 kg (0.90 lb) — data/raw/CSI_MS80SH.json · record 0 · spec 35 · dòng 37
- **SDI-12 Valid Addresses**: 0–9, a–z, A–Z — data/raw/CSI_MS80SH.json · record 0 · spec 36 · dòng 38
- **SDI-12 Measurement Instruction**: SDI12Recorder() — data/raw/CSI_MS80SH.json · record 0 · spec 37 · dòng 39
- **Modbus Measurement Instructions**: SerialOpen() followed by ModbusClient() — data/raw/CSI_MS80SH.json · record 0 · spec 38 · dòng 40
- **Compatible Campbell Scientific Data Loggers**: GRANITE series, CR6, CR1000X, CR350 series, CR300 series, CR1000, CR800 series — data/raw/CSI_MS80SH.json · record 0 · spec 39 · dòng 41
- **RS-485 Direct Compatibility**: MeteoPV, CR6 series, CR1000X, or Modbus RTU RS-485 network — data/raw/CSI_MS80SH.json · record 0 · spec 40 · dòng 42
- **Maintenance**: No scheduled replacement service items; no accessible desiccant cartridge — data/raw/CSI_MS80SH.json · record 0 · spec 41 · dòng 43
- **Recommended Recalibration Interval**: 2 years in the product manual; brochure states a 5-year recalibration interval — data/raw/CSI_MS80SH.json · record 0 · spec 42 · dòng 44
- **Warranty**: 5 years — data/raw/CSI_MS80SH.json · record 0 · spec 43 · dòng 45

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## NL201-ST

Ethernet Communication Device · CSI_NL201_ST

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: Auto-IP (supported), CS I/O (supported), DHCP (supported), DNS (supported), Ethernet (supported), HTTPS (supported), ICMP (supported), IPv4 (supported), IPv6 (supported), Modbus TCP (supported), PakBus (supported), RS-232 (supported), SLAAC (supported), TCP/IP (supported), Telnet (supported), TLS (supported), USB (supported), USB (unsupported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model NL201-ST. NL201-ST là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, Ethernet, HTTPS, Modbus TCP. Thông số power connector: CS I/O port or DC barrel connector; not powered over USB. Thông số Power Requirements: 7 to 20 VDC.

**Ví dụ explanation tiếng Anh**

Exact model match: NL201-ST. NL201-ST is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, Ethernet, HTTPS, Modbus TCP. power connector: CS I/O port or DC barrel connector; not powered over USB. Power Requirements: 7 to 20 VDC.

**Thông số nguồn để đối chiếu**

- **Base Model**: NL201 — data/raw/NL201.json · record 0 · spec 0 · dòng 3
- **Product Type**: Network Link Interface / Serial-to-Ethernet Interface — data/raw/NL201.json · record 0 · spec 1 · dòng 4
- **Device Classification**: Primary communications device / Ethernet network interface — data/raw/NL201.json · record 0 · spec 2 · dòng 6
- **Temperature Configuration**: Standard temperature — data/raw/NL201.json · record 0 · spec 3 · dòng 7
- **Temperature Range**: -25 to +50 °C — data/raw/NL201.json · record 0 · spec 4 · dòng 8
- **Primary Application**: Provides wired Ethernet connectivity to data loggers, peripherals, and other serial devices — data/raw/NL201.json · record 0 · spec 5 · dòng 9
- **Supported Modes**: PakBus router; TCP serial server; TCP serial client; Modbus TCP/IP gateway; TLS proxy server; Ethernet-to-CS I/O bridge — data/raw/NL201.json · record 0 · spec 6 · dòng 10
- **Transmission Area**: Worldwide — data/raw/NL201.json · record 0 · spec 7 · dòng 11
- **Power Connector**: CS I/O port or DC barrel connector; not powered over USB — data/raw/NL201.json · record 0 · spec 8 · dòng 12
- **Power Requirements**: 7 to 20 VDC — data/raw/NL201.json · record 0 · spec 9 · dòng 13
- **CS I/O Port**: SDC 7, 8, 10, or 11; does not support ME — data/raw/NL201.json · record 0 · spec 10 · dòng 14
- **RS-232 Port**: DTE — data/raw/NL201.json · record 0 · spec 11 · dòng 15
- **USB Port**: Micro-B; configuration only — data/raw/NL201.json · record 0 · spec 12 · dòng 16
- **Ethernet Port**: 10Base-T and 100Base-TX; full/half duplex; Auto-MDIX; Auto-IP (APIPA) — data/raw/NL201.json · record 0 · spec 13 · dòng 17
- **Supported Network Protocols**: IPv4, IPv6, ICMP/Ping, ICMPv6/Ping, TCP, DHCP Client, SLAAC, DNS Client, HTTPS Proxy, Telnet Server, TLS, PakBus, Modbus TCP/IP — data/raw/NL201.json · record 0 · spec 14 · dòng 18
- **TCP Connections**: 50 simultaneous connections; up to 10 may be used for TLS — data/raw/NL201.json · record 0 · spec 15 · dòng 19
- **PakBus Router Capacity**: 50 routes — data/raw/NL201.json · record 0 · spec 16 · dòng 20
- **Modbus Server Capacity**: 15 transactions maximum — data/raw/NL201.json · record 0 · spec 17 · dòng 21
- **Configuration Methods**: Device Configuration Utility over USB or Ethernet; terminal menu over Telnet; terminal menu over RS-232 — data/raw/NL201.json · record 0 · spec 18 · dòng 22
- **Service Requirements**: Ethernet access — data/raw/NL201.json · record 0 · spec 19 · dòng 23
- **Dimensions**: 16 × 6.73 × 2.54 cm (6.3 × 2.65 × 1 in.) — data/raw/NL201.json · record 0 · spec 20 · dòng 24
- **Weight**: 177 g (6.3 oz) — data/raw/NL201.json · record 0 · spec 21 · dòng 25
- **Current Drain – Active**: 50 mA @ 13 VDC — data/raw/NL201.json · record 0 · spec 22 · dòng 26
- **Current Drain – Forced Standby**: 2 mA (available in Ethernet-to-CS I/O Bridge Mode) — data/raw/NL201.json · record 0 · spec 23 · dòng 27
- **RS-232 Communication Rate**: 1200 bps to 115.2 kbps — data/raw/NL201.json · record 0 · spec 24 · dòng 28
- **CS I/O Communication Rate**: 9600 bps to 460.8 kbps — data/raw/NL201.json · record 0 · spec 25 · dòng 29
- **Ethernet Communication Rate**: 10/100 Mbps — data/raw/NL201.json · record 0 · spec 26 · dòng 30
- **Compliance**: RoHS compliant; Class B under European Standards; EN61326-1:2013 — data/raw/NL201.json · record 0 · spec 27 · dòng 31

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## NL241

Wi-Fi Communication Device · CSI_NL241

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), DHCP (supported), DNS (supported), HTTPS (supported), ICMP (supported), IPv4 (supported), IPv6 (supported), Modbus (supported), Modbus TCP (supported), PakBus (supported), RS-232 (supported), SLAAC (supported), TCP/IP (supported), Telnet (supported), TLS (supported), USB (supported), USB (unsupported), Wi-Fi (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model NL241. NL241 là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, HTTPS, Modbus, Modbus TCP. Thông số power source: CS I/O or DC barrel connector; not USB. Thông số Supply Voltage: 9 to 16 VDC. Thông số power consumption client mode: 7.5 to 8 mA idle; 65 to 75 mA communicating @ 12 VDC.

**Ví dụ explanation tiếng Anh**

Exact model match: NL241. NL241 is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, HTTPS, Modbus, Modbus TCP. power source: CS I/O or DC barrel connector; not USB. Supply Voltage: 9 to 16 VDC. power consumption client mode: 7.5 to 8 mA idle; 65 to 75 mA communicating @ 12 VDC.

**Thông số nguồn để đối chiếu**

- **Product Type**: Wireless Network Link Interface — data/raw/NL241.json · record 0 · spec 0 · dòng 3
- **Device Classification**: Primary communications device / Wi-Fi WLAN interface — data/raw/NL241.json · record 0 · spec 1 · dòng 5
- **Primary Application**: Provides Wi-Fi connectivity for Campbell Scientific data loggers and peripherals — data/raw/NL241.json · record 0 · spec 2 · dòng 6
- **Network Operation**: Can join an existing Wi-Fi network or create a Wi-Fi access point — data/raw/NL241.json · record 0 · spec 3 · dòng 7
- **Supported Connection Modes**: PakBus router; TCP Serial Server; TCP Serial Client; Modbus TCP/IP Gateway; Wi-Fi to CS I/O bridge; TLS proxy server — data/raw/NL241.json · record 0 · spec 4 · dòng 8
- **Transmission Area**: Worldwide — data/raw/NL241.json · record 0 · spec 5 · dòng 9
- **Housing Material**: Aluminum case with black anodized finish — data/raw/NL241.json · record 0 · spec 6 · dòng 10
- **Operating Temperature Range**: -40 to +70 °C — data/raw/NL241.json · record 0 · spec 7 · dòng 11
- **Configuration Methods**: Device Configuration Utility over USB or Wi-Fi; Telnet console over Wi-Fi; terminal menu over RS-232 — data/raw/NL241.json · record 0 · spec 8 · dòng 12
- **CS I/O Port**: 9600 bps to 460.8 kbps; SDC 7, 8, 10, or 11; does not support ME — data/raw/NL241.json · record 0 · spec 9 · dòng 13
- **RS-232 Port**: 1200 bps to 115.2 kbps; DTE; DB9 male — data/raw/NL241.json · record 0 · spec 10 · dòng 14
- **USB Port**: Micro-B; configuration only — data/raw/NL241.json · record 0 · spec 11 · dòng 15
- **Supported Protocols**: IPv4, IPv6, ICMP/Ping, ICMPv6/Ping, TCP/IP, DHCP Client, DHCP Server (access point mode only), SLAAC, DNS Client, HTTPS Proxy, TLS, Telnet Server, PakBus, Modbus — data/raw/NL241.json · record 0 · spec 12 · dòng 16
- **TCP Connections**: 50 simultaneous connections; up to 10 may be used for TLS — data/raw/NL241.json · record 0 · spec 13 · dòng 17
- **PakBus Router Capacity**: 50 routes — data/raw/NL241.json · record 0 · spec 14 · dòng 18
- **Modbus Server Capacity**: Up to 15 concurrent transactions — data/raw/NL241.json · record 0 · spec 15 · dòng 19
- **Power Source**: CS I/O or DC barrel connector; not USB — data/raw/NL241.json · record 0 · spec 16 · dòng 20
- **Supply Voltage**: 9 to 16 VDC — data/raw/NL241.json · record 0 · spec 17 · dòng 21
- **Power Consumption – Client Mode**: 7.5 to 8 mA idle; 65 to 75 mA communicating @ 12 VDC — data/raw/NL241.json · record 0 · spec 18 · dòng 22
- **Power Consumption – Access Point Mode**: 67 mA idle; 70 mA communicating @ 12 VDC — data/raw/NL241.json · record 0 · spec 19 · dòng 23
- **Power Consumption – Standby**: <1.5 mA @ 12 VDC — data/raw/NL241.json · record 0 · spec 20 · dòng 24
- **Dimensions**: 16 × 7.3 × 2.54 cm (6.3 × 2.9 × 1 in.) — data/raw/NL241.json · record 0 · spec 21 · dòng 25
- **Weight**: 180.35 g (6.36 oz) — data/raw/NL241.json · record 0 · spec 22 · dòng 26
- **WLAN Antenna Connector**: RP-SMA — data/raw/NL241.json · record 0 · spec 23 · dòng 27
- **WLAN Frequency**: 2.4 GHz — data/raw/NL241.json · record 0 · spec 24 · dòng 28
- **Supported WLAN Technologies**: 802.11b/g/n; WPA/WPA2-Personal; WPA/WPA2-Enterprise; WEP — data/raw/NL241.json · record 0 · spec 25 · dòng 29
- **Client Mode Security**: WPA/WPA2-Personal and Enterprise; WEP — data/raw/NL241.json · record 0 · spec 26 · dòng 30
- **Access Point Mode Security**: WPA2-Personal — data/raw/NL241.json · record 0 · spec 27 · dòng 31
- **WLAN Communication Rate**: Up to 72 Mbps (802.11n); up to 54 Mbps (802.11g); up to 11 Mbps (802.11b) — data/raw/NL241.json · record 0 · spec 28 · dòng 32
- **Transmit Power**: 7 ±1 dBm (low); 10 ±1 dBm (medium); 18 ±2 dBm (high) — data/raw/NL241.json · record 0 · spec 29 · dòng 33
- **Rx Sensitivity**: -97 dBm — data/raw/NL241.json · record 0 · spec 30 · dòng 34
- **Compliance**: CE compliant; Class A digital device under FCC Part 15 — data/raw/NL241.json · record 0 · spec 31 · dòng 35
- **Embedded Radio Transmitter Approvals**: FCC Identifier: XF6-RS9113SB; Industry Canada: 8407A-RS9113SB — data/raw/NL241.json · record 0 · spec 32 · dòng 36
- **Service Requirement**: Wi-Fi hotspot / access to standard 802.11b/g/n networks — data/raw/NL241.json · record 0 · spec 33 · dòng 37
- **Default Wi-Fi Network**: Creates an open network named NL241_SerialNumber — data/raw/NL241.json · record 0 · spec 34 · dòng 38
- **Default IP Address**: 192.168.67.1 when creating its default network — data/raw/NL241.json · record 0 · spec 35 · dòng 39
- **Bridge Mode**: Supports bridging WLAN and CS I/O communications for compatible data loggers — data/raw/NL241.json · record 0 · spec 36 · dòng 40

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## NR01

Solar Radiation Sensor · CSI_NR01

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Bức xạ mặt trời, Bức xạ thuần.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model NR01. NR01 đo bức xạ mặt trời, bức xạ thuần, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số overall expected accuracy: ±10% for 12-hour totals, day and night. Thông số Operating Temperature Range: -40 to +80 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: NR01. NR01 measures solar radiation, net radiation, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. overall expected accuracy: ±10% for 12-hour totals, day and night. Operating Temperature Range: -40 to +80 °C.

**Thông số nguồn để đối chiếu**

- **Product Name**: NR01 — data/raw/NR01.json · record 0 · spec 0 · dòng 2
- **Product Type**: Four-Component Net Radiometer — data/raw/NR01.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Hukseflux; cabled for use with Campbell Scientific data loggers — data/raw/NR01.json · record 0 · spec 2 · dòng 4
- **Device Classification**: Primary measurement device / sensor — data/raw/NR01.json · record 0 · spec 3 · dòng 5
- **Primary Application**: Scientific-grade energy balance studies — data/raw/NR01.json · record 0 · spec 4 · dòng 6
- **Measurement Description**: Measures incoming and outgoing short-wave and long-wave radiation — data/raw/NR01.json · record 0 · spec 5 · dòng 7
- **Measurement Components**: Two SR01 pyranometers, two IR01 pyrgeometers, PT100 RTD, and heater — data/raw/NR01.json · record 0 · spec 6 · dòng 8
- **Pyranometer Type**: Hukseflux SR01 ISO-class thermopile pyranometer — data/raw/NR01.json · record 0 · spec 7 · dòng 9
- **Pyrgeometer Type**: IR01 pyrgeometer — data/raw/NR01.json · record 0 · spec 8 · dòng 10
- **Temperature Sensor**: PT100 DIN Class A RTD — data/raw/NR01.json · record 0 · spec 9 · dòng 11
- **Response Time**: 18 s (95% response) — data/raw/NR01.json · record 0 · spec 10 · dòng 12
- **Overall Expected Accuracy**: ±10% for 12-hour totals, day and night — data/raw/NR01.json · record 0 · spec 11 · dòng 13
- **Operating Temperature Range**: -40 to +80 °C — data/raw/NR01.json · record 0 · spec 12 · dòng 14
- **Heater**: 90 Ω, 1.6 W at 12 VDC; 16 VDC maximum — data/raw/NR01.json · record 0 · spec 13 · dòng 15
- **Heater Current Drain**: ~140 mA — data/raw/NR01.json · record 0 · spec 14 · dòng 16
- **Dimensions**: 26.3 × 11.3 × 12.1 cm (10.4 × 4.4 × 4.8 in.) — data/raw/NR01.json · record 0 · spec 15 · dòng 17
- **Weight – Sensor Only**: 0.9 kg (2 lb) — data/raw/NR01.json · record 0 · spec 16 · dòng 18
- **Weight – With 5 m Cable**: 1.3 kg (2.9 lb) — data/raw/NR01.json · record 0 · spec 17 · dòng 19
- **Cable Length**: User specified; maximum 100 ft — data/raw/NR01.json · record 0 · spec 18 · dòng 20
- **Cable Diameter**: 5.4 mm (2 cables) — data/raw/NR01.json · record 0 · spec 19 · dòng 21
- **Leveling Assembly**: 2-axis leveling assembly included — data/raw/NR01.json · record 0 · spec 20 · dòng 22
- **Radiation Shields**: Four shields included — data/raw/NR01.json · record 0 · spec 21 · dòng 23
- **Recommended Recalibration Interval**: Every 2 years — data/raw/NR01.json · record 0 · spec 22 · dòng 24
- **CE Compliance**: Compliant with CE directives — data/raw/NR01.json · record 0 · spec 23 · dòng 25
- **Pyranometer Classification**: Second class pyranometer according to ISO 9060 / WMO — data/raw/NR01.json · record 0 · spec 24 · dòng 26
- **Pyranometer Sensitivity**: 10 to 40 µV/(W/m²) — data/raw/NR01.json · record 0 · spec 25 · dòng 27
- **Pyranometer Expected Voltage Output**: -0.1 to +50 mV — data/raw/NR01.json · record 0 · spec 26 · dòng 28
- **Pyranometer Range**: Up to 2000 W/m² — data/raw/NR01.json · record 0 · spec 27 · dòng 29
- **Pyranometer Spectral Range**: 305 to 2800 nm — data/raw/NR01.json · record 0 · spec 28 · dòng 30
- **Pyranometer Zero Offset A**: <15 W/m² — data/raw/NR01.json · record 0 · spec 29 · dòng 31
- **Pyranometer Zero Offset B**: <4 W/m² — data/raw/NR01.json · record 0 · spec 30 · dòng 32
- **Pyranometer Non-Stability**: <1% change per year — data/raw/NR01.json · record 0 · spec 31 · dòng 33
- **Pyranometer Non-Linearity**: <±2.5% — data/raw/NR01.json · record 0 · spec 32 · dòng 34
- **Pyranometer Directional Response**: Within ±25 W/m² — data/raw/NR01.json · record 0 · spec 33 · dòng 35
- **Pyranometer Spectral Selectivity**: ±5% (305 to 2000 nm) — data/raw/NR01.json · record 0 · spec 34 · dòng 36
- **Pyranometer Temperature Response**: Within 6% (-10 to 40 °C) — data/raw/NR01.json · record 0 · spec 35 · dòng 37
- **Pyranometer Tilt Response**: Within ±2% — data/raw/NR01.json · record 0 · spec 36 · dòng 38
- **Pyranometer Sensor Resistance**: 40 to 60 Ω (without trimming) — data/raw/NR01.json · record 0 · spec 37 · dòng 39
- **Pyranometer Power Required**: Zero (passive sensor) — data/raw/NR01.json · record 0 · spec 38 · dòng 40
- **Pyranometer Calibration Traceability**: To WRR, procedure according to ISO 9847 — data/raw/NR01.json · record 0 · spec 39 · dòng 41
- **Pyrgeometer Field of View**: 150° — data/raw/NR01.json · record 0 · spec 40 · dòng 42
- **Pyrgeometer Sensitivity**: 5 to 15 µV/(W/m²) — data/raw/NR01.json · record 0 · spec 41 · dòng 43
- **Pyrgeometer Expected Voltage Output**: -5 to +5 mV — data/raw/NR01.json · record 0 · spec 42 · dòng 44
- **Pyrgeometer Range**: Up to 1000 W/m² — data/raw/NR01.json · record 0 · spec 43 · dòng 45
- **Pyrgeometer Spectral Range**: 4500 to 50,000 nm — data/raw/NR01.json · record 0 · spec 44 · dòng 46
- **Pyrgeometer Window Heating Offset**: <15 W/m² — data/raw/NR01.json · record 0 · spec 45 · dòng 47
- **Pyrgeometer Zero Offset B**: <4 W/m² — data/raw/NR01.json · record 0 · spec 46 · dòng 48
- **Pyrgeometer Non-Stability**: <1% change per year — data/raw/NR01.json · record 0 · spec 47 · dòng 49
- **Pyrgeometer Non-Linearity**: <±2.5% — data/raw/NR01.json · record 0 · spec 48 · dòng 50
- **Pyrgeometer Temperature Response**: Within 6% (-10 to 40 °C) — data/raw/NR01.json · record 0 · spec 49 · dòng 51
- **Pyrgeometer Tilt Response**: Within ±2% — data/raw/NR01.json · record 0 · spec 50 · dòng 52
- **Pyrgeometer Sensor Resistance**: 100 to 400 Ω — data/raw/NR01.json · record 0 · spec 51 · dòng 53
- **Pyrgeometer Power Required**: Zero (passive sensor) — data/raw/NR01.json · record 0 · spec 52 · dòng 54
- **Pyrgeometer Calibration Traceability**: International temperature standard — data/raw/NR01.json · record 0 · spec 53 · dòng 55
- **Compatible Campbell Scientific Data Loggers**: CR6, CR3000, CR1000X, CR1000 — data/raw/NR01.json · record 0 · spec 54 · dòng 56
- **CR1000 / CR1000X RTD Requirement**: 4WPB100 PRT Bridge Module required to measure internal RTD — data/raw/NR01.json · record 0 · spec 55 · dòng 57

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## PS150

Power Supply / Charge Regulator · CSI_PS150

Nguồn catalog: https://www.campbellsci.com/products/ps150

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model PS150. PS150 là Power Supply / Charge Regulator, dùng cho phần cấp nguồn. Cần đối chiếu điện áp, dòng điện, pin và tải; chưa xác nhận thời gian hoạt động của hệ thống. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Input Voltage Range: 15 to 40 Vdc. Thông số maximum charging current: 4.0 Adc typical; 3.2 to 4.9 Adc depending upon individual charger. Thông số no battery connected: 930 µA at 30 V input voltage, AC or DC.

**Ví dụ explanation tiếng Anh**

Exact model match: PS150. PS150 is a Power Supply / Charge Regulator for system power. Check voltage, current, batteries and load; system runtime is not established. Installation suitability for your specific use case remains unconfirmed. Input Voltage Range: 15 to 40 Vdc. maximum charging current: 4.0 Adc typical; 3.2 to 4.9 Adc depending upon individual charger. no battery connected: 930 µA at 30 V input voltage, AC or DC.

**Thông số nguồn để đối chiếu**

- **Operational Temperature**: -40°C to +60°C; VRLA battery manufacturers state that “heat kills batteries” and recommend operating batteries at ≤50°C — data/raw/CH150_PS150.json · record 0 · spec 0 · dòng 2
- **Dimensions**: 19.3 × 7.6 × 10.6 cm (7.5 × 3 × 4.2 in.) — data/raw/CH150_PS150.json · record 0 · spec 1 · dòng 3
- **AC**: 18 to 24 VRMS, internally limited to 1.2 ARMS — data/raw/CH150_PS150.json · record 0 · spec 2 · dòng 5
- **DC**: 16 to 40 Vdc, internally limited to 0.85 Adc — data/raw/CH150_PS150.json · record 0 · spec 3 · dòng 6
- **Note**: Battery voltages below 8.7 V may result in <3.0 A current limit because of fold-back current limit — data/raw/CH150_PS150.json · record 0 · spec 4 · dòng 8
- **Input Voltage Range**: 15 to 40 Vdc — data/raw/CH150_PS150.json · record 0 · spec 5 · dòng 9
- **Maximum Charging Current**: 4.0 Adc typical; 3.2 to 4.9 Adc depending upon individual charger — data/raw/CH150_PS150.json · record 0 · spec 6 · dòng 10
- **No Charge Source Present**: 160 µA at 13.7 Vdc — data/raw/CH150_PS150.json · record 0 · spec 7 · dòng 12
- **No Battery Connected**: 930 µA at 30 V input voltage, AC or DC — data/raw/CH150_PS150.json · record 0 · spec 8 · dòng 13
- **Note**: “T” represents temperature in degrees Celsius — data/raw/CH150_PS150.json · record 0 · spec 9 · dòng 15
- **FLOAT Charging**: Vbatt(T) = 13.65 V - (24 mV) × (T - 25) + (0.24 mV) × (T - 25)² — data/raw/CH150_PS150.json · record 0 · spec 10 · dòng 16
- **Accuracy**: ±1% on charging voltage over -40°C to +60°C — data/raw/CH150_PS150.json · record 0 · spec 11 · dòng 17
- **Voltage**: Unregulated 12 V from battery; 4.65 A solid-state circuit breaker — data/raw/CH150_PS150.json · record 0 · spec 12 · dòng 19
- **Standards**: ETL Listed Class 2 power supply — data/raw/CH150_PS150.json · record 0 · spec 13 · dòng 20

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## PS200

Power Supply / Charge Regulator · CSI_PS200

Nguồn catalog: https://www.campbellsci.com/products/ps200

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model PS200. PS200 là Power Supply / Charge Regulator, dùng cho phần cấp nguồn. Cần đối chiếu điện áp, dòng điện, pin và tải; chưa xác nhận thời gian hoạt động của hệ thống. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Input Voltage Range: 15 to 40 Vdc. Thông số maximum charging current: 4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger). Thông số no battery connected: 2 mA maximum.

**Ví dụ explanation tiếng Anh**

Exact model match: PS200. PS200 is a Power Supply / Charge Regulator for system power. Check voltage, current, batteries and load; system runtime is not established. Installation suitability for your specific use case remains unconfirmed. Input Voltage Range: 15 to 40 Vdc. maximum charging current: 4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger). no battery connected: 2 mA maximum.

**Thông số nguồn để đối chiếu**

- **Operational Temperature**: -40°C to +60°C; VRLA battery manufacturers state that “heat kills batteries” and recommend operating batteries at ≤50°C — data/raw/ch200_201_ps200.json · record 1 · spec 0 · dòng 3
- **Weight**: 376.48 g (0.83 lb) — data/raw/ch200_201_ps200.json · record 1 · spec 1 · dòng 6
- **AC**: 18 to 24 VRMS, with 1.2 ARMS maximum — data/raw/ch200_201_ps200.json · record 1 · spec 2 · dòng 8
- **DC**: 16 to 40 Vdc, with 1.1 A DC maximum — data/raw/ch200_201_ps200.json · record 1 · spec 3 · dòng 9
- **Note**: Battery voltages below 8.7 V may result in less than 3.0 A current limit because of fold-back current limit — data/raw/ch200_201_ps200.json · record 1 · spec 4 · dòng 11
- **Input Voltage Range**: 15 to 40 Vdc — data/raw/ch200_201_ps200.json · record 1 · spec 5 · dòng 12
- **Maximum Charging Current**: 4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger) — data/raw/ch200_201_ps200.json · record 1 · spec 6 · dòng 13
- **No Charge Source Present**: 300 µA maximum — data/raw/ch200_201_ps200.json · record 1 · spec 7 · dòng 17
- **No Battery Connected**: 2 mA maximum — data/raw/ch200_201_ps200.json · record 1 · spec 8 · dòng 18
- **Battery Charging Note**: Two-step temperature-compensated constant-voltage charging for valve-regulated lead-acid batteries; cycle and float charging voltage parameters are programmable with default values listed — data/raw/ch200_201_ps200.json · record 1 · spec 9 · dòng 20
- **CYCLE Charging**: Vbatt(T) = 14.70 V − (24 mV) × (T − 25°C) — data/raw/ch200_201_ps200.json · record 1 · spec 10 · dòng 21
- **FLOAT Charging**: Vbatt(T) = 13.65 V − (18 mV) × (T − 25°C) — data/raw/ch200_201_ps200.json · record 1 · spec 11 · dòng 22
- **Charging Voltage Accuracy**: ±1% on charging voltage over -40°C to +60°C — data/raw/ch200_201_ps200.json · record 1 · spec 12 · dòng 23
- **Voltage**: Unregulated 12 V from battery — data/raw/ch200_201_ps200.json · record 1 · spec 13 · dòng 25
- **Output Protection**: 4 A self-resettable thermal fuse — data/raw/ch200_201_ps200.json · record 1 · spec 14 · dòng 26
- **Fuse Hold Current Limit**: >4 A (<20°C); 2.7 A (60°C); 3.1 A (50°C); 4.0 A (20°C) — data/raw/ch200_201_ps200.json · record 1 · spec 15 · dòng 27
- **Measurement Temperature Note**: Over -40°C to +60°C range — data/raw/ch200_201_ps200.json · record 1 · spec 16 · dòng 30
- **Average Battery Voltage**: ±(1% of reading + 15 mV) — data/raw/ch200_201_ps200.json · record 1 · spec 17 · dòng 31
- **Average Battery/Load Current**: ±(2% of reading + 2 mA) — data/raw/ch200_201_ps200.json · record 1 · spec 18 · dòng 32
- **Solar**: ±(1% of reading − 0.25 V) / −(1% of reading + 1 V) — data/raw/ch200_201_ps200.json · record 1 · spec 19 · dòng 40
- **Solar Negative Offset Note**: 1.0 V negative offset is worst-case due to reversal protection diode on input; typical diode drop is 0.35 V — data/raw/ch200_201_ps200.json · record 1 · spec 20 · dòng 41
- **Continuous**: ±(1% of reading − 0.5 V) / −(1% of reading + 2 V) — data/raw/ch200_201_ps200.json · record 1 · spec 21 · dòng 42
- **Continuous Negative Offset Note**: 2.0 V negative offset is worst-case due to two series diodes in AC full-bridge; typical diode drops are 0.35 each for 0.7 V total — data/raw/ch200_201_ps200.json · record 1 · spec 22 · dòng 43
- **Charger Temperature**: ±2°C — data/raw/ch200_201_ps200.json · record 1 · spec 23 · dòng 44

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## PS24-w/CH150

Power Supply / Charge Regulator · CSI_PS24_W_CH150

Nguồn catalog: https://www.campbellsci.com/products/ps24

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Product Name: PS24-w/CH150; Regulator: CH150; Regulator Role: Microcontroller-based smart charger with temperature compensation; intended for standard applications; Included Main Components: 24 Ah battery; CH150 regulator; 10 × 12 in. environmental enclosure; Current Website Configuration Status: Available with multiple mounting options (for example -MM, -LM, -TM, -PM, -EM)

**Ví dụ explanation tiếng Việt**

Khớp chính xác model PS24-w/CH150. PS24-w/CH150 là Power Supply / Charge Regulator, dùng cho phần cấp nguồn. Cần đối chiếu điện áp, dòng điện, pin và tải; chưa xác nhận thời gian hoạt động của hệ thống. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số charging source: AC wall charger or solar panel; ordered separately. Thông số input voltage: 15 to 28 VDC or 18 VAC RMS (CHG terminals). Thông số charging output voltage: Temperature-compensated float charge for 12 V battery.

**Ví dụ explanation tiếng Anh**

Exact model match: PS24-w/CH150. PS24-w/CH150 is a Power Supply / Charge Regulator for system power. Check voltage, current, batteries and load; system runtime is not established. Installation suitability for your specific use case remains unconfirmed. charging source: AC wall charger or solar panel; ordered separately. input voltage: 15 to 28 VDC or 18 VAC RMS (CHG terminals). charging output voltage: Temperature-compensated float charge for 12 V battery.

**Thông số nguồn để đối chiếu**

- **Product Name**: PS24-w/CH150 — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 0 · dòng 2
- **Base Model**: PS24 — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 1 · dòng 3
- **Product Type**: 24 Ah Power Supply with 10 × 12 in. Enclosure — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 2 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 3 · dòng 5
- **Device Classification**: Primary power-supply assembly — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 4 · dòng 6
- **Regulator**: CH150 — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 5 · dòng 7
- **Regulator Role**: Microcontroller-based smart charger with temperature compensation; intended for standard applications — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 6 · dòng 8
- **Primary Application**: Power supply for systems with above-average power requirements where the battery/power supply is housed in a separate enclosure — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 7 · dòng 10
- **Included Main Components**: 24 Ah battery; CH150 regulator; 10 × 12 in. environmental enclosure — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 8 · dòng 11
- **Charging Source**: AC wall charger or solar panel; ordered separately — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 9 · dòng 12
- **Cable Entry**: One 1.5 in. diameter conduit — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 10 · dòng 13
- **Included Output Cable**: 3.05 m (10.0 ft) cable to a data logger or other device requiring 12 V/Ground — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 11 · dòng 14
- **Input Voltage**: 15 to 28 VDC or 18 VAC RMS (CHG terminals) — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 12 · dòng 15
- **Charging Output Voltage**: Temperature-compensated float charge for 12 V battery — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 13 · dòng 16
- **Charging Current Limit**: 1.2 A typical — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 14 · dòng 17
- **Power Out (+12 Terminals) Voltage**: Unregulated 12 V from battery — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 15 · dòng 18
- **Battery Nominal Rating**: 24 Ah — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 16 · dòng 19
- **Enclosure Rating**: NEMA 4X (modified for cable entry) — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 17 · dòng 20
- **Enclosure Internal Dimensions**: 25.4 × 30.5 × 11.4 cm (10 × 12 × 4.5 in.) — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 18 · dòng 21
- **Enclosure Color**: White — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 19 · dòng 22
- **Enclosure Construction**: Fiberglass-reinforced polyester enclosure with door gasket, external grounding lug, stainless steel hinge, and lockable hasps — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 20 · dòng 23
- **Operating Temperature Range**: -40 to +60 °C — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 21 · dòng 24
- **Weight**: 10.2 kg (22.4 lb) — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 22 · dòng 25
- **Current Website Configuration Status**: Available with multiple mounting options (for example -MM, -LM, -TM, -PM, -EM) — data/raw/CSI_PS24_W_CH150.json · record 0 · spec 23 · dòng 26

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## PS84-CR

Power Supply / Charge Regulator · CSI_PS84_CR

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: chưa ghi nhận.



**Ví dụ explanation tiếng Việt**

Khớp chính xác model PS84-CR. PS84-CR là Power Supply / Charge Regulator, dùng cho phần cấp nguồn. Cần đối chiếu điện áp, dòng điện, pin và tải; chưa xác nhận thời gian hoạt động của hệ thống. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số charging source: Typically an unregulated solar panel through CH200 Regulator. Thông số power out plus 12 terminals voltage: Unregulated 12 V from battery. Thông số battery nominal rating: 84 Ah (when battery discharged at a 24 hr rate).

**Ví dụ explanation tiếng Anh**

Exact model match: PS84-CR. PS84-CR is a Power Supply / Charge Regulator for system power. Check voltage, current, batteries and load; system runtime is not established. Installation suitability for your specific use case remains unconfirmed. charging source: Typically an unregulated solar panel through CH200 Regulator. power out plus 12 terminals voltage: Unregulated 12 V from battery. battery nominal rating: 84 Ah (when battery discharged at a 24 hr rate).

**Thông số nguồn để đối chiếu**

- **Product Type**: 84 Ah Power Supply with 14 × 16 in. Enclosure — data/raw/PS84.json · record 2 · spec 0 · dòng 3
- **Device Classification**: Primary power-supply assembly — data/raw/PS84.json · record 2 · spec 1 · dòng 5
- **Configuration / Regulator**: CH200 Regulator — data/raw/PS84.json · record 2 · spec 2 · dòng 6
- **Primary Application**: Power supply for systems with larger power requirements, housed in a separate enclosure — data/raw/PS84.json · record 2 · spec 3 · dòng 7
- **Included Main Components**: 84 Ah battery; mounting bracket; 14 × 16 in. environmental enclosure; CH200 Regulator — data/raw/PS84.json · record 2 · spec 4 · dòng 8
- **Charging Source**: Typically an unregulated solar panel through CH200 Regulator — data/raw/PS84.json · record 2 · spec 5 · dòng 9
- **Cable-Entry Conduits**: One or two cable-entry conduits — data/raw/PS84.json · record 2 · spec 6 · dòng 10
- **Power Out (+12 Terminals) Voltage**: Unregulated 12 V from battery — data/raw/PS84.json · record 2 · spec 7 · dòng 11
- **Battery Nominal Rating**: 84 Ah (when battery discharged at a 24 hr rate) — data/raw/PS84.json · record 2 · spec 8 · dòng 12
- **Enclosure Rating**: NEMA 4X (modified for cable entry) — data/raw/PS84.json · record 2 · spec 9 · dòng 13
- **Temperature Range**: -40 to +71 °C — data/raw/PS84.json · record 2 · spec 10 · dòng 14
- **Enclosure External Dimensions**: 39.4 × 44.5 × 15.7 cm (15.5 × 17.5 × 6.2 in.) — data/raw/PS84.json · record 2 · spec 11 · dòng 15
- **Enclosure Internal Dimensions**: 35.6 × 40.6 × 15 cm (14 × 16 × 5.9 in.) — data/raw/PS84.json · record 2 · spec 12 · dòng 16
- **Battery Shipping Box Dimensions**: 20.3 × 33 × 35.6 cm (8 × 13 × 14 in.) — data/raw/PS84.json · record 2 · spec 13 · dòng 17
- **Bracket Dimensions**: 30.5 × 14.5 × 33 cm (4 × 6 × 13 in.) — data/raw/PS84.json · record 2 · spec 14 · dòng 18
- **Backplate Dimensions**: 3.18 × 10.16 × 33.02 cm (1.25 × 4 × 13 in.) — data/raw/PS84.json · record 2 · spec 15 · dòng 19
- **Sideplate Dimensions**: 3.8 × 12.7 × 38.1 cm (1.5 × 5 × 15 in.) — data/raw/PS84.json · record 2 · spec 16 · dòng 20
- **Bridgeplate Dimensions**: 3 × 10 × 32 cm (1.25 × 4 × 13 in.) — data/raw/PS84.json · record 2 · spec 17 · dòng 21
- **Backplate Weight**: 0.5 kg (1 lb) — data/raw/PS84.json · record 2 · spec 18 · dòng 22
- **Sideplate 1 Weight**: 0.5 kg (1 lb) — data/raw/PS84.json · record 2 · spec 19 · dòng 23
- **Sideplate 2 Weight**: 0.5 kg (1 lb) — data/raw/PS84.json · record 2 · spec 20 · dòng 24
- **Bridgeplate Weight**: 0.25 kg (0.5 lb) — data/raw/PS84.json · record 2 · spec 21 · dòng 25
- **Battery Shipping Weight**: 25.9 kg (57 lb) — data/raw/PS84.json · record 2 · spec 22 · dòng 26
- **Bracket Weight**: 0.9 kg (2 lb) — data/raw/PS84.json · record 2 · spec 23 · dòng 27
- **Battery Weight**: 25 kg (55 lb) — data/raw/PS84.json · record 2 · spec 24 · dòng 28

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## RainVue10-MM

Precipitation Sensor · CSI_RAINVUE10_MM

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ, Lượng mưa, Cường độ mưa, Độ nghiêng.

Giao thức được ghi nhận: SDI-12 (supported), USB (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model RainVue10-MM. RainVue10-MM đo nhiệt độ, lượng mưa, cường độ mưa, độ nghiêng, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12, USB. Thông số Measurement Range: 0 to 1200 mm/h (0 to 48 in./h). Thông số Precipitation Amount Resolution: 0.254 mm (0.01 in.). Thông số precipitation amount measurement uncertainty: 1% at 0 to 1200 mm/h intensity.

**Ví dụ explanation tiếng Anh**

Exact model match: RainVue10-MM. RainVue10-MM measures temperature, precipitation, precipitation intensity, tilt, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12, USB. Measurement Range: 0 to 1200 mm/h (0 to 48 in./h). Precipitation Amount Resolution: 0.254 mm (0.01 in.). precipitation amount measurement uncertainty: 1% at 0 to 1200 mm/h intensity.

**Thông số nguồn để đối chiếu**

- **Product Type**: SDI-12 Precipitation Sensor with Plastic Funnel — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 0 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 1 · dòng 4
- **Device Classification**: Primary measurement device / precipitation sensor — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 2 · dòng 5
- **Product Family**: RainVue Series — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 3 · dòng 6
- **Available Configuration**: 0.01 inch (0.254 mm) tip — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 4 · dòng 7
- **Sensor Type**: Tipping bucket with magnetic reed switch — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 5 · dòng 8
- **Material**: Injection-molded, highly robust, UV-stabilized plastic (ASA LI-911) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 6 · dòng 9
- **Output**: SDI-12 version 1.4 — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 7 · dòng 10
- **Sensor Configuration**: SDI-12 or USB — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 8 · dòng 11
- **Measurement Range**: 0 to 1200 mm/h (0 to 48 in./h) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 9 · dòng 12
- **Precipitation Amount Resolution**: 0.254 mm (0.01 in.) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 10 · dòng 13
- **Precipitation Amount Measurement Uncertainty**: 1% at 0 to 1200 mm/h intensity — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 11 · dòng 14
- **Precipitation Intensity Range**: 0 to 1200 mm/h (0 to 48 in./h) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 12 · dòng 15
- **WMO Compliant**: No — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 13 · dòng 17
- **Operating Temperature Range**: -40 to +70 °C (including melting snow); 1 to 70 °C (liquid precipitation only) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 14 · dòng 18
- **Power Requirements**: 6 to 18 VDC — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 15 · dòng 19
- **Active Current Drain**: 1 mA — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 16 · dòng 20
- **Quiescent Current Drain**: 0.07 mA — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 17 · dòng 21
- **Internal Battery**: 240 mAh lithium battery; up to 15 days continual operation after power loss under stated conditions — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 18 · dòng 22
- **Response Time**: 0 s (M0! command); 1 s (M1! command) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 19 · dòng 23
- **Tilt Measurement Uncertainty**: ±1° — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 20 · dòng 24
- **Temperature Measurement Uncertainty**: ±0.25 °C — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 21 · dòng 25
- **Supply Voltage Measurement Uncertainty**: ±0.5 V — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 22 · dòng 26
- **Orifice Diameter**: 20.0 cm (7.87 in.) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 23 · dòng 27
- **Collecting Area**: 314.16 cm² (48.67 in²) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 24 · dòng 28
- **Height**: 43.5 to 46.5 cm (17.1 to 18.3 in.) with feet adjustment — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 25 · dòng 29
- **Weight**: 2 kg (4.5 lb) — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 26 · dòng 30
- **Aspen 10 Compatibility**: Compatible — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 27 · dòng 31
- **CRBasic Measurement Instruction**: SDI12Recorder() — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 28 · dòng 32
- **White Wire Function**: SDI-12 signal — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 29 · dòng 33
- **Clear Wire Function**: Shield — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 30 · dòng 34
- **Brown Wire Function**: Power — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 31 · dòng 35
- **Black Wire Function**: Power ground — data/raw/CSI_RAINVUE10_MM.json · record 0 · spec 32 · dòng 36

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## RangeVue30

Water Level, Stage, and Flow Sensor · CSI_RANGEVUE30

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Mực nước, Khoảng cách.

Giao thức được ghi nhận: SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model RangeVue30. RangeVue30 đo mực nước, khoảng cách, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số Measurement Range: Up to 30 m (98.4 ft). Thông số accuracy: ≤ ±2 mm (±0.0065 ft). Thông số Resolution: 1 mm (0.0033 ft).

**Ví dụ explanation tiếng Anh**

Exact model match: RangeVue30. RangeVue30 measures water level, distance, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. Measurement Range: Up to 30 m (98.4 ft). accuracy: ≤ ±2 mm (±0.0065 ft). Resolution: 1 mm (0.0033 ft).

**Thông số nguồn để đối chiếu**

- **Product Type**: SDI-12 Radar Water-Level Sensor — data/raw/RangeVue15-30.json · record 1 · spec 0 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/RangeVue15-30.json · record 1 · spec 1 · dòng 4
- **Device Classification**: Primary measurement device / sensor — data/raw/RangeVue15-30.json · record 1 · spec 2 · dòng 5
- **Product Family**: RangeVue Series — data/raw/RangeVue15-30.json · record 1 · spec 3 · dòng 6
- **Primary Application**: Non-contact monitoring of water level in rivers, lakes, tidal seas, and reservoirs — data/raw/RangeVue15-30.json · record 1 · spec 4 · dòng 7
- **Measurement Principle**: Continuous frequency-modulated 80 GHz radar; measures elapsed time between emitted and returned signal — data/raw/RangeVue15-30.json · record 1 · spec 5 · dòng 8
- **Measurement Description**: Distance / stage — data/raw/RangeVue15-30.json · record 1 · spec 6 · dòng 9
- **Measurement Range**: Up to 30 m (98.4 ft) — data/raw/RangeVue15-30.json · record 1 · spec 7 · dòng 10
- **Accuracy**: ≤ ±2 mm (±0.0065 ft) — data/raw/RangeVue15-30.json · record 1 · spec 8 · dòng 11
- **Resolution**: 1 mm (0.0033 ft) — data/raw/RangeVue15-30.json · record 1 · spec 9 · dòng 12
- **Output Protocol**: SDI-12 version 1.4 — data/raw/RangeVue15-30.json · record 1 · spec 10 · dòng 13
- **Default SDI-12 Address**: 0 — data/raw/RangeVue15-30.json · record 1 · spec 11 · dòng 14
- **Valid SDI-12 Addresses**: 0–9, a–z, A–Z — data/raw/RangeVue15-30.json · record 1 · spec 12 · dòng 15
- **Radar Frequency**: W-band (80 GHz) — data/raw/RangeVue15-30.json · record 1 · spec 13 · dòng 16
- **Beam Angle**: 4° — data/raw/RangeVue15-30.json · record 1 · spec 14 · dòng 17
- **Measuring Cycle Time**: ≤250 ms — data/raw/RangeVue15-30.json · record 1 · spec 15 · dòng 18
- **Step Response Time**: ≤3 s for changes up to 12 in — data/raw/RangeVue15-30.json · record 1 · spec 16 · dòng 19
- **Average Spectral Transmission Power Density**: -3 dBm/MHz EIRP — data/raw/RangeVue15-30.json · record 1 · spec 17 · dòng 20
- **Maximum Spectral Transmission Power Density**: +34 dBm/50 MHz EIRP — data/raw/RangeVue15-30.json · record 1 · spec 18 · dòng 21
- **Maximum Power Density at 1 m**: <3 µW/cm² — data/raw/RangeVue15-30.json · record 1 · spec 19 · dòng 22
- **Input Voltage**: 8 to 32 VDC — data/raw/RangeVue15-30.json · record 1 · spec 20 · dòng 23
- **Power Consumption – Maximum**: 200 mW — data/raw/RangeVue15-30.json · record 1 · spec 21 · dòng 24
- **Power Consumption – Default Mode**: 100 mW at <18 VDC — data/raw/RangeVue15-30.json · record 1 · spec 22 · dòng 25
- **Power Consumption – Low-Power Mode**: 25 mW at <18 VDC — data/raw/RangeVue15-30.json · record 1 · spec 23 · dòng 26
- **Current Drain**: 10 mA at 12 VDC — data/raw/RangeVue15-30.json · record 1 · spec 24 · dòng 27
- **Operating Temperature Range**: -40 to +80 °C — data/raw/RangeVue15-30.json · record 1 · spec 25 · dòng 28
- **Storage Temperature Range**: -40 to +80 °C — data/raw/RangeVue15-30.json · record 1 · spec 26 · dòng 29
- **Vibration Resistance**: 5 g, 4 to 100 Hz — data/raw/RangeVue15-30.json · record 1 · spec 27 · dòng 30
- **Mechanical Rating**: IP66/68 IEC 60529; Type 4X/6P UL 50 — data/raw/RangeVue15-30.json · record 1 · spec 28 · dòng 31
- **Housing Material**: PVDF plastic — data/raw/RangeVue15-30.json · record 1 · spec 29 · dòng 32
- **Antenna Material**: PVDF plastic — data/raw/RangeVue15-30.json · record 1 · spec 30 · dòng 33
- **Seal Material**: FKM — data/raw/RangeVue15-30.json · record 1 · spec 31 · dòng 34
- **Cable Termination**: 4-Pin A-Coded M12 Connector — data/raw/RangeVue15-30.json · record 1 · spec 32 · dòng 35
- **Threads**: 1 NPT — data/raw/RangeVue15-30.json · record 1 · spec 33 · dòng 36
- **Weight**: 0.7 kg (1.5 lb) — data/raw/RangeVue15-30.json · record 1 · spec 34 · dòng 37
- **Dimensions**: Overall height 130 mm (5.13 in); max diameter 76 mm (2.99 in) — data/raw/RangeVue15-30.json · record 1 · spec 35 · dòng 38
- **Bluetooth Configuration**: Supported via smartphone, tablet, or PC — data/raw/RangeVue15-30.json · record 1 · spec 36 · dòng 39
- **Bluetooth Minimum Requirement**: Bluetooth 4.0 LE or newer — data/raw/RangeVue15-30.json · record 1 · spec 37 · dòng 40
- **Mobile OS Requirements**: iOS 13+; Android 5.1+ — data/raw/RangeVue15-30.json · record 1 · spec 38 · dòng 41
- **Configuration Application**: Wireless Device Configurator — data/raw/RangeVue15-30.json · record 1 · spec 39 · dòng 42
- **USGS Accuracy Requirement**: Meets USGS Office of Surface Water (OSW) requirements — data/raw/RangeVue15-30.json · record 1 · spec 40 · dòng 43
- **Low-Power Mode**: Available — data/raw/RangeVue15-30.json · record 1 · spec 41 · dòng 44
- **Aspen 10 Compatibility**: Compatible — data/raw/RangeVue15-30.json · record 1 · spec 42 · dòng 45
- **Compatible Data Loggers / Controllers**: Any SDI-12 recorder; Campbell Scientific GRANITE series, CR6, CR1000X, CR300 series, CR3000, CR800 series, CR1000 — data/raw/RangeVue15-30.json · record 1 · spec 43 · dòng 46
- **White Wire Function**: SDI-12 signal — data/raw/RangeVue15-30.json · record 1 · spec 44 · dòng 47
- **Clear Wire Function**: Shield — data/raw/RangeVue15-30.json · record 1 · spec 45 · dòng 48
- **Brown Wire Function**: Power — data/raw/RangeVue15-30.json · record 1 · spec 46 · dòng 49
- **Black Wire Function**: Power ground — data/raw/RangeVue15-30.json · record 1 · spec 47 · dòng 50
- **Recommended Measurement Scan**: 10 seconds or more — data/raw/RangeVue15-30.json · record 1 · spec 48 · dòng 51
- **Beam Clearance Formula**: Clearance diameter = 0.070 × distance — data/raw/RangeVue15-30.json · record 1 · spec 49 · dòng 52
- **Sensor Alignment**: Antenna horn within 1° of vertical — data/raw/RangeVue15-30.json · record 1 · spec 50 · dòng 54

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## RF407

Radio Communication Device · CSI_RF407

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), RS-232 (supported), USB (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model RF407. RF407 là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232, USB. Thông số Operating Frequency: 902 to 928 MHz. Thông số Transmit Power Output: 5 to 250 mW (software-selectable). Thông số RF Data Rate: 200 kbps.

**Ví dụ explanation tiếng Anh**

Exact model match: RF407. RF407 is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232, USB. Operating Frequency: 902 to 928 MHz. Transmit Power Output: 5 to 250 mW (software-selectable). RF Data Rate: 200 kbps.

**Thông số nguồn để đối chiếu**

- **Product Type**: 900 MHz Spread-Spectrum Radio — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 0 · dòng 3
- **Device Classification**: Primary communications device / spread-spectrum radio — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 1 · dòng 5
- **Product Family**: RF407-series — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 2 · dòng 6
- **Country / Region**: US, Canada — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 3 · dòng 7
- **Radio Type**: Frequency Hopping Spread Spectrum (FHSS) — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 4 · dòng 8
- **Operating Frequency**: 902 to 928 MHz — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 5 · dòng 9
- **Transmit Power Output**: 5 to 250 mW (software-selectable) — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 6 · dòng 10
- **Receiver Sensitivity**: -101 dBm — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 7 · dòng 11
- **Channel Capacity**: Eight 25-channel hop sequences sharing 64 available channels — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 8 · dòng 12
- **RF Data Rate**: 200 kbps — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 9 · dòng 13
- **Maximum Link Throughput**: 105 kbps — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 10 · dòng 14
- **Transmission Distance**: Up to 1.61 km (1 mi) with omnidirectional antenna; up to 16.09 km (10 mi) with higher-gain directional antennas at ideal conditions — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 11 · dòng 15
- **Network Operation**: Point-to-point with RF retries; point-to-multipoint operations — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 12 · dòng 16
- **Maximum Nodes in Network**: 50 — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 13 · dòng 17
- **Antenna Connector**: Reverse Polarity SMA (RPSMA) jack — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 14 · dòng 18
- **LED Indicators**: Red TX/PWR and green RX — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 15 · dòng 19
- **RS-232 Baud Rate**: 1200 to 115200 bps — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 16 · dòng 20
- **CS I/O Modes**: SDC 7, 8, 10, 11, and ME master — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 17 · dòng 21
- **Communication Ports**: RS-232 9-pin D female; USB Type B jack; CS I/O 9-pin D male — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 18 · dòng 22
- **Input Voltage**: 9 to 16 VDC — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 19 · dòng 23
- **Power Connector**: 2.5 mm DC power jack — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 20 · dòng 24
- **Powered Over**: CS I/O or barrel plug — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 21 · dòng 25
- **Average Current Drain – Transmit**: <80 mA at 250 mW TX power — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 22 · dòng 26
- **Average Current Drain – Receive**: 15 mA — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 23 · dòng 27
- **Average Current Drain – Standby/Sleep**: <0.5 mA depending on power-saving mode — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 24 · dòng 28
- **Operating Temperature Range**: -40 to +70 °C — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 25 · dòng 29
- **Dimensions**: 11.1 × 6.9 × 2.7 cm (4.4 × 2.7 × 1.1 in.) — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 26 · dòng 30
- **Weight – Without Ships With Items**: 136 g (4.8 oz) — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 27 · dòng 31
- **Weight – With Ships With Items**: 283.5 g (10 oz) — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 28 · dòng 32
- **Compliance / Certification**: United States FCC Part 15.247: MCQ-XB900HP; Industry Canada: 1846A-XB900HP — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 29 · dòng 33
- **Network Compatibility Restriction**: RF407 only with RF407-type radios — data/raw/RF407-RF412-RF422-RF427.json · record 0 · spec 30 · dòng 39

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## RF452

Spread-Spectrum Radio · CSI_RF452

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), PakBus (supported), RS-232 (supported), USB (supported).

Cấu hình model: Available Configurations: RF452-NA – for use in US/Canada (ships as 40389, 16675, and 17648); RF452-AU – AUS for use in Australia (ships as 40753, 16675, and 17648); Configuration Tool: Campbell Scientific Device Configuration Utility (DevConfig)

**Ví dụ explanation tiếng Việt**

Khớp chính xác model RF452. RF452 là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232, USB. Thông số Frequency: 902 to 928 MHz. Thông số power output: 10 to 1,000 mW user-selectable. Thông số Maximum RF Power: 30 dBm (1 W).

**Ví dụ explanation tiếng Anh**

Exact model match: RF452. RF452 is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232, USB. Frequency: 902 to 928 MHz. power output: 10 to 1,000 mW user-selectable. Maximum RF Power: 30 dBm (1 W).

**Thông số nguồn để đối chiếu**

- **Product Name**: RF452 — data/raw/CSI_RF452.json · record 0 · spec 0 · dòng 2
- **Product Type**: 900 MHz 1 W Spread-Spectrum Radio — data/raw/CSI_RF452.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_RF452.json · record 0 · spec 2 · dòng 4
- **Device Classification**: Primary communications device / spread-spectrum radio — data/raw/CSI_RF452.json · record 0 · spec 3 · dòng 5
- **Available Configurations**: RF452-NA – for use in US/Canada (ships as 40389, 16675, and 17648); RF452-AU – AUS for use in Australia (ships as 40753, 16675, and 17648) — data/raw/CSI_RF452.json · record 0 · spec 4 · dòng 6
- **Primary Application**: Wireless networking with PakBus data loggers over long-distance 900 MHz links — data/raw/CSI_RF452.json · record 0 · spec 5 · dòng 7
- **Radio Type**: Frequency Hopping Spread Spectrum (FHSS) — data/raw/CSI_RF452.json · record 0 · spec 6 · dòng 8
- **Frequency**: 902 to 928 MHz — data/raw/CSI_RF452.json · record 0 · spec 7 · dòng 9
- **Country Used In**: US, Canada, New Zealand, Australia — data/raw/CSI_RF452.json · record 0 · spec 8 · dòng 10
- **Radio Module**: FreeWave MM3 LV-T radio module with Campbell Scientific interface board — data/raw/CSI_RF452.json · record 0 · spec 9 · dòng 11
- **Operating Roles**: Gateway, Endpoint/Remote, Repeater, Endpoint/Repeater — data/raw/CSI_RF452.json · record 0 · spec 10 · dòng 12
- **Compatible Networks**: Existing RF450, RF451, RF452, and FreeWave FGR radio networks — data/raw/CSI_RF452.json · record 0 · spec 11 · dòng 13
- **Power Output**: 10 to 1,000 mW user-selectable — data/raw/CSI_RF452.json · record 0 · spec 12 · dòng 14
- **Maximum RF Power**: 30 dBm (1 W) — data/raw/CSI_RF452.json · record 0 · spec 13 · dòng 15
- **Transmission Distance**: 20.92 to 96.56 km (13 to 60 mi), depending on antenna and line-of-sight — data/raw/CSI_RF452.json · record 0 · spec 14 · dòng 16
- **Modulation**: 2-level GFSK — data/raw/CSI_RF452.json · record 0 · spec 15 · dòng 17
- **RF Data Rate**: 115.2 or 153.6 kbps selectable — data/raw/CSI_RF452.json · record 0 · spec 16 · dòng 18
- **Occupied Bandwidth**: 142 kHz — data/raw/CSI_RF452.json · record 0 · spec 17 · dòng 19
- **Hopping Patterns**: 15 per band, 105 total, user-selectable — data/raw/CSI_RF452.json · record 0 · spec 18 · dòng 20
- **Hopping Channels**: 50 to 110 user-selectable — data/raw/CSI_RF452.json · record 0 · spec 19 · dòng 21
- **Channel Spacing**: 230.4 kHz — data/raw/CSI_RF452.json · record 0 · spec 20 · dòng 22
- **Frequency Zones**: 16 — data/raw/CSI_RF452.json · record 0 · spec 21 · dòng 23
- **Receiver Sensitivity @ 115.2 kbps**: -108 dBm for 10^-4 BER — data/raw/CSI_RF452.json · record 0 · spec 22 · dòng 24
- **Receiver Sensitivity @ 153.6 kbps**: -103 dBm for 10^-4 BER — data/raw/CSI_RF452.json · record 0 · spec 23 · dòng 25
- **IF Selectivity**: 40 dB at fc ± 230 kHz — data/raw/CSI_RF452.json · record 0 · spec 24 · dòng 26
- **Receiver Selectivity**: 50 dB at 896 MHz, 935 MHz — data/raw/CSI_RF452.json · record 0 · spec 25 · dòng 27
- **Error Detection**: 32-bit CRC; retransmit on error — data/raw/CSI_RF452.json · record 0 · spec 26 · dòng 28
- **Data Encryption**: Proprietary spread-spectrum technology — data/raw/CSI_RF452.json · record 0 · spec 27 · dòng 29
- **Maximum Link Throughput**: 115.2 kbps — data/raw/CSI_RF452.json · record 0 · spec 28 · dòng 30
- **RF Connector**: Reverse Polarity SMA (RPSMA) jack; external antenna required — data/raw/CSI_RF452.json · record 0 · spec 29 · dòng 31
- **CS I/O**: DB9 male; SDC 7/8/10/11 device — data/raw/CSI_RF452.json · record 0 · spec 30 · dòng 32
- **RS-232**: DB9 female; DCE — data/raw/CSI_RF452.json · record 0 · spec 31 · dòng 33
- **USB**: USB Type B / USB standard B (device only) — data/raw/CSI_RF452.json · record 0 · spec 32 · dòng 34
- **Data Interface Protocols**: RS-232, USB, CS I/O SDC, and CS I/O ME Gateway; user-selectable — data/raw/CSI_RF452.json · record 0 · spec 33 · dòng 35
- **RS-232 Baud Rate**: 1200, 4800, 9600 bps; 19.2, 38.4, 57.6, 115.2 kbps — data/raw/CSI_RF452.json · record 0 · spec 34 · dòng 36
- **Network ID Range**: 0 to 4095, excluding 255 — data/raw/CSI_RF452.json · record 0 · spec 35 · dòng 37
- **Frequency Key**: 0 to 14 — data/raw/CSI_RF452.json · record 0 · spec 36 · dòng 38
- **Maximum Repeaters per Network**: 4 — data/raw/CSI_RF452.json · record 0 · spec 37 · dòng 39
- **Operating Temperature Range**: -40 to +85 °C — data/raw/CSI_RF452.json · record 0 · spec 38 · dòng 40
- **Relative Humidity**: 0 to 95% RH, non-condensing — data/raw/CSI_RF452.json · record 0 · spec 39 · dòng 41
- **Average Current Drain – Transmit**: 650 mA @ 12 VDC — data/raw/CSI_RF452.json · record 0 · spec 40 · dòng 42
- **Average Current Drain – Receive**: 40 mA @ 12 VDC — data/raw/CSI_RF452.json · record 0 · spec 41 · dòng 43
- **Average Current Drain – Idle**: 15 mA @ 12 VDC — data/raw/CSI_RF452.json · record 0 · spec 42 · dòng 44
- **Average Current Drain – Sleep**: 6 mA @ 12 VDC — data/raw/CSI_RF452.json · record 0 · spec 43 · dòng 45
- **Input Voltage**: 7 to 28 VDC — data/raw/CSI_RF452.json · record 0 · spec 44 · dòng 46
- **Powered Over**: CS I/O or barrel plug — data/raw/CSI_RF452.json · record 0 · spec 45 · dòng 47
- **Power Connector**: Barrel plug, center positive 12 V — data/raw/CSI_RF452.json · record 0 · spec 46 · dòng 48
- **Dimensions**: 13.61 × 2.74 × 7.01 cm (5.36 × 1.08 × 2.76 in.) — data/raw/CSI_RF452.json · record 0 · spec 47 · dòng 49
- **Weight**: 0.18 kg (0.4 lb) — data/raw/CSI_RF452.json · record 0 · spec 48 · dòng 50
- **Compliance – FCC ID**: KNYMM3 — data/raw/CSI_RF452.json · record 0 · spec 49 · dòng 51
- **Compliance – Industry Canada**: 2329B-MM3 — data/raw/CSI_RF452.json · record 0 · spec 50 · dòng 52
- **Configuration Tool**: Campbell Scientific Device Configuration Utility (DevConfig) — data/raw/CSI_RF452.json · record 0 · spec 51 · dòng 53

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## RF500M

Radio Modem · CSI_RF500M

Nguồn catalog: https://www.campbellsci.com/products/rf500m

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: CS I/O (supported), PakBus (supported), RS-232 (supported).

Cấu hình model: Operating System Options: -PB PakBus OS (standard); -AL ALERT OS; -DA Dial OS; Configuration Tool: Device Configuration Utility (DevConfig)

**Ví dụ explanation tiếng Việt**

Khớp chính xác model RF500M. RF500M là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: CS I/O, RS-232. Thông số voltage: 7 to 20 VDC; can be provided by the CS I/O port.

**Ví dụ explanation tiếng Anh**

Exact model match: RF500M. RF500M is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: CS I/O, RS-232. voltage: 7 to 20 VDC; can be provided by the CS I/O port.

**Thông số nguồn để đối chiếu**

- **Product Name**: RF500M — data/raw/CSI_RF500M.json · record 0 · spec 0 · dòng 2
- **Product Type**: Radio Modem / Versatile Radio Modem — data/raw/CSI_RF500M.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_RF500M.json · record 0 · spec 2 · dòng 4
- **Device Classification**: Primary communications device / radio modem — data/raw/CSI_RF500M.json · record 0 · spec 3 · dòng 5
- **Primary Application**: Interface for licensed UHF/VHF radio telemetry networks — data/raw/CSI_RF500M.json · record 0 · spec 4 · dòng 6
- **Operating Roles**: Field modem; stand-alone repeater; base-station modem — data/raw/CSI_RF500M.json · record 0 · spec 5 · dòng 7
- **Network Compatibility**: Legacy or existing PakBus and mixed-array/dial-up networks — data/raw/CSI_RF500M.json · record 0 · spec 6 · dòng 8
- **Compatible Radio Series**: RF320 series; RF310 series; RF300 series; other radio/modem combinations that output a demodulated byte stream via RS-232 — data/raw/CSI_RF500M.json · record 0 · spec 7 · dòng 9
- **ALERT Compatibility**: Suitable for ALERT store-and-forward repeaters or base-station-decoder applications — data/raw/CSI_RF500M.json · record 0 · spec 8 · dòng 10
- **Operating System Options**: -PB PakBus OS (standard); -AL ALERT OS; -DA Dial OS — data/raw/CSI_RF500M.json · record 0 · spec 9 · dòng 11
- **PakBus OS**: Uses TDRF polling; compatible with -TD, -PB, and current-generation PakBus data loggers — data/raw/CSI_RF500M.json · record 0 · spec 10 · dòng 12
- **ALERT Dual Mode OS**: Supports transmission, repeating, and reception of binary ALERT-formatted data; supports ALERT and TDRF communications — data/raw/CSI_RF500M.json · record 0 · spec 11 · dòng 13
- **Dial OS**: Supports mixed-array and PakBus/table-based data loggers and point-to-point networking — data/raw/CSI_RF500M.json · record 0 · spec 12 · dòng 14
- **Configuration Tool**: Device Configuration Utility (DevConfig) — data/raw/CSI_RF500M.json · record 0 · spec 13 · dòng 15
- **RS-232 Port**: DTE; used for modem configuration, RS-232 radio connection, or PC connection as an RF base — data/raw/CSI_RF500M.json · record 0 · spec 14 · dòng 16
- **CS I/O Port**: Connects to data logger or PC as an RF base — data/raw/CSI_RF500M.json · record 0 · spec 15 · dòng 17
- **Transceiver Port**: Connects to compatible analog radio/transceiver — data/raw/CSI_RF500M.json · record 0 · spec 16 · dòng 18
- **RF Address Range**: 1 to 255 — data/raw/CSI_RF500M.json · record 0 · spec 17 · dòng 19
- **Default RF Address**: 1 — data/raw/CSI_RF500M.json · record 0 · spec 18 · dòng 20
- **Voltage**: 7 to 20 VDC; can be provided by the CS I/O port — data/raw/CSI_RF500M.json · record 0 · spec 19 · dòng 21
- **Active Current Drain**: <8 mA RMS @ 12 VDC — data/raw/CSI_RF500M.json · record 0 · spec 20 · dòng 22
- **Standard Temperature Range**: -25 to +50 °C — data/raw/CSI_RF500M.json · record 0 · spec 21 · dòng 23
- **Extended Temperature Range**: -55 to +85 °C — data/raw/CSI_RF500M.json · record 0 · spec 22 · dòng 24
- **Dimensions**: 16.0 × 9.5 × 2.2 cm (6.31 × 3.69 × 0.88 in.) — data/raw/CSI_RF500M.json · record 0 · spec 23 · dòng 25
- **Weight**: 0.18 kg (0.4 lb) — data/raw/CSI_RF500M.json · record 0 · spec 24 · dòng 26
- **Transceiver Audio Output – J1**: 310 mV peak-to-peak — data/raw/CSI_RF500M.json · record 0 · spec 25 · dòng 27
- **Transceiver Audio Output – J3**: 670 mV peak-to-peak — data/raw/CSI_RF500M.json · record 0 · spec 26 · dòng 28
- **Analog Radio Compatibility**: RF320 series; RF310 series; RF300 series; unmodified DataRadio DL-3400 — data/raw/CSI_RF500M.json · record 0 · spec 27 · dòng 29
- **Digital Radio Compatibility**: Digital RS-232 radios such as DataRadio Integra — data/raw/CSI_RF500M.json · record 0 · spec 28 · dòng 30

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## RV50X

Cellular Modem / Router · CSI_RV50X

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: DNP3 (supported), DNS (supported), Ethernet (supported), FTP (supported), HTTP (supported), Modbus (supported), PPP (supported), RJ45 (supported), RS-232 (supported), SIM (supported), TCP/IP (supported), USB (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model RV50X. RV50X là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Ethernet, HTTP, Modbus, RS-232. Thông số Operating Voltage: 7 to 36 VDC. Thông số radio output power: 23 dBm on LTE; 23 dBm on UMTS.

**Ví dụ explanation tiếng Anh**

Exact model match: RV50X. RV50X is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Ethernet, HTTP, Modbus, RS-232. Operating Voltage: 7 to 36 VDC. radio output power: 23 dBm on LTE; 23 dBm on UMTS.

**Thông số nguồn để đối chiếu**

- **Product Type**: Industrial 4G LTE Cellular Gateway — data/raw/RV50X.json · record 0 · spec 0 · dòng 3
- **Device Classification**: Primary communications device / cellular gateway — data/raw/RV50X.json · record 0 · spec 1 · dòng 5
- **Available Configurations**: RV50X-NE-V – Provisioned for Verizon US; RV50X-NE-VS – Provisioned for Verizon US Static IP; RV50X-NE-AT – Provisioned for AT&T North America; RV50X-NE-IT1A – Provisioned for International 1A; RV50X-NE-IT1B – Provisioned for International 1B; RV50X-NE-NP – No Provisioning — data/raw/RV50X.json · record 0 · spec 2 · dòng 6
- **Network Technology**: 4G LTE with automatic fallback to 3G — data/raw/RV50X.json · record 0 · spec 3 · dòng 7
- **Cellular Technologies**: 4G LTE; 3G HSPA/HSPA+; 3G TD-SCDMA (Asia Pacific model only) — data/raw/RV50X.json · record 0 · spec 4 · dòng 8
- **Radio Module**: MC7455 — data/raw/RV50X.json · record 0 · spec 5 · dòng 9
- **SIM Interface**: Dual Mini-SIM (2FF) interfaces — data/raw/RV50X.json · record 0 · spec 6 · dòng 10
- **Host Interface**: 10/100/1000 Ethernet RJ45; USB 2.0 Micro-B; RS-232 Serial DTE DB9 Female — data/raw/RV50X.json · record 0 · spec 7 · dòng 11
- **RS-232 Services**: Serial server, serial client, and PPP host — data/raw/RV50X.json · record 0 · spec 8 · dòng 12
- **Embedded Operating System**: Sierra Wireless ALEOS — data/raw/RV50X.json · record 0 · spec 9 · dòng 13
- **Embedded Network Services**: IP serial server/client, local PPP host, dynamic DNS client, routing, VPN, port forwarding — data/raw/RV50X.json · record 0 · spec 10 · dòng 14
- **RF Connectors**: 3 female SMA jacks for primary cellular, optional diversity cellular, and GPS — data/raw/RV50X.json · record 0 · spec 11 · dòng 15
- **Operating Temperature Range**: -30 to +70 °C — data/raw/RV50X.json · record 0 · spec 12 · dòng 16
- **Dimensions**: 11.9 × 9.4 × 3.4 cm (4.69 × 3.7 × 1.34 in.) — data/raw/RV50X.json · record 0 · spec 13 · dòng 17
- **Weight**: 320 g (11.3 oz) — data/raw/RV50X.json · record 0 · spec 14 · dòng 18
- **Operating Voltage**: 7 to 36 VDC — data/raw/RV50X.json · record 0 · spec 15 · dòng 19
- **Typical Enable / Ignition Sense Low**: 1 mA @ 12 VDC — data/raw/RV50X.json · record 0 · spec 16 · dòng 20
- **Typical Idle Current**: 65 to 95 mA @ 12 VDC, depending on configuration — data/raw/RV50X.json · record 0 · spec 17 · dòng 21
- **Typical Active Current**: 250 to 300 mA @ 12 VDC, depending on configuration — data/raw/RV50X.json · record 0 · spec 18 · dòng 22
- **Radio Output Power**: 23 dBm on LTE; 23 dBm on UMTS — data/raw/RV50X.json · record 0 · spec 19 · dòng 23
- **North America / EMEA Carrier Approval**: Verizon, AT&T, T-Mobile USA, Southern Linc, Sprint, US Cellular, Rogers, Telus, Bell — data/raw/RV50X.json · record 0 · spec 20 · dòng 24
- **North America / EMEA 4G LTE Bands**: B1, B2, B3, B4, B5, B7, B8, B12, B13, B20, B25, B26, B29, B41 — data/raw/RV50X.json · record 0 · spec 21 · dòng 25
- **North America / EMEA 3G HSPA/HSPA+ Bands**: B1, B2, B3, B4, B5, B8 — data/raw/RV50X.json · record 0 · spec 22 · dòng 26
- **North America / EMEA Industry Approvals**: FCC, IC, PTCRB, R&TTE, GCF, CE — data/raw/RV50X.json · record 0 · spec 23 · dòng 27
- **Asia Pacific Carrier Approval**: Telstra — data/raw/RV50X.json · record 0 · spec 24 · dòng 28
- **Asia Pacific 4G LTE Bands**: B1, B3, B5, B7, B8, B18, B19, B21, B28, B38, B39, B40, B41 — data/raw/RV50X.json · record 0 · spec 25 · dòng 29
- **Asia Pacific 3G HSPA/HSPA+ Bands**: B1, B5, B6, B8, B9, B19 — data/raw/RV50X.json · record 0 · spec 26 · dòng 30
- **Asia Pacific 3G TD-SCDMA Band**: B39 — data/raw/RV50X.json · record 0 · spec 27 · dòng 31
- **Asia Pacific Industry Approvals**: RCM, JRF/JPA, Anatel — data/raw/RV50X.json · record 0 · spec 28 · dòng 32
- **Cellular Service Requirement**: At least one Mini-SIM (2FF) and a compatible cellular data service — data/raw/RV50X.json · record 0 · spec 29 · dòng 33
- **Configuration Tool**: ACEManager web-based configuration tool — data/raw/RV50X.json · record 0 · spec 30 · dòng 34
- **Data Logger Connectivity**: RS-232 or Ethernet — data/raw/RV50X.json · record 0 · spec 31 · dòng 35
- **Internet Protocol Support**: TCP/IP; supports use cases including Modbus, DNP3, email, HTTP, FTP — data/raw/RV50X.json · record 0 · spec 32 · dòng 36
- **Antenna Requirement**: Primary cellular antenna required; two external antennas recommended/required for reliable 4G LTE communications — data/raw/RV50X.json · record 0 · spec 33 · dòng 37

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## SkyVue8

LIDAR Ceilometer · CSI_SKYVUE8

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Độ ẩm tương đối, Tầm nhìn, Độ cao chân mây.

Giao thức được ghi nhận: Ethernet (supported), RS-232 (supported), RS-422 (supported), RS-485 (supported), USB (supported).

Cấu hình model: Legacy / Alternate Model: CS136; Product Type: LIDAR Ceilometer; Primary Application: Cloud base height and vertical visibility measurement for aviation and meteorological applications; Reported Parameters: Cloud base heights, sky condition, vertical visibility, raw backscatter profiles; Reporting Range: 0 to 8 km (0 to 26,250 ft); Cloud Layers Reported: Up to four layers; Vertical Visibility: Reported when there is obscuration but no clouds detected; Dimensions: 737 × 294 × 240 mm (29.0 × 11.6 × 9.5 in.) including tilt base; Weight: 18 kg (39.7 lb); Power Source: 115/230 VAC ±15% auto-switching, 50 to 60 Hz; Power / Current Consumption: 15 W minimum; up to 380 W with all heaters on; optional current-limited mode 250 W max.; Battery Backup: Internal 12 V, 7 Ah battery; Data Interfaces: RS-232 / RS-422 / RS-485 / Ethernet option; Operating Temperature Range: -40 to +60 °C excluding battery; Extended / Battery Temperature Range: -50 to +60 °C available as a special; Maximum Wind Speed: 55 m/s (123 mph); Standards / Guidance: ICAO, CAA, WMO; includes ICAO 9837, ICAO Annex 3, CAP 437, CAP 746

**Ví dụ explanation tiếng Việt**

Khớp chính xác model SkyVue8. SkyVue8 đo độ ẩm tương đối, tầm nhìn, độ cao chân mây, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: Ethernet, RS-232, RS-422, RS-485. Thông số Minimum Reporting Resolution: 5 m (16.4 ft). Thông số hard target range accuracy: ±0.25%, ±4.6 m (15.1 ft). Thông số operating temperature range: -40 to +60 °C excluding battery.

**Ví dụ explanation tiếng Anh**

Exact model match: SkyVue8. SkyVue8 measures relative humidity, visibility, cloud base height, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: Ethernet, RS-232, RS-422, RS-485. Minimum Reporting Resolution: 5 m (16.4 ft). hard target range accuracy: ±0.25%, ±4.6 m (15.1 ft). operating temperature range: -40 to +60 °C excluding battery.

**Thông số nguồn để đối chiếu**

- **Legacy / Alternate Model**: CS136 — data/raw/SkyVue.json · record 0 · spec 0 · dòng 3
- **Product Type**: LIDAR Ceilometer — data/raw/SkyVue.json · record 0 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/SkyVue.json · record 0 · spec 2 · dòng 5
- **Device Classification**: Primary measurement device / sensor — data/raw/SkyVue.json · record 0 · spec 3 · dòng 6
- **Primary Application**: Cloud base height and vertical visibility measurement for aviation and meteorological applications — data/raw/SkyVue.json · record 0 · spec 4 · dòng 7
- **Measurement Technology**: LIDAR (Light Detection And Ranging) — data/raw/SkyVue.json · record 0 · spec 5 · dòng 8
- **Reported Parameters**: Cloud base heights, sky condition, vertical visibility, raw backscatter profiles — data/raw/SkyVue.json · record 0 · spec 6 · dòng 9
- **Reporting Range**: 0 to 8 km (0 to 26,250 ft) — data/raw/SkyVue.json · record 0 · spec 7 · dòng 11
- **Minimum Reporting Resolution**: 5 m (16.4 ft) — data/raw/SkyVue.json · record 0 · spec 8 · dòng 12
- **Hard Target Range Accuracy**: ±0.25%, ±4.6 m (15.1 ft) — data/raw/SkyVue.json · record 0 · spec 9 · dòng 13
- **Reporting Cycle**: 2 to 600 s — data/raw/SkyVue.json · record 0 · spec 10 · dòng 14
- **Cloud Layers Reported**: Up to four layers — data/raw/SkyVue.json · record 0 · spec 11 · dòng 15
- **Sky Condition**: Up to five layers with cover in oktas according to WMO SYNOP and METAR requirements — data/raw/SkyVue.json · record 0 · spec 12 · dòng 16
- **Vertical Visibility**: Reported when there is obscuration but no clouds detected — data/raw/SkyVue.json · record 0 · spec 13 · dòng 17
- **Laser Type**: InGaAs — data/raw/SkyVue.json · record 0 · spec 14 · dòng 18
- **Laser Wavelength**: 912 nm (±5 nm) — data/raw/SkyVue.json · record 0 · spec 15 · dòng 19
- **Tilt Capability**: Up to 24° — data/raw/SkyVue.json · record 0 · spec 16 · dòng 21
- **Dimensions**: 737 × 294 × 240 mm (29.0 × 11.6 × 9.5 in.) including tilt base — data/raw/SkyVue.json · record 0 · spec 17 · dòng 22
- **Weight**: 18 kg (39.7 lb) — data/raw/SkyVue.json · record 0 · spec 18 · dòng 24
- **Power Supply Cable Length**: 10.06 m (33 ft) — data/raw/SkyVue.json · record 0 · spec 19 · dòng 26
- **Data Cable Length**: 10.06 m (33 ft) — data/raw/SkyVue.json · record 0 · spec 20 · dòng 27
- **Power Source**: 115/230 VAC ±15% auto-switching, 50 to 60 Hz — data/raw/SkyVue.json · record 0 · spec 21 · dòng 28
- **Power / Current Consumption**: 15 W minimum; up to 380 W with all heaters on; optional current-limited mode 250 W max. — data/raw/SkyVue.json · record 0 · spec 22 · dòng 29
- **Battery Backup**: Internal 12 V, 7 Ah battery — data/raw/SkyVue.json · record 0 · spec 23 · dòng 30
- **Data Interfaces**: RS-232 / RS-422 / RS-485 / Ethernet option — data/raw/SkyVue.json · record 0 · spec 24 · dòng 32
- **Maintenance Interface**: USB 2.0 (USB 1.1 compatible) — data/raw/SkyVue.json · record 0 · spec 25 · dòng 34
- **Baud Rate**: 300 to 115,200 bps — data/raw/SkyVue.json · record 0 · spec 26 · dòng 35
- **Operating Temperature Range**: -40 to +60 °C excluding battery — data/raw/SkyVue.json · record 0 · spec 27 · dòng 36
- **Extended / Battery Temperature Range**: -50 to +60 °C available as a special — data/raw/SkyVue.json · record 0 · spec 28 · dòng 37
- **Humidity Range**: 0 to 100% RH — data/raw/SkyVue.json · record 0 · spec 29 · dòng 38
- **IP Rating**: IP66 (NEMA 4X) — data/raw/SkyVue.json · record 0 · spec 30 · dòng 39
- **Maximum Wind Speed**: 55 m/s (123 mph) — data/raw/SkyVue.json · record 0 · spec 31 · dòng 40
- **Standards / Guidance**: ICAO, CAA, WMO; includes ICAO 9837, ICAO Annex 3, CAP 437, CAP 746 — data/raw/SkyVue.json · record 0 · spec 32 · dòng 45

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## SN500SS

Net Radiometer · CSI_SN500SS

Nguồn catalog: https://www.campbellsci.com/products/sn500ss

Đại lượng có bằng chứng: Bức xạ thuần.

Giao thức được ghi nhận: SDI-12 (supported).

Cấu hình model: Sensor Configuration: Two thermopile pyranometers and two pyrgeometers

**Ví dụ explanation tiếng Việt**

Khớp chính xác model SN500SS. SN500SS đo bức xạ thuần, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số Operating Temperature Range: -50 to +80 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: SN500SS. SN500SS measures net radiation, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. Operating Temperature Range: -50 to +80 °C.

**Thông số nguồn để đối chiếu**

- **Product Name**: SN500SS — data/raw/CSI_SN500SS.json · record 0 · spec 0 · dòng 2
- **Product Type**: Four-Component Net Radiometer — data/raw/CSI_SN500SS.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Apogee Instruments; supplied by Campbell Scientific — data/raw/CSI_SN500SS.json · record 0 · spec 2 · dòng 4
- **Device Classification**: Primary measurement device / sensor — data/raw/CSI_SN500SS.json · record 0 · spec 3 · dòng 5
- **Measurement Description**: Measures incoming and outgoing short-wave and long-wave radiation — data/raw/CSI_SN500SS.json · record 0 · spec 4 · dòng 6
- **Sensor Configuration**: Two thermopile pyranometers and two pyrgeometers — data/raw/CSI_SN500SS.json · record 0 · spec 5 · dòng 7
- **Output**: SDI-12 — data/raw/CSI_SN500SS.json · record 0 · spec 6 · dòng 8
- **Heater**: 62 mA current drain and 740 mW power requirement at 12 VDC — data/raw/CSI_SN500SS.json · record 0 · spec 7 · dòng 9
- **Operating Temperature Range**: -50 to +80 °C — data/raw/CSI_SN500SS.json · record 0 · spec 8 · dòng 10
- **Operating Humidity Range**: 0 to 100% — data/raw/CSI_SN500SS.json · record 0 · spec 9 · dòng 11
- **Response Time**: 1 s SDI-12 data transfer rate; detector response time 0.5 s — data/raw/CSI_SN500SS.json · record 0 · spec 10 · dòng 12
- **Heater Current Drain – Heaters Off, Communication Disabled**: 0.6 mA — data/raw/CSI_SN500SS.json · record 0 · spec 11 · dòng 13
- **Heater Current Drain – Heaters On, Communication Enabled**: 63 mA — data/raw/CSI_SN500SS.json · record 0 · spec 12 · dòng 14
- **Heater Current Drain – Heaters Off, Communication Enabled**: 1.5 mA — data/raw/CSI_SN500SS.json · record 0 · spec 13 · dòng 15
- **Dimensions**: 11.6 × 4.5 × 6.6 cm (4.6 × 1.8 × 2.6 in.) — data/raw/CSI_SN500SS.json · record 0 · spec 14 · dòng 16
- **Weight**: 320 g (11.29 oz) with mounting rod and 5 m (16.4 ft) lead wire — data/raw/CSI_SN500SS.json · record 0 · spec 15 · dòng 17
- **Package Includes**: Net radiometer, mounting rod, pigtail lead cable for data logger interface, and carrying case — data/raw/CSI_SN500SS.json · record 0 · spec 16 · dòng 18
- **Pyranometer Spectral Range – Downward-Looking**: 295 to 2685 nm — data/raw/CSI_SN500SS.json · record 0 · spec 17 · dòng 19
- **Pyranometer Spectral Range – Upward-Looking**: 385 to 2105 nm — data/raw/CSI_SN500SS.json · record 0 · spec 18 · dòng 20
- **Pyranometer Sensitivity – Upward-Looking**: 0.057 mV per W/m² — data/raw/CSI_SN500SS.json · record 0 · spec 19 · dòng 21
- **Pyranometer Sensitivity – Downward-Looking**: 0.15 mV per W/m² — data/raw/CSI_SN500SS.json · record 0 · spec 20 · dòng 22
- **Pyranometer Expected Output Range – Downward-Looking**: 0 to 300 mV — data/raw/CSI_SN500SS.json · record 0 · spec 21 · dòng 23
- **Pyranometer Expected Output Range – Upward-Looking**: 0 to 114 mV — data/raw/CSI_SN500SS.json · record 0 · spec 22 · dòng 24
- **Pyrgeometer Spectral Range**: 5,000 to 30,000 nm — data/raw/CSI_SN500SS.json · record 0 · spec 23 · dòng 25
- **Pyrgeometer Sensitivity**: 0.12 mV per W/m² — data/raw/CSI_SN500SS.json · record 0 · spec 24 · dòng 26
- **Pyrgeometer Expected Output Range**: -24 to +24 mV — data/raw/CSI_SN500SS.json · record 0 · spec 25 · dòng 27

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## SnowVue10

Snow Water Equivalent / Snow Depth Sensor · CSI_SNOWVUE10

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Khoảng cách, Độ sâu tuyết.

Giao thức được ghi nhận: SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model SnowVue10. SnowVue10 đo khoảng cách, độ sâu tuyết, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số Distance Measurement Range: 0.4 to 10 m (1.3 to 32.8 ft). Thông số accuracy: 0.2% of distance to target. Thông số Resolution: 0.1 mm.

**Ví dụ explanation tiếng Anh**

Exact model match: SnowVue10. SnowVue10 measures distance, snow depth, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. Distance Measurement Range: 0.4 to 10 m (1.3 to 32.8 ft). accuracy: 0.2% of distance to target. Resolution: 0.1 mm.

**Thông số nguồn để đối chiếu**

- **Product Name**: SnowVue™10 — data/raw/SnowVue10.json · record 0 · spec 0 · dòng 2
- **Product Type**: Digital Snow-Depth Sensor / Sonic Ranging Sensor — data/raw/SnowVue10.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/SnowVue10.json · record 0 · spec 2 · dòng 4
- **Device Classification**: Primary measurement device / sensor — data/raw/SnowVue10.json · record 0 · spec 3 · dòng 5
- **Measurement Principle**: Ultrasonic time-of-flight measurement — data/raw/SnowVue10.json · record 0 · spec 4 · dòng 6
- **Nominal Ultrasonic Frequency**: 50 kHz — data/raw/SnowVue10.json · record 0 · spec 5 · dòng 7
- **Measurement Parameter**: Distance to target / snow depth — data/raw/SnowVue10.json · record 0 · spec 6 · dòng 8
- **Distance Measurement Range**: 0.4 to 10 m (1.3 to 32.8 ft) — data/raw/SnowVue10.json · record 0 · spec 7 · dòng 9
- **Snow Depth Range**: 0 to 9.6 m — data/raw/SnowVue10.json · record 0 · spec 8 · dòng 10
- **Accuracy**: 0.2% of distance to target — data/raw/SnowVue10.json · record 0 · spec 9 · dòng 11
- **Resolution**: 0.1 mm — data/raw/SnowVue10.json · record 0 · spec 10 · dòng 12
- **Required Beam Angle Clearance**: 30° — data/raw/SnowVue10.json · record 0 · spec 11 · dòng 13
- **Recommended Minimum Distance to Target**: At least 70 cm (27.5 in.) — data/raw/SnowVue10.json · record 0 · spec 12 · dòng 14
- **Operating Temperature Range**: -45 to +50 °C — data/raw/SnowVue10.json · record 0 · spec 13 · dòng 15
- **Survivability Temperature Range**: -55 to +80 °C — data/raw/SnowVue10.json · record 0 · spec 14 · dòng 16
- **Humidity Range**: 0 to 100% non-condensing — data/raw/SnowVue10.json · record 0 · spec 15 · dòng 17
- **Power Requirements**: 9 to 18 VDC — data/raw/SnowVue10.json · record 0 · spec 16 · dòng 18
- **Quiescent Current Consumption**: <300 µA — data/raw/SnowVue10.json · record 0 · spec 17 · dòng 19
- **Active Current Consumption**: 210 mA peak; 14 mA average @ 20 °C — data/raw/SnowVue10.json · record 0 · spec 18 · dòng 20
- **Measurement Time**: 5 s typical; 20 s maximum — data/raw/SnowVue10.json · record 0 · spec 19 · dòng 21
- **Warmup Time**: 2 s — data/raw/SnowVue10.json · record 0 · spec 20 · dòng 22
- **Recommended Measurement Rate**: 20 to 60 seconds — data/raw/SnowVue10.json · record 0 · spec 21 · dòng 23
- **Output**: SDI-12 version 1.4 — data/raw/SnowVue10.json · record 0 · spec 22 · dòng 24
- **Default SDI-12 Address**: 0 — data/raw/SnowVue10.json · record 0 · spec 23 · dòng 25
- **Valid SDI-12 Addresses**: 0–9, a–z, A–Z — data/raw/SnowVue10.json · record 0 · spec 24 · dòng 26
- **Temperature Compensation Requirement**: External temperature measurement required for accurate distance compensation — data/raw/SnowVue10.json · record 0 · spec 25 · dòng 27
- **Example Reference Temperature Sensor**: TempVue 10 — data/raw/SnowVue10.json · record 0 · spec 26 · dòng 28
- **Speed of Sound Reference**: 331.4 m/s at 0 °C — data/raw/SnowVue10.json · record 0 · spec 27 · dòng 29
- **Measurement Quality Output**: Quality number based on standard deviation of multiple readings — data/raw/SnowVue10.json · record 0 · spec 28 · dòng 30
- **Quality Number – Good**: 1 to 100 — data/raw/SnowVue10.json · record 0 · spec 29 · dòng 31
- **Quality Number – Reduced Echo Strength**: 100 to 300 — data/raw/SnowVue10.json · record 0 · spec 30 · dòng 32
- **Quality Number – High Uncertainty**: 300 to 600 — data/raw/SnowVue10.json · record 0 · spec 31 · dòng 33
- **Sensor Diagnostics**: Internal RH, measurement quality, supply voltage, transducer health — data/raw/SnowVue10.json · record 0 · spec 32 · dòng 34
- **Pitch and Roll Reporting**: Yes — data/raw/SnowVue10.json · record 0 · spec 33 · dòng 35
- **Sensor Connector Type**: M12, 5-pole, A-coded, pin connector — data/raw/SnowVue10.json · record 0 · spec 34 · dòng 36
- **Maximum Cable Length**: 60 m (197 ft) — data/raw/SnowVue10.json · record 0 · spec 35 · dòng 37
- **Cable Type**: 3-conductor, polyurethane sheathed, screened cable; 4.8 mm nominal diameter — data/raw/SnowVue10.json · record 0 · spec 36 · dòng 38
- **Chassis Material**: Corrosion-resistant Type III anodized aluminum — data/raw/SnowVue10.json · record 0 · spec 37 · dòng 39
- **Sensor Length**: 9.9 cm (3.9 in.) — data/raw/SnowVue10.json · record 0 · spec 38 · dòng 40
- **Sensor Diameter**: 7.6 cm (3.0 in.) — data/raw/SnowVue10.json · record 0 · spec 39 · dòng 41
- **Sensor Weight Without Cable**: 293 g (10.3 oz) — data/raw/SnowVue10.json · record 0 · spec 40 · dòng 42
- **Cable Weight – 15 ft**: 250 g (8.2 oz) — data/raw/SnowVue10.json · record 0 · spec 41 · dòng 43
- **Electrical Housing IP Rating**: IP67 — data/raw/SnowVue10.json · record 0 · spec 42 · dòng 44
- **Transducer IP Rating**: IP64 — data/raw/SnowVue10.json · record 0 · spec 43 · dòng 45
- **Compatible Data Loggers / Controllers**: Aspen 10; GRANITE series; CR6; CR1000X; CR350 series; CR300 series; CR1000; CR800 series — data/raw/SnowVue10.json · record 0 · spec 44 · dòng 46
- **Black Wire Function**: Power ground — data/raw/SnowVue10.json · record 0 · spec 45 · dòng 47
- **Brown Wire Function**: Power — data/raw/SnowVue10.json · record 0 · spec 46 · dòng 48
- **White Wire Function**: SDI-12 signal — data/raw/SnowVue10.json · record 0 · spec 47 · dòng 49
- **Clear Wire Function**: Shield — data/raw/SnowVue10.json · record 0 · spec 48 · dòng 50
- **CRBasic Measurement Instruction**: SDI12Recorder() — data/raw/SnowVue10.json · record 0 · spec 49 · dòng 51
- **Mounting**: Tripod mast, tower leg, or user-supplied pole using mounting kit / crossarm — data/raw/SnowVue10.json · record 0 · spec 50 · dòng 52
- **Comparison to SR50A – Measurement Time**: SnowVue10: 5–20 s; SR50A: 1 s — data/raw/SnowVue10.json · record 0 · spec 51 · dòng 53
- **Comparison to SR50A – Resolution**: SnowVue10: 0.1 mm; SR50A: 0.25 mm — data/raw/SnowVue10.json · record 0 · spec 52 · dòng 54
- **Comparison to SR50A – Measurement Range**: SnowVue10: 0.4–10 m; SR50A: 0.5–10 m — data/raw/SnowVue10.json · record 0 · spec 53 · dòng 55
- **Comparison to SR50A – Advanced Processing**: SnowVue10: Yes; SR50A: No — data/raw/SnowVue10.json · record 0 · spec 54 · dòng 56
- **Comparison to SR50A – Ingress Protection Improvement**: SnowVue10 adds vapor barrier / ingress protection improvement — data/raw/SnowVue10.json · record 0 · spec 55 · dòng 57

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## SoilVue10-5

Soil Moisture, Temperature, and EC Sensor · CSI_SOILVUE10_5

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ đất, Hàm lượng nước thể tích, Độ dẫn điện của đất, Hằng số điện môi.

Giao thức được ghi nhận: SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model SoilVue10-5. SoilVue10-5 đo nhiệt độ đất, hàm lượng nước thể tích, độ dẫn điện của đất, hằng số điện môi, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Lượng nước trong đất giúp đánh giá đất khô/ướt; ngưỡng phù hợp còn phụ thuộc cây và loại đất. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số Number of Measurement Depths: 6. Thông số measurement depths: 5, 10, 20, 30, 40, 50 cm (2, 4, 8, 12, 16, 20 in.). Thông số Operating Temperature Range: -40 to +60 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: SoilVue10-5. SoilVue10-5 measures soil temperature, volumetric water content, soil electrical conductivity, dielectric permittivity, providing readings to monitor conditions before deciding on adjustments. Water content helps assess dry/wet soil; suitable thresholds depend on crops and soil. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. Number of Measurement Depths: 6. measurement depths: 5, 10, 20, 30, 40, 50 cm (2, 4, 8, 12, 16, 20 in.). Operating Temperature Range: -40 to +60 °C.

**Thông số nguồn để đối chiếu**

- **Product Variant**: 0.5 m option — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 0 · dòng 3
- **Product Type**: Complete Soil Profiler / TDR Soil Moisture and Temperature Profile Sensor — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 2 · dòng 5
- **Measurement Technology**: Campbell TrueWave™ TDR — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 3 · dòng 6
- **Measurements Made**: Volumetric water content (VWC), permittivity, electrical conductivity (EC), and temperature — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 4 · dòng 7
- **Number of Measurement Depths**: 6 — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 5 · dòng 8
- **Measurement Depths**: 5, 10, 20, 30, 40, 50 cm (2, 4, 8, 12, 16, 20 in.) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 6 · dòng 9
- **Operating Temperature Range**: -40 to +60 °C — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 7 · dòng 10
- **Operating Voltage Range**: 9 to 36 VDC — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 8 · dòng 11
- **Current Drain – Active**: ~64 mA @ 12 VDC — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 9 · dòng 12
- **Current Drain – Quiescent**: ~1.5 mA @ 12 VDC — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 10 · dòng 13
- **Output**: SDI-12 version 1.4 compliant — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 11 · dòng 14
- **Default SDI-12 Address**: 0 — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 12 · dòng 15
- **Maximum Installation Torque**: 54 N·m (40 ft·lb) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 13 · dòng 16
- **Diameter Including Threads**: 5.8 cm (2.3 in.) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 14 · dòng 17
- **Diameter Without Threads**: 5.2 cm (2.05 in.) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 15 · dòng 18
- **Length**: 0.55 m (21.5 in.) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 16 · dòng 19
- **Weight**: 1.9 kg (4.2 lb) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 17 · dòng 20
- **Maximum Cable Length**: 304.8 m (1,000 ft) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 18 · dòng 21
- **Cable Connector**: Detachable IP67-rated M12 connector — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 19 · dòng 22
- **Volumetric Water Content Range**: 0 to 100% — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 20 · dòng 23
- **Volumetric Water Content Accuracy**: ±1.5% typical with most soils — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 21 · dòng 24
- **Relative Dielectric Permittivity Range**: 1 to 80 — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 22 · dòng 25
- **Relative Dielectric Permittivity Accuracy**: ±1 permittivity unit between 4 and 42 — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 23 · dòng 26
- **Electrical Conductivity Range**: 0 to 10 dS/m — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 24 · dòng 27
- **Electrical Conductivity Accuracy – Low Range**: ±2% (0 to 2.5 dS/m) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 25 · dòng 28
- **Electrical Conductivity Accuracy – Full Range**: ±5% (full range) — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 26 · dòng 29
- **Soil Temperature Accuracy**: ±0.15 °C between -30 and +40 °C — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 27 · dòng 30
- **Response Time**: Up to 1 minute — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 28 · dòng 31
- **Recommended Scan Rate**: At least 60 seconds for the 0.5 m probe with six sensors — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 29 · dòng 32
- **Installation Hole Diameter**: Standard 5 cm (2 in.) hand auger hole — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 30 · dòng 33
- **Threaded Design**: Individual waveguides built into threads for improved soil contact and reduced air-gap errors — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 31 · dòng 34
- **Aspen 10 Compatibility**: Compatible — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 32 · dòng 35
- **Compatible CRBasic Data Loggers**: GRANITE series, CR6, CR1000X, CR800 series, CR350 series, CR300 series, CR3000, CR1000 — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 33 · dòng 36
- **White Wire Function**: SDI-12 signal — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 34 · dòng 37
- **Clear Wire Function**: Shield — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 35 · dòng 38
- **Brown Wire Function**: Power — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 36 · dòng 39
- **Black Wire Function**: Power ground — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 37 · dòng 40
- **CRBasic Measurement Instruction**: SDI12Recorder() — data/raw/CSI_SOILVUE10_5.json · record 0 · spec 38 · dòng 41

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## SunScout

Solar Monitoring Station · CSI_SUNSCOUT

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: RS-485 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model SunScout. SunScout được phân loại là Solar Monitoring Station. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-485.

**Ví dụ explanation tiếng Anh**

Exact model match: SunScout. SunScout is classified as a Solar Monitoring Station. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-485.

**Thông số nguồn để đối chiếu**

- **Product Type**: Solar Resource Assessment Station — data/raw/SunScout.json · record 0 · spec 0 · dòng 3
- **System Class / Positioning**: Class A Solar Resource Assessment — data/raw/SunScout.json · record 0 · spec 1 · dòng 5
- **Primary Application**: Solar resource assessment and solar project monitoring — data/raw/SunScout.json · record 0 · spec 2 · dòng 6
- **Data Acquisition**: Campbell Scientific CR350 datalogger with embedded cellular gateway — data/raw/SunScout.json · record 0 · spec 3 · dòng 7
- **Programming Standard**: Programmed according to industry best practices and IEC 61724-1 — data/raw/SunScout.json · record 0 · spec 4 · dòng 8
- **Maintenance Logging**: Easy-access maintenance button to record maintenance tasks — data/raw/SunScout.json · record 0 · spec 5 · dòng 9
- **Global Horizontal Irradiance (GHI)**: Class A pyranometer with ISO 17025-accredited calibration — data/raw/SunScout.json · record 0 · spec 6 · dòng 10
- **GHI Mount**: Premium pyranometer mount with leveling and elevation adjustment — data/raw/SunScout.json · record 0 · spec 7 · dòng 11
- **Diffuse Horizontal Irradiance (DHI)**: Measured by SPN1 — data/raw/SunScout.json · record 0 · spec 8 · dòng 12
- **Direct Normal Irradiance (DNI)**: Calculated using onboard solar position algorithm — data/raw/SunScout.json · record 0 · spec 9 · dòng 13
- **Additional Irradiance Option**: Class A pyranometer for redundant GHI or Plane of Array — data/raw/SunScout.json · record 0 · spec 10 · dòng 14
- **Albedo Option**: Choice of Class A or Class C pyranometers — data/raw/SunScout.json · record 0 · spec 11 · dòng 15
- **Albedo Mounting / Reflection Control**: Matte black powder-coated tripod and mounting hardware — data/raw/SunScout.json · record 0 · spec 12 · dòng 16
- **Soiling Sensor**: DustVue photovoltaic (PV) soiling sensor — data/raw/SunScout.json · record 0 · spec 13 · dòng 17
- **Soiling Measurement Method**: Direct measure of power loss using short-circuit current between two panels; based on IEC 61724-1 — data/raw/SunScout.json · record 0 · spec 14 · dòng 18
- **Meteorological Sensor**: MetSens500 all-in-one sensor — data/raw/SunScout.json · record 0 · spec 15 · dòng 19
- **Meteorological Parameters**: Air temperature, relative humidity, wind speed, wind direction, barometric pressure — data/raw/SunScout.json · record 0 · spec 16 · dòng 20
- **Rain Gauge**: TE525 tipping-bucket rain gauge for precipitation — data/raw/SunScout.json · record 0 · spec 17 · dòng 21
- **Alternative Weather Sensor**: ClimaVue 40 — data/raw/SunScout.json · record 0 · spec 18 · dòng 22
- **Rain Gauge Requirement with ClimaVue 40**: Not required — data/raw/SunScout.json · record 0 · spec 19 · dòng 23
- **Power Supply**: Designed for continuous off-grid operation — data/raw/SunScout.json · record 0 · spec 20 · dòng 24
- **Power Management**: Intelligent sensor and peripheral control to maximize uptime and complete data record — data/raw/SunScout.json · record 0 · spec 21 · dòng 25
- **Tripod**: Wide footprint for stability in high-wind environments — data/raw/SunScout.json · record 0 · spec 22 · dòng 26
- **Tripod Anchoring**: Center-point anchor system — data/raw/SunScout.json · record 0 · spec 23 · dòng 27
- **Target Installation Time**: Full station designed to be installed within six hours — data/raw/SunScout.json · record 0 · spec 24 · dòng 28
- **Main Tripod Assembly**: Tripod; guy wire assembly; North/South crossarm; East/West crossarm; soiling assembly; enclosure; power supply kit — data/raw/SunScout.json · record 0 · spec 25 · dòng 29
- **North/South Crossarm Components**: ClimaVue 40, antenna, and guyed crossarm brace — data/raw/SunScout.json · record 0 · spec 26 · dòng 30
- **East/West Crossarm Components**: Irradiance sensors and crossarm brace — data/raw/SunScout.json · record 0 · spec 27 · dòng 31
- **Irradiance Sensor Mounting Bracket**: CM256 mounting brackets — data/raw/SunScout.json · record 0 · spec 28 · dòng 32
- **Soiling Assembly**: Two solar panels with CS241DM temperature sensors attached to the back of each panel — data/raw/SunScout.json · record 0 · spec 29 · dòng 33
- **Optional Meteorological Sensor**: MetSENS500 — data/raw/SunScout.json · record 0 · spec 30 · dòng 34
- **Optional Albedo Installation**: Separate tripod and crossarm — data/raw/SunScout.json · record 0 · spec 31 · dòng 35
- **Albedo Pyranometer Options**: SR30 or SR05; one facing upward and one facing downward — data/raw/SunScout.json · record 0 · spec 32 · dòng 36
- **Albedo Cable Length**: 15 m (50 ft) — data/raw/SunScout.json · record 0 · spec 33 · dòng 37
- **Typical Albedo Tripod Distance**: Within 12 m (40 ft) radius of main tripod — data/raw/SunScout.json · record 0 · spec 34 · dòng 38
- **Recommended Albedo Sensor Height**: At least 1.5 m (5 ft) above soil surface — data/raw/SunScout.json · record 0 · spec 35 · dòng 39
- **Siting – Obstruction Clearance**: Horizontal distance from obstruction should be at least 10 times the obstruction height — data/raw/SunScout.json · record 0 · spec 36 · dòng 40
- **Siting – Solar Path**: No obstacles should be between the course of the sun and the pyranometers — data/raw/SunScout.json · record 0 · spec 37 · dòng 41
- **Tripod Base Height**: Approximately 30 cm (12 in) above ground — data/raw/SunScout.json · record 0 · spec 38 · dòng 42
- **Guy Wire Clamp Nut Torque**: 3.5 N·m (31 in-lb) — data/raw/SunScout.json · record 0 · spec 39 · dòng 43
- **Guy Wire Tension**: 68 to 91 kg (150 to 200 lb) — data/raw/SunScout.json · record 0 · spec 40 · dòng 44
- **ClimaVue 40 Orientation**: N mark oriented to True North — data/raw/SunScout.json · record 0 · spec 41 · dòng 45
- **Optional MetSENS500 Orientation**: Four notches aligned to magnetic north — data/raw/SunScout.json · record 0 · spec 42 · dòng 46
- **Optional Rain Gauge Use**: Used when optional MetSENS500 is used instead of ClimaVue 40 — data/raw/SunScout.json · record 0 · spec 43 · dòng 47
- **Optional Rain Gauge Mount**: CM270 mounting bracket — data/raw/SunScout.json · record 0 · spec 44 · dòng 48
- **Field Wiring – Digital Sensors**: RS-485 sensor connections — data/raw/SunScout.json · record 0 · spec 45 · dòng 49
- **Field Wiring – Analog Sensors**: Analog sensor wiring — data/raw/SunScout.json · record 0 · spec 46 · dòng 50
- **ClimaVue 40 Communication**: RS-485 — data/raw/SunScout.json · record 0 · spec 47 · dòng 51

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## TB4

Rain Gage · CSI_TB4

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Lượng mưa.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Product Type: Rain Gage with 8 in. Orifice; Rainfall per Tip: 0.254 mm (0.01 in.); Rainfall Multiplier – Inches: 0.01; Rainfall Multiplier – Millimeters: 0.254

**Ví dụ explanation tiếng Việt**

Khớp chính xác model TB4. TB4 đo lượng mưa, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Thông số Measurement Range: 0 to 700 mm/h (0 to 27.6 in./h). Thông số measurement uncertainty low rate: ±2% @ < 250 mm/h (9.8 in./h). Thông số measurement uncertainty high rate: ±3% @ 250 to 500 mm/h (9.8 to 19.7 in./h).

**Ví dụ explanation tiếng Anh**

Exact model match: TB4. TB4 measures precipitation, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Installation suitability for your specific use case remains unconfirmed. Measurement Range: 0 to 700 mm/h (0 to 27.6 in./h). measurement uncertainty low rate: ±2% @ < 250 mm/h (9.8 in./h). measurement uncertainty high rate: ±3% @ 250 to 500 mm/h (9.8 to 19.7 in./h).

**Thông số nguồn để đối chiếu**

- **Product Type**: Rain Gage with 8 in. Orifice — data/raw/CSI_TB4.json · record 0 · spec 0 · dòng 3
- **Manufacturer**: HS Hyquest Solutions — data/raw/CSI_TB4.json · record 0 · spec 1 · dòng 4
- **Sensor Type**: Tipping bucket with siphon and dual reed switch — data/raw/CSI_TB4.json · record 0 · spec 2 · dòng 5
- **Measurement Parameter**: Rainfall / precipitation — data/raw/CSI_TB4.json · record 0 · spec 3 · dòng 6
- **Rainfall per Tip**: 0.254 mm (0.01 in.) — data/raw/CSI_TB4.json · record 0 · spec 4 · dòng 7
- **Measurement Range**: 0 to 700 mm/h (0 to 27.6 in./h) — data/raw/CSI_TB4.json · record 0 · spec 5 · dòng 8
- **Measurement Uncertainty – Low Rate**: ±2% @ < 250 mm/h (9.8 in./h) — data/raw/CSI_TB4.json · record 0 · spec 6 · dòng 9
- **Measurement Uncertainty – High Rate**: ±3% @ 250 to 500 mm/h (9.8 to 19.7 in./h) — data/raw/CSI_TB4.json · record 0 · spec 7 · dòng 10
- **Operating Temperature Range**: 0 to 70 °C — data/raw/CSI_TB4.json · record 0 · spec 8 · dòng 11
- **Humidity Range**: 0 to 100% — data/raw/CSI_TB4.json · record 0 · spec 9 · dòng 12
- **Orifice Diameter**: 20 cm (7.9 in.) — data/raw/CSI_TB4.json · record 0 · spec 10 · dòng 13
- **Height**: 33 cm (13 in.) — data/raw/CSI_TB4.json · record 0 · spec 11 · dòng 14
- **Weight**: 2 kg (4.4 lb) with 7.62 m (25 ft) signal cable — data/raw/CSI_TB4.json · record 0 · spec 12 · dòng 15
- **Cable Type**: Two-conductor shielded — data/raw/CSI_TB4.json · record 0 · spec 13 · dòng 16
- **Drain Tube Size**: Both filters accept 12 mm (0.47 in.) ID tubing — data/raw/CSI_TB4.json · record 0 · spec 14 · dòng 17
- **Reed Switch**: Dual reed switch — data/raw/CSI_TB4.json · record 0 · spec 15 · dòng 18
- **Siphon Mechanism**: Internal siphon mechanism — data/raw/CSI_TB4.json · record 0 · spec 16 · dòng 19
- **High-Intensity Rainfall Suitability**: Yes — data/raw/CSI_TB4.json · record 0 · spec 17 · dòng 20
- **Compatible Data Loggers**: Most / all Campbell Scientific data loggers — data/raw/CSI_TB4.json · record 0 · spec 18 · dòng 21
- **Black Wire Function**: Rain signal — data/raw/CSI_TB4.json · record 0 · spec 19 · dòng 23
- **White Wire Function**: Rain signal reference — data/raw/CSI_TB4.json · record 0 · spec 20 · dòng 24
- **Clear Wire Function**: Shield — data/raw/CSI_TB4.json · record 0 · spec 21 · dòng 25
- **CRBasic Measurement Instruction**: PulseCount() — data/raw/CSI_TB4.json · record 0 · spec 22 · dòng 26
- **Rainfall Multiplier – Inches**: 0.01 — data/raw/CSI_TB4.json · record 0 · spec 23 · dòng 27
- **Rainfall Multiplier – Millimeters**: 0.254 — data/raw/CSI_TB4.json · record 0 · spec 24 · dòng 28

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## TCAV

Soil Temperature Sensor · CSI_TCAV

Nguồn catalog: https://www.campbellsci.com/products/tcav

Đại lượng có bằng chứng: Nhiệt độ đất.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: 

**Ví dụ explanation tiếng Việt**

Khớp chính xác model TCAV. TCAV đo nhiệt độ đất, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn.

**Ví dụ explanation tiếng Anh**

Exact model match: TCAV. TCAV measures soil temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed.

**Thông số nguồn để đối chiếu**

- **Product Name**: TCAV — data/raw/CSI_TCAV.json · record 0 · spec 0 · dòng 2
- **Product Type**: Averaging Soil Thermocouple Probe — data/raw/CSI_TCAV.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_TCAV.json · record 0 · spec 2 · dòng 4
- **Measurement Parameter**: Average soil temperature — data/raw/CSI_TCAV.json · record 0 · spec 3 · dòng 5
- **Primary Application**: Energy-balance / soil heat flux systems — data/raw/CSI_TCAV.json · record 0 · spec 4 · dòng 6
- **Thermocouple Type**: Type E — data/raw/CSI_TCAV.json · record 0 · spec 5 · dòng 7
- **Thermocouple Materials**: Chromel-Constantan — data/raw/CSI_TCAV.json · record 0 · spec 6 · dòng 8
- **Number of Thermocouples**: 4 — data/raw/CSI_TCAV.json · record 0 · spec 7 · dòng 9
- **Wire Gauge**: 24 AWG — data/raw/CSI_TCAV.json · record 0 · spec 8 · dòng 10
- **Maximum Spacing Between Thermocouple Pairs**: Up to 1 m — data/raw/CSI_TCAV.json · record 0 · spec 9 · dòng 11
- **Typical Output**: 60 µV/°C — data/raw/CSI_TCAV.json · record 0 · spec 10 · dòng 12
- **Weight**: 0.45 kg (1 lb) with 15.24 m (50 ft) cable — data/raw/CSI_TCAV.json · record 0 · spec 11 · dòng 13
- **Reference Temperature Required**: Yes — data/raw/CSI_TCAV.json · record 0 · spec 12 · dòng 14
- **Recommended Reference Temperature Source**: Data logger panel temperature sensor — data/raw/CSI_TCAV.json · record 0 · spec 13 · dòng 15
- **Differential Measurement Instruction**: TCDiff() — data/raw/CSI_TCAV.json · record 0 · spec 14 · dòng 16
- **Single-Ended Measurement Instruction**: TCSe() — data/raw/CSI_TCAV.json · record 0 · spec 15 · dòng 17
- **Recommended Measurement Instruction**: TCDiff() — data/raw/CSI_TCAV.json · record 0 · spec 16 · dòng 18
- **Thermocouple Type Setting in CRBasic**: TypeE — data/raw/CSI_TCAV.json · record 0 · spec 17 · dòng 19
- **Reference Temperature Instruction**: PanelTemp() — data/raw/CSI_TCAV.json · record 0 · spec 18 · dòng 20
- **Purple Wire Function**: Analog signal — data/raw/CSI_TCAV.json · record 0 · spec 19 · dòng 21
- **Red Wire Function**: Signal reference — data/raw/CSI_TCAV.json · record 0 · spec 20 · dòng 22
- **Differential High Connection**: U configured for differential high / DIFF H — data/raw/CSI_TCAV.json · record 0 · spec 21 · dòng 23
- **Differential Low Connection**: U configured for differential low / DIFF L — data/raw/CSI_TCAV.json · record 0 · spec 22 · dòng 24
- **Single-Ended Connection**: U configured for single-ended / SE — data/raw/CSI_TCAV.json · record 0 · spec 23 · dòng 25
- **Typical Soil Heat Flux System Components**: TCAV, HFP01SC Soil Heat Flux Plates, and CS616 / CS650 / CS655 water content reflectometer — data/raw/CSI_TCAV.json · record 0 · spec 24 · dòng 26
- **Warranty**: 12 months — data/raw/CSI_TCAV.json · record 0 · spec 25 · dòng 27

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## TE525

Tipping Bucket Rain Gage · CSI_TE525

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Lượng mưa.

Giao thức được ghi nhận: chưa ghi nhận.

Cấu hình model: Product Type: Tipping Bucket Rain Gage; Volume per Tip: 4.73 ml/tip (0.16 fl. oz/tip); Rainfall per Tip: 0.01 in. (0.254 mm); Funnel Collector Diameter: 15.4 cm (6.06 in.); Height: 24.1 cm (9.5 in.); Tipping Bucket Weight: 0.9 kg (2 lb); CS705 Snowfall Adapter Compatibility: No direct compatibility; Rainfall Multiplier – Inches: 0.01; Rainfall Multiplier – Millimeters: 0.254; Field Calibration Check – Expected Tips per 16 fl oz: 100 ± 3

**Ví dụ explanation tiếng Việt**

Khớp chính xác model TE525. TE525 đo lượng mưa, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Đây là số đo lượng mưa tại điểm lắp đặt, bổ sung cho dự báo; nếu chỉ cần đo mưa, chưa có căn cứ bắt buộc mua cả trạm thời tiết. Theo dõi theo thời gian cần cấu hình ghi dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Cấu hình TE525: Field Calibration Check – Expected Tips per 16 fl oz: 100 ± 3. Thông số Operating Temperature Range: 0 to +50 °C. Thông số resolution: 1 tip. Thông số measurement accuracy: 1.0% up to 50 mm/h (2 in./h).

**Ví dụ explanation tiếng Anh**

Exact model match: TE525. TE525 measures precipitation, providing readings to monitor conditions before deciding on adjustments. This measures rainfall at the installation point, complementing forecasts; measuring rainfall alone does not establish a need for an entire weather station. Tracking it over time requires data-recording configuration. Installation suitability for your specific use case remains unconfirmed. TE525 configuration: Field Calibration Check – Expected Tips per 16 fl oz: 100 ± 3. Operating Temperature Range: 0 to +50 °C. resolution: 1 tip. measurement accuracy: 1.0% up to 50 mm/h (2 in./h).

**Thông số nguồn để đối chiếu**

- **Product Type**: Tipping Bucket Rain Gage — data/raw/CSI_TE525.json · record 0 · spec 0 · dòng 3
- **Manufacturer**: Texas Electronics; cabled by Campbell Scientific — data/raw/CSI_TE525.json · record 0 · spec 1 · dòng 4
- **Sensor Type**: Tipping bucket / potted magnetic momentary-contact reed switch — data/raw/CSI_TE525.json · record 0 · spec 2 · dòng 5
- **Operating Temperature Range**: 0 to +50 °C — data/raw/CSI_TE525.json · record 0 · spec 3 · dòng 6
- **Storage Temperature Range**: -40 to +70 °C — data/raw/CSI_TE525.json · record 0 · spec 4 · dòng 7
- **Resolution**: 1 tip — data/raw/CSI_TE525.json · record 0 · spec 5 · dòng 8
- **Volume per Tip**: 4.73 ml/tip (0.16 fl. oz/tip) — data/raw/CSI_TE525.json · record 0 · spec 6 · dòng 9
- **Rainfall per Tip**: 0.01 in. (0.254 mm) — data/raw/CSI_TE525.json · record 0 · spec 7 · dòng 10
- **Measurement Accuracy**: 1.0% up to 50 mm/h (2 in./h) — data/raw/CSI_TE525.json · record 0 · spec 8 · dòng 11
- **Funnel Collector Diameter**: 15.4 cm (6.06 in.) — data/raw/CSI_TE525.json · record 0 · spec 9 · dòng 12
- **Height**: 24.1 cm (9.5 in.) — data/raw/CSI_TE525.json · record 0 · spec 10 · dòng 13
- **Tipping Bucket Weight**: 0.9 kg (2 lb) — data/raw/CSI_TE525.json · record 0 · spec 11 · dòng 14
- **Cable Type**: 2-conductor shielded cable — data/raw/CSI_TE525.json · record 0 · spec 12 · dòng 15
- **Cable Weight**: 0.1 kg (0.2 lb) per 3.05 m (10 ft) — data/raw/CSI_TE525.json · record 0 · spec 13 · dòng 16
- **Switch Rating – DC**: 30 VDC at 2 A — data/raw/CSI_TE525.json · record 0 · spec 14 · dòng 17
- **Switch Rating – AC**: 115 VAC at 1 A — data/raw/CSI_TE525.json · record 0 · spec 15 · dòng 18
- **Switch Closure Time**: 135 ms — data/raw/CSI_TE525.json · record 0 · spec 16 · dòng 19
- **Bounce Settling Time**: 0.75 ms — data/raw/CSI_TE525.json · record 0 · spec 17 · dòng 20
- **Bucket Material**: White powder-coated spun aluminum — data/raw/CSI_TE525.json · record 0 · spec 18 · dòng 21
- **Funnel Collector Material**: Gold anodized spun aluminum — data/raw/CSI_TE525.json · record 0 · spec 19 · dòng 22
- **Screen Material**: Gold anodized spun aluminum — data/raw/CSI_TE525.json · record 0 · spec 20 · dòng 23
- **Locking Snap Ring Material**: Stainless steel — data/raw/CSI_TE525.json · record 0 · spec 21 · dòng 24
- **Tipping Mechanism Material**: UV-protected black ABS plastic with hardened stainless-steel jewel bearings and pivot — data/raw/CSI_TE525.json · record 0 · spec 22 · dòng 25
- **CS705 Snowfall Adapter Compatibility**: No direct compatibility — data/raw/CSI_TE525.json · record 0 · spec 23 · dòng 27
- **Wireless Sensor Network Compatibility**: Compatible with CWS900-series interfaces — data/raw/CSI_TE525.json · record 0 · spec 24 · dòng 28
- **Compatible Data Loggers**: All Campbell Scientific data loggers — data/raw/CSI_TE525.json · record 0 · spec 25 · dòng 29
- **Mounting**: Pole or mast mounting; CM300-series pole or user-supplied pole — data/raw/CSI_TE525.json · record 0 · spec 26 · dòng 30
- **Black Wire Function**: Rain signal — data/raw/CSI_TE525.json · record 0 · spec 27 · dòng 31
- **White Wire Function**: Rain signal reference — data/raw/CSI_TE525.json · record 0 · spec 28 · dòng 32
- **Clear Wire Function**: Shield — data/raw/CSI_TE525.json · record 0 · spec 29 · dòng 33
- **CRBasic Measurement Instruction**: PulseCount() — data/raw/CSI_TE525.json · record 0 · spec 30 · dòng 34
- **Rainfall Multiplier – Inches**: 0.01 — data/raw/CSI_TE525.json · record 0 · spec 31 · dòng 35
- **Rainfall Multiplier – Millimeters**: 0.254 — data/raw/CSI_TE525.json · record 0 · spec 32 · dòng 36
- **Field Calibration Check Interval**: Every 12 months — data/raw/CSI_TE525.json · record 0 · spec 33 · dòng 37
- **Field Calibration Check – Expected Tips per 16 fl oz**: 100 ± 3 — data/raw/CSI_TE525.json · record 0 · spec 34 · dòng 38
- **Warranty**: 3 years — data/raw/CSI_TE525.json · record 0 · spec 35 · dòng 39

**Cần kiểm tra tiếp**

- Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.
- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## TEMP120-XD

Measurement Device · CSI_TEMP120_XD

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: RJ45 (supported), USB (supported).

Cấu hình model: Product Variant: Extended Duty (XD); Operating Temperature Range: -55 to +85 °C; Internal Cold Junction Accuracy – Maximum: ±0.36 °C maximum (-55 to +85 °C); Total Measurement Accuracy – Static Environment – Maximum: ±1.0 °C maximum (-55 to +85 °C); Measurement Performance Verification: Engineering design; verified over the full product temperature range; Calibration Certificate: Included; Instrument Data Report: Included

**Ví dụ explanation tiếng Việt**

Khớp chính xác model TEMP120-XD. TEMP120-XD là Measurement Device; dữ liệu ghi nhận chức năng/đầu vào đo nhiệt độ. Cần phân biệt phép đo nội bộ và tín hiệu đầu vào với cảm biến đo trực tiếp môi trường; kiểm tra cảm biến, đấu dây và cấu hình tương ứng. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: USB. Cấu hình TEMP120-XD: Product Variant: Extended Duty (XD). Cấu hình TEMP120-XD: Calibration Certificate: Included. Thông số Measurement Resolution: 0.015 °C. Thông số Operating Temperature Range: -55 to +85 °C. Thông số internal cold junction accuracy maximum: ±0.36 °C maximum (-55 to +85 °C).

**Ví dụ explanation tiếng Anh**

Exact model match: TEMP120-XD. TEMP120-XD is a Measurement Device; the data records measurement functions/inputs for temperature. Distinguish internal measurements and input signals from direct environmental sensors; check sensors, wiring and configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: USB. TEMP120-XD configuration: Product Variant: Extended Duty (XD). TEMP120-XD configuration: Calibration Certificate: Included. Measurement Resolution: 0.015 °C. Operating Temperature Range: -55 to +85 °C. internal cold junction accuracy maximum: ±0.36 °C maximum (-55 to +85 °C).

**Thông số nguồn để đối chiếu**

- **Product Variant**: Extended Duty (XD) — data/raw/TEMP120-XD.json · record 0 · spec 0 · dòng 3
- **Product Type**: 20-Channel Thermocouple Module — data/raw/TEMP120-XD.json · record 0 · spec 1 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/TEMP120-XD.json · record 0 · spec 2 · dòng 5
- **Number of Channels**: 20 — data/raw/TEMP120-XD.json · record 0 · spec 3 · dòng 6
- **Terminal Type**: Universal (copper/copper), miniature socket connectors — data/raw/TEMP120-XD.json · record 0 · spec 4 · dòng 7
- **Supported Thermocouple Types**: B, E, J, K, N, R, S, T — data/raw/TEMP120-XD.json · record 0 · spec 5 · dòng 8
- **A/D Converter**: 24-bit sigma-delta — data/raw/TEMP120-XD.json · record 0 · spec 6 · dòng 9
- **Measurement Resolution**: 0.015 °C — data/raw/TEMP120-XD.json · record 0 · spec 7 · dòng 10
- **Operating Temperature Range**: -55 to +85 °C — data/raw/TEMP120-XD.json · record 0 · spec 8 · dòng 11
- **Internal Cold Junction Accuracy – Maximum**: ±0.36 °C maximum (-55 to +85 °C) — data/raw/TEMP120-XD.json · record 0 · spec 9 · dòng 13
- **Total Measurement Accuracy – Static Environment – Maximum**: ±1.0 °C maximum (-55 to +85 °C) — data/raw/TEMP120-XD.json · record 0 · spec 10 · dòng 15
- **Total Measurement Accuracy – Rapid Temperature Ramps**: ±3 °C maximum (8 °C/min ambient gradient) — data/raw/TEMP120-XD.json · record 0 · spec 11 · dòng 16
- **Measurement Performance Verification**: Engineering design; verified over the full product temperature range — data/raw/TEMP120-XD.json · record 0 · spec 12 · dòng 17
- **Calibration Certificate**: Included — data/raw/TEMP120-XD.json · record 0 · spec 13 · dòng 18
- **Instrument Data Report**: Included — data/raw/TEMP120-XD.json · record 0 · spec 14 · dòng 19
- **Recommended Calibration Interval**: Every 3 years — data/raw/TEMP120-XD.json · record 0 · spec 15 · dòng 20
- **Maximum Measurement Rate – Filtering Disabled**: 10 Hz for all 20 channels — data/raw/TEMP120-XD.json · record 0 · spec 16 · dòng 21
- **Maximum Measurement Rate – Filtering Enabled**: 1 Hz for all 20 channels — data/raw/TEMP120-XD.json · record 0 · spec 17 · dòng 22
- **Input Limits**: 0.25 to 3.0 VDC (built-in ±1.65 VDC bias voltage) — data/raw/TEMP120-XD.json · record 0 · spec 18 · dòng 23
- **Maximum Input Voltage**: ±10 VDC — data/raw/TEMP120-XD.json · record 0 · spec 19 · dòng 24
- **DC Common-Mode Rejection**: ≥115 dB — data/raw/TEMP120-XD.json · record 0 · spec 20 · dòng 25
- **Normal-Mode Rejection**: >80 dB at 50 and 60 Hz — data/raw/TEMP120-XD.json · record 0 · spec 21 · dòng 26
- **CPI Interface**: RJ45 interface — data/raw/TEMP120-XD.json · record 0 · spec 22 · dòng 27
- **USB Interface**: USB micro-B, USB 2.0 full-speed, 12 Mbps — data/raw/TEMP120-XD.json · record 0 · spec 23 · dòng 28
- **Processor**: Renesas RX63N, 32-bit with hardware FPU, 96 MHz — data/raw/TEMP120-XD.json · record 0 · spec 24 · dòng 29
- **Memory**: 2 MB SRAM — data/raw/TEMP120-XD.json · record 0 · spec 25 · dòng 30
- **Power Supply Voltage**: 9.6 to 32 VDC — data/raw/TEMP120-XD.json · record 0 · spec 26 · dòng 31
- **Typical Current Drain – Sleep**: 5 mA — data/raw/TEMP120-XD.json · record 0 · spec 27 · dòng 32
- **Typical Current Drain – Active**: 30 mA — data/raw/TEMP120-XD.json · record 0 · spec 28 · dòng 33
- **Default CPI Address**: 1 — data/raw/TEMP120-XD.json · record 0 · spec 29 · dòng 34
- **Allowable CPI Address Range**: 1 to 120 — data/raw/TEMP120-XD.json · record 0 · spec 30 · dòng 35
- **Compatible Data Loggers**: GRANITE 10, GRANITE 9, GRANITE 6, CR6, CR1000X — data/raw/TEMP120-XD.json · record 0 · spec 31 · dòng 36
- **CPI Cable**: CAT5e or better RJ45 cable — data/raw/TEMP120-XD.json · record 0 · spec 32 · dòng 37
- **Earth Ground Wire**: 14 AWG minimum recommended — data/raw/TEMP120-XD.json · record 0 · spec 33 · dòng 38
- **Dimensions**: 20.3 × 12.7 × 5.1 cm (8.0 × 5.0 × 2.0 in) — data/raw/TEMP120-XD.json · record 0 · spec 34 · dòng 39

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## TempVue20-S

Air Temperature Sensor · CSI_TEMPVUE20_S

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ không khí.

Giao thức được ghi nhận: SDI-12 (supported).

Cấu hình model: Product Variant: SDI-12 output version; Communication Protocol: SDI-12 version 1.4; Default Address: SDI-12 address: 0; Signal Type / Output: Digital output, SDI-12; Compatible Data Loggers / Controllers: GRANITE series, CR6, CR1000X, CR800 series, CR300 series, CR3000, CR1000; CRBasic Measurement Instruction: SDI12Recorder(); Brown Wire Function: Power (12V); Black Wire Function: Power ground; Gray Wire Function: Aspen detect signal

**Ví dụ explanation tiếng Việt**

Khớp chính xác model TempVue20-S. TempVue20-S đo nhiệt độ không khí, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Cấu hình TempVue20-S: Product Variant: SDI-12 output version. Thông số measurement uncertainty common range: ±0.1 °C (-40 to +40 °C). Thông số measurement uncertainty full range: ±0.3 °C (-60 to -40 °C and 40 to 60 °C). Thông số temperature measurement range: -60 to +60 °C (-76 to +140 °F).

**Ví dụ explanation tiếng Anh**

Exact model match: TempVue20-S. TempVue20-S measures air temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. TempVue20-S configuration: Product Variant: SDI-12 output version. measurement uncertainty common range: ±0.1 °C (-40 to +40 °C). measurement uncertainty full range: ±0.3 °C (-60 to -40 °C and 40 to 60 °C). temperature measurement range: -60 to +60 °C (-76 to +140 °F).

**Thông số nguồn để đối chiếu**

- **Product Name**: TempVue™20 — data/raw/TempVue20.json · record 0 · spec 0 · dòng 2
- **Product Variant**: SDI-12 output version — data/raw/TempVue20.json · record 0 · spec 1 · dòng 3
- **Product Type**: Pt100 Digital Air Temperature Sensor — data/raw/TempVue20.json · record 0 · spec 2 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/TempVue20.json · record 0 · spec 3 · dòng 5
- **Measurement Parameter**: Air temperature — data/raw/TempVue20.json · record 0 · spec 4 · dòng 6
- **Sensor Description**: Platinum Resistance Thermometer (Pt100) — data/raw/TempVue20.json · record 0 · spec 5 · dòng 7
- **Communication Protocol**: SDI-12 version 1.4 — data/raw/TempVue20.json · record 0 · spec 6 · dòng 8
- **Default Address**: SDI-12 address: 0 — data/raw/TempVue20.json · record 0 · spec 7 · dòng 9
- **Measurement Uncertainty – Common Range**: ±0.1 °C (-40 to +40 °C) — data/raw/TempVue20.json · record 0 · spec 8 · dòng 11
- **Measurement Uncertainty – Full Range**: ±0.3 °C (-60 to -40 °C and 40 to 60 °C) — data/raw/TempVue20.json · record 0 · spec 9 · dòng 12
- **Temperature Measurement Range**: -60 to +60 °C (-76 to +140 °F) — data/raw/TempVue20.json · record 0 · spec 10 · dòng 13
- **Time Constant in Air**: 20 s for a wind speed of 1 m/s (3.3 ft/s) — data/raw/TempVue20.json · record 0 · spec 11 · dòng 14
- **Resolution**: 0.01 °C — data/raw/TempVue20.json · record 0 · spec 12 · dòng 15
- **Voltage Range**: 6 to 16 VDC — data/raw/TempVue20.json · record 0 · spec 13 · dòng 16
- **Current**: 150 µA — data/raw/TempVue20.json · record 0 · spec 14 · dòng 17
- **Signal Type / Output**: Digital output, SDI-12 — data/raw/TempVue20.json · record 0 · spec 15 · dòng 18
- **Connector Type**: M12 — data/raw/TempVue20.json · record 0 · spec 16 · dòng 19
- **Standard Cable Length**: 1 m (3 ft) — data/raw/TempVue20.json · record 0 · spec 17 · dòng 20
- **Ingress Protection**: IP67 — data/raw/TempVue20.json · record 0 · spec 18 · dòng 21
- **Probe Diameter**: 1.9 cm (0.75 in) maximum — data/raw/TempVue20.json · record 0 · spec 19 · dòng 22
- **Probe Length**: 12.1 cm (4.75 in) tip to end of cable gland — data/raw/TempVue20.json · record 0 · spec 20 · dòng 23
- **Extended Probe Length**: 18.1 cm (7.125 in) tip to end of extender piece — data/raw/TempVue20.json · record 0 · spec 21 · dòng 24
- **Total Length**: 97.16 cm (38.25 in) tip to end of connector — data/raw/TempVue20.json · record 0 · spec 22 · dòng 25
- **Weight**: 70 g (0.15 lb) including standard 1 m cable with M12 connector — data/raw/TempVue20.json · record 0 · spec 23 · dòng 26
- **Aspen 10 Compatibility**: Direct connection supported — data/raw/TempVue20.json · record 0 · spec 24 · dòng 27
- **Compatible Data Loggers / Controllers**: GRANITE series, CR6, CR1000X, CR800 series, CR300 series, CR3000, CR1000 — data/raw/TempVue20.json · record 0 · spec 25 · dòng 28
- **Measurement Memory**: Most recent 5760 measurements (one day worth) — data/raw/TempVue20.json · record 0 · spec 26 · dòng 29
- **Recommended Measurement Scan Interval**: 15 seconds or more — data/raw/TempVue20.json · record 0 · spec 27 · dòng 30
- **Temperature Output Units**: °C or °F — data/raw/TempVue20.json · record 0 · spec 28 · dòng 31
- **Valid SDI-12 Addresses**: 0–9, a–z, A–Z — data/raw/TempVue20.json · record 0 · spec 29 · dòng 32
- **CRBasic Measurement Instruction**: SDI12Recorder() — data/raw/TempVue20.json · record 0 · spec 30 · dòng 33
- **White Wire Function**: SDI-12 signal — data/raw/TempVue20.json · record 0 · spec 31 · dòng 34
- **Brown Wire Function**: Power (12V) — data/raw/TempVue20.json · record 0 · spec 32 · dòng 37
- **Black Wire Function**: Power ground — data/raw/TempVue20.json · record 0 · spec 33 · dòng 38
- **Gray Wire Function**: Aspen detect signal — data/raw/TempVue20.json · record 0 · spec 34 · dòng 39
- **Clear Wire Function**: Shield — data/raw/TempVue20.json · record 0 · spec 35 · dòng 40
- **Compatible Radiation Shields**: RAD06, RAD10E, RAD14, TS100SS — data/raw/TempVue20.json · record 0 · spec 36 · dòng 41
- **Compliance**: UKCA and EU declarations of conformity — data/raw/TempVue20.json · record 0 · spec 37 · dòng 42

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## TempVue50

Water and Soil Temperature Sensor · CSI_TEMPVUE50

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ nước.

Giao thức được ghi nhận: SDI-12 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model TempVue50. TempVue50 đo nhiệt độ nước, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: SDI-12. Thông số measurement uncertainty: 0.1 °C (-0.5 to +40 °C). Thông số Temperature Measurement Range: -40 to +60 °C. Thông số Resolution: 0.01 °C.

**Ví dụ explanation tiếng Anh**

Exact model match: TempVue50. TempVue50 measures water temperature, providing readings to monitor conditions before deciding on adjustments. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: SDI-12. measurement uncertainty: 0.1 °C (-0.5 to +40 °C). Temperature Measurement Range: -40 to +60 °C. Resolution: 0.01 °C.

**Thông số nguồn để đối chiếu**

- **Product Type**: Precision Digital Water Temperature Sensor — data/raw/TempVue50.json · record 0 · spec 0 · dòng 3
- **Sensor Description**: Band gap sensor mounted to a circuit board — data/raw/TempVue50.json · record 0 · spec 1 · dòng 5
- **Measurement Parameter**: Water temperature — data/raw/TempVue50.json · record 0 · spec 2 · dòng 6
- **Communication Protocol**: SDI-12 version 1.4 — data/raw/TempVue50.json · record 0 · spec 3 · dòng 7
- **Default SDI-12 Address**: 0 — data/raw/TempVue50.json · record 0 · spec 4 · dòng 8
- **Measurement Uncertainty**: 0.1 °C (-0.5 to +40 °C) — data/raw/TempVue50.json · record 0 · spec 5 · dòng 9
- **Temperature Measurement Range**: -40 to +60 °C — data/raw/TempVue50.json · record 0 · spec 6 · dòng 10
- **Time Constant**: <35 seconds — data/raw/TempVue50.json · record 0 · spec 7 · dòng 11
- **Resolution**: 0.01 °C — data/raw/TempVue50.json · record 0 · spec 8 · dòng 12
- **Voltage Range**: 6 to 16 VDC — data/raw/TempVue50.json · record 0 · spec 9 · dòng 13
- **Average Current**: 150 µA — data/raw/TempVue50.json · record 0 · spec 10 · dòng 14
- **Signal Type / Output**: Digital output, SDI-12 version 1.4 — data/raw/TempVue50.json · record 0 · spec 11 · dòng 15
- **Maximum Depth**: 100 m (328 ft) — data/raw/TempVue50.json · record 0 · spec 12 · dòng 16
- **Probe Diameter**: 1.7 cm (0.67 in) — data/raw/TempVue50.json · record 0 · spec 13 · dòng 17
- **Probe Length**: 9.5 cm (3.75 in) — data/raw/TempVue50.json · record 0 · spec 14 · dòng 18
- **Housing**: Water-tight housing — data/raw/TempVue50.json · record 0 · spec 15 · dòng 19
- **Compatible Data Loggers / Controllers**: Any SDI-12 data logger/controller including Campbell Scientific GRANITE series, CR6, CR1000X, CR800 series, CR300 series, CR3000, and CR1000 — data/raw/TempVue50.json · record 0 · spec 16 · dòng 20
- **Aspen 10 Compatibility**: SDI-12 version directly connects to Campbell Scientific Aspen 10 Edge Device — data/raw/TempVue50.json · record 0 · spec 17 · dòng 21
- **A151 Compatibility**: Compatible with A151 vented junction box — data/raw/TempVue50.json · record 0 · spec 18 · dòng 22
- **Measurement Memory**: Most recent 5760 measurements (one day worth) — data/raw/TempVue50.json · record 0 · spec 19 · dòng 23
- **Recommended Measurement Scan Interval**: 15 seconds or more — data/raw/TempVue50.json · record 0 · spec 20 · dòng 24
- **Temperature Output Units**: °C or °F — data/raw/TempVue50.json · record 0 · spec 21 · dòng 25
- **White Wire Function**: SDI-12 signal — data/raw/TempVue50.json · record 0 · spec 22 · dòng 26
- **Brown Wire Function**: Power (12V connection) — data/raw/TempVue50.json · record 0 · spec 23 · dòng 27
- **Black Wire Function**: Power ground — data/raw/TempVue50.json · record 0 · spec 24 · dòng 28
- **Clear Wire Function**: Shield — data/raw/TempVue50.json · record 0 · spec 25 · dòng 29
- **Valid SDI-12 Addresses**: 0–9, a–z, A–Z — data/raw/TempVue50.json · record 0 · spec 26 · dòng 30
- **CRBasic Measurement Instruction**: SDI12Recorder() — data/raw/TempVue50.json · record 0 · spec 27 · dòng 31
- **Compliance**: UKCA and EU declarations of conformity — data/raw/TempVue50.json · record 0 · spec 28 · dòng 32

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## TX325

Satellite Communication Device · CSI_TX325

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: ASCII (supported), RS-232 (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model TX325. TX325 là thiết bị truyền thông, liên quan đến phần truyền dữ liệu của hệ thống. Cần xác nhận giao thức, mạng và thiết bị kết nối phù hợp; khả năng truyền dữ liệu không xác nhận khả năng đo hoặc xử lý vấn đề. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232. Thông số Supply Voltage Range: 10.5 to 16 Vdc. Thông số power connector: 2-pin screw terminal, 0.2 in. pitch. Thông số power protection: Up to 23.1 V (reverse polarity and overvoltage); total system current fused at 5 A with replaceable fuse.

**Ví dụ explanation tiếng Anh**

Exact model match: TX325. TX325 is communication equipment for the data-transfer part of a system. Confirm compatible protocols, networks and connected devices; communication does not establish measurement or treatment capabilities. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232. Supply Voltage Range: 10.5 to 16 Vdc. power connector: 2-pin screw terminal, 0.2 in. pitch. power protection: Up to 23.1 V (reverse polarity and overvoltage); total system current fused at 5 A with replaceable fuse.

**Thông số nguồn để đối chiếu**

- **Product Type**: Satellite Transmitter for GOES CS2/v2.0 — data/raw/TX325.json · record 0 · spec 0 · dòng 3
- **Satellite System**: GOES DCS — data/raw/TX325.json · record 0 · spec 1 · dòng 5
- **Successor To**: TX321 — data/raw/TX325.json · record 0 · spec 2 · dòng 6
- **Communication Direction**: One-way satellite data transmission — data/raw/TX325.json · record 0 · spec 3 · dòng 7
- **Transmissions Supported**: Random; Timed (Scheduled) — data/raw/TX325.json · record 0 · spec 4 · dòng 8
- **Supported Transmission Rates**: 300 and 1200 bps — data/raw/TX325.json · record 0 · spec 5 · dòng 9
- **Data Formats**: ASCII (SHEF); Pseudo Binary — data/raw/TX325.json · record 0 · spec 6 · dòng 10
- **Radio Module**: OmniSat-3 — data/raw/TX325.json · record 0 · spec 7 · dòng 11
- **Certification**: NOAA/NESDIS GOES High Data Rate Certification Standard V2, Certification #12142012 — data/raw/TX325.json · record 0 · spec 8 · dòng 12
- **Operating Temperature Range**: -40 to +60 °C — data/raw/TX325.json · record 0 · spec 9 · dòng 13
- **Storage Temperature Range**: -55 to +75 °C — data/raw/TX325.json · record 0 · spec 10 · dòng 14
- **Case Dimensions – Without Connectors**: 15.88 × 12.7 × 4.57 cm (6.25 × 5 × 1.8 in.) — data/raw/TX325.json · record 0 · spec 11 · dòng 15
- **Maximum Dimensions – With Connectors**: 15.88 × 14.99 × 4.57 cm (6.25 × 5.9 × 1.8 in.) — data/raw/TX325.json · record 0 · spec 12 · dòng 16
- **Weight**: 0.77 kg (1.7 lb) — data/raw/TX325.json · record 0 · spec 13 · dòng 17
- **Supply Voltage Range**: 10.5 to 16 Vdc — data/raw/TX325.json · record 0 · spec 14 · dòng 18
- **Current Drain – Standby**: <5 mA (2.8 mA typical at 12 Vdc) — data/raw/TX325.json · record 0 · spec 15 · dòng 19
- **Current Drain – GPS Acquisition**: <50 mA (25 mA typical at 12 Vdc) — data/raw/TX325.json · record 0 · spec 16 · dòng 20
- **Current Drain – Transmitting**: <2.5 A (1.8 A typical at 12 Vdc) — data/raw/TX325.json · record 0 · spec 17 · dòng 21
- **Power Connector**: 2-pin screw terminal, 0.2 in. pitch — data/raw/TX325.json · record 0 · spec 18 · dòng 22
- **Power Protection**: Up to 23.1 V (reverse polarity and overvoltage); total system current fused at 5 A with replaceable fuse — data/raw/TX325.json · record 0 · spec 19 · dòng 23
- **Baud Rates**: 300 and 1200 bps — data/raw/TX325.json · record 0 · spec 20 · dòng 24
- **Transmit Power – 300 baud**: 31 dBm maximum — data/raw/TX325.json · record 0 · spec 21 · dòng 25
- **Typical EIRP – 300 baud**: 37 to 41 dBm — data/raw/TX325.json · record 0 · spec 22 · dòng 26
- **Maximum EIRP – 300 baud**: 41 dBm — data/raw/TX325.json · record 0 · spec 23 · dòng 27
- **Transmit Power – 1200 baud**: 37 dBm maximum — data/raw/TX325.json · record 0 · spec 24 · dòng 28
- **Typical EIRP – 1200 baud**: 43 to 47 dBm — data/raw/TX325.json · record 0 · spec 25 · dòng 29
- **Maximum EIRP – 1200 baud**: 47 dBm — data/raw/TX325.json · record 0 · spec 26 · dòng 30
- **Frequency Range**: 401.701 to 402.09925 MHz — data/raw/TX325.json · record 0 · spec 27 · dòng 31
- **Initial Frequency Stability**: ±20 Hz disciplined to GPS — data/raw/TX325.json · record 0 · spec 28 · dòng 32
- **Integrated GPS Receiver**: Yes — data/raw/TX325.json · record 0 · spec 29 · dòng 34
- **GPS Initial Time Accuracy**: ±100 μs (synchronized to GPS) — data/raw/TX325.json · record 0 · spec 30 · dòng 35
- **Clock Drift Without GPS**: ±40 ms/day — data/raw/TX325.json · record 0 · spec 31 · dòng 36
- **GPS Schedule**: 1 fix at power up; updated roughly every 11 hours — data/raw/TX325.json · record 0 · spec 32 · dòng 37
- **Maximum RF Input Gain**: 25 dB — data/raw/TX325.json · record 0 · spec 33 · dòng 39
- **GPS Receiver Type**: 3.3 V active — data/raw/TX325.json · record 0 · spec 34 · dòng 40
- **GPS Connector Type**: SMA jack — data/raw/TX325.json · record 0 · spec 35 · dòng 41
- **External GPS Antenna Supply**: Up to 19 mA at 2.7 V — data/raw/TX325.json · record 0 · spec 36 · dòng 42
- **Recommended Maximum GPS Antenna LNA**: 1.5 dB — data/raw/TX325.json · record 0 · spec 37 · dòng 43
- **RS-232 Interface**: DB9 F, DCE, 3-wire RS-232 — data/raw/TX325.json · record 0 · spec 38 · dòng 44
- **Satellite RF Transmit Out**: Type N jack — data/raw/TX325.json · record 0 · spec 39 · dòng 45
- **Compatible Data Loggers – Fully Compatible**: GRANITE series, CR6, CR1000X series, CR350, CR300 series — data/raw/TX325.json · record 0 · spec 40 · dòng 46
- **Compatible Data Loggers – Limited Compatibility**: CR3000, CR800 series, CR1000 — data/raw/TX325.json · record 0 · spec 41 · dòng 47

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## TX326

Satellite Transmitter · CSI_TX326

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: ASCII (supported), RS-232 (supported).

Cấu hình model: 

**Ví dụ explanation tiếng Việt**

Khớp chính xác model TX326. TX326 được phân loại là Satellite Transmitter. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232. Thông số Supply Voltage Range: 10.5 to 16 VDC. Thông số power connector: 2-pin screw terminal, 0.2 in. pitch. Thông số power protection: Up to 23.1 V (reverse polarity and overvoltage); total system current fused at 5 A with replaceable fuse.

**Ví dụ explanation tiếng Anh**

Exact model match: TX326. TX326 is classified as a Satellite Transmitter. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232. Supply Voltage Range: 10.5 to 16 VDC. power connector: 2-pin screw terminal, 0.2 in. pitch. power protection: Up to 23.1 V (reverse polarity and overvoltage); total system current fused at 5 A with replaceable fuse.

**Thông số nguồn để đối chiếu**

- **Product Name**: TX326 Satellite Transmitter for METEOSAT — data/raw/CSI_TX326.json · record 0 · spec 0 · dòng 2
- **Product Type**: Satellite Transmitter for METEOSAT — data/raw/CSI_TX326.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_TX326.json · record 0 · spec 2 · dòng 4
- **Satellite System**: Meteosat / EuroSat — data/raw/CSI_TX326.json · record 0 · spec 3 · dòng 5
- **Communication Direction**: One-way communication from DCP to receiving station — data/raw/CSI_TX326.json · record 0 · spec 4 · dòng 6
- **Transmissions Supported**: Self-Timed (Scheduled); Alarm (Random) — data/raw/CSI_TX326.json · record 0 · spec 5 · dòng 7
- **Supported Transmission Rates**: 100 bps (SRDCP) and 1200 bps (HRDCP) — data/raw/CSI_TX326.json · record 0 · spec 6 · dòng 8
- **Data Formats**: ASCII data with restrictions; Meteosat alert message; Binary data; ASCII data; Pseudo binary (1200 baud only) — data/raw/CSI_TX326.json · record 0 · spec 7 · dòng 9
- **Radio Module**: OmniSAT-3 — data/raw/CSI_TX326.json · record 0 · spec 8 · dòng 10
- **EUMETSAT Certification – Standard Rate**: EUMETSAT 2013-003-DCP-SDR (17 July 2013), 100 bps — data/raw/CSI_TX326.json · record 0 · spec 9 · dòng 11
- **EUMETSAT Certification – High Rate**: EUMETSAT 2015-001-DCP-HDR (12 March 2015), 1200 bps — data/raw/CSI_TX326.json · record 0 · spec 10 · dòng 12
- **Operating Temperature Range**: -40 to +60 °C — data/raw/CSI_TX326.json · record 0 · spec 11 · dòng 13
- **Storage Temperature Range**: -55 to +75 °C — data/raw/CSI_TX326.json · record 0 · spec 12 · dòng 14
- **Case Dimensions – Without Connectors**: 15.88 × 12.7 × 4.57 cm (6.25 × 5 × 1.8 in.) — data/raw/CSI_TX326.json · record 0 · spec 13 · dòng 15
- **Maximum Dimensions – With Connectors**: 15.88 × 14.99 × 4.57 cm (6.25 × 5.9 × 1.8 in.) — data/raw/CSI_TX326.json · record 0 · spec 14 · dòng 16
- **Weight**: 0.77 kg (1.7 lb) — data/raw/CSI_TX326.json · record 0 · spec 15 · dòng 17
- **Supply Voltage Range**: 10.5 to 16 VDC — data/raw/CSI_TX326.json · record 0 · spec 16 · dòng 18
- **Current Drain – Transmitting**: <2.75 A (1.8 A typical at 12 VDC) — data/raw/CSI_TX326.json · record 0 · spec 17 · dòng 19
- **Current Drain – Standby**: <5 mA (2.8 mA typical at 12 VDC) — data/raw/CSI_TX326.json · record 0 · spec 18 · dòng 20
- **Current Drain – GPS Acquisition**: <40 mA (25 mA typical at 12 VDC) — data/raw/CSI_TX326.json · record 0 · spec 19 · dòng 21
- **Power Connector**: 2-pin screw terminal, 0.2 in. pitch — data/raw/CSI_TX326.json · record 0 · spec 20 · dòng 22
- **Power Protection**: Up to 23.1 V (reverse polarity and overvoltage); total system current fused at 5 A with replaceable fuse — data/raw/CSI_TX326.json · record 0 · spec 21 · dòng 23
- **Baud Rates**: 100 bps (tolerance ±0.005 bps) and 1200 bps (tolerance ±0.06 bps) — data/raw/CSI_TX326.json · record 0 · spec 22 · dòng 24
- **Transmit Power – 100 baud**: 42 dBm maximum — data/raw/CSI_TX326.json · record 0 · spec 23 · dòng 25
- **Typical EIRP – 100 baud**: 47 to 52 dBm — data/raw/CSI_TX326.json · record 0 · spec 24 · dòng 26
- **Maximum EIRP – 100 baud**: 52 dBm — data/raw/CSI_TX326.json · record 0 · spec 25 · dòng 27
- **Transmit Power – 1200 baud**: 50 dBm maximum — data/raw/CSI_TX326.json · record 0 · spec 26 · dòng 28
- **Typical EIRP – 1200 baud**: 40 to 50 dBm — data/raw/CSI_TX326.json · record 0 · spec 27 · dòng 29
- **Maximum EIRP – 1200 baud**: 50 dBm — data/raw/CSI_TX326.json · record 0 · spec 28 · dòng 30
- **Frequency Range – Meteosat**: 402.0355 MHz (channel #1) to 402.4345 MHz (channel #267) — data/raw/CSI_TX326.json · record 0 · spec 29 · dòng 31
- **Frequency Range – International**: 402.0025 MHz (channel #268) to 402.034 MHz (channel #289) — data/raw/CSI_TX326.json · record 0 · spec 30 · dòng 32
- **Channel Bandwidth**: 1.5 kHz (100/1200 baud) — data/raw/CSI_TX326.json · record 0 · spec 31 · dòng 33
- **Initial Frequency Stability – Without GPS**: Maximum ±125 Hz — data/raw/CSI_TX326.json · record 0 · spec 32 · dòng 34
- **Frequency Stability – GPS Disciplined**: < ±20 Hz — data/raw/CSI_TX326.json · record 0 · spec 33 · dòng 35
- **Integrated GPS Receiver**: Yes — data/raw/CSI_TX326.json · record 0 · spec 34 · dòng 36
- **GPS Initial Time Accuracy**: ±100 μs (synchronized to GPS) — data/raw/CSI_TX326.json · record 0 · spec 35 · dòng 37
- **Clock Drift Without GPS**: ±40 ms/day — data/raw/CSI_TX326.json · record 0 · spec 36 · dòng 38
- **GPS Schedule**: 1 fix at power up; updated roughly every 11 hours — data/raw/CSI_TX326.json · record 0 · spec 37 · dòng 39
- **Transmission Continuation Without GPS Fix**: 6 days — data/raw/CSI_TX326.json · record 0 · spec 38 · dòng 40
- **GPS Receiver Type**: 3.3 V active — data/raw/CSI_TX326.json · record 0 · spec 39 · dòng 41
- **GPS Connector Type**: SMA jack — data/raw/CSI_TX326.json · record 0 · spec 40 · dòng 42
- **Maximum RF Input Gain**: 25 dB — data/raw/CSI_TX326.json · record 0 · spec 41 · dòng 43
- **External GPS Antenna Supply**: Up to 19 mA at 2.7 V — data/raw/CSI_TX326.json · record 0 · spec 42 · dòng 44
- **Recommended Maximum GPS Antenna LNA**: 1.5 dB — data/raw/CSI_TX326.json · record 0 · spec 43 · dòng 45
- **RS-232 Interface**: DB9 M, DTE, 3-wire RS-232 — data/raw/CSI_TX326.json · record 0 · spec 44 · dòng 46
- **Transmit RF Out Connector**: Type N jack — data/raw/CSI_TX326.json · record 0 · spec 45 · dòng 47
- **Compatible Data Loggers**: GRANITE series, CR6, CR1000X series, CR350, CR300 series — data/raw/CSI_TX326.json · record 0 · spec 46 · dòng 48
- **Transmission Antenna Type**: Right-hand circular polarized Yagi — data/raw/CSI_TX326.json · record 0 · spec 47 · dòng 49
- **Transmission Antenna Gain**: 11 dBi — data/raw/CSI_TX326.json · record 0 · spec 48 · dòng 50

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## VOLT108-XD

Analog Input Module · CSI_VOLT108_XD

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: RJ45 (supported), USB (supported).

Cấu hình model: Product Variant: Extended Duty (-XD)

**Ví dụ explanation tiếng Việt**

Khớp chính xác model VOLT108-XD. VOLT108-XD được phân loại là Analog Input Module. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: USB. Cấu hình VOLT108-XD: Product Variant: Extended Duty (-XD). Thông số accuracy 0 to 40 c: ±(0.04% of reading + offset). Thông số accuracy 40 to 70 c: ±(0.06% of reading + offset). Thông số accuracy 55 to 85 c: ±(0.08% of reading + offset).

**Ví dụ explanation tiếng Anh**

Exact model match: VOLT108-XD. VOLT108-XD is classified as a Analog Input Module. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: USB. VOLT108-XD configuration: Product Variant: Extended Duty (-XD). accuracy 0 to 40 c: ±(0.04% of reading + offset). accuracy 40 to 70 c: ±(0.06% of reading + offset). accuracy 55 to 85 c: ±(0.08% of reading + offset).

**Thông số nguồn để đối chiếu**

- **Product Name**: Granite™ Volt 108 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 0 · dòng 2
- **Product Variant**: Extended Duty (-XD) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 1 · dòng 3
- **Product Type**: 8- or 16-Channel 5V Analog Input Module — data/raw/CSI_VOLT108_XD.json · record 0 · spec 2 · dòng 4
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_VOLT108_XD.json · record 0 · spec 3 · dòng 5
- **Analog-to-Digital Converter**: 24-bit ADC — data/raw/CSI_VOLT108_XD.json · record 0 · spec 4 · dòng 6
- **Analog Front End**: Low-noise analog front end — data/raw/CSI_VOLT108_XD.json · record 0 · spec 5 · dòng 7
- **Differential Input Channels**: 8 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 6 · dòng 8
- **Single-Ended Input Channels**: 16 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 7 · dòng 9
- **Voltage / Current Excitation Channels**: 2 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 8 · dòng 10
- **Analog Input Ranges**: ±5000 mV, ±1000 mV, ±200 mV — data/raw/CSI_VOLT108_XD.json · record 0 · spec 9 · dòng 11
- **Accuracy @ 0 to 40 °C**: ±(0.04% of reading + offset) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 10 · dòng 12
- **Accuracy @ -40 to 70 °C**: ±(0.06% of reading + offset) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 11 · dòng 13
- **Accuracy @ -55 to 85 °C**: ±(0.08% of reading + offset) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 12 · dòng 14
- **Operating Temperature Range – Extended Duty**: -55 to +85 °C — data/raw/CSI_VOLT108_XD.json · record 0 · spec 13 · dòng 15
- **Maximum Scan Rate – 1 Channel**: 1 kHz — data/raw/CSI_VOLT108_XD.json · record 0 · spec 14 · dòng 16
- **Maximum Scan Rate – 8 Channels**: 333 Hz — data/raw/CSI_VOLT108_XD.json · record 0 · spec 15 · dòng 17
- **Period Averaging**: Traditional period averaging on analog input channels — data/raw/CSI_VOLT108_XD.json · record 0 · spec 16 · dòng 18
- **Voltage Excitation Output**: ±5 V (@ 50 mA) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 17 · dòng 19
- **Current Excitation Output**: ±2.5 mA (±5 V compliance voltage) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 18 · dòng 20
- **Number of Voltage / Current Excitation Outputs**: 2 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 19 · dòng 21
- **Number of SW5V Outputs**: 2 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 20 · dòng 22
- **SW5V Output Resistance**: 30 Ω — data/raw/CSI_VOLT108_XD.json · record 0 · spec 21 · dòng 23
- **Number of SW12V Outputs**: 1 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 22 · dòng 24
- **Typical Limit of SW12V Outputs**: 200 mA — data/raw/CSI_VOLT108_XD.json · record 0 · spec 23 · dòng 25
- **Minimum Limit of SW12V Outputs**: 180 mA — data/raw/CSI_VOLT108_XD.json · record 0 · spec 24 · dòng 26
- **Number of 12V Outputs**: 1 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 25 · dòng 27
- **Typical Limit of 12V Outputs**: 200 mA — data/raw/CSI_VOLT108_XD.json · record 0 · spec 26 · dòng 28
- **Minimum Limit of 12V Outputs**: 180 mA — data/raw/CSI_VOLT108_XD.json · record 0 · spec 27 · dòng 29
- **Power Requirements**: 9.6 to 32 Vdc — data/raw/CSI_VOLT108_XD.json · record 0 · spec 28 · dòng 30
- **Typical Current Drain – Sleep**: <1 mA — data/raw/CSI_VOLT108_XD.json · record 0 · spec 29 · dòng 31
- **Typical Current Drain – Active 1 Hz Scan**: 2 mA (estimated) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 30 · dòng 32
- **Typical Current Drain – Active 20 Hz Scan**: 20 mA — data/raw/CSI_VOLT108_XD.json · record 0 · spec 31 · dòng 33
- **Typical Current Drain – Active 1 kHz Scan**: 67 mA — data/raw/CSI_VOLT108_XD.json · record 0 · spec 32 · dòng 34
- **CPI Interface**: For data logger connection — data/raw/CSI_VOLT108_XD.json · record 0 · spec 33 · dòng 35
- **CPI Baud Rate**: Selectable from 50 kbps to 1 Mbps — data/raw/CSI_VOLT108_XD.json · record 0 · spec 34 · dòng 36
- **Default CPI Speed**: 250 kbps — data/raw/CSI_VOLT108_XD.json · record 0 · spec 35 · dòng 37
- **Allowable CPI Address Range**: 1 to 120 — data/raw/CSI_VOLT108_XD.json · record 0 · spec 36 · dòng 38
- **CPI Connections**: 2 per module — data/raw/CSI_VOLT108_XD.json · record 0 · spec 37 · dòng 39
- **CPI Cable**: Cat5e or Cat6 cable with RJ45 connectors — data/raw/CSI_VOLT108_XD.json · record 0 · spec 38 · dòng 40
- **USB Interface**: USB 2.0 full-speed connection to PC — data/raw/CSI_VOLT108_XD.json · record 0 · spec 39 · dòng 41
- **CANbus Output**: CANbus 2.0 A/B available with Extended Duty (-XD) version — data/raw/CSI_VOLT108_XD.json · record 0 · spec 40 · dòng 42
- **Earth Ground Wire**: 14 AWG or larger — data/raw/CSI_VOLT108_XD.json · record 0 · spec 41 · dòng 43
- **Mounting**: Standard 1-in. grid (DIN rail mounting available) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 42 · dòng 44
- **Dimensions**: 20.3 × 12.7 × 5.1 cm (8 × 5 × 2 in.) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 43 · dòng 45
- **Weight**: 0.8 kg (1.75 lb) — data/raw/CSI_VOLT108_XD.json · record 0 · spec 44 · dòng 46
- **Warranty**: One year against defects in materials and workmanship — data/raw/CSI_VOLT108_XD.json · record 0 · spec 45 · dòng 47

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## VWANALYZER

Vibrating Wire Analyzer · CSI_VWANALYZER

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: chưa xác nhận.

Giao thức được ghi nhận: USB (supported).

Cấu hình model: 

**Ví dụ explanation tiếng Việt**

Khớp chính xác model VWANALYZER. VWANALYZER được phân loại là Vibrating Wire Analyzer. Cần đối chiếu chức năng, đầu vào/đầu ra và cấu hình được ghi nhận; chưa xác nhận các khả năng không có trong dữ liệu. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: USB. Thông số vibrating wire resolution: 0.001 Hz RMS. Thông số vibrating wire accuracy: ±0.005% of reading. Thông số thermistor resolution: 0.01 Ω RMS.

**Ví dụ explanation tiếng Anh**

Exact model match: VWANALYZER. VWANALYZER is classified as a Vibrating Wire Analyzer. Check documented functions, inputs/outputs and configuration; undocumented capabilities remain unconfirmed. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: USB. vibrating wire resolution: 0.001 Hz RMS. vibrating wire accuracy: ±0.005% of reading. thermistor resolution: 0.01 Ω RMS.

**Thông số nguồn để đối chiếu**

- **Product Name**: Vibrating Wire Analyzer (VWAnalyzer) — data/raw/CSI_VWANALYZER.json · record 0 · spec 0 · dòng 2
- **Product Type**: Vibrating wire field reader / analyzer — data/raw/CSI_VWANALYZER.json · record 0 · spec 1 · dòng 3
- **Manufacturer**: Campbell Scientific, Inc. — data/raw/CSI_VWANALYZER.json · record 0 · spec 2 · dòng 4
- **Measurement Technology**: VSPECT™ (Vibrating Wire Spectral Analysis) — data/raw/CSI_VWANALYZER.json · record 0 · spec 3 · dòng 5
- **Channel Count**: 1 channel (vibrating wire and thermistor reading) — data/raw/CSI_VWANALYZER.json · record 0 · spec 4 · dòng 6
- **Vibrating Wire Frequency Range**: 300 to 6500 Hz — data/raw/CSI_VWANALYZER.json · record 0 · spec 5 · dòng 7
- **Vibrating Wire Resolution**: 0.001 Hz RMS — data/raw/CSI_VWANALYZER.json · record 0 · spec 6 · dòng 8
- **Vibrating Wire Accuracy**: ±0.005% of reading — data/raw/CSI_VWANALYZER.json · record 0 · spec 7 · dòng 9
- **Excitation**: 2 V, 5 V, 12 V (user-selectable) — data/raw/CSI_VWANALYZER.json · record 0 · spec 8 · dòng 10
- **Measurement Interval Range**: 1 s to 15 min (continuous reading mode only) — data/raw/CSI_VWANALYZER.json · record 0 · spec 9 · dòng 11
- **Fastest Measurement Speed**: 1 s — data/raw/CSI_VWANALYZER.json · record 0 · spec 10 · dòng 12
- **Thermistor Resolution**: 0.01 Ω RMS — data/raw/CSI_VWANALYZER.json · record 0 · spec 11 · dòng 13
- **Thermistor Accuracy**: ±0.15% of reading — data/raw/CSI_VWANALYZER.json · record 0 · spec 12 · dòng 14
- **Sensor Frequency Output**: Hz — data/raw/CSI_VWANALYZER.json · record 0 · spec 13 · dòng 15
- **Sensor Amplitude Diagnostic**: mV RMS — data/raw/CSI_VWANALYZER.json · record 0 · spec 14 · dòng 16
- **Signal-to-Noise Ratio Diagnostic**: Unitless — data/raw/CSI_VWANALYZER.json · record 0 · spec 15 · dòng 17
- **Noise Frequency Diagnostic**: Hz — data/raw/CSI_VWANALYZER.json · record 0 · spec 16 · dòng 18
- **Thermistor / RTD Resistance Output**: Ω — data/raw/CSI_VWANALYZER.json · record 0 · spec 17 · dòng 20
- **Integrated GPS**: Yes — data/raw/CSI_VWANALYZER.json · record 0 · spec 18 · dòng 21
- **GPS Accuracy**: ±5 m (16.4 ft) typical — data/raw/CSI_VWANALYZER.json · record 0 · spec 19 · dòng 22
- **GPS Time Sync**: ±1 ms — data/raw/CSI_VWANALYZER.json · record 0 · spec 20 · dòng 23
- **Site Capacity**: 40 unique sites — data/raw/CSI_VWANALYZER.json · record 0 · spec 21 · dòng 24
- **Sensors per Site**: 22 sensors per site — data/raw/CSI_VWANALYZER.json · record 0 · spec 22 · dòng 25
- **Maximum Unique Sensors**: 880 — data/raw/CSI_VWANALYZER.json · record 0 · spec 23 · dòng 26
- **Site / Sensor Measurements Memory**: 1,700 measurements (most recent) — data/raw/CSI_VWANALYZER.json · record 0 · spec 24 · dòng 27
- **Single Measurements Memory**: 240 measurements (most recent) — data/raw/CSI_VWANALYZER.json · record 0 · spec 25 · dòng 28
- **Continuous Measurements Memory**: 16,500 measurements (most recent) — data/raw/CSI_VWANALYZER.json · record 0 · spec 26 · dòng 29
- **USB Memory**: 80 MB — data/raw/CSI_VWANALYZER.json · record 0 · spec 27 · dòng 30
- **Stored / Transfer File Types**: PDF, CSV, VWA, and other files — data/raw/CSI_VWANALYZER.json · record 0 · spec 28 · dòng 31
- **USB Interface**: USB Mini B; direct connection to PC — data/raw/CSI_VWANALYZER.json · record 0 · spec 29 · dòng 32
- **Battery Type**: 5 AA (1.5 V) — data/raw/CSI_VWANALYZER.json · record 0 · spec 30 · dòng 33
- **Battery Life**: 20 hours continuous use — data/raw/CSI_VWANALYZER.json · record 0 · spec 31 · dòng 34
- **Operating Temperature Range**: -20 to +70 °C — data/raw/CSI_VWANALYZER.json · record 0 · spec 32 · dòng 35
- **Enclosure Rating**: IP62 — data/raw/CSI_VWANALYZER.json · record 0 · spec 33 · dòng 36
- **Compliance**: CE, RoHS — data/raw/CSI_VWANALYZER.json · record 0 · spec 34 · dòng 37
- **Warranty**: One year against defects in materials and workmanship — data/raw/CSI_VWANALYZER.json · record 0 · spec 35 · dòng 38
- **Dimensions**: 200 × 100 × 58 mm (7.9 × 3.9 × 2.3 in) — data/raw/CSI_VWANALYZER.json · record 0 · spec 36 · dòng 39
- **Weight**: 0.34 kg (0.75 lb) — data/raw/CSI_VWANALYZER.json · record 0 · spec 37 · dòng 40
- **PDF Report Generation**: Yes — data/raw/CSI_VWANALYZER.json · record 0 · spec 38 · dòng 41
- **CSV Output**: Yes — data/raw/CSI_VWANALYZER.json · record 0 · spec 39 · dòng 42
- **Sensor Library**: Common vibrating wire sensors — data/raw/CSI_VWANALYZER.json · record 0 · spec 40 · dòng 43

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.

## VWIRE305-XD

Measurement Device · CSI_VWIRE305_XD

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Nhiệt độ.

Giao thức được ghi nhận: RJ45 (supported), USB (supported).



**Ví dụ explanation tiếng Việt**

Khớp chính xác model VWIRE305-XD. VWIRE305-XD là Measurement Device; dữ liệu ghi nhận chức năng/đầu vào đo nhiệt độ. Cần phân biệt phép đo nội bộ và tín hiệu đầu vào với cảm biến đo trực tiếp môi trường; kiểm tra cảm biến, đấu dây và cấu hình tương ứng. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: USB. Thông số vibrating wire accuracy: ±(0.005% of reading + effective measurement resolution). Thông số Vibrating-Wire Excitation Voltage Resolution: 26 mV. Thông số effective resolution precision: 0.005 to 0.45 Hz RMS, depending on scan rate.

**Ví dụ explanation tiếng Anh**

Exact model match: VWIRE305-XD. VWIRE305-XD is a Measurement Device; the data records measurement functions/inputs for temperature. Distinguish internal measurements and input signals from direct environmental sensors; check sensors, wiring and configuration. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: USB. vibrating wire accuracy: ±(0.005% of reading + effective measurement resolution). Vibrating-Wire Excitation Voltage Resolution: 26 mV. effective resolution precision: 0.005 to 0.45 Hz RMS, depending on scan rate.

**Thông số nguồn để đối chiếu**

- **Product Type**: 8-Channel Dynamic Vibrating-Wire Analyzer — data/raw/VWIRE305_XD.json · record 0 · spec 0 · dòng 3
- **Number of Input Channels**: 8 — data/raw/VWIRE305_XD.json · record 0 · spec 1 · dòng 5
- **Sensor Capacity per Channel**: 1 vibrating wire sensor — data/raw/VWIRE305_XD.json · record 0 · spec 2 · dòng 6
- **Temperature Sensor per Channel**: 1 embedded thermistor or RTD — data/raw/VWIRE305_XD.json · record 0 · spec 3 · dòng 7
- **Channel Measurement Mode**: All channels measured simultaneously — data/raw/VWIRE305_XD.json · record 0 · spec 4 · dòng 8
- **Measurement Technology**: VSPECT™ dynamic vibrating-wire measurement technology — data/raw/VWIRE305_XD.json · record 0 · spec 5 · dòng 9
- **Dynamic Vibrating-Wire Measurement Rate**: 20, 50, 100, 200, or 333.3 Hz — data/raw/VWIRE305_XD.json · record 0 · spec 6 · dòng 10
- **Static Measurement Rate**: 1 Hz — data/raw/VWIRE305_XD.json · record 0 · spec 7 · dòng 11
- **Embedded Thermistor / RTD Measurement Rate**: 1 Hz — data/raw/VWIRE305_XD.json · record 0 · spec 8 · dòng 12
- **Vibrating-Wire Accuracy**: ±(0.005% of reading + effective measurement resolution) — data/raw/VWIRE305_XD.json · record 0 · spec 9 · dòng 13
- **Vibrating-Wire Input Resistance**: 5 kΩ — data/raw/VWIRE305_XD.json · record 0 · spec 10 · dòng 14
- **Vibrating-Wire Excitation Voltage Range**: 0 to ±3 V (6 V peak-to-peak) — data/raw/VWIRE305_XD.json · record 0 · spec 11 · dòng 15
- **Vibrating-Wire Excitation Voltage Resolution**: 26 mV — data/raw/VWIRE305_XD.json · record 0 · spec 12 · dòng 16
- **Effective Resolution (Precision)**: 0.005 to 0.45 Hz RMS, depending on scan rate — data/raw/VWIRE305_XD.json · record 0 · spec 13 · dòng 17
- **Sustained Input Voltage Without Damage**: -0.5 to 7.1 V — data/raw/VWIRE305_XD.json · record 0 · spec 14 · dòng 18
- **Temperature Measurement**: 24-bit resistance measurement of thermistor or RTD embedded in the vibrating wire sensor — data/raw/VWIRE305_XD.json · record 0 · spec 15 · dòng 19
- **Temperature Accuracy**: 0.15% of reading — data/raw/VWIRE305_XD.json · record 0 · spec 16 · dòng 20
- **Temperature Resolution**: 0.002 Ω RMS @ 5 kΩ — data/raw/VWIRE305_XD.json · record 0 · spec 17 · dòng 21
- **Bridge Resistor**: 4.99 kΩ, 0.1% — data/raw/VWIRE305_XD.json · record 0 · spec 18 · dòng 22
- **Temperature Excitation Voltage**: 1.5 V — data/raw/VWIRE305_XD.json · record 0 · spec 19 · dòng 23
- **CPI Interface**: RJ45 interface to Campbell Scientific data loggers, sensors, and GRANITE Measurement Modules — data/raw/VWIRE305_XD.json · record 0 · spec 20 · dòng 24
- **USB Interface**: USB micro-B device only, USB 2.0 full-speed, 12 Mbps — data/raw/VWIRE305_XD.json · record 0 · spec 21 · dòng 25
- **Processor**: Renesas RX63N (32-bit with hardware FPU, 96 MHz) — data/raw/VWIRE305_XD.json · record 0 · spec 22 · dòng 26
- **Memory**: 2 MB SRAM — data/raw/VWIRE305_XD.json · record 0 · spec 23 · dòng 27
- **Supply Voltage**: 10 to 32 VDC — data/raw/VWIRE305_XD.json · record 0 · spec 24 · dòng 28
- **Typical Current Drain @ 12 VDC**: 190 mA — data/raw/VWIRE305_XD.json · record 0 · spec 25 · dòng 29
- **Typical Current Drain @ 24 VDC**: 110 mA — data/raw/VWIRE305_XD.json · record 0 · spec 26 · dòng 30
- **Dimensions**: 20.3 × 12.7 × 5.1 cm (8.0 × 5.0 × 2.0 in) — data/raw/VWIRE305_XD.json · record 0 · spec 27 · dòng 31
- **Weight**: <1 kg (2.0 lb) — data/raw/VWIRE305_XD.json · record 0 · spec 28 · dòng 32
- **Operating Temperature – Extended Duty (XD)**: -55 to 85 °C — data/raw/VWIRE305_XD.json · record 0 · spec 29 · dòng 33
- **Default CPI Address**: 1 — data/raw/VWIRE305_XD.json · record 0 · spec 30 · dòng 34
- **Allowable CPI Address Range**: 1 to 120 — data/raw/VWIRE305_XD.json · record 0 · spec 31 · dòng 35
- **Compatible Data Loggers**: GRANITE 10, GRANITE 9, GRANITE 6, CR6, CR1000X — data/raw/VWIRE305_XD.json · record 0 · spec 32 · dòng 36
- **CPI Cable Type**: CAT5e or better RJ45 cable — data/raw/VWIRE305_XD.json · record 0 · spec 33 · dòng 37
- **Recommended Earth Ground Wire**: 14 AWG or larger — data/raw/VWIRE305_XD.json · record 0 · spec 34 · dòng 38
- **Rainflow Histogram Support**: Yes; Matsuishi and Endo (1968) rainflow algorithm — data/raw/VWIRE305_XD.json · record 0 · spec 35 · dòng 39
- **Diagnostic Outputs**: Excitation level; low/high-frequency warnings; low/high-amplitude warnings; standard deviation — data/raw/VWIRE305_XD.json · record 0 · spec 36 · dòng 40

**Cần kiểm tra tiếp**

- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.

## WindSonic1

Ultrasonic Wind Sensor · CSI_WINDSONIC1

Nguồn catalog: chưa có URL

Đại lượng có bằng chứng: Tốc độ gió, Hướng gió.

Giao thức được ghi nhận: RS-232 (supported).

Cấu hình model: 

**Ví dụ explanation tiếng Việt**

Khớp chính xác model WindSonic1. WindSonic1 đo tốc độ gió, hướng gió, giúp bạn có số liệu để theo dõi và đánh giá tình trạng trước khi quyết định điều chỉnh. Số đo gió hỗ trợ đánh giá điều kiện tại điểm lắp đặt. Chưa xác nhận cấu hình lắp đặt phù hợp với trường hợp cụ thể của bạn. Giao tiếp được ghi nhận: RS-232. Thông số Operating Temperature Range: -35 to +70 °C. Thông số Wind Direction Accuracy: ±3°. Thông số Wind Direction Resolution: 1°.

**Ví dụ explanation tiếng Anh**

Exact model match: WindSonic1. WindSonic1 measures wind speed, wind direction, providing readings to monitor conditions before deciding on adjustments. Wind readings support assessing conditions at the installation point. Installation suitability for your specific use case remains unconfirmed. Documented interfaces: RS-232. Operating Temperature Range: -35 to +70 °C. Wind Direction Accuracy: ±3°. Wind Direction Resolution: 1°.

**Thông số nguồn để đối chiếu**

- **Product Type**: 2-D Sonic Wind Sensor / Two-dimensional ultrasonic anemometer — data/raw/WindSonic1.json · record 0 · spec 0 · dòng 2
- **Manufacturer**: Campbell Scientific / manufactured by Gill Instruments, Ltd. — data/raw/WindSonic1.json · record 0 · spec 1 · dòng 3
- **Measurement Description**: Wind speed and direction — data/raw/WindSonic1.json · record 0 · spec 2 · dòng 4
- **Technology / Principle**: Ultrasonic; two pairs of orthogonally oriented transducers — data/raw/WindSonic1.json · record 0 · spec 3 · dòng 5
- **Applications**: Extreme (blowing sand, salt spray); General (rain with light snow, little/no riming or blowing sand, no salt spray) — data/raw/WindSonic1.json · record 0 · spec 4 · dòng 6
- **Input Voltage**: 9 to 30 Vdc — data/raw/WindSonic1.json · record 0 · spec 5 · dòng 7
- **Typical Current Drain**: ~15 mA (continuous) — data/raw/WindSonic1.json · record 0 · spec 6 · dòng 8
- **Operating Humidity Range**: <5% to 100% RH — data/raw/WindSonic1.json · record 0 · spec 7 · dòng 9
- **Operating Temperature Range**: -35 to +70 °C — data/raw/WindSonic1.json · record 0 · spec 8 · dòng 10
- **Storage Temperature Range**: -40 to +80 °C — data/raw/WindSonic1.json · record 0 · spec 9 · dòng 11
- **Measurement Frequency**: 40 Hz block averaged to a programmable output frequency; factory set to 1 Hz — data/raw/WindSonic1.json · record 0 · spec 10 · dòng 12
- **Output Parameters**: Polar (direction and speed) or orthogonal (Ux and Uy wind) — data/raw/WindSonic1.json · record 0 · spec 11 · dòng 13
- **Output Signal**: RS-232 — data/raw/WindSonic1.json · record 0 · spec 12 · dòng 14
- **Factory-default Baud Rate**: 9600 baud — data/raw/WindSonic1.json · record 0 · spec 13 · dòng 15
- **Maximum Cable Capacitance**: 2500 pF — data/raw/WindSonic1.json · record 0 · spec 14 · dòng 16
- **Maximum Cable Length**: 15.24 m (50 ft) — data/raw/WindSonic1.json · record 0 · spec 15 · dòng 17
- **Dimensions**: 142 × 160 mm (5.6 × 6.3 in) — data/raw/WindSonic1.json · record 0 · spec 16 · dòng 18
- **Diameter**: 14.2 cm (5.6 in) — data/raw/WindSonic1.json · record 0 · spec 17 · dòng 19
- **Length**: 16.0 cm — data/raw/WindSonic1.json · record 0 · spec 18 · dòng 20
- **Weight**: 0.5 kg (1.1 lb) — data/raw/WindSonic1.json · record 0 · spec 19 · dòng 21
- **Wind Direction Range**: 0° to 359° (no dead band) — data/raw/WindSonic1.json · record 0 · spec 20 · dòng 22
- **Wind Direction Accuracy**: ±3° — data/raw/WindSonic1.json · record 0 · spec 21 · dòng 23
- **Wind Direction Resolution**: 1° — data/raw/WindSonic1.json · record 0 · spec 22 · dòng 24
- **Wind Speed Range**: 0 to 60 m/s — data/raw/WindSonic1.json · record 0 · spec 23 · dòng 25
- **Wind Speed Accuracy**: ±2% @ 12 m/s — data/raw/WindSonic1.json · record 0 · spec 24 · dòng 26
- **Wind Speed Resolution**: 0.01 m/s — data/raw/WindSonic1.json · record 0 · spec 25 · dòng 27
- **Minimum Detectable Wind Speed**: 0.01 m/s — data/raw/WindSonic1.json · record 0 · spec 26 · dòng 28
- **Heated**: No — data/raw/WindSonic1.json · record 0 · spec 27 · dòng 30
- **Recommended Conditions**: Not recommended where rime, ice, or horizontal snow will occur — data/raw/WindSonic1.json · record 0 · spec 28 · dòng 31
- **Compatible Data Loggers**: CR6, CR1000X series, CR350, CR300 series; datasheet also lists CR1000, CR3000, CR310, CR800, CR850 — data/raw/WindSonic1.json · record 0 · spec 29 · dòng 32
- **Compatible Serial Modules**: SDM-SIO1A and SDM-SIO4A — data/raw/WindSonic1.json · record 0 · spec 30 · dòng 33
- **Default Wind Speed Unit**: m/s — data/raw/WindSonic1.json · record 0 · spec 31 · dòng 34
- **Default Output Frequency**: 1 Hz — data/raw/WindSonic1.json · record 0 · spec 32 · dòng 35

**Cần kiểm tra tiếp**

- Chưa có tên sản phẩm tiếng Việt đã duyệt.
