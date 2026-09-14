import { Controller } from '@nestjs/common';
import type { ProductSummary } from '@reeco/shared';

export type ProductResponse = ProductSummary;

@Controller('products')
export class ProductsController {}
