import {
  Controller,
  Get,
  Param,
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
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProductsService } from '../products/products.service';

@Controller('admin/products')
@UseGuards(SupabaseAuthGuard)
export class AdminController {
  constructor(private readonly productsService: ProductsService) {}

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
}
