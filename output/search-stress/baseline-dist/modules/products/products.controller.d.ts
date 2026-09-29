import { type ProductDetail, type ProductListQuery, type ProductListResponse } from '@reeco/shared';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(query: ProductListQuery): Promise<ProductListResponse>;
    get(productId: string): Promise<ProductDetail>;
}
