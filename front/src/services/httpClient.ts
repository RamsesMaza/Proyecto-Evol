import { refreshToken as refreshApi } from './authApi';

let accessToken: string | null = localStorage.getItem('accessToken');
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

function authHeaders(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function tryRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const result = await refreshApi();
      setAccessToken(result.accessToken);
      return result.accessToken;
    } catch {
      setAccessToken(null);
      localStorage.removeItem('user');
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function redirectLogin() {
  setAccessToken(null);
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export async function api<T>(base: string, path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options?.headers },
  });

  if (res.status === 401 && accessToken) {
    const newToken = await tryRefresh();
    if (newToken) {
      // Retry original request with new token
      const retryRes = await fetch(`${base}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...{ Authorization: `Bearer ${newToken}` }, ...options?.headers },
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: 'Error de conexión' }));
        if (retryRes.status === 401) redirectLogin();
        throw new Error(err.error || `Error ${retryRes.status}`);
      }
      return retryRes.json();
    }
    redirectLogin();
    throw new Error('Sesión expirada. Redirigiendo al login...');
  }

  if (res.status === 401) {
    redirectLogin();
    throw new Error('Sesión expirada');
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

  if (res.status === 401 && accessToken) {
    const newToken = await tryRefresh();
    if (newToken) {
      const retryRes = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${newToken}` },
        body: formData,
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: 'Error de conexión' }));
        if (retryRes.status === 401) redirectLogin();
        throw new Error(err.error || `Error ${retryRes.status}`);
      }
      return retryRes.json();
    }
    redirectLogin();
    throw new Error('Sesión expirada');
  }

  if (res.status === 401) {
    redirectLogin();
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}
