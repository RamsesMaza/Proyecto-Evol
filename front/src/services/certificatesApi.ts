import { api as http } from './httpClient';

const BASE = '/api/certificates';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(BASE, path, options);
}

export interface Certificate {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  imageUrl: string | null;
  course: string | null;
  hours: number | null;
  credentialId: string;
  createdBy: number | null;
  createdAt: string;
  user?: { id: number; firstName: string; lastName: string; email: string };
  creator?: { id: number; firstName: string; lastName: string } | null;
}

export interface CertListResponse {
  certificates: Certificate[];
  total: number;
  page: number;
  pageSize: number;
}

export function fetchCertificates(params?: Record<string, string>): Promise<CertListResponse> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/${qs}`);
}

export function fetchMyCertificates(): Promise<Certificate[]> {
  return api('/me/own');
}

export function createCertificate(data: {
  userId: number; title: string; description?: string; issuer?: string;
  expiryDate?: string; imageUrl?: string; course?: string; hours?: number;
}): Promise<Certificate> {
  return api('/', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteCertificate(id: number): Promise<any> {
  return api(`/${id}`, { method: 'DELETE' });
}

export interface CertUser {
  id: number; firstName: string; lastName: string; email: string;
}

export function fetchCertUsers(search?: string): Promise<{ users: CertUser[] }> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return api(`/users${qs}`);
}
