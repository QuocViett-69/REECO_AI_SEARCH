// ─── AI Recommendation Integration Service ────────────────────────────────────
// Boundary Note: The AI recommendation engine and ranking model are maintained by
// the AI/Search teammate. This service provides the clean frontend API integration
// point for `GET /api/v1/products/:id/recommendations` with fallback compatibility mapping.

import { getProductPrice } from './commercialService.js';

// Pre-defined technical compatibility graph for Campbell scientific products
const TECHNICAL_COMPATIBILITY_GRAPH = {
  // Soil & Moisture Sensors -> Compatible Dataloggers & Cables
  CS655: [
    { model: 'CR300', reason: 'Compatible datalogger with SDI-12 support', type: 'compatible' },
    { model: 'CR310', reason: 'Datalogger with integrated 4G cellular gateway', type: 'compatible' },
    { model: 'CS650', reason: 'Complementary 30cm reflectometer variant', type: 'complementary' },
  ],
  CS650: [
    { model: 'CR300', reason: 'Compatible datalogger with SDI-12 support', type: 'compatible' },
    { model: 'CR1000X', reason: 'Flagship multi-channel measurement logger', type: 'compatible' },
  ],
  // Meteorological Sensors -> Loggers & Mountings
  ClimaVUE50: [
    { model: 'CR300', reason: 'Compact datalogger with SDI-12 reader', type: 'compatible' },
    { model: 'CR6', reason: 'High-speed vibrating wire & universal datalogger', type: 'compatible' },
  ],
  // Dataloggers -> Power, Multiplexers & Sensors
  CR300: [
    { model: 'CS655', reason: 'Precision soil moisture SDI-12 sensor', type: 'compatible_sensor' },
    { model: 'ClimaVUE50', reason: 'All-in-one meteorological compact sensor', type: 'compatible_sensor' },
    { model: 'CR310', reason: 'Cellular telemetry datalogger upgrade', type: 'alternative' },
  ],
  CR310: [
    { model: 'CS655', reason: 'Precision soil moisture SDI-12 sensor', type: 'compatible_sensor' },
    { model: 'CR6', reason: 'High-speed industrial grade datalogger', type: 'alternative' },
  ],
  CR1000X: [
    { model: 'CR6', reason: 'Universal channel measurement logger', type: 'alternative' },
    { model: 'CS655', reason: 'High-accuracy multiparameter soil sensor', type: 'compatible_sensor' },
  ],
  CR6: [
    { model: 'CR1000X', reason: 'High-reliability core scientific logger', type: 'alternative' },
    { model: 'CS655', reason: 'Multi-probe soil moisture array sensor', type: 'compatible_sensor' },
  ],
};

class RecommendationService {
  /**
   * Recommendations for a product. The API has no recommendations endpoint yet, so this
   * reads the local technical compatibility graph; `hydrateRecommendations` is ready for
   * when GET /products/:id/recommendations exists.
   */
  async getProductRecommendations(productId, model) {
    const cleanModel = model ? String(model).trim() : '';

    // Hydrate fallback from technical compatibility graph
    const compatibleList = TECHNICAL_COMPATIBILITY_GRAPH[cleanModel] || [];

    if (compatibleList.length > 0) {
      return compatibleList.map((item) => ({
        product_id: item.model,
        model: item.model,
        name: item.model,
        image: null,
        price: getProductPrice(item.model, item.model),
        currency: 'VND',
        reason: item.reason,
        type: item.type,
      }));
    }

    // Default fallback: Top 3 known compatible products
    const fallbackProducts = Object.keys(TECHNICAL_COMPATIBILITY_GRAPH)
      .filter((candidate) => candidate.toLowerCase() !== cleanModel.toLowerCase())
      .slice(0, 3);

    return fallbackProducts.map((fallbackModel) => ({
      product_id: fallbackModel,
      model: fallbackModel,
      name: fallbackModel,
      image: null,
      price: getProductPrice(fallbackModel, fallbackModel),
      currency: 'VND',
      reason: 'Complementary instrument for Campbell stations',
      type: 'complementary',
    }));
  }

  hydrateRecommendations(rawList) {
    return rawList.map((item) => {
      const model = item.model || 'Campbell Product';
      const price = item.price ?? getProductPrice(item.product_id, model);
      return {
        product_id: item.product_id || model,
        model,
        name: item.name || item.name_en || model,
        image: item.image || item.image_url || null,
        price,
        currency: 'VND',
        reason: item.reason || 'Compatible accessory',
        type: item.type || 'compatible',
      };
    });
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
