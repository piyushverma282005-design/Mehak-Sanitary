import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL, getStoredToken } from '../api/client';

export interface UploadResponse {
  url: string;
  name: string;
}

export const uploadService = {
  async uploadImage(
    imageUri: string,
    mimeType: string = 'image/jpeg',
    filename: string = 'product_image.jpg'
  ): Promise<UploadResponse> {
    const token = await getStoredToken();

    const cleanFileName = filename || `upload_${Date.now()}.jpg`;
    const cleanMimeType = mimeType || 'image/jpeg';
    const url = `${API_BASE_URL}/api/upload`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Strategy 1: Use Expo's native legacy uploadAsync in Expo Go.
    // This delegates the multipart upload directly to Android's native ExponentFileSystemModule via OkHttp,
    // avoiding all JavaScript FormData and C++ fetch parsing issues.
    try {
      if (FileSystem && typeof FileSystem.uploadAsync === 'function') {
        const result = await FileSystem.uploadAsync(url, imageUri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          mimeType: cleanMimeType,
          headers,
        });

        let data: any = {};
        try {
          data = JSON.parse(result.body || '{}');
        } catch {
          data = {};
        }

        if (result.status >= 200 && result.status < 300 && data.url) {
          return data as UploadResponse;
        }

        if (result.status >= 400) {
          throw new Error(data?.error || `Upload failed with status ${result.status}`);
        }
      }
    } catch (fsErr: any) {
      console.warn('[UploadService] FileSystem.uploadAsync error, trying WinterCG Blob upload:', fsErr?.message || fsErr);
    }

    // Strategy 2: WinterCG compliant FormData upload.
    // In WinterCG/Web standards, files are attached using formData.append(name, blob, filename).
    // This passes a true Blob (with filename as 3rd parameter), completely avoiding { uri, name, type }
    // which causes 'Unsupported FormDataPart implementation', and avoiding new File() which has Hermes getter issues.
    try {
      const fileResponse = await fetch(imageUri);
      const rawBlob = await fileResponse.blob();

      // Ensure proper MIME type using standard W3C Blob.slice without mutating properties
      const blob = rawBlob.type === cleanMimeType ? rawBlob : rawBlob.slice(0, rawBlob.size, cleanMimeType);

      const formData = new FormData();
      // Notice: 3rd argument is cleanFileName as per W3C specification
      formData.append('file', blob, cleanFileName);

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
    } catch (fetchErr: any) {
      console.error('[UploadService] WinterCG upload error:', fetchErr);
      throw new Error(fetchErr?.message || 'Failed to upload image.');
    }
  },
};
