import { API_BASE_URL, getStoredToken } from '../api/client';

export interface UploadResponse {
  url: string;
  name: string;
}

export const uploadService = {
  async uploadImage(imageUri: string, mimeType: string = 'image/jpeg', filename: string = 'product_image.jpg'): Promise<UploadResponse> {
    const token = await getStoredToken();

    let fileToAppend: any;

    try {
      // In Expo SDK 57 / React Native 0.86, check if standard Web File constructor is available
      if (typeof File !== 'undefined') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        fileToAppend = new File([blob], filename, { type: mimeType });
      } else {
        // Fallback for native React Native FormData file part (never mutate read-only Blob properties)
        fileToAppend = {
          uri: imageUri,
          name: filename,
          type: mimeType,
        };
      }
    } catch (e) {
      console.warn('[UploadService] Falling back to React Native file object:', e);
      fileToAppend = {
        uri: imageUri,
        name: filename,
        type: mimeType,
      };
    }

    const formData = new FormData();
    formData.append('file', fileToAppend);

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
