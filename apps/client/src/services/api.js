import { groupSpecifications } from './specifications';
import { isSearchMockEnabled, mockSearch } from './mocks/searchMock';
import { getApiBaseUrl } from './apiFetch';

const API_BASE_URL = getApiBaseUrl();

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
    // ── Commercial fields (product_commercial join) ──────────────────────────
    price: p.price ?? null,
    currency: p.currency || 'VND',
    availability: p.availability_status || p.availability || 'available_for_order',
    is_purchasable: p.is_purchasable !== false,
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
    groupSpecifications(data.specifications).forEach((spec) => {
      const group = spec.quantity_kind || 'General';
      if (!specs[group]) specs[group] = {};
      specs[group][spec.canonical_key] = spec.values.join('\n');
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
    variants: data.variants || [],
    media: data.media || [],
    specifications: data.specifications || [],
    important_specifications: data.important_specifications || [],
    // ── Commercial fields ─────────────────────────────────────────────────────
    price: p.price ?? data.commercial?.price ?? null,
    currency: p.currency || data.commercial?.currency || 'VND',
    availability: p.availability_status || data.commercial?.availability_status || 'available_for_order',
    is_purchasable: p.is_purchasable !== false,
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
      pagination: data.pagination || {
        page: 1,
        limit: 100,
        total: 0,
        total_pages: 0,
      },
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
      `${API_BASE_URL}/products/${encodeURIComponent(productIdOrModel)}`,
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
// The API generates explanations from product evidence; the client only displays them.
export async function searchProductsApi(query, limit = 10, context = null) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const res = isSearchMockEnabled
      ? await mockSearch(query, limit, context).then(({ status, body }) => ({
          status,
          ok: status >= 200 && status < 300,
          json: async () => body,
        }))
      : await fetch(`${API_BASE_URL}/search`, {
          signal: controller.signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit, explain: true, ...(context && { context }) }),
        });
    if (res.status === 400) {
      const errData = await res.json().catch(() => ({}));
      return {
        error: 'invalid_input',
        message: errData.message || 'Invalid search query',
      };
    }
    if (res.status === 503) {
      return {
        error: 'unavailable',
        message: 'Search service is temporarily unavailable. Please try again.',
      };
    }
    if (!res.ok)
      throw new Error(`Search API responded with status ${res.status}`);
    const data = await res.json();
    return {
      query: data.query,
      resolved_query: data.resolved_query || data.query,
      context_applied: data.context_applied || false,
      mode: data.mode, // 'hybrid' | 'keyword' | 'semantic'
      guidance: data.guidance || null,
      results: (data.results || []).map((r) => ({
        ...normalizeProduct(r),
        matched_features: r.matched_features || [],
        explanation: r.explanation || null,
        scores: r.scores || {},
      })),
    };
  } catch (error) {
    console.warn('API Search failed:', error.message);
    return {
      error: controller.signal.aborted ? 'timeout' : 'network_error',
      message: controller.signal.aborted ? 'Search took too long. Please try again.' : 'Could not connect to the search server.',
    };
  } finally {
    clearTimeout(timeout);
  }
}
