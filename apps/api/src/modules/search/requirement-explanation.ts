import type { ProductSearchDocument, ProductSpecification, SearchResponse } from '@reeco/shared';
import { matchIntentFeatures, parseSearchIntent } from './search-intent';
import { isCapabilityQuestion, purchaseQuery } from './query-context';
import { numericSpecificationText } from './search-language';

type Evidence = NonNullable<SearchResponse['results'][number]['explanation']>['evidence'][number];

// Statements about the product require catalog facts. Installation advice stays conditional.
export function contextualExplanation(query: string, document: ProductSearchDocument, specs: ProductSpecification[], vi: boolean): { text: string; evidence: Evidence[] } | undefined {
  const intent = parseSearchIntent(query);
  const evidence: Evidence[] = [];
  const sentences: string[] = [];
  const text = query.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/giu, 'd').toLowerCase();
  const add = (vietnamese: string, english: string) => sentences.push(vi ? vietnamese : english);
  const facts = (keys: RegExp, numeric = false) => specs.filter(s => keys.test(s.canonical_key)).map(s => {
    const value = s.normalized_value.value_raw ?? (s.normalized_value.type === 'text' ? s.normalized_value.value : '');
    if (value) evidence.push({ source: 'normalized_spec', field: s.canonical_key, value, raw_ref: s.raw_ref });
    return numeric ? numericSpecificationText(s, vi ? 'vi' : 'en') : value;
  }).filter(Boolean);
  const measured = (key: string) => {
    const measurement = document.measurements.find(m => m.key === key);
    if (!measurement) return false;
    evidence.push({ source: 'product_document', field: 'measurements', value: vi ? measurement.label_vi : measurement.label_en });
    return true;
  };
  const featureEvidence = matchIntentFeatures(intent, document, specs);
  if (featureEvidence) {
    evidence.push(...featureEvidence);
    for (const feature of intent.features) {
      if (feature.key === 'non_contact') {
        const principle = facts(/^measurement_principle$/u).join(' ');
        add(`${document.model} đo mực nước không tiếp xúc${/radar/iu.test(principle) ? ' bằng radar' : ''}, đáp ứng yêu cầu không nhúng đầu đo vào nước thải ăn mòn. Cần xác minh vị trí lắp phía trên, hình học bồn, vật cản và bề mặt đo; không tiếp xúc không chứng minh kháng mọi hóa chất.`, `${document.model} measures water level without contact${/radar/iu.test(principle) ? ' using radar' : ''}, avoiding immersion in corrosive wastewater. Verify overhead mounting, tank geometry, obstructions and the target surface; non-contact does not establish resistance to every chemical.`);
      }
      if (feature.key === 'soil_profile') {
        const depths = facts(/^measurement_depths$/u, true).join('; ');
        const requested = intent.depths.length ? `${intent.depths.join(', ')} cm` : vi ? 'nhiều tầng đất' : 'multiple depths';
        add(`Các vị trí đo cố định tích hợp trên thanh ${document.model}: ${depths}; đáp ứng ${requested} trên cùng một đầu đo nhiều tầng. Cách bố trí này giúp giảm số hố đặt đầu đo rời; vẫn cần tạo lỗ và lắp đúng hướng dẫn để tiếp xúc tốt với đất, không đại diện mặc định toàn bộ khu trồng.`, `${document.model} measures at ${depths}, covering ${requested} in one profile. A profile probe reduces separate installations; a prepared hole and correct soil contact are still required, and one profile does not represent the entire field.`);
      }
      if (feature.key === 'heated_rain') {
        const heater = facts(/^(?:heater_thermostat_set_point|power|operating_temperature_range)$/u, true);
        add(`Bộ sấy của ${document.model} phục vụ đo mưa khi có tuyết/băng; dữ liệu ghi nhận ${heater.join('; ')}. Cần nguồn cấp cho sấy và kiểm tra dải vận hành; không bảo đảm chống tắc ở mọi mức lạnh.`, `${document.model}'s heater supports precipitation measurement in snow/ice; documented limits: ${heater.join('; ')}. Supply heater power and check operating limits; blockage prevention is not guaranteed at every temperature.`);
      }
      if (feature.key === 'sonic_wind') {
        const range = facts(/^(?:range|wind_speed_range|horizontal_wind_speed_range|wind_direction_range)$/u, true);
        add(`${document.model} đo gió bằng siêu âm, không có bộ phận quay cơ học nên tránh nguy cơ gãy cánh quạt. Cần đối chiếu dải tốc độ, hướng gió, độ chính xác và cách lắp trong thông số; không có cánh quạt không bảo đảm không hư hỏng hoặc chính xác trong mọi cơn bão.`, `${document.model} uses acoustic wind measurement without a rotating rotor. ${range.length ? `Documented ranges: ${range.join('; ')}. ` : ''}Check wind conditions, accuracy and mounting; no rotor does not guarantee survival or accuracy in every storm.`);
      }
    }
  }
  if (intent.measurements.some(m => m.key === 'soil_heat_flux') && measured('soil_heat_flux')) add(`${document.model} đo thông lượng nhiệt qua tấm đo trong đất theo W/m², cho biết tốc độ truyền nhiệt trên một đơn vị diện tích và cung cấp đầu vào cho nghiên cứu cân bằng năng lượng vi khí hậu nông nghiệp. Đây không phải nhiệt độ hay năng lượng tích lũy; để suy ra thông lượng tại bề mặt hoặc nhiều lớp cần bố trí đo và dữ liệu nhiệt tích trữ bổ sung.`, `${document.model} measures heat flux at the plate location for the soil energy balance. Flux is distinct from temperature and stored energy; surface flux or multiple layers require additional measurements and heat-storage correction.`);
  if (intent.measurements.some(m => m.key === 'precipitation') && /sat lo|lu quet|flood|landslide/u.test(text) && measured('precipitation')) add(`Số đo mưa của ${document.model} có thể được ghi và tích lũy theo thời gian để cấp dữ liệu cho hệ thống cảnh báo lũ/sạt lở. Cần bộ ghi, ngưỡng cảnh báo và đường truyền; cảm biến mưa không tự phát hiện sạt lở hay tạo hệ thống cảnh báo hoàn chỉnh.`, `${document.model}'s rainfall readings can be logged and accumulated over time for a flood/landslide warning system. Logging, thresholds and communications are needed; the rain sensor alone neither detects landslides nor provides a complete warning system.`);
  if (intent.measurements.some(m => m.key === 'solar_radiation') && measured('solar_radiation') && /phat dien|dien mat troi|photovoltaic|\bpv\b/u.test(text)) {
    const range = facts(/measurement_range|spectral_range|sensitivity|output/u, true);
    add(`${document.model} cung cấp số đo bức xạ phục vụ theo dõi điện mặt trời. ${range.length ? `Thông số: ${range.join('; ')}. ` : ''}Đánh giá hiệu suất điện mặt trời cần bức xạ theo W/m² cùng dữ liệu công suất/điện năng và bố trí đo phù hợp; thông lượng photon quang hợp không thay thế đại lượng này.`, `${document.model} provides solar-radiation measurements for PV monitoring. ${range.length ? `Specifications: ${range.join('; ')}. ` : ''}PV efficiency assessment needs irradiance in W/m² together with power/energy and suitable mounting; PAR/photon flux is a different quantity.`);
  }
  if (intent.measurements.length >= 4 && intent.target?.key === 'air_temperature' && intent.measurements.every(m => document.measurements.some(d => d.key === m.key))) add('Cụm đo tích hợp đáp ứng các đại lượng yêu cầu, giúp bố trí gọn trên cột. Vẫn cần xác minh bộ ghi, modem và nguồn cấp; cảm biến tích hợp không đồng nghĩa có sẵn cả trạm.', 'The integrated measurement assembly covers the requested variables and simplifies pole mounting. Confirm logging, modem and power separately; an integrated sensor is not necessarily a complete station.');
  if (intent.transport && /satellite|radio|cellular|modem/iu.test(document.taxonomy.device_type + ' ' + document.name_en)) {
    const kind = document.taxonomy.device_type;
    evidence.push({ source: 'product_document', field: 'taxonomy.device_type', value: kind });
    if (intent.transport === 'radio' && /radio/iu.test(kind)) add(`${document.model} truyền bằng sóng vô tuyến tới trạm mẹ, không phụ thuộc mạng di động. Chưa xác nhận khoảng cách tuyến yêu cầu: cần thiết bị tương thích hai đầu, anten, đường truyền thẳng không bị che khuất, khảo sát địa hình và kiểm tra tần số được phép tại nơi triển khai.`, `${document.model} is a radio candidate for a base-station link independent of cellular coverage. The requested path length is unconfirmed: check compatible endpoints, antennas, line-of-sight, terrain and permitted frequencies.`);
    if (intent.transport === 'satellite' && /satellite/iu.test(kind + ' ' + document.name_en)) {
      const system = facts(/^satellite_system|^product_type|^communication_direction/u).join('; ');
      const goes = /\bGOES\b/iu.test(system + ' ' + document.name_en);
      add(`${document.model} phát gói dữ liệu trực tiếp lên vệ tinh${goes ? ' GOES' : ''}, không phụ thuộc mạng viễn thông mặt đất. Cần xác minh tọa độ/vùng phủ, quyền truy cập dịch vụ, bộ ghi, anten, nguồn và lắp đặt ngoài biển. ${goes ? 'GOES không phải dịch vụ phủ toàn cầu; ' : ''}Chưa xác nhận dịch vụ phù hợp với vị trí của bạn.`, `${document.model} provides satellite data transmission: ${system || kind}. Verify location/coverage, service access, logger, antennas, power and marine installation; ${goes ? 'GOES is not global coverage and ' : ''}suitability at your location is unconfirmed.`);
    }
    if (intent.transport === 'cellular' && /cellular|modem/iu.test(kind)) add('Phương án truyền qua mạng di động cần kiểm tra nhà mạng, băng tần, SIM và vùng phủ tại trạm; cấu hình dành cho một nhà mạng/thị trường không dùng mặc định ở nơi khác.', 'Cellular transmission requires checking carrier, bands, SIM and coverage; a carrier/market-specific configuration is not automatically suitable elsewhere.');
  }
  const wired = document.supported_protocols.filter(p => /^(?:SDI-12|RS-232|RS-485|USB|Ethernet|CPI|CS I\/O)$/u.test(p));
  if (wired.length && (isCapabilityQuestion(query) || /khong dung wifi|without wi.fi|khong dung modbus|without using modbus|co san|already own|\bi have\b/u.test(text))) {
    evidence.push({ source: 'product_document', field: 'supported_protocols', value: wired.join(', ') });
    const wifiQuestion = isCapabilityQuestion(query) && /wi[ -]?fi/iu.test(query);
    // CS655's documented sensor outputs are wired; an external gateway is a separate device.
    if (wifiQuestion && document.model === 'CS655' && facts(/^sensor_output$/u).length) add('CS655 không kết nối Wi-Fi trực tiếp; cảm biến dùng dây SDI-12 hoặc RS-232. Muốn đưa dữ liệu lên mạng Wi-Fi cần bộ ghi hoặc bộ chuyển đổi bên ngoài.', 'CS655 does not connect directly to Wi-Fi; its sensor outputs are wired SDI-12 or RS-232. A separate logger or gateway is required to relay its data over Wi-Fi.');
    const owned = purchaseQuery(query) !== query;
    if (owned && wired.includes('SDI-12')) add('SDI-12 cho phép nhiều cảm biến chia sẻ cùng tuyến bus khi mỗi cảm biến có địa chỉ riêng. Cần kiểm tra nguồn cấp, chiều dài dây và giới hạn tải của bộ ghi đang có.', 'SDI-12 permits sensors with distinct addresses to share a bus. Check supply, cable length and the existing logger’s bus limits.');
    add(`Giao tiếp có dây được xác nhận: ${wired.join(', ')}. ${wifiQuestion ? 'Dữ liệu này không xác nhận Wi-Fi tích hợp; kết nối không dây qua phụ kiện ngoài là khả năng riêng. ' : ''}${owned ? 'Bạn đang chọn cảm biến cho thiết bị đã có; hỗ trợ giao thức chưa xác nhận tương thích của toàn bộ cấu hình. ' : !isCapabilityQuestion(query) ? 'Có thể xem xét đường truyền có dây để tránh giao thức không muốn dùng. ' : ''}Cần kiểm tra đấu dây, nguồn, địa chỉ SDI-12 và giới hạn tuyến theo tài liệu. Không bảo đảm tuyệt đối không mất kết nối.`, `Confirmed wired interfaces: ${wired.join(', ')}. ${wifiQuestion ? 'These facts do not establish integrated Wi-Fi; wireless via external accessories is separate. ' : ''}${owned ? 'You are selecting a sensor for equipment already owned; protocol support does not establish compatibility of the complete configuration. ' : !isCapabilityQuestion(query) ? 'Consider a wired alternative to the unwanted protocol. ' : ''}Verify wiring, supply, SDI-12 addresses and bus limits. This does not guarantee uninterrupted connectivity.`);
  }
  if (/plc/iu.test(query) && document.supported_protocols.includes('RS-485') && document.supported_protocols.includes('Modbus RTU')) add('PLC cần cổng RS-485, vai trò chủ trong Modbus và cấu hình tốc độ truyền, kiểm tra chẵn lẻ, địa chỉ thanh ghi tương ứng; chưa xác nhận kết nối trực tiếp với mọi PLC.', 'The PLC needs an RS-485 port/module, Modbus master/client support and matching baud/parity/register configuration; direct compatibility with every PLC is unconfirmed.');
  if (intent.target?.key === 'air_temperature' && /am \d+|-\d+|cold|ngoai troi/u.test(text)) add('Khi đo nhiệt độ không khí ngoài trời cần kiểm tra che bức xạ và thông gió phù hợp; dải vận hành không thay thế yêu cầu lắp đặt.', 'Outdoor air-temperature measurement requires suitable radiation shielding and ventilation; operating range does not replace installation requirements.');
  return sentences.length ? { text: sentences.join(' '), evidence } : undefined;
}
