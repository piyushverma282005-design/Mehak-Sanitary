import { Platform } from 'react-native';
import { File as ExpoFile, UploadType } from 'expo-file-system';
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

    // 1. Native Mobile (Android & iOS in Expo Go):
    // Use Expo SDK 57's native FileSystem UploadTask.
    // This executes native OkHttp multipart file streaming directly on Android,
    // completely bypassing Expo C++ fetch(), JavaScript FormData, and Hermes Blob getter limitations.
    if (Platform.OS !== 'web') {
      try {
        const file = new ExpoFile(imageUri);
        const task = file.createUploadTask(url, {
          uploadType: UploadType.MULTIPART,
          fieldName: 'file',
          mimeType: cleanMimeType,
          headers,
        });

        const result = await task.uploadAsync();

        let data: any = {};
        try {
          data = JSON.parse(result.body || '{}');
        } catch {
          data = {};
        }

        if (result.status < 200 || result.status >= 300) {
          throw new Error(data?.error || `Upload failed with status ${result.status}`);
        }

        return data as UploadResponse;
      } catch (nativeErr: any) {
        console.warn('[UploadService] Native UploadTask error, trying fallback:', nativeErr?.message || nativeErr);
        // If native UploadTask throws, fall through to XMLHttpRequest fallback below
      }
    }

    // 2. Web or Universal Fallback:
    // XMLHttpRequest routes directly through the network layer without invoking Expo's C++ fetch validator.
    return new Promise<UploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      xhr.setRequestHeader('Accept', 'application/json');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data as UploadResponse);
          } else {
            reject(new Error(data?.error || `Upload failed with status ${xhr.status}`));
          }
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during image upload. Please check connection.'));
      };

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: cleanFileName,
        type: cleanMimeType,
      } as any);

      xhr.send(formData);
    });
  },
};
