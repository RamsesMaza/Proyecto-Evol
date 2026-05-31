import { prisma } from '../lib/prisma';

export const AuditModel = {
  async log(data: {
    userId?: number;
    userEmail?: string;
    userName?: string;
    action: string;
    entity: string;
    entityId?: string;
    description?: string;
    ipAddress?: string;
    oldValues?: any;
    newValues?: any;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        userEmail: data.userEmail ?? null,
        userName: data.userName ?? null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId ?? null,
        description: data.description ?? null,
        ipAddress: data.ipAddress ?? null,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
      },
    });
  },

  async list(filters: {
    page?: number;
    pageSize?: number;
    action?: string;
    entity?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 0, pageSize = 50, action, entity, userId, startDate, endDate } = filters;
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
    }
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize,
      }),
    ]);
    return { logs, total };
  },

  async getRecent(limit = 20) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
