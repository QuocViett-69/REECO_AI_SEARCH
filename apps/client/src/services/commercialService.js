// ─── Commercial Product Data Service ──────────────────────────────────────────
// REECO acts as an authorized third-party business partner / reseller.
// Products are ordered from official manufacturers on demand.
// NEVER expose stock quantity or inventory numbers.

// Prices in VND (integer đồng), converted from the USD list at ~25,400 VND/USD.
const PRICE_MAP = {
  // Sensors & Reflectometers
  CSI_CS655: 13_210_000,
  CSI_CS650: 12_190_000,
  CSI_CS616: 10_030_000,
  CSI_CS610: 7_870_000,
  CSI_109: 4_700_000,
  CSI_43347: 8_640_000,
  CSI_TEMPVUE20_S: 11_430_000,
  CSI_TEMPVUE50: 12_450_000,
  CSI_EE181: 14_730_000,
  CSI_HYGROVUE10: 9_910_000,
  CSI_SOILVUE10_5: 22_610_000,
  CSI_SOILVUE10_1: 29_210_000,
  CSI_HS2_12: 31_750_000,
  CSI_CS506: 10_670_000,
  CSI_METSENS500_DS: 41_910_000,
  CSI_METSENS200_D2: 24_890_000,
  CSI_METSENS300_D2: 29_210_000,
  CSI_METSENS550_D2: 46_990_000,

  // Dataloggers
  CSI_CR300: 17_270_000,
  CSI_CR310_NA: 21_590_000,
  CSI_CR310_WIFI: 23_370_000,
  CSI_CR350_NA: 32_510_000,
  CSI_CR6_NA_ST_CC: 67_310_000,
  CSI_CR1000X: 54_610_000,

  // Power & Accessories
  CSI_PS84_CR: 18_290_000,
  CSI_PS24_W_CH150: 14_990_000,
  CSI_PS200: 11_430_000,
  CSI_PS150: 9_650_000,
};

// Deterministic price calculation fallback based on product model / id
function calculateFallbackPrice(identifier) {
  if (!identifier) return 11_430_000;
  let hash = 0;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash) % 1500;
  // Step in multiples of 250,000 VND between 6,250,000 and 43,500,000 VND
  return 6_250_000 + Math.floor(base / 10) * 250_000;
}

export const CURRENCY = 'VND';
const livePrices = new Map();
export const PRICE_UPDATED_EVENT = 'reeco:prices-updated';

export function updateProductPrices(products) {
  let changed = false;
  for (const product of products) {
    if (!product?.product_id || !Number.isFinite(product.price)) continue;
    if (livePrices.get(product.product_id) !== product.price) {
      livePrices.set(product.product_id, product.price);
      changed = true;
    }
  }
  if (changed) window.dispatchEvent(new Event(PRICE_UPDATED_EVENT));
}

export function getDisplayPrice(product) {
  return livePrices.get(product.product_id || product.id) ?? product.price ?? getProductPrice(product.product_id, product.model);
}

export function notifyCommerce(message) {
  window.dispatchEvent(new CustomEvent('reeco:commerce-notice', { detail: message }));
}

export function getProductPrice(productId, model) {
  if (livePrices.has(productId)) return livePrices.get(productId);
  if (productId && PRICE_MAP[productId]) {
    return PRICE_MAP[productId];
  }
  if (model && PRICE_MAP[model]) {
    return PRICE_MAP[model];
  }
  return calculateFallbackPrice(productId || model);
}

export function getCommercialData(productId, model) {
  const price = getProductPrice(productId, model);
  return {
    price,
    currency: CURRENCY,
    availability_status: 'available_for_order',
    availability_label: 'Available for order',
    is_purchasable: true,
    lead_time: '2 - 4 weeks',
    warranty: '12 months manufacturer warranty',
  };
}

export function formatPrice(amount, currency = CURRENCY) {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Cart/favorite items saved before the switch to VND carry USD prices; re-price them.
export function parseStoredItems(raw) {
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) return [];
  return items.map((item) =>
    item.currency === CURRENCY
      ? { ...item, price: getDisplayPrice(item) }
      : { ...item, price: getProductPrice(item.product_id, item.model), currency: CURRENCY }
  );
}

export function enrichProductWithCommercial(product) {
  if (!product) return null;
  const commercial = getCommercialData(product.product_id || product.id, product.model);
  return {
    ...product,
    price: getDisplayPrice(product),
    currency: product.currency ?? commercial.currency,
    availability: product.availability ?? commercial.availability_status,
    availability_label: commercial.availability_label,
    is_purchasable: commercial.is_purchasable,
    lead_time: commercial.lead_time,
    warranty: commercial.warranty,
  };
}
