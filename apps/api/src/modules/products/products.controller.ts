import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ProductListQuerySchema,
  type ProductDetail,
  type ProductListQuery,
  type ProductListResponse,
} from '@reeco/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ProductListQuerySchema))
    query: ProductListQuery,
  ): Promise<ProductListResponse> {
    return this.productsService.listPublic(query);
  }

  @Get(':productId')
  get(@Param('productId') productId: string): Promise<ProductDetail> {
    return this.productsService.getPublic(productId);
  }
}
