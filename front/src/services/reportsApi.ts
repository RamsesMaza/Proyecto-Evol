import { api as http } from './httpClient';

const BASE = '/api/reports';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(BASE, path, options);
}

export interface GeneralReport {
  usersByRole: Array<{ role: string; _count: number }>;
  newUsers: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalQuotes: number;
}

export function fetchGeneral(params?: Record<string, string>): Promise<GeneralReport> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/general${qs}`);
}

export function fetchUserGrowth(params?: Record<string, string>): Promise<Array<{ month: string; total: number }>> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/user-growth${qs}`);
}

export interface LeadReport {
  byStatus: Array<{ status: string; _count: number }>;
  byCampaign: Array<{ campaignId: number | null; campaignName: string; _count: number }>;
  total: number;
}

export function fetchLeadReports(params?: Record<string, string>): Promise<LeadReport> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/leads${qs}`);
}

export function fetchLeadTrend(params?: Record<string, string>): Promise<Array<{ month: string; total: number; converted: number }>> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/lead-trend${qs}`);
}

export interface CampaignReport {
  byStatus: Array<{ status: string; _count: number }>;
  byType: Array<{ type: string; _count: number }>;
  top: Array<{ id: number; name: string; status: string; type: string; budget: number; spent: number; leadsCount: number; revenue: number }>;
  totals: { revenue: number; leadsGenerated: number; leadsConverted: number; impressions: number; clicks: number };
}

export function fetchCampaignReports(params?: Record<string, string>): Promise<CampaignReport> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/campaigns${qs}`);
}

export interface RevenueReport {
  totalOrders: number;
  totalQuotes: number;
  totalCampaignRevenue: number;
  orderCount: number;
  quoteCount: number;
  pendingQuotes: number;
  approvedQuotes: number;
  byCampaign: Array<{ campaignName: string; revenue: number; leadsGenerated: number; leadsConverted: number }>;
}

export function fetchRevenueReports(params?: Record<string, string>): Promise<RevenueReport> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/revenue${qs}`);
}

export interface ActivityReport {
  byAction: Array<{ action: string; _count: number }>;
  byEntity: Array<{ entity: string; _count: number }>;
  recent: Array<{ id: number; action: string; entity: string; entityId: string | null; description: string | null; userName: string | null; createdAt: string }>;
}

export function fetchActivityReports(params?: Record<string, string>): Promise<ActivityReport> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/activity${qs}`);
}
