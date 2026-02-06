// Use relative path so requests go through Next.js proxy (same-origin for cookies)
export const API_BASE_URL = '/api/v1';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { headers, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.statusText}`);
  }

  return response.json();
}
