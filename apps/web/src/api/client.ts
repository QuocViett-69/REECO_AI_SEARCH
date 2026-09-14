import type { SearchRequest } from '@reeco/shared';

const apiBaseUrl = import.meta.env.VITE_API_URL;

export function createApiUrl(path: string): URL {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_URL is not configured');
  }

  return new URL(path.replace(/^\//, ''), `${apiBaseUrl.replace(/\/$/, '')}/`);
}

export type SearchApiRequest = SearchRequest;
