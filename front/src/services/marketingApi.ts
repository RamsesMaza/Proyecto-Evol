import { api as http } from './httpClient';

const BASE = '/api/marketing';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(BASE, path, options);
}

/* ───── Dashboard ───── */
export interface MarketingDashboardStats {
  totalLeads: number; newLeads: number; convertedLeads: number; conversionRate: number;
  activeCampaigns: number; finishedCampaigns: number; campaignRevenue: number;
  recentActivity: any[];
}

export function fetchMarketingDashboard(): Promise<MarketingDashboardStats> {
  return api('/dashboard');
}

/* ───── Leads ───── */
export interface Lead {
  id: number; campaignId: number | null; name: string; email: string | null;
  phone: string | null; company: string | null; position: string | null;
  source: string; status: string; priority: string;
  assignedTo: number | null; notes: string | null; observations: string | null;
  contactedAt: string | null; convertedAt: string | null;
  createdAt: string; updatedAt: string;
  campaign?: { id: number; name: string } | null;
  activities?: any[];
}

export function fetchLeads(params?: Record<string, string>): Promise<{ leads: Lead[]; total: number; page: number; pageSize: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/leads${qs}`);
}

export function fetchLead(id: number): Promise<Lead> {
  return api(`/leads/${id}`);
}

export function createLead(data: any): Promise<Lead> {
  return api('/leads', { method: 'POST', body: JSON.stringify(data) });
}

export function updateLead(id: number, data: any): Promise<Lead> {
  return api(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteLead(id: number): Promise<any> {
  return api(`/leads/${id}`, { method: 'DELETE' });
}

export function addLeadActivity(id: number, data: any): Promise<any> {
  return api(`/leads/${id}/activity`, { method: 'POST', body: JSON.stringify(data) });
}

/* ───── Campaigns ───── */
export interface Campaign {
  id: number; name: string; description: string | null; objective: string | null;
  budget: number; spent: number;
  startDate: string | null; endDate: string | null;
  status: string; type: string; assignedTo: number | null;
  createdAt: string; updatedAt: string;
  _count?: { leads: number; emailCampaigns: number; smsCampaigns: number };
  results?: any[];
  leads?: Lead[];
  emailCampaigns?: any[];
  smsCampaigns?: any[];
}

export function fetchCampaigns(params?: Record<string, string>): Promise<{ campaigns: Campaign[]; total: number; page: number; pageSize: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/campaigns${qs}`);
}

export function fetchCampaign(id: number): Promise<Campaign> {
  return api(`/campaigns/${id}`);
}

export function createCampaign(data: any): Promise<Campaign> {
  return api('/campaigns', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCampaign(id: number, data: any): Promise<Campaign> {
  return api(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteCampaign(id: number): Promise<any> {
  return api(`/campaigns/${id}`, { method: 'DELETE' });
}

export function recordCampaignResult(id: number, data: any): Promise<any> {
  return api(`/campaigns/${id}/results`, { method: 'POST', body: JSON.stringify(data) });
}

/* ───── Email Campaigns ───── */
export function fetchEmailCampaigns(campaignId?: number): Promise<{ campaigns: any[] }> {
  const qs = campaignId ? `?campaignId=${campaignId}` : '';
  return api(`/email-campaigns${qs}`);
}

export function createEmailCampaign(data: any): Promise<any> {
  return api('/email-campaigns', { method: 'POST', body: JSON.stringify(data) });
}

export function updateEmailCampaign(id: number, data: any): Promise<any> {
  return api(`/email-campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

/* ───── SMS Campaigns ───── */
export function fetchSmsCampaigns(campaignId?: number): Promise<{ campaigns: any[] }> {
  const qs = campaignId ? `?campaignId=${campaignId}` : '';
  return api(`/sms-campaigns${qs}`);
}

export function createSmsCampaign(data: any): Promise<any> {
  return api('/sms-campaigns', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSmsCampaign(id: number, data: any): Promise<any> {
  return api(`/sms-campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

/* ───── Segments ───── */
export interface Segment {
  id: number; name: string; description: string | null; criteria: string | null;
  createdBy: number | null; createdAt: string; updatedAt: string;
  _count?: { members: number };
  creator?: { id: number; firstName: string; lastName: string } | null;
  members?: Array<{ user: { id: number; firstName: string; lastName: string; email: string; phone: string | null; company: string | null; status: string; createdAt: string } }>;
}

export function fetchSegments(): Promise<{ segments: Segment[] }> {
  return api('/segments');
}

export function fetchSegment(id: number): Promise<Segment> {
  return api(`/segments/${id}`);
}

export function createSegment(data: any): Promise<Segment> {
  return api('/segments', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteSegment(id: number): Promise<any> {
  return api(`/segments/${id}`, { method: 'DELETE' });
}

export function evaluateSegment(id: number): Promise<{ segment: Segment; members: any[]; count: number }> {
  return api(`/segments/${id}/evaluate`, { method: 'POST' });
}

/* ───── Reports ───── */
export interface MarketingReports {
  leadsByStatus: Array<{ status: string; _count: number }>;
  campaignsByStatus: Array<{ status: string; _count: number }>;
  monthlyLeads: Array<{ month: string; total: number; converted: number }>;
  totalRevenue: number; totalConverted: number; totalLeadsGenerated: number;
  topCampaigns: Campaign[];
}

export function fetchMarketingReports(params?: Record<string, string>): Promise<MarketingReports> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/reports${qs}`);
}
