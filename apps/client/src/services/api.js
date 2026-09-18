const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// ─── Format a normalized spec value to human-readable string ──────────────────
function formatSpecValue(val) {
  if (!val) return '';
  if (val.type === 'range') {
    const min = val.min_value ?? val.min ?? '';
    const max = val.max_value ?? val.max ?? '';
    const unit = val.unit || '';
    return `${min} – ${max} ${unit}`.trim();
  }
  if (val.type === 'number' || val.type === 'quantity') {
    return `${val.value ?? ''} ${val.unit || ''}`.trim();
  }
  if (val.type === 'boolean') {
    return val.value ? 'Yes' : 'No';
  }
  return String(val.value ?? '');
}

// ─── Normalize a product summary row from backend into UI shape ────────────────
function normalizeProduct(p) {
  return {
    product_id: p.product_id,
    model: p.model,
    name: p.name_en || p.name_vi || p.model,
    name_en: p.name_en,
    name_vi: p.name_vi,
    category: p.category || 'Uncategorized',
    subcategory: p.subcategory || p.device_type || 'General',
    deviceType: p.device_type || 'Hardware',
    image: p.image_url || null,
    status: p.status,
  };
}

// ─── Normalize detail response ─────────────────────────────────────────────────
function normalizeProductDetail(data) {
  const p = data.product;

  // supported_protocols is a plain string array: ["SDI-12", "RS-232"]
  const protocols = (data.supported_protocols || []).join(', ') || '';

  // Build specs map from specifications array using correct field names
  const specs = {};
  if (Array.isArray(data.specifications) && data.specifications.length > 0) {
    data.specifications.forEach((spec) => {
      const group = spec.quantity_kind || 'General';
      if (!specs[group]) specs[group] = {};
      specs[group][spec.canonical_key] = formatSpecValue(spec.normalized_value);
    });
  }

  if (Object.keys(specs).length === 0) {
    specs['General'] = {
      'Device Type': p.device_type || 'Hardware',
      Model: p.model,
      Category: p.category || '-',
    };
  }

  const primaryImageUrl =
    (data.media || []).find((m) => m.image_url)?.image_url ||
    p.image_url ||
    null;

  return {
    product_id: p.product_id,
    model: p.model,
    name: p.name_en || p.model,
    name_vi: p.name_vi,
    category: p.category || 'Uncategorized',
    subcategory: p.subcategory || p.device_type || 'General',
    deviceType: p.device_type || 'Hardware',
    // protocols is the joined string for display; keep array separately
    protocol: protocols,
    supported_protocols: data.supported_protocols || [],
    unsupported_protocols: data.unsupported_protocols || [],
    image: primaryImageUrl,
    status: p.status,
    specs,
    taxonomy: data.taxonomy || null,
    measurements: data.measurements || [],
    applications: data.applications || [],
    capabilities: data.capabilities || [],
    aliases: data.aliases || [],
    media: data.media || [],
    specifications: data.specifications || [],
    important_specifications: data.important_specifications || [],
  };
}

// ─── GET /products (paginated list) ────────────────────────────────────────────
export async function getProductsApi(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('page', params.page || 1);
    queryParams.set('limit', params.limit || 100);
    if (params.q) queryParams.set('q', params.q);
    if (params.category) queryParams.set('category', params.category);
    if (params.subcategory) queryParams.set('subcategory', params.subcategory);
    if (params.device_type) queryParams.set('device_type', params.device_type);

    const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Products API error ${res.status}`);
    const data = await res.json();
    return {
      items: (data.items || []).map(normalizeProduct),
      pagination: data.pagination || { page: 1, limit: 100, total: 0, total_pages: 0 },
    };
  } catch (error) {
    console.warn('API Get products failed:', error.message);
    return null;
  }
}

// ─── GET /products/:id (detail) ─────────────────────────────────────────────────
export async function getProductDetailApi(productIdOrModel) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/products/${encodeURIComponent(productIdOrModel)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Product Detail API error ${res.status}`);
    const data = await res.json();
    return normalizeProductDetail(data);
  } catch (error) {
    console.warn('API Get product detail failed:', error.message);
    return null;
  }
}

// ─── POST /search ────────────────────────────────────────────────────────────────
// Returns { query, mode, results } — results contain real scores and matched_features.
// Do NOT fabricate percentage scores or generate explanation text from these fields.
export async function searchProductsApi(query, limit = 10) {
  try {
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });
    if (res.status === 400) {
      const errData = await res.json().catch(() => ({}));
      return { error: 'invalid_input', message: errData.message || 'Invalid search query' };
    }
    if (res.status === 503) {
      return { error: 'unavailable', message: 'Search service is temporarily unavailable. Please try again.' };
    }
    if (!res.ok) throw new Error(`Search API responded with status ${res.status}`);
    const data = await res.json();
    return {
      query: data.query,
      mode: data.mode,  // 'hybrid' | 'keyword' | 'semantic'
      results: (data.results || []).map((r) => ({
        ...normalizeProduct(r),
        matched_features: r.matched_features || [],
        scores: r.scores || {},
      })),
    };
  } catch (error) {
    console.warn('API Search failed:', error.message);
    return { error: 'network_error', message: 'Could not connect to the search server.' };
  }
}
