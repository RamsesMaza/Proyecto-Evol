import { api as http } from './httpClient';

const BASE = '/api/products';

export interface ProductData {
  id: number; title: string; name?: string; description?: string; fullDescription?: string;
  price: number; oldPrice?: number | null; categoryId: number; category?: { id: number; name: string };
  image?: string | null; stock: number; isNew: boolean; isFeatured: boolean; isOffer: boolean;
  rating: number; reviewCount: number;
  images: string[]; specs?: { label: string; value: string }[];
  createdAt: string;
}

export interface CategoryData {
  id: number; name: string; slug?: string; _count?: { products: number };
}

export interface ProductFormData {
  title: string; name?: string; description?: string; fullDescription?: string;
  price: number; oldPrice?: number | null; categoryId: number;
  image?: string | null; stock: number;
  isNew: boolean; isFeatured: boolean; isOffer: boolean;
  images?: string[]; specs?: { key: string; value: string }[];
}

export async function fetchProducts(params: {
  search?: string; categoryId?: string; page?: number; limit?: number; sort?: string;
}): Promise<{ products: ProductData[]; pagination: { total: number; page: number; totalPages: number } }> {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.categoryId) sp.set('categoryId', params.categoryId);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.sort) sp.set('sort', params.sort);
  return http(BASE, `?${sp.toString()}`);
}

export async function fetchProduct(id: number): Promise<ProductData> {
  return http(BASE, `/${id}`);
}

export async function createProduct(data: ProductFormData): Promise<ProductData> {
  return http(BASE, '', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: number, data: Partial<ProductFormData>): Promise<ProductData> {
  return http(BASE, `/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  await http(BASE, `/${id}`, { method: 'DELETE' });
}

export async function fetchCategories(): Promise<CategoryData[]> {
  return http('/api/categories', '');
}
