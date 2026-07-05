function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleRedirectIfExpired() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export async function api<T>(base: string, path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options?.headers },
  });
  if (res.status === 401) {
    handleRedirectIfExpired();
    throw new Error('Sesión expirada. Redirigiendo al login...');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

export async function apiFormData<T>(base: string, path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  if (res.status === 401) {
    handleRedirectIfExpired();
    throw new Error('Sesión expirada. Redirigiendo al login...');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}
