// Relevance rules are evaluation-only and independent of the production intent parser.
// Each rule is checked against the complete live catalog, not the returned ranking.
export const cases = `
A08|SoilVue10-5|model:SoilVue10-5
A09|RainVue10-MM|model:RainVue10-MM
A10|CSAT3B-NC|model:CSAT3B-NC
B01|soil moisture sensor|moisture
B02|water content reflectometer|reflectometer
B03|weather sensor|weather
B04|cellular gateway|cellular
B05|data logger|logger
B06|rain gauge|rain
B07|turbidity sensor|turbidity
B08|vibrating wire analyzer|vibrating&reader
B09|barometric pressure sensor|pressure
B10|solar radiation sensor|solar
C01|cảm biến đo độ ẩm đất|moisture
C02|cảm biến đo lượng nước trong đất|moisture
C03|thiết bị đo nhiệt độ đất|soiltemperature
C04|cảm biến đo độ đục nước|turbidity
C05|thiết bị đo lượng mưa|rain
C06|cảm biến áp suất khí quyển|pressure
C07|bộ ghi dữ liệu|logger
C08|thiết bị truyền dữ liệu qua mạng di động|cellular
C09|cảm biến đo bức xạ mặt trời|solar
C10|thiết bị đo dây rung|vibrating
D01|I need a sensor for measuring water content in soil|moisture
D02|Tôi cần cảm biến để theo dõi lượng nước trong đất|moisture
D03|Tôi muốn theo dõi điều kiện đất ngoài đồng|soil
D04|I need equipment for remote environmental monitoring|environment
D05|thiết bị để thu thập dữ liệu cảm biến ngoài hiện trường|logger
D06|Tôi muốn truyền dữ liệu từ trạm quan trắc ở xa|communication
D07|sensor for monitoring rainfall in the field|rain
D08|thiết bị dùng để đo chất lượng nước|waterquality
D09|thiết bị theo dõi thời tiết ngoài trời|weather
D10|I want one sensor that measures multiple weather parameters|multiweather
E01|SDI-12|protocol:SDI-12
E02|RS-232|protocol:RS-232
E03|SDI-12 RS-232|protocol:SDI-12&protocol:RS-232
E04|Wi-Fi datalogger|logger&wifi
E05|cellular modem|cellular
E06|USB interface|protocol:USB
E07|CANbus|spec:canbus
E08|CPI interface|protocol:CPI
E09|24-bit ADC|adc
E10|IP62|spec:ip62
F01|soil moisture sensor with SDI-12|moisture&protocol:SDI-12
F02|cảm biến độ ẩm đất có SDI-12|moisture&protocol:SDI-12
F03|soil sensor with SDI-12 and RS-232|soil&protocol:SDI-12&protocol:RS-232
F04|cảm biến đo độ ẩm đất và nhiệt độ đất|moisture&soiltemperature
F05|cảm biến đo độ ẩm đất, nhiệt độ đất và độ dẫn điện|moisture&soiltemperature&conductivity
F06|datalogger with Wi-Fi|logger&wifi
F07|weather sensor with temperature humidity and pressure|airtemperature&humidity&pressure
F08|thiết bị quan trắc thời tiết đo nhiệt độ độ ẩm áp suất|airtemperature&humidity&pressure
F09|cellular gateway for remote monitoring|cellular
F10|vibrating wire measurement device with thermistor support|vibrating&spec:thermistor
G01|operating temperature -50°C|operating:-50
G02|thiết bị hoạt động ở -50°C|operating:-50
G03|operating temperature 70°C|operating:70
G04|300 to 6500 Hz|spec:300 to 6500
G05|1 kHz|spec:1 khz
G06|9.6 to 32 Vdc|spec:9.6 to 32
G07|24 bit ADC|adc
G08|5 AA battery|battery
G09|IP rating IP62|spec:ip62
G10|accuracy 0.005%|spec:0.005%
H01|agriculture soil monitoring|soil
H02|quan trắc nông nghiệp|agriculture
H03|hydrology monitoring|water
H04|water level monitoring|waterlevel
H05|weather station|weather
H06|remote weather station|environment
H07|environmental monitoring station|environment
H08|solar monitoring|solar
H09|structural monitoring with vibrating wire sensors|vibrating
H10|monitoring water turbidity|turbidity
I01|soil humidity sensor|moisture
I02|water in soil sensor|moisture
I03|device for measuring how wet the soil is|moisture
I04|rainfall measuring device|rain
I05|mobile network communication device|cellular
I06|wireless data logger|wirelesslogger
I07|water clarity sensor|turbidity
I08|atmospheric pressure|pressure
I09|sun radiation measurement|solar
I10|multi parameter weather sensor|multiweather
J01|CS65|prefix:CS65
J02|CS6555|model:CS655
J03|soil moisure sensor|moisture
J04|tempature sensor|temperature
J05|turbity sensor|turbidity
J06|data loger wifi|logger&wifi
J07|SDI12 sensor|protocol:SDI-12
J08|rs232|protocol:RS-232
J09|clari vue 10|model:ClariVue10
J10|rain vue|prefix:RainVue
K01|cảm biến soil moisture|moisture
K02|soil sensor có SDI-12|soil&protocol:SDI-12
K03|datalogger có wifi|logger&wifi
K04|thiết bị cellular gateway cho trạm quan trắc|cellular
K05|weather sensor đo humidity|weather&humidity
K06|water sensor đo turbidity|turbidity
K07|sensor nhiệt độ operating -50°C|operating:-50
K08|vibrating wire thiết bị đọc|vibrating&reader
L01|sensor|sensor
L02|temperature|temperature
L03|water sensor|broadwater
L04|weather|weather
L05|communication|communication
L06|power|power
L07|monitoring|ambiguous
L08|best sensor|ambiguous
M01|iPhone 17|outofdomain
M02|gaming laptop|outofdomain
M03|coffee machine|outofdomain
M04|blood pressure monitor|outofdomain
M05|car GPS navigation|outofdomain
M06|home wifi router|outofdomain
N01|soil moisture sensor without SDI-12|negative
N02|datalogger without Wi-Fi|negative
N03|non-cellular communication device|negative
N04|soil sensor but not temperature sensor|negative
O01|Tôi đang xây dựng một trạm quan trắc ở vùng nông nghiệp và cần một thiết bị có thể đo lượng nước trong đất, nhiệt độ đất và ưu tiên giao tiếp SDI-12 để kết nối với hệ thống hiện tại|moisture&soiltemperature&protocol:SDI-12
O02|Our field station is located far away and we need to send measurement data over a cellular network because Wi-Fi is unavailable|cellular
O03|Tôi cần thiết bị đo nhiều thông số thời tiết ngoài trời thay vì phải lắp nhiều cảm biến rời|multiweather
O04|We need an instrument to inspect and read vibrating wire sensors during field maintenance|vibrating&reader
P01|CS655 soil moisture|model:CS655
P02|CS655 SDI-12|model:CS655
P03|RV50X cellular gateway|model:RV50X
P04|CR310 WiFi datalogger|model:CR310-WIFI
P05|ClariVue10 turbidity|model:ClariVue10
P06|BaroVue10 pressure|model:BaroVue10
Q01|soil moisture sensor with SDI-12|moisture&protocol:SDI-12
Q02|weather sensor measuring temperature humidity pressure|airtemperature&humidity&pressure
Q03|remote monitoring using cellular communication|cellular
Q04|device for measuring turbidity in water|turbidity
Q05|vibrating wire field reader|vibrating&reader
`.trim().split('\n').map(line => {
  const [id, query, intent] = line.split('|');
  return { id, query, intent, language: /[ăâđêôơư\u1ea0-\u1ef9]/iu.test(query) ? 'vi/mixed' : 'en' };
});

