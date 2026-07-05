import type { Cotizacion, CotizacionStats, CotizacionFormData, FilterPreset, SortField, SortDir } from '../components/SalesPanel/Cotizaciones/types';
import { api as http } from './httpClient';

const BASE = '/api/cotizaciones';

export async function fetchCotizaciones(params: {
  query?: string;
  estado?: FilterPreset;
  page?: number;
  pageSize?: number;
  sortField?: SortField;
  sortDir?: SortDir;
}): Promise<{ cotizaciones: Cotizacion[]; total: number; page: number; pageSize: number }> {
  const sp = new URLSearchParams();
  if (params.query) sp.set('query', params.query);
  if (params.estado) sp.set('estado', params.estado);
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.pageSize !== undefined) sp.set('pageSize', String(params.pageSize));
  if (params.sortField) sp.set('sortField', params.sortField);
  if (params.sortDir) sp.set('sortDir', params.sortDir);
  return http(BASE, `?${sp.toString()}`);
}

export async function fetchCotizacion(id: number): Promise<Cotizacion> {
  return http(BASE, `/${id}`);
}

export async function createCotizacion(data: CotizacionFormData): Promise<Cotizacion> {
  return http(BASE, '', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCotizacion(id: number, data: Partial<CotizacionFormData>): Promise<Cotizacion> {
  return http(BASE, `/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteCotizacion(id: number): Promise<void> {
  await http(BASE, `/${id}`, { method: 'DELETE' });
}

export async function fetchCotizacionesStats(): Promise<CotizacionStats> {
  return http(BASE, '/stats');
}

/** @deprecated Use fetchCotizacionesStats */
export const fetchCotizacionStats = fetchCotizacionesStats;

export async function fetchCotizacionVersions(id: number): Promise<{ versions: any[] }> {
  return http(BASE, `/${id}/versions`);
}

export async function restoreCotizacionVersion(id: number, versionId: number): Promise<Cotizacion> {
  return http(BASE, `/${id}/versions/${versionId}/restore`, { method: 'POST' });
}
