import { api as http } from './httpClient';

const BASE = '/api/notifications';

export interface Notification {
  id: number; userId?: number | null; type: string; title: string;
  message?: string | null; icon?: string | null; link?: string | null;
  readAt?: string | null; createdAt: string;
}

export async function fetchMyNotifications(params?: { type?: string; read?: string; page?: number; pageSize?: number }): Promise<{ notifications: Notification[]; total: number }> {
  const sp = new URLSearchParams();
  if (params?.type) sp.set('type', params.type);
  if (params?.read) sp.set('read', params.read);
  if (params?.page !== undefined) sp.set('page', String(params.page));
  if (params?.pageSize !== undefined) sp.set('pageSize', String(params.pageSize));
  return http(`${BASE}/mine?${sp.toString()}`, '');
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const data = await http<{ count: number }>(BASE, '/unread-count');
    return data.count ?? 0;
  } catch { return 0; }
}

export async function markNotificationRead(id: number): Promise<void> {
  await http(BASE, `/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await http(BASE, '/mark-all-read', { method: 'POST' });
}

export async function deleteNotification(id: number): Promise<void> {
  await http(BASE, `/${id}`, { method: 'DELETE' });
}
