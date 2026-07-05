import { prisma } from '../lib/prisma';

export const ReportsModel = {

  async getGeneral(filters: { startDate?: string; endDate?: string }) {
    const start = filters.startDate ? new Date(filters.startDate) : new Date(0);
    const end = filters.endDate ? new Date(filters.endDate) : new Date();

    const [usersByRole, newUsers, totalUsers, totalOrders, totalRevenue, totalQuotes] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.cotizacion.count(),
    ]);

    return { usersByRole, newUsers, totalUsers, totalOrders, totalRevenue: totalRevenue._sum.total || 0, totalQuotes };
  },

  async getUserGrowth(filters: { startDate?: string; endDate?: string }) {
    const start = filters.startDate || '2020-01-01';
    const end = filters.endDate || new Date().toISOString().slice(0, 10);

    const raw = await prisma.$queryRawUnsafe<Array<{ month: string; total: bigint }>>(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as total
       FROM \`User\` WHERE createdAt >= ? AND createdAt <= ?
       GROUP BY month ORDER BY month ASC`,
      new Date(start), new Date(end)
    );
    return (raw || []).map(r => ({ month: r.month, total: Number(r.total) }));
  },

  async getLeads(filters: { startDate?: string; endDate?: string; status?: string }) {
    const where: any = {};
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.status) where.status = filters.status;

    const [byStatus, byCampaign, total] = await Promise.all([
      prisma.lead.groupBy({ by: ['status'], _count: true, where }),
      prisma.lead.groupBy({ by: ['campaignId'], _count: true, where, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      prisma.lead.count({ where }),
    ]);

    const campaignNames = byCampaign.length > 0
      ? await prisma.campaign.findMany({ where: { id: { in: byCampaign.map(c => c.campaignId).filter(Boolean) as number[] } }, select: { id: true, name: true } })
      : [];
    const nameMap = Object.fromEntries(campaignNames.map(c => [c.id, c.name]));

    return {
      byStatus,
      byCampaign: byCampaign.map(c => ({ campaignId: c.campaignId, campaignName: nameMap[c.campaignId as number] || 'Sin campaña', _count: c._count })),
      total,
    };
  },

  async getLeadTrend(filters: { startDate?: string; endDate?: string }) {
    const start = filters.startDate || '2020-01-01';
    const end = filters.endDate || new Date().toISOString().slice(0, 10);

    const raw = await prisma.$queryRawUnsafe<Array<{ month: string; total: bigint; converted: bigint }>>(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month,
              COUNT(*) as total,
              SUM(CASE WHEN status = 'convertido' THEN 1 ELSE 0 END) as converted
       FROM \`Lead\` WHERE createdAt >= ? AND createdAt <= ?
       GROUP BY month ORDER BY month ASC`,
      new Date(start), new Date(end)
    );
    return (raw || []).map(r => ({ month: r.month, total: Number(r.total), converted: Number(r.converted) }));
  },

  async getCampaigns(filters: { startDate?: string; endDate?: string }) {
    const where: any = {};
    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) where.startDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.startDate.lte = new Date(filters.endDate);
    }

    const [byStatus, byType, top, totals] = await Promise.all([
      prisma.campaign.groupBy({ by: ['status'], _count: true, where }),
      prisma.campaign.groupBy({ by: ['type'], _count: true, where }),
      prisma.campaign.findMany({
        where, orderBy: { results: { _count: 'desc' } }, take: 10,
        include: { results: true, _count: { select: { leads: true } } },
      }),
      prisma.campaignResult.aggregate({ _sum: { revenue: true, leadsGenerated: true, leadsConverted: true, impressions: true, clicks: true } }),
    ]);

    return {
      byStatus, byType,
      top: top.map(c => ({
        id: c.id, name: c.name, status: c.status, type: c.type,
        budget: c.budget, spent: c.spent,
        leadsCount: c._count.leads,
        revenue: c.results.reduce((s, r) => s + r.revenue, 0),
      })),
      totals: {
        revenue: totals._sum.revenue || 0,
        leadsGenerated: totals._sum.leadsGenerated || 0,
        leadsConverted: totals._sum.leadsConverted || 0,
        impressions: totals._sum.impressions || 0,
        clicks: totals._sum.clicks || 0,
      },
    };
  },

  async getRevenue(filters: { startDate?: string; endDate?: string }) {
    const start = filters.startDate ? new Date(filters.startDate) : new Date(0);
    const end = filters.endDate ? new Date(filters.endDate) : new Date();

    const [orders, quotes, byCampaign] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { total: true, createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.cotizacion.findMany({
        where: { fecha: { gte: start, lte: end } },
        select: { total: true, fecha: true, estado: true },
        orderBy: { fecha: 'asc' },
      }),
      prisma.campaignResult.findMany({
        where: { recordedAt: { gte: start, lte: end } },
        include: { campaign: { select: { name: true } } },
        orderBy: { revenue: 'desc' },
        take: 10,
      }),
    ]);

    const totalOrders = orders.reduce((s, o) => s + o.total, 0);
    const totalQuotes = quotes.reduce((s, q) => s + q.total, 0);

    return {
      totalOrders, totalQuotes, totalCampaignRevenue: byCampaign.reduce((s, r) => s + r.revenue, 0),
      orderCount: orders.length,
      quoteCount: quotes.length,
      pendingQuotes: quotes.filter(q => q.estado === 'pendiente' || q.estado === 'revision').length,
      approvedQuotes: quotes.filter(q => q.estado === 'aprobada').length,
      byCampaign: byCampaign.map(r => ({ campaignName: r.campaign.name, revenue: r.revenue, leadsGenerated: r.leadsGenerated, leadsConverted: r.leadsConverted })),
    };
  },

  async getActivity(filters: { startDate?: string; endDate?: string }) {
    const start = filters.startDate ? new Date(filters.startDate) : new Date(0);
    const end = filters.endDate ? new Date(filters.endDate) : new Date();

    const where = { createdAt: { gte: start, lte: end } };

    const [byAction, byEntity, recent] = await Promise.all([
      prisma.auditLog.groupBy({ by: ['action'], _count: true, where, orderBy: { _count: { id: 'desc' } }, take: 15 }),
      prisma.auditLog.groupBy({ by: ['entity'], _count: true, where, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    return { byAction, byEntity, recent };
  },

};
