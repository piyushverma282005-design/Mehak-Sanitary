import { apiFetch, setStoredToken, removeStoredToken } from '../api/client';
import { AdminUser } from '../types';

export interface LoginResponse {
  message: string;
  token?: string;
  user?: AdminUser;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    });

    if (data.token) {
      await setStoredToken(data.token);
    }

    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      await removeStoredToken();
    }
  },

  async getMe(): Promise<{ authenticated: boolean; user?: AdminUser }> {
    return apiFetch<{ authenticated: boolean; user?: AdminUser }>('/api/auth/me', {
      method: 'GET',
    });
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },
};
