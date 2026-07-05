const API_URL = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error' }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

export async function refreshToken(): Promise<{ accessToken: string; refreshToken: string; user: any }> {
  return request('/api/auth/refresh', { method: 'POST' });
}

export async function logout(): Promise<void> {
  await request('/api/auth/logout', { method: 'POST' });
}

export async function login(email: string, password: string, captchaToken?: string) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, captchaToken }),
  });
}
