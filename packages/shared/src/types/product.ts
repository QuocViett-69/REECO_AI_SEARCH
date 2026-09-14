export interface ProductSummary {
  id: string;
  productId: string;
  model: string;
  productNameEn: string;
  productNameVi?: string | null;
  category?: string | null;
  subcategory?: string | null;
  deviceType?: string | null;
  imageUrl?: string | null;
}
