export const expected = {
  'TC-01': ['RangeVue30'], 'TC-02': ['SoilVue10-5'], 'TC-03': ['SoilVue10-5'],
  'TC-04': ['HFP01'], 'TC-05': ['RainVue10-MM'], 'TC-06': ['52202'],
  'TC-07': ['ClimaVue50G2'], 'TC-08': ['CS301'], 'TC-09': ['CSAT3B-NC'],
  'TC-10': ['CS655'], 'TC-11': ['ClimaVue40'], 'TC-12': ['ClimaVue40'],
  'TC-13': ['109'], 'TC-14': ['CELL210-V'], 'TC-15': ['RF407'], 'TC-16': ['TX325'],
  'TC-17': ['TX325'], 'TC-18': ['CS655'], 'TC-20': ['CR310-NA'], 'TC-21': ['CS655'],
};
export const originalIds = {
  'TC-01': 'TC08', 'TC-02': 'TC13', 'TC-03': 'TC14', 'TC-04': 'TC20',
  'TC-05': 'TC22', 'TC-08': 'TC28', 'TC-09': 'TC30', 'TC-10': 'TC32',
  'TC-11': 'TC33', 'TC-12': 'TC34', 'TC-13': 'TC37', 'TC-14': 'TC42',
  'TC-15': 'TC46', 'TC-16': 'TC47', 'TC-17': 'TC48', 'TC-18': 'TC63',
  'TC-20': 'TC71', 'TC-21': 'TC72', 'TC-22': 'TC73', 'TC-23': 'TC74', 'TC-24': 'TC75',
};
export const firstExpected = ['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05', 'TC-09', 'TC-11', 'TC-12', 'TC-16', 'TC-17', 'TC-18'];
export const explanationChecks = {
  'TC-01': /không tiếp xúc.*không nhúng/u, 'TC-02': /tạo lỗ/u, 'TC-03': /10, 20, 50 cm/u,
  'TC-04': /nhiệt tích trữ/u, 'TC-05': /ngưỡng cảnh báo/u, 'TC-06': /nguồn cấp/u,
  'TC-07': /bộ ghi, modem/u, 'TC-08': /W\/m²/u, 'TC-09': /không bảo đảm/u,
  'TC-10': /đấu dây/u, 'TC-12': /PLC.*RS-485/u, 'TC-13': /-40°C/u,
  'TC-15': /đường truyền thẳng không bị che khuất/u, 'TC-16': /GOES/u, 'TC-17': /vùng phủ/u,
  'TC-18': /không kết nối Wi-Fi trực tiếp/u, 'TC-20': /có dây/u, 'TC-21': /có dây/u,
};
