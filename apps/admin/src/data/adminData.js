export const initialStats = {
  totalProducts: 269,
  activeProducts: 250,
  totalAiSearches: '1,420',
  failedImports: 2,
};

export const recentSearches = [
  { id: 1, query: 'Cảm biến đo độ ẩm đất hỗ trợ SDI-12', time: 'Just now' },
  { id: 2, query: 'Datalogger cho quan trắc môi trường', time: '5 mins ago' },
  { id: 3, query: 'Thiết bị cellular cho trạm ở xa', time: '2 hours ago' },
  { id: 4, query: 'Cảm biến đo mức nước hồ chứa siêu âm/radar', time: '3 hours ago' },
  { id: 5, query: 'Đo độ đục nguồn nước cấp tự động', time: '5 hours ago' },
];

export const topSearchedProducts = [
  { model: 'CS655', views: '150 views' },
  { model: 'CR310', views: '120 views' },
  { model: 'CS650', views: '90 views' },
  { model: 'CR6', views: '85 views' },
  { model: 'ClariVue10', views: '62 views' },
];

export const initialRecentImports = [
  { id: 1, file: 'CS655.json', status: 'valid', label: 'Success', time: '2 mins ago' },
  { id: 2, file: 'CR310.json', status: 'invalid', label: 'Invalid (Missing Model)', time: '1 hour ago' },
  { id: 3, file: 'CS650.json', status: 'valid', label: 'Success', time: '1 day ago' },
  { id: 4, file: 'CR6.json', status: 'valid', label: 'Success', time: '2 days ago' },
];

export const initialProducts = [
  {
    id: 'CS655',
    model: 'CS655',
    name: 'Water Content Reflectometer',
    category: 'Sensors',
    subcategory: 'Soil Sensors',
    deviceType: 'Soil Sensor',
    protocol: 'SDI-12',
    status: 'Active',
    specs: {
      'General Specifications': {
        'Operating Temperature': '-40 to 70 °C',
        'Accuracy': '±2.5% VWC',
        'Measurement': 'Soil Water Content',
        'Rod Length': '12 cm',
      },
      'Communication': {
        'Protocol': 'SDI-12',
        'Output': 'Volumetric water content, EC, temperature',
      },
      'Electrical': {
        'Power Supply': '9 – 16 VDC',
        'Current Consumption': '35 mA typical',
      },
    },
  },
  {
    id: 'CR310',
    model: 'CR310',
    name: 'Compact Datalogger',
    category: 'Logger',
    subcategory: 'Compact Loggers',
    deviceType: 'Datalogger',
    protocol: 'SDI-12, RS-232',
    status: 'Draft',
    specs: {
      'General Specifications': {
        'Measurement Channels': '6 analog, 4 digital',
        'Processor': 'ARM Cortex-M4',
        'Memory': '4 MB internal',
        'Operating Temperature': '-40 to 70 °C',
      },
      'Communication': {
        'Protocol': 'SDI-12, RS-232, RS-485',
        'Cellular': 'Optional via external modem',
      },
      'Electrical': {
        'Power Supply': '9 – 16 VDC',
        'Current Consumption': '2 mA sleep, 25 mA active',
      },
    },
  },
  {
    id: 'CR6',
    model: 'CR6',
    name: 'Measurement & Control Datalogger',
    category: 'Logger',
    subcategory: 'Advanced Loggers',
    deviceType: 'Datalogger',
    protocol: 'SDI-12, Ethernet',
    status: 'Active',
    specs: {
      'General Specifications': {
        'Measurement Channels': '20 analog, 8 digital',
        'Processor': 'High-performance ARM',
        'Memory': '8 MB internal + SD card',
        'Operating Temperature': '-40 to 70 °C',
      },
      'Communication': {
        'Protocol': 'SDI-12, RS-232, RS-485, Ethernet',
        'Cellular': 'Built-in optional',
      },
      'Electrical': {
        'Power Supply': '9 – 16 VDC',
        'Current Consumption': '5 mA sleep, 50 mA active',
      },
    },
  },
  {
    id: 'CS650',
    model: 'CS650',
    name: 'Water Content Reflectometer',
    category: 'Sensors',
    subcategory: 'Soil Sensors',
    deviceType: 'Soil Sensor',
    protocol: 'SDI-12',
    status: 'Active',
    specs: {
      'General Specifications': {
        'Operating Temperature': '-40 to 55 °C',
        'Accuracy': '±3% in standard soils',
        'Rod Length': '30 cm',
      },
      'Communication': {
        'Protocol': 'SDI-12',
        'Output': 'Volumetric water content, EC, temperature',
      },
    },
  },
  {
    id: 'CS616',
    model: 'CS616',
    name: 'Water Content Reflectometer',
    category: 'Sensors',
    subcategory: 'Soil Sensors',
    deviceType: 'Reflectometer',
    protocol: 'SDI-12',
    status: 'Draft',
    specs: {
      'General Specifications': {
        'Rod Length': '30 cm',
        'Accuracy': '±2.5% in standard soils',
      },
      'Electrical': {
        'Power Supply': '5 – 16 VDC',
        'Current Consumption': '20 mA typical',
      },
    },
  },
  {
    id: 'RV50X',
    model: 'RV50X',
    name: 'Cellular Modem/Router',
    category: 'Communications',
    subcategory: 'Cellular',
    deviceType: 'Router',
    protocol: 'Ethernet, Cellular',
    status: 'Active',
    specs: {
      'General Specifications': {
        'Network': '4G LTE, 3G fallback',
        'Operating Temperature': '-30 to 60 °C',
      },
      'Communication': {
        'Protocol': 'Ethernet, Cellular',
        'WiFi': '802.11 b/g/n',
      },
    },
  },
  {
    id: 'ClariVue10',
    model: 'ClariVue10',
    name: 'Submersible Turbidity and Temperature Sensor',
    category: 'Sensors',
    subcategory: 'Water Sensors',
    deviceType: 'Turbidity Sensor',
    protocol: 'SDI-12',
    status: 'Active',
    specs: {
      'General Specifications': {
        'Turbidity Range': '0 – 1000 NTU',
        'Accuracy': '±2% of reading',
        'Operating Temperature': '0 to 50 °C',
      },
      'Communication': {
        'Protocol': 'SDI-12',
      },
    },
  },
  {
    id: 'RangeVue30',
    model: 'RangeVue30',
    name: 'Radar Water Level Sensor',
    category: 'Sensors',
    subcategory: 'Water Sensors',
    deviceType: 'Radar Sensor',
    protocol: 'SDI-12, RS-485',
    status: 'Active',
    specs: {
      'General Specifications': {
        'Measurement': 'Water Level',
        'Range': '0 – 30 m',
        'Accuracy': '±3 mm',
      },
      'Communication': {
        'Protocol': 'SDI-12, RS-485',
      },
    },
  },
];

export const sampleImportFiles = [
  {
    name: 'CS655.json',
    status: 'valid',
    data: {
      model: 'CS655',
      name: 'Water Content Reflectometer',
      category: 'Sensors',
      subcategory: 'Soil Sensors',
      status: 'Active',
    },
  },
  {
    name: 'CR310.json',
    status: 'invalid',
    error: 'Missing model',
    data: {
      name: 'Compact Datalogger',
      category: 'Logger',
    },
  },
];
