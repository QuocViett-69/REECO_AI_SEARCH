import * as sharedSchemas from '@reeco/shared';
import type {
  NormalizedValue,
  ProductDetail,
  ProductListQuery,
  ProductListResponse,
  SearchRequest,
  SearchResponse,
} from '@reeco/shared';
import { z } from 'zod';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const ImportResponseSchema = z
  .object({
    status: z.literal('completed'),
    report: z.unknown(),
  })
  .strict();

export type ImportResponse = z.infer<typeof ImportResponseSchema>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiUrl(path: string): URL {
  if (!apiBaseUrl) throw new Error('VITE_API_URL is not configured');
  return new URL(path.replace(/^\//, ''), `${apiBaseUrl.replace(/\/$/, '')}/`);
}

async function requestJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(createApiUrl(path), { ...init, headers });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const record = payload && typeof payload === 'object' ? payload : null;
    const message =
      record && 'message' in record && typeof record.message === 'string'
        ? record.message
        : `Request failed with HTTP ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return schema.parse(payload);
}

function appendQuery(path: string, query: Partial<ProductListQuery>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const search = searchParams.toString();
  return search ? `${path}?${search}` : path;
}

export function listProducts(
  query: Partial<ProductListQuery>,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  return requestJson(
    appendQuery('/products', query),
    sharedSchemas.ProductListResponseSchema,
    { signal },
  );
}

export function getProduct(
  productIdOrModel: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return requestJson(
    `/products/${encodeURIComponent(productIdOrModel)}`,
    sharedSchemas.ProductDetailSchema,
    { signal },
  );
}

export function searchProducts(
  request: SearchRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const body = sharedSchemas.SearchRequestSchema.parse(request);
  return requestJson('/search', sharedSchemas.SearchResponseSchema, {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });
}

export function listAdminProducts(
  query: Partial<ProductListQuery>,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  return requestJson(
    appendQuery('/admin/products', query),
    sharedSchemas.ProductListResponseSchema,
    { signal },
    accessToken,
  );
}

export function getAdminProduct(
  productIdOrModel: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return requestJson(
    `/admin/products/${encodeURIComponent(productIdOrModel)}`,
    sharedSchemas.ProductDetailSchema,
    { signal },
    accessToken,
  );
}

export function runAdminImport(accessToken: string): Promise<ImportResponse> {
  return requestJson(
    '/admin/import',
    ImportResponseSchema,
    { method: 'POST' },
    accessToken,
  );
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400)
      return 'The request is invalid. Check the entered values.';
    if (error.status === 401)
      return 'Your admin session is missing or expired. Please sign in again.';
    if (error.status === 404) return 'The requested product was not found.';
    if (error.status === 409) return 'A product import is already running.';
    if (error.status === 503)
      return 'The service is temporarily unavailable. Please retry shortly.';
    return error.message;
  }
  if (error instanceof z.ZodError)
    return 'The server returned an unexpected response.';
  return error instanceof Error
    ? error.message
    : 'An unexpected error occurred.';
}

export function formatNormalizedValue(value: NormalizedValue): string {
  if (value.type === 'boolean') return value.value ? 'Yes' : 'No';
  if (value.type === 'protocol' || value.type === 'list') {
    return value.values.join(', ');
  }
  if (value.type === 'number') {
    const qualifier = value.qualifier ? `${value.qualifier} ` : '';
    return `${qualifier}${value.value}${value.unit ? ` ${value.unit}` : ''}`;
  }

  const qualifier = value.qualifier ? `${value.qualifier} ` : '';
  if (value.min && value.max) {
    return `${qualifier}${value.min.value} ${value.min.unit} – ${value.max.value} ${value.max.unit}`;
  }
  return `${qualifier}${value.min_value ?? '—'} – ${value.max_value ?? '—'}${value.unit ? ` ${value.unit}` : ''}`;
}

export function humanizeFeature(feature: string): string {
  const [rawKind, ...rest] = feature.split(':');
  const kind = rawKind || 'match';
  const identityType = rest[0];
  const value =
    kind === 'identity' && ['model', 'product_id'].includes(rest[0] ?? '')
      ? rest.slice(1).join(':')
      : rest.join(':');
  const labels: Record<string, string> = {
    identity: 'Exact identity',
    protocol: 'Protocol',
    'operating-temperature': 'Operating temperature',
    'measurement-temperature': 'Measurement temperature',
  };
  const label =
    kind === 'identity' && identityType
      ? identityType.replaceAll('_', ' ')
      : (labels[kind] ?? kind.replaceAll('-', ' '));
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${value}`;
}
