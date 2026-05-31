import type { Cotizacion, CotizacionStats, CotizacionFormData, FilterPreset, SortField, SortDir } from '../components/SalesPanel/Cotizaciones/types';

const BASE = '/api/cotizaciones';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCotizaciones(params: {
  query?: string;
  estado?: FilterPreset;
  page?: number;
  pageSize?: number;
  sortField?: SortField;
  sortDir?: SortDir;
}): Promise<{ cotizaciones: Cotizacion[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('query', params.query);
  if (params.estado && params.estado !== 'todas') searchParams.set('estado', params.estado);
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize));
  if (params.sortField) searchParams.set('sortField', params.sortField);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);

  const res = await fetch(`${BASE}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Error al cargar cotizaciones');
  return res.json();
}

export async function fetchCotizacion(id: number): Promise<Cotizacion> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Error al cargar cotización');
  return res.json();
}

export async function createCotizacion(data: CotizacionFormData): Promise<Cotizacion> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear cotización');
  }
  return res.json();
}

export async function updateCotizacion(id: number, data: Partial<CotizacionFormData>): Promise<Cotizacion> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar cotización');
  }
  return res.json();
}

export async function updateCotizacionStatus(id: number, estado: string): Promise<Cotizacion> {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar estado');
  }
  return res.json();
}

export async function deleteCotizacion(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar cotización');
  }
}

export async function fetchCotizacionStats(): Promise<CotizacionStats> {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error('Error al cargar estadísticas');
  return res.json();
}
