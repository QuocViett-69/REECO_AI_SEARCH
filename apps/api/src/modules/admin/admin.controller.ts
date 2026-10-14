import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ProductListQuerySchema,
  type ProductListQuery,
  type ProductListResponse,
} from '@reeco/shared';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { User } from '@supabase/supabase-js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProductsService } from '../products/products.service';
import { AdminService, type AdminProductDetail } from './admin.service';
import {
  AdminProductPriceUpdateSchema,
  AdminProductUpdateSchema,
  type AdminProductPriceUpdate,
  type AdminProductUpdate,
} from './admin-product-update.schema';
import { AdminPaymentsQuerySchema, type AdminPaymentsQuery } from './admin-payments-query.schema';

@Controller('admin/products')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly adminService: AdminService,
  ) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ProductListQuerySchema))
    query: ProductListQuery,
  ): Promise<ProductListResponse> {
    return this.productsService.listAdmin(query);
  }

  @Get(':productId')
  get(@Param('productId') productId: string): Promise<AdminProductDetail> {
    return this.adminService.getAdminProductDetail(productId);
  }

  @Patch(':productId')
  update(
    @CurrentUser() user: User,
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(AdminProductUpdateSchema))
    updates: AdminProductUpdate,
  ): Promise<AdminProductDetail> {
    return this.adminService.updateAdminProduct(productId, updates, user);
  }

  @Put(':productId/price')
  setPrice(
    @CurrentUser() user: User,
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(AdminProductPriceUpdateSchema))
    body: AdminProductPriceUpdate,
  ): Promise<AdminProductDetail> {
    return this.adminService.setProductPrice(productId, body.price_vnd, user);
  }
}

@Controller('admin')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class AdminOperationsController {
  constructor(private readonly adminService: AdminService) {}

  @Get('quality')
  getQuality() {
    return this.adminService.getQuality();
  }

  @Get('clients')
  getClients() {
    return this.adminService.getClients();
  }

  @Get('payments')
  getPayments(
    @Query(new ZodValidationPipe(AdminPaymentsQuerySchema))
    query: AdminPaymentsQuery,
  ) {
    return this.adminService.getPayments(query);
  }
}
