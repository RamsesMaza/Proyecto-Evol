import type { Cotizacion } from '../components/SalesPanel/Cotizaciones/types';

const BASE = '/api/orders';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface OrderStats {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
  ingresos: number;
  esteMes: number;
}

export async function fetchOrders(params: {
  query?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDir?: string;
}): Promise<{ orders: Cotizacion[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('query', params.query);
  if (params.status) searchParams.set('status', params.status);
  if (params.paymentStatus) searchParams.set('paymentStatus', params.paymentStatus);
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize));
  if (params.sortField) searchParams.set('sortField', params.sortField);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);

  const res = await fetch(`${BASE}?${searchParams.toString()}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al cargar pedidos');
  return res.json();
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const res = await fetch(`${BASE}/stats`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Error al cargar estadísticas de pedidos');
  return res.json();
}
