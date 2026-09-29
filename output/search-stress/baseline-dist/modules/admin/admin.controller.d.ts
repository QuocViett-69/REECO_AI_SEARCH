import { type ProductDetail, type ProductListQuery, type ProductListResponse } from '@reeco/shared';
import { ProductsService } from '../products/products.service';
export declare class AdminController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(query: ProductListQuery): Promise<ProductListResponse>;
    get(productId: string): Promise<ProductDetail>;
    update(productId: string, updates: Record<string, any>): Promise<ProductDetail>;
}
