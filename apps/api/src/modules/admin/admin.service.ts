import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ProductDetail } from '@reeco/shared';
import type { User } from '@supabase/supabase-js';
import { configuration } from '../../config/configuration';
import { SupabaseService } from '../../database/supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import type { AdminProductUpdate } from './admin-product-update.schema';
import type { AdminPaymentsQuery } from './admin-payments-query.schema';

/** ProductDetail plus the stored price, which admins see even when the product is not purchasable. */
export interface ProductPriceHistory {
  id: number; old_price_vnd: number | null; new_price_vnd: number;
  changed_by: string | null; changed_by_email: string | null; created_at: string;
}
export type AdminProductDetail = ProductDetail & { price_vnd: number | null; price_history: ProductPriceHistory[] };

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
  ) {}

  // PostgREST caps every response at max_rows (1000) without an error, so read page by page.
  // `page` must apply a stable order, otherwise rows can shift between pages.
  private async selectAll<T>(
    page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
    errorMessage: string,
  ): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await page(from, from + 999);
      if (error) {
        this.logger.error(`${errorMessage}: ${error.message}`);
        throw new ServiceUnavailableException(errorMessage);
      }
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) return rows;
    }
  }

  // ─── Data Quality Center (GET /admin/quality) ──────────────────────────────
  // One endpoint: stats are derived from the same per-product rows the table shows.
  async getQuality() {
    const client = this.supabase.getClient();
    const failure = 'Lỗi tải dữ liệu kiểm tra chất lượng danh mục';

    const [productRows, priceRows, docRows, mediaRows, indexRows] = await Promise.all([
      this.selectAll(
        (from, to) =>
          client
            .from('products')
            // Embedded count: selecting product_specifications rows would hit max_rows on its own.
            .select('product_id, model, product_name_en, category, status, product_specifications(count)')
            .order('product_id')
            .range(from, to),
        failure,
      ),
      this.selectAll(
        (from, to) => client.from('product_prices').select('product_id, price_vnd').order('product_id').range(from, to),
        failure,
      ),
      this.selectAll(
        (from, to) =>
          client
            .from('product_documents')
            .select(
              'product_id, content_hash, name_vi:search_document->>name_vi, source_versions:search_document->source_versions, applications:search_document->applications, capabilities:search_document->capabilities',
            )
            .order('product_id')
            .range(from, to),
        failure,
      ),
      this.selectAll(
        (from, to) =>
          client
            .from('product_media')
            .select('product_id')
            .not('image_url', 'is', null)
            .order('media_id')
            .range(from, to),
        failure,
      ),
      this.selectAll(
        (from, to) =>
          client
            .from('product_search_index')
            .select('product_id, source_content_hash, embedding_model, embedding_dimensions, embedding_version')
            .order('product_id')
            .range(from, to),
        failure,
      ),
    ]);

    const prices = new Map(priceRows.map((p) => [p.product_id, Number(p.price_vnd)]));
    const docs = new Map(docRows.map((d) => [d.product_id, d]));
    const withImage = new Set(mediaRows.map((m) => m.product_id));
    // EN name alone does not send a product to review.
    const reviewFields = ['Missing VI Name', 'Missing Price', 'Missing Image', 'Missing Structured Specs'];

    const products = productRows.map((p) => {
      const missingFields: string[] = [];
      let score = 100;
      const miss = (field: string, penalty: number) => {
        missingFields.push(field);
        score -= penalty;
      };

      if (!docs.get(p.product_id)?.name_vi?.trim()) miss('Missing VI Name', 15);
      if (!p.product_name_en?.trim()) miss('Missing EN Name', 20);
      if (!((prices.get(p.product_id) ?? 0) > 0)) miss('Missing Price', 25);
      if (!withImage.has(p.product_id)) miss('Missing Image', 20);
      if (!((p.product_specifications?.[0]?.count ?? 0) > 0)) miss('Missing Structured Specs', 10);

      return {
        product_id: p.product_id,
        model: p.model,
        name: p.product_name_en || p.model,
        category: p.category,
        status: p.status,
        missing_fields: missingFields,
        // The KPI card and the "needs review" filter both read this flag, so they always agree.
        needs_review: p.status === 'review' || missingFields.some((f) => reviewFields.includes(f)),
        data_quality_score: Math.max(0, score),
      };
    });

    const countMissing = (field: string) => products.filter((p) => p.missing_fields.includes(field)).length;

    return {
      stats: {
        totalProducts: products.length,
        needsReview: products.filter((p) => p.needs_review).length,
        missingViName: countMissing('Missing VI Name'),
        missingEnName: countMissing('Missing EN Name'),
        missingPrice: countMissing('Missing Price'),
        missingImage: countMissing('Missing Image'),
        missingStructuredSpecs: countMissing('Missing Structured Specs'),
        searchIndexHealth: this.searchIndexHealth(productRows, docs, new Map(indexRows.map((r) => [r.product_id, r]))),
      },
      products,
    };
  }

  // Same rules as scripts/create-embeddings/lib.mjs: an embedding is current only when it matches
  // the configured model/dimensions/version; a search document is stale when the index was built
  // from a different content_hash.
  private searchIndexHealth(
    products: { product_id: string; status: string }[],
    docs: Map<string, { content_hash: string; source_versions: unknown; applications: unknown; capabilities: unknown }>,
    index: Map<
      string,
      {
        source_content_hash: string;
        embedding_model: string | null;
        embedding_dimensions: number | null;
        embedding_version: string | null;
      }
    >,
  ) {
    const { model, dimensions, version } = configuration().embedding;
    const nonEmpty = (value: unknown) => Array.isArray(value) && value.length > 0;
    let staleSearchDocument = 0;
    let staleEmbedding = 0;
    let missingSemanticEnrichment = 0;

    for (const p of products) {
      const doc = docs.get(p.product_id);
      const row = index.get(p.product_id);
      if (!doc || !row || row.source_content_hash !== doc.content_hash) staleSearchDocument++;
      // Review products are never embedded, so only active ones count.
      if (
        p.status === 'active' &&
        (row?.embedding_model !== model ||
          Number(row?.embedding_dimensions) !== dimensions ||
          row?.embedding_version !== version)
      ) {
        staleEmbedding++;
      }
      const versions = doc?.source_versions;
      const enriched =
        typeof versions === 'object' &&
        versions !== null &&
        !!(versions as Record<string, unknown>).semantic_enrichment &&
        (nonEmpty(doc?.applications) || nonEmpty(doc?.capabilities));
      if (!enriched) missingSemanticEnrichment++;
    }

    return {
      staleSearchDocument,
      staleEmbedding,
      missingSemanticEnrichment,
      status: staleSearchDocument + staleEmbedding + missingSemanticEnrichment === 0 ? 'healthy' : 'degraded',
    };
  }

  // ─── Order-Derived Client Operations View ─────────────────────────────────
  async getClients() {
    const client = this.supabase.getClient();
    // ponytail: aggregates in Node like getAdminOrderStats; move to a SQL view if orders grow large.
    const orders = await this.selectAll(
      (from, to) =>
        client
          .from('orders')
          .select('customer_id, customer_name, customer_email, customer_phone, total, payment_status, status, created_at')
          .order('id', { ascending: true })
          .range(from, to),
      'Lỗi tải danh sách khách hàng',
    );

    const clientMap = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        phone: string;
        orders_count: number;
        total_spent: number;
        last_order_date: string;
        active_orders_count: number;
      }
    >();

    for (const ord of orders) {
      // Emails differ in case/spacing between orders of the same customer.
      const key = ord.customer_email?.trim().toLowerCase() || ord.customer_id || 'guest';
      const existing = clientMap.get(key) || {
        id: ord.customer_id || key,
        name: ord.customer_name || 'Khách hàng',
        email: ord.customer_email?.trim() || '—',
        phone: ord.customer_phone || '—',
        orders_count: 0,
        total_spent: 0,
        last_order_date: ord.created_at,
        active_orders_count: 0,
      };

      existing.orders_count += 1;
      if (ord.payment_status === 'PAID') {
        existing.total_spent += Number(ord.total) || 0;
      }
      if (ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED') {
        existing.active_orders_count += 1;
      }
      // Contact details follow the customer's most recent order.
      if (new Date(ord.created_at) >= new Date(existing.last_order_date)) {
        existing.last_order_date = ord.created_at;
        existing.name = ord.customer_name || existing.name;
        existing.phone = ord.customer_phone || existing.phone;
      }

      clientMap.set(key, existing);
    }

    return Array.from(clientMap.values());
  }

  // ─── Payments Operations View ──────────────────────────────────────────────
  async getPayments(params: AdminPaymentsQuery) {
    const client = this.supabase.getClient();
    const from = (params.page - 1) * params.page_size;

    // Every query below applies the same filters, so the KPI counts match the table.
    const eqFilters: Record<string, string> = {};
    if (params.method) eqFilters.payment_method = params.method;
    if (params.status) eqFilters.payment_status = params.status;
    // Same escaping as admin order search: the value sits inside a quoted or() filter.
    const term = params.search?.replace(/["\\]/g, '');
    const searchFilter = term
      ? ['order_code', 'customer_name', 'customer_email', 'vnpay_txn_ref', 'vnpay_transaction_no']
          .map((column) => `${column}.ilike."%${term}%"`)
          .join(',')
      : null;

    const countWhere = (column: string, values: string[]) => {
      const q = client.from('orders').select('id', { count: 'exact', head: true }).match(eqFilters).in(column, values);
      return searchFilter ? q.or(searchFilter) : q;
    };
    let listQuery = client
      .from('orders')
      .select(
        'id, order_number, order_code, customer_name, customer_email, payment_method, payment_status, total, currency, vnpay_txn_ref, vnpay_transaction_no, created_at, updated_at',
      )
      .match(eqFilters);
    if (searchFilter) listQuery = listQuery.or(searchFilter);

    const [list, vnpay, cod, paid, pending, failed] = await Promise.all([
      listQuery.order('created_at', { ascending: false }).range(from, from + params.page_size - 1),
      countWhere('payment_method', ['vnpay']),
      countWhere('payment_method', ['cod']),
      countWhere('payment_status', ['PAID']),
      countWhere('payment_status', ['PENDING_PAYMENT', 'COD_PENDING']),
      countWhere('payment_status', ['FAILED']),
    ]);

    // PGRST103 = page past the end (the filter shrank the result): an empty page, not an outage.
    const pastEnd = list.error?.code === 'PGRST103';
    const failedQuery = [pastEnd ? null : list, vnpay, cod, paid, pending, failed].find((r) => r?.error);
    if (failedQuery) {
      this.logger.error(`Error fetching payments: ${failedQuery.error?.message}`);
      throw new ServiceUnavailableException('Lỗi tải giao dịch thanh toán');
    }
    // payment_method is constrained to cod | vnpay, so these two counts add up to every match.
    const total = (vnpay.count ?? 0) + (cod.count ?? 0);

    return {
      items: pastEnd ? [] : list.data || [],
      total,
      stats: {
        totalPayments: total,
        vnpayCount: vnpay.count ?? 0,
        codCount: cod.count ?? 0,
        paidCount: paid.count ?? 0,
        pendingCount: pending.count ?? 0,
        failedCount: failed.count ?? 0,
      },
    };
  }

  // ─── Admin product detail (adds the raw price, which ProductDetail hides for review products) ──
  async getAdminProductDetail(productId: string): Promise<AdminProductDetail> {
    const detail = await this.productsService.getAdmin(productId);
    const { data, error } = await this.supabase
      .getClient()
      .from('product_prices')
      .select('price_vnd')
      .eq('product_id', detail.product.product_id)
      .maybeSingle();
    if (error) {
      this.logger.error(`Failed to load price for ${detail.product.product_id}: ${error.message}`);
      throw new ServiceUnavailableException('Không tải được giá sản phẩm');
    }
    const history = await this.supabase.getClient().from('product_price_history')
      .select('id,old_price_vnd,new_price_vnd,changed_by,changed_by_email,created_at')
      .eq('product_id', detail.product.product_id).order('id', { ascending: false }).limit(100);
    if (history.error) throw new ServiceUnavailableException('Không tải được lịch sử sửa giá');
    return { ...detail, price_vnd: data ? Number(data.price_vnd) : null, price_history: history.data ?? [] };
  }

  // ─── PUT /admin/products/:productId/price ──────────────────────────────────
  async setProductPrice(productId: string, priceVnd: number, user?: User): Promise<AdminProductDetail> {
    const detail = await this.productsService.getAdmin(productId);
    await this.upsertPrice(detail.product.product_id, priceVnd, user);
    return this.getAdminProductDetail(detail.product.product_id);
  }

  // ─── PATCH /admin/products/:productId ──────────────────────────────────────
  async updateAdminProduct(
    productId: string,
    updates: AdminProductUpdate,
    user?: User,
  ): Promise<AdminProductDetail> {
    return this.setProductPrice(productId, updates.price_vnd, user);
  }

  private async upsertPrice(productId: string, priceVnd: number, user?: User): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .rpc('set_product_price', { p_product_id: productId, p_price_vnd: priceVnd,
        p_actor_id: user?.id ?? null, p_actor_email: user?.email ?? null });
    if (error) {
      this.logger.error(`Failed to save price for ${productId}: ${error.message}`);
      throw new ServiceUnavailableException('Không lưu được giá sản phẩm');
    }
  }
}
