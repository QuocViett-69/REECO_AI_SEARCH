import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ProductListQuerySchema,
  type ProductDetail,
  type ProductListQuery,
  type ProductListResponse,
} from '@reeco/shared';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProductsService } from '../products/products.service';
import {
  AdminProductUpdateSchema,
  type AdminProductUpdate,
} from './admin-product-update.schema';

@Controller('admin/products')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  list(
    @Query(new ZodValidationPipe(ProductListQuerySchema))
    query: ProductListQuery,
  ): Promise<ProductListResponse> {
    return this.productsService.listAdmin(query);
  }

  @Get(':productId')
  get(@Param('productId') productId: string): Promise<ProductDetail> {
    return this.productsService.getAdmin(productId);
  }

  @Patch(':productId')
  update(
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(AdminProductUpdateSchema))
    updates: AdminProductUpdate,
  ): Promise<ProductDetail> {
    return this.productsService.updateAdmin(productId, updates);
  }
}
