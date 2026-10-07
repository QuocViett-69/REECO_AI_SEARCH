// Render the evidence and requirement evaluations returned by the search API.
const FIELD_LABELS = {
  model: ['Model', 'Model'],
  measurements: ['Measures', 'Đại lượng đo'],
  capabilities: ['Capabilities', 'Khả năng'],
  applications: ['Applications', 'Ứng dụng'],
  'taxonomy.device_type': ['Device type', 'Loại thiết bị'],
  'taxonomy.category': ['Category', 'Danh mục'],
  supported_protocols: ['Supported interface', 'Giao tiếp hỗ trợ'],
  variant_configuration: ['Model configuration', 'Cấu hình model'],
  unsupported_protocols: ['Unsupported interface', 'Giao tiếp không hỗ trợ'],
  operating_temperature_range: ['Operating range', 'Dải hoạt động'],
  temperature_measurement_range: ['Measurement range', 'Dải đo'],
  measurement_temperature_range: ['Measurement range', 'Dải đo'],
  ingress_protection: ['Environmental protection', 'Bảo vệ môi trường'],
};

/**
 * Present the backend's explanation, product evidence and requirement statuses.
 *
 * @param {{ product: object, query: string, resolvedQuery?: string }} input
 * @returns {Promise<ProductFit>}
 */
export async function explainProductFit({ product }) {
  const explanation = product?.explanation;
  const vi = explanation?.language === 'vi';
  const confirmed = (explanation?.evidence || []).map((item) => ({
    label: FIELD_LABELS[item.field]?.[vi ? 1 : 0] || String(item.field).replaceAll('_', ' '),
    value: String(item.value),
  }));

  return {
    language: vi ? 'vi' : 'en',
    summary:
      explanation?.text ||
      (vi
        ? 'Chưa có giải thích chi tiết cho model này.'
        : 'A detailed explanation for this model is not available yet.'),
    confirmed,
    matched: (explanation?.requirements || []).filter(item => item.status === 'confirmed').map(item => item.label),
    unconfirmed: (explanation?.requirements || []).filter(item => item.status === 'unconfirmed').map(item => item.label),
    mismatched: (explanation?.requirements || []).filter(item => item.status === 'mismatch').map(item => item.label),
    source: explanation?.source || null,
  };
}
