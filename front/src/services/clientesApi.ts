import type { Cliente, ClienteStats, FilterPreset } from '../components/SalesPanel/Clientes/types';
import { api as http } from './httpClient';

const BASE = '/api/users/clientes';

function parseCliente(c: any): Cliente {
  return {
    ...c,
    id: String(c.id),
    tags: c.tags || [],
    createdAt: typeof c.createdAt === 'string' ? c.createdAt.split('T')[0] : c.createdAt,
    updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt.split('T')[0] : c.updatedAt,
  };
}

export async function fetchClientes(params: {
  search?: string; query?: string; tag?: string; orderBy?: string; dir?: string;
  page?: number; pageSize?: number; filter?: FilterPreset; status?: string;
}): Promise<{ clientes: Cliente[]; total: number; page: number; pageSize: number; stats: ClienteStats }> {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.query && !params.search) sp.set('query', params.query);
  if (params.tag) sp.set('tag', params.tag);
  if (params.orderBy) sp.set('orderBy', params.orderBy);
  if (params.dir) sp.set('dir', params.dir);
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.pageSize !== undefined) sp.set('pageSize', String(params.pageSize));
  if (params.filter) sp.set('filter', params.filter);
  if (params.status && !params.filter) sp.set('status', params.status);
  const data: any = await http(BASE, `?${sp.toString()}`);
  return { ...data, clientes: (data.clientes || []).map(parseCliente) };
}

export async function fetchCliente(id: number | string): Promise<Cliente> {
  const data: any = await http(BASE, `/${id}`);
  return parseCliente(data);
}

export async function createCliente(data: any): Promise<Cliente> {
  const res: any = await http(BASE, '', { method: 'POST', body: JSON.stringify(data) });
  return parseCliente(res);
}

export async function updateCliente(id: number | string, data: any): Promise<Cliente> {
  const res: any = await http(BASE, `/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return parseCliente(res);
}

export async function deleteCliente(id: number | string): Promise<void> {
  await http(BASE, `/${id}`, { method: 'DELETE' });
}

export async function fetchClientesStats(): Promise<ClienteStats> {
  return http(BASE, '/stats');
}

/** @deprecated Use fetchClientesStats */
export const fetchClienteStats = fetchClientesStats;

export async function updateMyProfile(data: { phone?: string; company?: string }): Promise<any> {
  return http('/api/users', '/profile', { method: 'PUT', body: JSON.stringify(data) });
}
