import { API_BASE_URL, getStoredToken } from '../api/client';

export interface UploadResponse {
  url: string;
  name: string;
}

export const uploadService = {
  async uploadImage(imageUri: string, mimeType: string = 'image/jpeg', filename: string = 'product_image.jpg'): Promise<UploadResponse> {
    const token = await getStoredToken();

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: mimeType,
      name: filename,
    } as any);

    const url = `${API_BASE_URL}/api/upload`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || `Upload failed with status ${response.status}`);
    }

    return data as UploadResponse;
  },
};
