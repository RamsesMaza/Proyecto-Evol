import type { Cliente, ClienteStats, FilterPreset } from '../components/SalesPanel/Clientes/types';

const BASE = '/api/users/clientes';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseCliente(c: any): Cliente {
  return {
    ...c,
    id: String(c.id),
    tags: c.tags || [],
    createdAt: typeof c.createdAt === 'string' ? c.createdAt.split('T')[0] : c.createdAt,
    updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt.split('T')[0] : c.updatedAt,
    ultimaCompra: c.ultimaCompra ? (typeof c.ultimaCompra === 'string' ? c.ultimaCompra.split('T')[0] : c.ultimaCompra) : null,
    activity: (c.activity || []).map((a: any) => ({
      ...a,
      date: typeof a.date === 'string' ? a.date.split('T')[0] : a.date,
    })),
    cotizaciones: (c.cotizaciones || []).map((cq: any) => ({
      ...cq,
      date: typeof cq.date === 'string' ? cq.date.split('T')[0] : cq.date,
    })),
    notas: (c.notas || []).map((n: any) => ({
      ...n,
      date: typeof n.date === 'string' ? n.date.split('T')[0] : n.date,
    })),
  };
}

export async function fetchClientes(params: {
  query?: string;
  status?: FilterPreset;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
}): Promise<{ clientes: Cliente[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('query', params.query);
  if (params.status && params.status !== 'todos') searchParams.set('status', params.status);
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize));
  if (params.sortField) searchParams.set('sortField', params.sortField);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);

  const res = await fetch(`${BASE}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Error al cargar clientes');
  const data = await res.json();
  return {
    clientes: data.clientes.map(parseCliente),
    total: data.total,
  };
}

export async function updateCliente(id: number, data: { status?: string; isFavorite?: boolean }): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar cliente');
  }
}

export async function fetchClienteStats(): Promise<ClienteStats> {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error('Error al cargar estadísticas');
  return res.json();
}

export async function updateMyProfile(data: { phone?: string; company?: string; firstName?: string; lastName?: string }): Promise<{ id: string; firstName: string; lastName: string; email: string; phone: string; company: string }> {
  const res = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar perfil');
  }
  return res.json();
}
