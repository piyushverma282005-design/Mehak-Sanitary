import * as SecureStore from 'expo-secure-store';

export const PRODUCTION_API_URL = 'https://mehak-sanitary.vercel.app';

// Always resolve to the production Vercel backend URL for physical Android devices,
// preventing localhost / 127.0.0.1 / 10.0.2.2 errors.
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (
    envUrl &&
    !envUrl.includes('localhost') &&
    !envUrl.includes('127.0.0.1') &&
    !envUrl.includes('10.0.2.2')
  ) {
    return envUrl.replace(/\/+$/, '');
  }
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

export const TOKEN_KEY = 'mehak_admin_token';

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('[SecureStore] Failed to read auth token:', error);
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('[SecureStore] Failed to store auth token:', error);
  }
}

export async function removeStoredToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('[SecureStore] Failed to remove auth token:', error);
  }
}

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  timeoutMs?: number;
}

export async function apiFetch<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, timeoutMs = 15000, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getStoredToken();
    if (token) {
      // Send both Authorization Bearer header and Cookie for maximum backend compatibility
      requestHeaders['Authorization'] = `Bearer ${token}`;
      requestHeaders['Cookie'] = `admin_session=${token}`;
    } else {
      console.warn(`[API AUTH] Warning: Authenticated request to "${endpoint}" called without stored token.`);
    }
  }

  const cleanEndpoint = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const method = (rest.method || 'GET').toUpperCase();
  console.log(`[API REQ] ${method} ${cleanEndpoint}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(cleanEndpoint, {
      ...rest,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timer);
    console.log(`[API RES] ${response.status} ${cleanEndpoint}`);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP Error ${response.status}`;
      console.warn(`[API ERR] ${response.status} ${cleanEndpoint}:`, errorMessage);
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.details = data?.details;
      throw error;
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.status) {
      throw error;
    }
    const msg = error.name === 'AbortError'
      ? `Request timed out after ${timeoutMs / 1000}s. Please check internet connection.`
      : error.message || 'Unable to connect to Mehak server.';
    console.error(`[API FAIL] ${cleanEndpoint}:`, msg);
    throw new Error(msg);
  }
}
