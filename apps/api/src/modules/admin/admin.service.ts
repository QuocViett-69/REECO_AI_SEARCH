import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ProductDetail } from '@reeco/shared';
import { SupabaseService } from '../../database/supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import type { AdminProductUpdate } from './admin-product-update.schema';

/** ProductDetail plus the stored price, which admins see even when the product is not purchasable. */
export type AdminProductDetail = ProductDetail & { price_vnd: number | null };

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly productsService: ProductsService,
  ) {}

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
    return { ...detail, price_vnd: data ? Number(data.price_vnd) : null };
  }

  // ─── PUT /admin/products/:productId/price ──────────────────────────────────
  async setProductPrice(productId: string, priceVnd: number): Promise<AdminProductDetail> {
    const detail = await this.productsService.getAdmin(productId);
    await this.upsertPrice(detail.product.product_id, priceVnd);
    return this.getAdminProductDetail(detail.product.product_id);
  }

  // ─── PATCH /admin/products/:productId ──────────────────────────────────────
  async updateAdminProduct(
    productId: string,
    updates: AdminProductUpdate,
  ): Promise<AdminProductDetail> {
    const { price_vnd, ...productUpdates } = updates;
    const detail = await this.productsService.updateAdmin(productId, productUpdates);
    const targetProductId = detail.product.product_id;
    if (price_vnd !== undefined) {
      await this.upsertPrice(targetProductId, price_vnd);
    }
    return this.getAdminProductDetail(targetProductId);
  }

  private async upsertPrice(productId: string, priceVnd: number): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('product_prices')
      .upsert({ product_id: productId, price_vnd: priceVnd }, { onConflict: 'product_id' });
    if (error) {
      this.logger.error(`Failed to save price for ${productId}: ${error.message}`);
      throw new ServiceUnavailableException('Không lưu được giá sản phẩm');
    }
  }
}
