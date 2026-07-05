import { prisma } from '../lib/prisma';

export const NotificationModel = {
  async list(filters: { userId?: number; type?: string; read?: boolean; page?: number; pageSize?: number }) {
    const { userId, type, read, page = 0, pageSize = 50 } = filters;
    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (read !== undefined) where.readAt = read ? { not: null } : null;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: page * pageSize, take: pageSize,
      }),
    ]);
    return { notifications, total };
  },

  async create(data: { userId?: number; type: string; title: string; message?: string; icon?: string; link?: string }) {
    return prisma.notification.create({ data });
  },

  async markRead(id: number) {
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  },

  async markAllRead(userId: number) {
    return prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  },

  async delete(id: number) {
    return prisma.notification.delete({ where: { id } });
  },

  async getUnreadCount(userId?: number) {
    const where: any = { readAt: null };
    if (userId) where.userId = userId;
    return prisma.notification.count({ where });
  },

  async createSystemNotification(type: string, title: string, message?: string, link?: string) {
    return this.create({ type, title, message, link });
  },
};
