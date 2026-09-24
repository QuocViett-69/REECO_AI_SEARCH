// ─── Commercial Product Data Service ──────────────────────────────────────────
// REECO acts as an authorized third-party business partner / reseller.
// Products are ordered from official manufacturers on demand.
// NEVER expose stock quantity or inventory numbers.

const PRICE_MAP = {
  // Sensors & Reflectometers
  CSI_CS655: 520,
  CSI_CS650: 480,
  CSI_CS616: 395,
  CSI_CS610: 310,
  CSI_109: 185,
  CSI_43347: 340,
  CSI_TEMPVUE20_S: 450,
  CSI_TEMPVUE50: 490,
  CSI_EE181: 580,
  CSI_HYGROVUE10: 390,
  CSI_SOILVUE10_5: 890,
  CSI_SOILVUE10_1: 1150,
  CSI_HS2_12: 1250,
  CSI_CS506: 420,
  CSI_METSENS500_DS: 1650,
  CSI_METSENS200_D2: 980,
  CSI_METSENS300_D2: 1150,
  CSI_METSENS550_D2: 1850,

  // Dataloggers
  CSI_CR300: 680,
  CSI_CR310_NA: 850,
  CSI_CR310_WIFI: 920,
  CSI_CR350_NA: 1280,
  CSI_CR6_NA_ST_CC: 2650,
  CSI_CR1000X: 2150,

  // Power & Accessories
  CSI_PS84_CR: 720,
  CSI_PS24_W_CH150: 590,
  CSI_PS200: 450,
  CSI_PS150: 380,
};

// Deterministic price calculation fallback based on product model / id
function calculateFallbackPrice(identifier) {
  if (!identifier) return 450;
  let hash = 0;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash) % 1500;
  // Step in multiples of 10 between $250 and $1,850
  return 250 + Math.floor(base / 10) * 10;
}

export function getProductPrice(productId, model) {
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
    currency: 'USD',
    availability_status: 'available_for_order',
    availability_label: 'Available for order',
    is_purchasable: true,
    lead_time: '2 - 4 weeks',
    warranty: '12 months manufacturer warranty',
  };
}

export function formatPrice(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function enrichProductWithCommercial(product) {
  if (!product) return null;
  const commercial = getCommercialData(product.product_id || product.id, product.model);
  return {
    ...product,
    price: product.price ?? commercial.price,
    currency: product.currency ?? commercial.currency,
    availability: product.availability ?? commercial.availability_status,
    availability_label: commercial.availability_label,
    is_purchasable: commercial.is_purchasable,
    lead_time: commercial.lead_time,
    warranty: commercial.warranty,
  };
}
