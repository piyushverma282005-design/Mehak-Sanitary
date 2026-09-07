import { apiFetch } from '../api/client';
import { Product } from '../types';

export const productsService = {
  async getProducts(params?: { category?: string; search?: string; featured?: boolean }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') {
      query.append('category', params.category);
    }
    if (params?.search) {
      query.append('search', params.search);
    }
    if (params?.featured) {
      query.append('featured', 'true');
    }

    const endpoint = `/api/products${query.toString() ? `?${query.toString()}` : ''}`;
    return apiFetch<Product[]>(endpoint, { method: 'GET', requiresAuth: false });
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    return apiFetch<Product>(`/api/products/${idOrSlug}`, { method: 'GET', requiresAuth: false });
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    return apiFetch<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return apiFetch<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },
};
