/**
 * TODO (cleanup): Legacy static product data — no active component imports this file in production.
 * All product data is fetched from the NestJS API via GET /api/v1/products (see src/services/api.js).
 * Remove in a separate cleanup task.
 */

import { masterProducts } from './masterProducts';

export const products = masterProducts;
export default products;
