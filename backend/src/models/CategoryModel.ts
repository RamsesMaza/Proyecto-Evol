import { prisma } from '../lib/prisma';

export const CategoryModel = {
  async list() {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  },
};
