import { prisma } from '../lib/prisma';

export const LoginAttemptModel = {
  async log(data: { email: string; userId?: number; ipAddress?: string; success: boolean }) {
    return prisma.loginAttempt.create({ data: { ...data, userId: data.userId ?? null } });
  },

  async getRecent(limit = 50) {
    return prisma.loginAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async getFailedAttempts(email: string, withinMinutes = 15): Promise<number> {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000);
    return prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: since } },
    });
  },

  async getStats() {
    const total = await prisma.loginAttempt.count();
    const failed = await prisma.loginAttempt.count({ where: { success: false } });
    const last24h = await prisma.loginAttempt.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    return { total, failed, last24h, successRate: total > 0 ? Math.round(((total - failed) / total) * 100) : 100 };
  },
};
