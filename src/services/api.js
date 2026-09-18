const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

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
    protocol: 'SDI-12',
    image: p.image_url || null,
    status: p.status,
  };
}

// ─── Normalize detail response ─────────────────────────────────────────────────
function normalizeProductDetail(data) {
  const p = data.product;
  const protocols =
    data.supported_protocols?.map((pr) => pr.key).join(', ') || 'SDI-12';

  // Build specs map from specifications array
  const specs = {};
  if (Array.isArray(data.specifications) && data.specifications.length > 0) {
    data.specifications.forEach((spec) => {
      const group = spec.quantity_kind || 'General';
      if (!specs[group]) specs[group] = {};
      const val = spec.normalized_value;
      let displayVal = '';
      if (val) {
        if (val.type === 'range') {
          displayVal = `${val.min} \u2013 ${val.max} ${val.unit || ''}`.trim();
        } else if (val.type === 'quantity') {
          displayVal = `${val.value} ${val.unit || ''}`.trim();
        } else if (val.type === 'boolean') {
          displayVal = val.value ? 'Yes' : 'No';
        } else {
          displayVal = String(val.value ?? '');
        }
      }
      specs[group][spec.canonical_key] = displayVal;
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
    protocol: protocols,
    image: primaryImageUrl,
    status: p.status,
    specs,
    taxonomy: data.taxonomy || null,
    measurements: data.measurements || [],
    applications: data.applications || [],
    capabilities: data.capabilities || [],
    supported_protocols: data.supported_protocols || [],
    aliases: data.aliases || [],
    media: data.media || [],
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
    if (!res.ok) throw new Error(`Product Detail API error ${res.status}`);
    const data = await res.json();
    return normalizeProductDetail(data);
  } catch (error) {
    console.warn('API Get product detail failed:', error.message);
    return null;
  }
}

// ─── POST /search ────────────────────────────────────────────────────────────────
export async function searchProductsApi(query, limit = 10) {
  try {
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) throw new Error(`Search API responded with status ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((r) => ({
      ...normalizeProduct(r),
      score: Math.min(98, Math.max(65, Math.round((r.scores?.keyword || 0.8) * 35 + 60))),
      scores: r.scores,
    }));
  } catch (error) {
    console.warn('API Search failed:', error.message);
    return null;
  }
}
