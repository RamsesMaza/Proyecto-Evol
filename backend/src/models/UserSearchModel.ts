import { prisma } from '../lib/prisma';

export const UserSearchModel = {
  async search(query: string) {
    return prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
      take: 50,
      orderBy: { firstName: 'asc' },
    });
  },

  async listByIds(ids: number[]) {
    return prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
  },
};