const norm = s => s.toLowerCase().replace(/[‐‑–—-]/gu, ' ').replace(/\s+/gu, ' ');
export function judgmentsFor(intent, catalog) {
  if (['negative', 'ambiguous', 'outofdomain'].includes(intent)) return [];
  return catalog.flatMap(({ document: d, specifications: specs }) => {
    if (!d) return [];
    const type = norm(d.taxonomy.device_type);
    const raw = norm(specs.map(s => `${s.canonical_key} ${s.normalized_value.value_raw ?? JSON.stringify(s.normalized_value)}`).join(' '));
    const measure = key => d.measurements.some(m => m.key === key) || d.capabilities.some(m => m.key === `measure_${key}`);
    const soil = /soil/u.test(type);
    const weather = /weather|air temperature|humidity|barometric|wind|precipitation|rain/u.test(type);
    const logger = /data logger/u.test(type);
    const option = d.variants.find(v => v.model === d.model)?.distinguishing_specifications.find(s => s.name_en === 'Communication Option');
    const wireless = option ? /wi[ -]?fi|cellular|radio/iu.test(option.value_raw)
      : /\b(?:wireless|cellular|radio)\b/iu.test(`${type} ${d.name_en}`) || d.supported_protocols.includes('Wi-Fi');
    const communication = /communication|modem|\bradio\b|transmitter/u.test(type);
    const water = /water|turbidity|oxygen/u.test(type) && !soil;
    const matches = rule => {
      if (rule.startsWith('model:')) return d.model === rule.slice(6);
      if (rule.startsWith('prefix:')) return d.model.startsWith(rule.slice(7));
      if (rule.startsWith('protocol:')) return d.supported_protocols.includes(rule.slice(9));
      if (rule.startsWith('spec:')) return new RegExp(`(^|[^a-z0-9.])${rule.slice(5).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}($|[^a-z0-9.])`, 'u').test(raw);
      if (rule.startsWith('operating:')) return specs.some(s => ['operating_temperature_range', 'operating_temperature_extended_duty_xd'].includes(s.canonical_key) && s.normalized_value.unit === '°C' && s.normalized_value.min_value <= Number(rule.slice(10)) && s.normalized_value.max_value >= Number(rule.slice(10)));
      return ({
        moisture: measure('volumetric_water_content'), reflectometer: /water content reflectometer/iu.test(d.name_en),
        soil, soiltemperature: measure('soil_temperature') || /soil temperature|water and soil temperature/u.test(type),
        airtemperature: measure('air_temperature') || /air temperature/u.test(type), humidity: measure('relative_humidity'),
        conductivity: measure('soil_electrical_conductivity'), pressure: measure('barometric_pressure') || /barometric pressure/u.test(type),
        turbidity: measure('turbidity'), rain: measure('precipitation') || /rain ga[u]?ge/u.test(type),
        solar: /solar|radiometer|radiation|pyranometer/u.test(type) || measure('solar_radiation'), weather,
        multiweather: /weather/u.test(type) && d.measurements.length >= 3,
        cellular: /cellular/u.test(type), logger, communication, power: d.taxonomy.category_key === 'power',
        vibrating: /vibrating wire/iu.test(`${type} ${d.name_en}`),
        reader: /\b(?:reader|analy[sz]er)\b/iu.test(`${type} ${d.name_en}`),
        wifi: d.supported_protocols.includes('Wi-Fi') && !d.variants.some(v => v.model === d.model && v.distinguishing_specifications.some(s => s.name_en === 'Communication Option' && !/^wi[ -]?fi$/iu.test(s.value_raw))),
        wirelesslogger: logger && wireless,
        adc: specs.some(s => {
          const text = norm(`${s.canonical_key.replaceAll('_', ' ')} ${s.normalized_value.value_raw ?? ''}`);
          return /24[ -]?bit/u.test(text) && /\badc\b|analog.to.digital|a\/d|a per d converter/u.test(text);
        }),
        battery: /5\s*(?:x\s*)?aa|five aa/u.test(raw),
        water, waterquality: /turbidity|oxygen|water quality/u.test(type), waterlevel: /water.level/u.test(type),
        broadwater: water || measure('volumetric_water_content'),
        agriculture: soil || weather, environment: weather || logger || communication,
        temperature: /temperature/u.test(type) || d.measurements.some(m => /temperature/u.test(m.key)),
        sensor: d.taxonomy.category_key === 'sensors',
      })[rule] ?? false;
    };
    return intent.split('&').every(matches) ? [{ product_id: d.product_id, relevance: 1, evidence: { device_type: d.taxonomy.device_type, measurements: d.measurements.map(m => m.key), rule: intent } }] : [];
  });
}
