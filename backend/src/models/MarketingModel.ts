import { prisma } from '../lib/prisma';
import { AuditModel } from './AuditModel';

export const MarketingModel = {

  /* ───── DASHBOARD ───── */
  async getDashboardStats(userId?: number) {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalLeads, newLeads, convertedLeads, activeCampaigns, finishedCampaigns,
      campaignRevenue, recentActivity] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'nuevo' } }),
      prisma.lead.count({ where: { status: 'convertido' } }),
      prisma.campaign.count({ where: { status: 'activa' } }),
      prisma.campaign.count({ where: { status: 'finalizada' } }),
      prisma.campaignResult.aggregate({ _sum: { revenue: true } }),
      prisma.auditLog.findMany({
        where: { entity: { in: ['lead', 'campaign', 'segment', 'email_campaign', 'sms_campaign'] } },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads, newLeads, convertedLeads, conversionRate,
      activeCampaigns, finishedCampaigns,
      campaignRevenue: campaignRevenue._sum.revenue || 0,
      recentActivity,
    };
  },

  /* ───── LEADS ───── */
  async listLeads(params: { status?: string; priority?: string; search?: string; assignedTo?: string; campaignId?: string; page?: number; pageSize?: number }) {
    const { status, priority, search, assignedTo, campaignId } = params;
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = Number(assignedTo);
    if (campaignId) where.campaignId = Number(campaignId);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
        include: { campaign: { select: { id: true, name: true } }, activities: true },
      }),
      prisma.lead.count({ where }),
    ]);
    return { leads, total, page, pageSize };
  },

  async getLead(id: number) {
    const lead = await prisma.lead.findUnique({
      where: { id }, include: {
        campaign: { select: { id: true, name: true } },
        activities: { include: { performedUser: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) throw { status: 404, message: 'Lead no encontrado' };
    return lead;
  },

  async createLead(data: any, userId?: number, ipAddress?: string) {
    const lead = await prisma.lead.create({
      data: {
        name: data.name, email: data.email, phone: data.phone,
        company: data.company, position: data.position, source: data.source || 'web',
        status: data.status || 'nuevo', priority: data.priority || 'media',
        assignedTo: data.assignedTo ? Number(data.assignedTo) : null,
        campaignId: data.campaignId ? Number(data.campaignId) : null,
        notes: data.notes, observations: data.observations,
      },
    });

    await AuditModel.log({
      userId, action: 'lead.create', entity: 'lead', entityId: String(lead.id),
      description: `Lead creado: ${lead.name}`, ipAddress,
    });

    return lead;
  },

  async updateLead(id: number, data: any, userId?: number, ipAddress?: string) {
    const old = await prisma.lead.findUnique({ where: { id } });
    if (!old) throw { status: 404, message: 'Lead no encontrado' };

    const statusChanged = data.status && data.status !== old.status;
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo ? Number(data.assignedTo) : null;
    if (data.campaignId !== undefined) updateData.campaignId = data.campaignId ? Number(data.campaignId) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.observations !== undefined) updateData.observations = data.observations;

    if (statusChanged && data.status === 'contactado') updateData.contactedAt = new Date();
    if (statusChanged && data.status === 'convertido') updateData.convertedAt = new Date();

    const lead = await prisma.lead.update({ where: { id }, data: updateData });

    if (statusChanged && data.status === 'convertido') {
      await AuditModel.log({
        userId, action: 'lead.convert', entity: 'lead', entityId: String(id),
        description: `Lead convertido: ${lead.name}`, ipAddress,
      });
    }

    if (data.campaignId && statusChanged && data.status === 'convertido') {
      const existing = await prisma.campaignResult.findFirst({ where: { campaignId: Number(data.campaignId) }, orderBy: { recordedAt: 'desc' } });
      if (existing) {
        await prisma.campaignResult.update({ where: { id: existing.id }, data: { leadsConverted: { increment: 1 } } });
      } else {
        await prisma.campaignResult.create({ data: { campaignId: Number(data.campaignId), leadsConverted: 1, revenue: 0, recordedAt: new Date() } });
      }
    }

    return lead;
  },

  async deleteLead(id: number, userId?: number, ipAddress?: string) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) throw { status: 404, message: 'Lead no encontrado' };
    await prisma.lead.delete({ where: { id } });
    await AuditModel.log({
      userId, action: 'lead.delete', entity: 'lead', entityId: String(id),
      description: `Lead eliminado: ${lead.name}`, ipAddress,
    });
  },

  async addLeadActivity(leadId: number, data: any, userId?: number, ipAddress?: string) {
    const activity = await prisma.leadActivity.create({
      data: { leadId, type: data.type || 'nota', description: data.description, performedBy: userId },
    });
    await AuditModel.log({
      userId, action: 'lead.activity', entity: 'lead', entityId: String(leadId),
      description: `Actividad en lead: ${data.description}`, ipAddress,
    });
    return activity;
  },

  /* ───── CAMPAIGNS ───── */
  async listCampaigns(params: { status?: string; type?: string; search?: string; page?: number; pageSize?: number }) {
    const { status, type, search } = params;
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) where.name = { contains: search };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
        include: {
          _count: { select: { leads: true, emailCampaigns: true, smsCampaigns: true } },
          results: true,
        },
      }),
      prisma.campaign.count({ where }),
    ]);
    return { campaigns, total, page, pageSize };
  },

  async getCampaign(id: number) {
    const campaign = await prisma.campaign.findUnique({
      where: { id }, include: {
        _count: { select: { leads: true, emailCampaigns: true, smsCampaigns: true } },
        leads: { orderBy: { createdAt: 'desc' }, take: 10 },
        results: true,
        emailCampaigns: true,
        smsCampaigns: true,
      },
    });
    if (!campaign) throw { status: 404, message: 'Campaña no encontrada' };
    return campaign;
  },

  async createCampaign(data: any, userId?: number, ipAddress?: string) {
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name, description: data.description, objective: data.objective,
        budget: Number(data.budget) || 0, spent: Number(data.spent) || 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'borrador', type: data.type || 'otro',
        assignedTo: data.assignedTo ? Number(data.assignedTo) : null,
      },
    });

    await AuditModel.log({
      userId, action: 'campaign.create', entity: 'campaign', entityId: String(campaign.id),
      description: `Campaña creada: ${campaign.name}`, ipAddress,
    });

    return campaign;
  },

  async updateCampaign(id: number, data: any, userId?: number, ipAddress?: string) {
    const old = await prisma.campaign.findUnique({ where: { id } });
    if (!old) throw { status: 404, message: 'Campaña no encontrada' };

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.objective !== undefined) updateData.objective = data.objective;
    if (data.budget !== undefined) updateData.budget = Number(data.budget);
    if (data.spent !== undefined) updateData.spent = Number(data.spent);
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo ? Number(data.assignedTo) : null;

    const campaign = await prisma.campaign.update({ where: { id }, data: updateData });

    await AuditModel.log({
      userId, action: 'campaign.update', entity: 'campaign', entityId: String(id),
      description: `Campaña actualizada: ${campaign.name}`, ipAddress,
    });

    return campaign;
  },

  async deleteCampaign(id: number, userId?: number, ipAddress?: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw { status: 404, message: 'Campaña no encontrada' };
    await prisma.campaign.delete({ where: { id } });
    await AuditModel.log({
      userId, action: 'campaign.delete', entity: 'campaign', entityId: String(id),
      description: `Campaña eliminada: ${campaign.name}`, ipAddress,
    });
  },

  async recordCampaignResult(campaignId: number, data: any, userId?: number, ipAddress?: string) {
    const result = await prisma.campaignResult.create({
      data: {
        campaignId: Number(campaignId),
        leadsGenerated: Number(data.leadsGenerated) || 0,
        leadsConverted: Number(data.leadsConverted) || 0,
        revenue: Number(data.revenue) || 0,
        roi: Number(data.roi) || 0,
        impressions: Number(data.impressions) || 0,
        clicks: Number(data.clicks) || 0,
        opens: Number(data.opens) || 0,
      },
    });

    await AuditModel.log({
      userId, action: 'campaign.result', entity: 'campaign', entityId: String(campaignId),
      description: 'Resultado registrado en campaña', ipAddress,
    });

    return result;
  },

  /* ───── SEGMENTS ───── */
  async listSegments() {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } }, creator: { select: { id: true, firstName: true, lastName: true } } },
    });
    return segments;
  },

  async getSegment(id: number) {
    const segment = await prisma.segment.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: true, status: true, createdAt: true } } } },
      },
    });
    if (!segment) throw { status: 404, message: 'Segmento no encontrado' };
    return segment;
  },

  async createSegment(data: any, userId?: number, ipAddress?: string) {
    const segment = await prisma.segment.create({
      data: {
        name: data.name, description: data.description,
        criteria: data.criteria ? JSON.stringify(data.criteria) : null,
        createdBy: userId,
      },
    });

    await AuditModel.log({
      userId, action: 'segment.create', entity: 'segment', entityId: String(segment.id),
      description: `Segmento creado: ${segment.name}`, ipAddress,
    });

    return segment;
  },

  async deleteSegment(id: number, userId?: number, ipAddress?: string) {
    const segment = await prisma.segment.findUnique({ where: { id } });
    if (!segment) throw { status: 404, message: 'Segmento no encontrado' };
    await prisma.segment.delete({ where: { id } });
    await AuditModel.log({
      userId, action: 'segment.delete', entity: 'segment', entityId: String(id),
      description: `Segmento eliminado: ${segment.name}`, ipAddress,
    });
  },

  async evaluateSegment(id: number) {
    const segment = await prisma.segment.findUnique({ where: { id } });
    if (!segment) throw { status: 404, message: 'Segmento no encontrado' };

    const criteria = segment.criteria ? JSON.parse(segment.criteria) : {};
    const where: any = {};

    if (criteria.ageMin || criteria.ageMax) {
      const now = new Date();
      if (criteria.ageMax) {
        const minDate = new Date(now.getFullYear() - criteria.ageMax, now.getMonth(), now.getDate());
        where.createdAt = { ...where.createdAt, gte: minDate };
      }
      if (criteria.ageMin) {
        const maxDate = new Date(now.getFullYear() - criteria.ageMin, now.getMonth(), now.getDate());
        where.createdAt = { ...where.createdAt, lte: maxDate };
      }
    }

    if (criteria.status) where.status = criteria.status;
    if (criteria.city) where.city = { contains: criteria.city };
    if (criteria.minSpent || criteria.maxSpent) {
      const userOrders = await prisma.order.groupBy({
        by: ['userId'], where: { paymentStatus: 'paid' },
        _sum: { total: true },
        having: {
          total: {
            ...(criteria.minSpent ? { gte: criteria.minSpent } : {}),
            ...(criteria.maxSpent ? { lte: criteria.maxSpent } : {}),
          },
        },
      });
      where.id = { in: userOrders.map(o => o.userId).filter(Boolean) };
    }

    if (criteria.minOrders) {
      const userOrders = await prisma.order.groupBy({
        by: ['userId'], where: { paymentStatus: 'paid' },
        _count: true,
        having: { userId: { _count: { gte: criteria.minOrders } } },
      });
      const ids = userOrders.map(o => o.userId).filter(Boolean);
      where.id = where.id ? { ...where.id, in: ids.filter(id => (where.id as any).in?.includes(id) ?? true) } : { in: ids };
    }

    if (criteria.registeredAfter) where.createdAt = { ...where.createdAt, gte: new Date(criteria.registeredAfter) };
    if (criteria.registeredBefore) where.createdAt = { ...where.createdAt, lte: new Date(criteria.registeredBefore) };

    const users = await prisma.user.findMany({ where, select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: true, status: true, createdAt: true } });

    await prisma.segmentMember.deleteMany({ where: { segmentId: id } });
    if (users.length > 0) {
      await prisma.segmentMember.createMany({
        data: users.map(u => ({ segmentId: id, userId: u.id })),
      });
    }

    return { segment, members: users, count: users.length };
  },

  /* ───── EMAIL CAMPAIGNS ───── */
  async listEmailCampaigns(campaignId?: number) {
    const where = campaignId ? { campaignId: Number(campaignId) } : {};
    return prisma.emailCampaign.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async createEmailCampaign(data: any, userId?: number, ipAddress?: string) {
    const emailCampaign = await prisma.emailCampaign.create({
      data: {
        campaignId: Number(data.campaignId),
        name: data.name, subject: data.subject, body: data.body,
        template: data.template, status: data.status || 'borrador',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        recipients: Number(data.recipients) || 0,
      },
    });

    await AuditModel.log({
      userId, action: 'email_campaign.create', entity: 'email_campaign', entityId: String(emailCampaign.id),
      description: `Campaña de email creada: ${emailCampaign.name}`, ipAddress,
    });

    return emailCampaign;
  },

  async updateEmailCampaign(id: number, data: any) {
    return prisma.emailCampaign.update({ where: { id }, data });
  },

  /* ───── SMS CAMPAIGNS ───── */
  async listSmsCampaigns(campaignId?: number) {
    const where = campaignId ? { campaignId: Number(campaignId) } : {};
    return prisma.smsCampaign.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async createSmsCampaign(data: any, userId?: number, ipAddress?: string) {
    const smsCampaign = await prisma.smsCampaign.create({
      data: {
        campaignId: Number(data.campaignId),
        name: data.name, message: data.message,
        provider: data.provider || 'twilio', status: data.status || 'borrador',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });

    await AuditModel.log({
      userId, action: 'sms_campaign.create', entity: 'sms_campaign', entityId: String(smsCampaign.id),
      description: `Campaña SMS creada: ${smsCampaign.name}`, ipAddress,
    });

    return smsCampaign;
  },

  async updateSmsCampaign(id: number, data: any) {
    return prisma.smsCampaign.update({ where: { id }, data });
  },

  /* ───── REPORTS ───── */
  async getReports(filters: { startDate?: string; endDate?: string; campaignId?: string }) {
    const whereDate: any = {};
    if (filters.startDate) whereDate.gte = new Date(filters.startDate);
    if (filters.endDate) whereDate.lte = new Date(filters.endDate);

    const campaignWhere = { ...whereDate };
    if (filters.campaignId) (campaignWhere as any).id = Number(filters.campaignId);

    const [leadsByStatus, campaignsByStatus, monthlyLeads, monthlyRevenue, topCampaigns] = await Promise.all([
      prisma.lead.groupBy({ by: ['status'], _count: true }),
      prisma.campaign.groupBy({ by: ['status'], _count: true }),
      prisma.$queryRawUnsafe<Array<{ month: string; total: bigint; converted: bigint }>>(
         `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'convertido' THEN 1 ELSE 0 END) as converted
         FROM \`Lead\` GROUP BY DATE_FORMAT(createdAt, '%Y-%m') ORDER BY month ASC`
      ),
      prisma.campaignResult.aggregate({ _sum: { revenue: true, leadsConverted: true, leadsGenerated: true } }),
      prisma.campaign.findMany({
        where: campaignWhere,
        orderBy: { results: { _count: 'desc' } },
        take: 5,
        include: { results: true },
      }),
    ]);

    return {
      leadsByStatus,
      campaignsByStatus,
      monthlyLeads: (monthlyLeads || []).map((r: any) => ({ month: r.month, total: Number(r.total), converted: Number(r.converted) })),
      totalRevenue: monthlyRevenue._sum.revenue || 0,
      totalConverted: monthlyRevenue._sum.leadsConverted || 0,
      totalLeadsGenerated: monthlyRevenue._sum.leadsGenerated || 0,
      topCampaigns,
    };
  },
};
