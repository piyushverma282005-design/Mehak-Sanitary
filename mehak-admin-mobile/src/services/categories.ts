import { apiFetch } from '../api/client';
import { Category } from '../types';

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    return apiFetch<Category[]>(`/api/categories?_t=${Date.now()}`, {
      method: 'GET',
      requiresAuth: false,
      headers: {
        'Cache-Control': 'no-cache, no-store',
      },
    });
  },

  async createCategory(categoryData: { name: string; slug?: string; description?: string }): Promise<Category> {
    return apiFetch<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  async updateCategory(id: string, categoryData: { name: string; slug?: string; description?: string }): Promise<Category> {
    return apiFetch<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
