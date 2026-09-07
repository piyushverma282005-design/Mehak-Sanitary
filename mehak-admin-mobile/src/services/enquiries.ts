import { apiFetch } from '../api/client';
import { Enquiry, EnquiryStatus } from '../types';

export const enquiriesService = {
  async getEnquiries(params?: { status?: string; businessType?: string; enquiryType?: string }): Promise<Enquiry[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      query.append('status', params.status);
    }
    if (params?.businessType && params.businessType !== 'all') {
      query.append('businessType', params.businessType);
    }
    if (params?.enquiryType && params.enquiryType !== 'all') {
      query.append('enquiryType', params.enquiryType);
    }

    const endpoint = `/api/enquiries${query.toString() ? `?${query.toString()}` : ''}`;
    return apiFetch<Enquiry[]>(endpoint, { method: 'GET' });
  },

  async getEnquiry(id: string): Promise<Enquiry> {
    return apiFetch<Enquiry>(`/api/enquiries/${id}`, { method: 'GET' });
  },

  async updateStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
    return apiFetch<Enquiry>(`/api/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteEnquiry(id: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/api/enquiries/${id}`, {
      method: 'DELETE',
    });
  },
};
