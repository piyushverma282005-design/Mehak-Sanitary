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
      // In React Native / Expo SDK 57, fetching local file URI into Blob/File object
      // creates a native FormDataPart binary stream that prevents 'Unsupported FormDataPart implementation' errors.
      const response = await fetch(imageUri);
      const blob = await response.blob();
      if (typeof File !== 'undefined') {
        fileToAppend = new File([blob], filename, { type: mimeType });
      } else {
        fileToAppend = Object.assign(blob, {
          name: filename,
          type: mimeType,
        });
      }
    } catch (e) {
      console.warn('[UploadService] Falling back to standard RN file object:', e);
      fileToAppend = {
        uri: imageUri,
        type: mimeType,
        name: filename,
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
