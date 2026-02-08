// Use relative path so requests go through Next.js proxy (same-origin for cookies)
import { unauthorized } from 'next/navigation';

export const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    : '/api/v1';

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
    if (response.status === 401) {
      unauthorized();
    }
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(
      errorData.detail || `API Error: ${response.statusText}`,
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}
