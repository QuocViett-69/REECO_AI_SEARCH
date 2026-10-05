// ─── "Explain this model for my needs" ───────────────────────────────────────
// Integration point for the inline explanation under a recommended product on the
// AI Search page (components/search/SearchResults.js). The UI only depends on the
// shape returned below, so the backend can be connected here without touching it.
//
// TODO(backend): replace the body of explainProductFit with a real request. The API
// already answers explanation questions with a conversation context, e.g.
//
//   POST /search
//   {
//     "query": "Why is this product suitable for my application?",
//     "explain": true,
//     "context": {
//       "base_query": <first question of the conversation>,
//       "previous_query": <latest resolved question>,
//       "product_ids": [<product.product_id>]
//     }
//   }
//
// and returns the product with `explanation` (text, language, source, evidence) plus
// `guidance`. Map that response to the ProductFit shape and keep throwing on failure so
// the panel shows its error state.
//
// ProductFit:
//   {
//     language:    'en' | 'vi',
//     summary:     string,                              // one or two sentences
//     confirmed:   Array<{ label: string, value: string }>, // requirements the data confirms
//     unconfirmed: string[],                            // requirements not proven yet
//     source:      'rule' | 'llm' | null,               // where the wording came from
//   }

const FIELD_LABELS = {
  model: ['Model', 'Model'],
  measurements: ['Measures', 'Đại lượng đo'],
  capabilities: ['Capabilities', 'Khả năng'],
  applications: ['Applications', 'Ứng dụng'],
  'taxonomy.device_type': ['Device type', 'Loại thiết bị'],
  'taxonomy.category': ['Category', 'Danh mục'],
  supported_protocols: ['Supported interface', 'Giao tiếp hỗ trợ'],
  unsupported_protocols: ['Unsupported interface', 'Giao tiếp không hỗ trợ'],
  operating_temperature_range: ['Operating range', 'Dải hoạt động'],
  temperature_measurement_range: ['Measurement range', 'Dải đo'],
  measurement_temperature_range: ['Measurement range', 'Dải đo'],
  ingress_protection: ['Environmental protection', 'Bảo vệ môi trường'],
};

/**
 * Explain why `product` fits the user's request.
 * Placeholder until the backend is connected: it uses only the explanation and evidence
 * that the search response already returned for this product.
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
    unconfirmed: [],
    source: explanation?.source || null,
  };
}
