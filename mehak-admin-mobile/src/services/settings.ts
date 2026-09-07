import { apiFetch } from '../api/client';
import { BusinessSettings } from '../types';

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    return apiFetch<BusinessSettings>('/api/settings', { method: 'GET', requiresAuth: false });
  },

  async updateSettings(settingsData: Partial<BusinessSettings>): Promise<BusinessSettings> {
    return apiFetch<BusinessSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },
};
