export const expected = {
  'TC-01': ['RangeVue30'], 'TC-02': ['SoilVue10-5'], 'TC-03': ['SoilVue10-5'],
  'TC-04': ['HFP01'], 'TC-05': ['RainVue10-MM'], 'TC-06': ['52202'],
  'TC-07': ['ClimaVue50G2'], 'TC-08': ['CS301'], 'TC-09': ['CSAT3B-NC'],
  'TC-10': ['CS655'], 'TC-11': ['ClimaVue40'], 'TC-12': ['ClimaVue40'],
  'TC-13': ['109'], 'TC-14': [], 'TC-15': ['RF407'], 'TC-16': ['TX325'],
  'TC-17': ['TX325'], 'TC-18': ['CS655'], 'TC-20': ['CR310-NA'], 'TC-21': ['CS655'],
};
export const explanationChecks = {
  'TC-01': /không tiếp xúc.*không nhúng/u, 'TC-02': /tạo lỗ/u, 'TC-03': /10, 20, 50 cm/u,
  'TC-04': /nhiệt tích trữ/u, 'TC-05': /ngưỡng cảnh báo/u, 'TC-06': /nguồn cấp/u,
  'TC-07': /logger, modem/u, 'TC-08': /W\/m²/u, 'TC-09': /không bảo đảm/u,
  'TC-10': /đấu dây/u, 'TC-12': /PLC.*RS-485/u, 'TC-13': /-40°C/u,
  'TC-15': /line-of-sight/u, 'TC-16': /GOES/u, 'TC-17': /vùng phủ/u,
  'TC-18': /không xác nhận Wi-Fi/u, 'TC-20': /có dây/u, 'TC-21': /có dây/u,
};
