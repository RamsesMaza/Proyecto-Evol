import type { Cotizacion } from '../components/SalesPanel/Cotizaciones/types';
import { api as http } from './httpClient';

const BASE = '/api/orders';

export interface OrderStats {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
  ingresos: number;
  esteMes: number;
}

export async function fetchOrders(params: {
  query?: string; estado?: string; page?: number; pageSize?: number;
  sortField?: string; sortDir?: string;
}): Promise<{ orders: Cotizacion[]; total: number; page: number; pageSize: number }> {
  const sp = new URLSearchParams();
  if (params.query) sp.set('query', params.query);
  if (params.estado) sp.set('estado', params.estado);
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.pageSize !== undefined) sp.set('pageSize', String(params.pageSize));
  if (params.sortField) sp.set('sortField', params.sortField);
  if (params.sortDir) sp.set('sortDir', params.sortDir);
  return http(BASE, `?${sp.toString()}`);
}

export async function fetchOrderStats(): Promise<OrderStats> {
  return http(BASE, '/stats');
}

export async function updateOrderStatus(id: number, estado: string): Promise<Cotizacion> {
  return http(BASE, `/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}
