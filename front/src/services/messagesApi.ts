import { api as http } from './httpClient';

const BASE = '/api/messages';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(BASE, path, options);
}

export interface MessageUser {
  id: number; firstName: string; lastName: string; email: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number | null;
  subject: string | null;
  body: string;
  read: boolean;
  parentId: number | null;
  createdAt: string;
  sender: MessageUser;
  receiver?: MessageUser | null;
}

export interface Conversation {
  user: MessageUser;
  lastMessage: Message;
  unread: number;
}

export function fetchConversations(): Promise<Conversation[]> {
  return api('/conversations');
}

export function fetchThread(userId: number): Promise<Message[]> {
  return api(`/thread/${userId}`);
}

export function sendMessage(data: { receiverId?: number; subject?: string; body: string; parentId?: number }): Promise<Message> {
  return api('/send', { method: 'POST', body: JSON.stringify(data) });
}

export function fetchUnreadCount(): Promise<{ count: number }> {
  return api('/unread');
}

export function fetchAuditors(): Promise<{ users: MessageUser[] }> {
  return api('/auditors');
}

export function fetchContacts(q?: string): Promise<{ users: MessageUser[] }> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return api(`/contacts${qs}`);
}
