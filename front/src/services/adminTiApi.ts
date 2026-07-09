import { api as http } from './httpClient';

const BASE = '/api/admin-ti';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(BASE, path, options);
}

/* Dashboard */
export interface TiDashboardStats {
  total: number; activos: number; bloqueados: number; inactivos: number;
  admins: number; sales: number; users: number; tis: number;
  activeSessions: number;
  loginStats: { total: number; failed: number; last24h: number; successRate: number };
  ticketStats: { abiertos: number; enProgreso: number; resueltos: number; cerrados: number; total: number };
  recentActivity: any[];
  orderStats: { total: number; paid: number; pending: number; cancelled: number; ingresos: number; esteMes: number };
  newUsersThisMonth: number;
  newUsersToday: number;
  salesToday: number;
  salesThisMonth: number;
  totalClientes: number;
  newClientesThisMonth: number;
  last7Orders: any[];
  charts: { salesByDay: any[]; userGrowth: any[]; dailyLogins: any[] };
}

export function fetchTiDashboardStats(): Promise<TiDashboardStats> {
  return api('/dashboard/stats');
}

/* Finanzas */
export interface FinanzasData {
  revenue: {
    total: number; thisMonth: number; today: number;
    lastMonth: number; averageOrder: number; paidOrders: number;
  };
  paymentMethods: Array<{ method: string; count: number; total: number }>;
  financials: {
    taxCollected: number; discountsGiven: number;
    shippingCollected: number; refunded: number;
  };
  monthlyRevenue: Array<{ month: string; total: number; count: number; tax: number }>;
  topProducts: Array<{ productId: number; productName: string; quantity: number; revenue: number }>;
  cotizaciones: {
    projectedRevenue: number; pendingRevenue: number;
    total: number; approvedCount: number; pendingCount: number; conversionRate: number;
  };
}

export function fetchFinanzas(): Promise<FinanzasData> {
  return api('/finanzas');
}

/* Users */
export interface TiUser {
  id: number; firstName: string; lastName: string; email: string;
  phone: string; company: string; role: string; status: string;
  isFavorite: boolean; createdAt: string; updatedAt: string;
}

export function fetchTiUsers(params?: Record<string, string>): Promise<{ users: TiUser[]; total: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/users${qs}`);
}

export function fetchTiUser(id: number): Promise<TiUser> {
  return api(`/users/${id}`);
}

export function createTiUser(data: any): Promise<TiUser> {
  return api('/users', { method: 'POST', body: JSON.stringify(data) });
}

export function updateTiUser(id: number, data: any): Promise<TiUser> {
  return api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function changeUserStatus(id: number, status: string): Promise<TiUser> {
  return api(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function changeUserRole(id: number, role: string): Promise<TiUser> {
  return api(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}

export function resetUserPassword(id: number, newPassword: string): Promise<{ message: string }> {
  return api(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) });
}

export function fetchUserActivity(id: number): Promise<{ logs: any[] }> {
  return api(`/users/${id}/activity`);
}

export function deleteTiUser(id: number): Promise<{ message: string }> {
  return api(`/users/${id}`, { method: 'DELETE' });
}

export function fetchUserLoginHistory(id: number): Promise<{ attempts: any[] }> {
  return api(`/users/${id}/login-history`);
}

/* Permissions */
export interface Permission {
  id: number; name: string; slug: string; description: string; module: string;
}

export function fetchPermissions(): Promise<{ permissions: Permission[] }> {
  return api('/permissions');
}

export function fetchRolePermissions(role: string): Promise<{ permissions: any[] }> {
  return api(`/permissions/role/${role}`);
}

export function assignPermission(role: string, permissionId: number): Promise<any> {
  return api('/permissions/assign', { method: 'POST', body: JSON.stringify({ role, permissionId }) });
}

export function removePermission(role: string, permissionId: number): Promise<any> {
  return api('/permissions/remove', { method: 'POST', body: JSON.stringify({ role, permissionId }) });
}

export function createPermission(data: any): Promise<Permission> {
  return api('/permissions', { method: 'POST', body: JSON.stringify(data) });
}

/* Audit */
export function fetchAuditLogs(params?: Record<string, string>): Promise<{ logs: any[]; total: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/audit${qs}`);
}

export function fetchRecentAuditLogs(): Promise<{ logs: any[] }> {
  return api('/audit/recent');
}

/* Support Tickets */
export interface SupportTicket {
  id: number; title: string; description: string; status: string; priority: string;
  createdById: number; assignedToId: number | null;
  createdBy: { id: number; firstName: string; lastName: string; email: string } | null;
  assignedTo: { id: number; firstName: string; lastName: string; email: string } | null;
  resolution: string | null; createdAt: string; updatedAt: string;
}

export function fetchSupportTickets(params?: Record<string, string>): Promise<{ tickets: SupportTicket[]; total: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/support-tickets${qs}`);
}

export function fetchSupportTicketStats(): Promise<{ abiertos: number; enProgreso: number; resueltos: number; cerrados: number; total: number }> {
  return api('/support-tickets/stats');
}

export function fetchSupportTicket(id: number): Promise<SupportTicket> {
  return api(`/support-tickets/${id}`);
}

export function createSupportTicket(data: any): Promise<SupportTicket> {
  return api('/support-tickets', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSupportTicket(id: number, data: any): Promise<SupportTicket> {
  return api(`/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

/* Sessions */
export interface Session {
  id: number; userId: number; token: string; ipAddress: string; userAgent: string;
  isActive: boolean; lastActivity: string; createdAt: string;
  user: { id: number; firstName: string; lastName: string; email: string; role: string };
}

export function fetchSessions(): Promise<{ sessions: Session[]; total: number }> {
  return api('/sessions');
}

export function closeSession(id: number): Promise<any> {
  return api(`/sessions/${id}`, { method: 'DELETE' });
}

/* Login Attempts */
export function fetchLoginAttempts(): Promise<{ attempts: any[] }> {
  return api('/login-attempts');
}

export function fetchLoginAttemptStats(): Promise<{ total: number; failed: number; last24h: number; successRate: number }> {
  return api('/login-attempts/stats');
}
