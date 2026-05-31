import { prisma } from '../lib/prisma';

export const PermissionModel = {
  async list() {
    return prisma.permission.findMany({ orderBy: { module: 'asc' } });
  },

  async create(data: { name: string; slug: string; description?: string; module: string }) {
    return prisma.permission.create({ data });
  },

  async getRolePermissions(role: string) {
    return prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });
  },

  async assignPermission(role: string, permissionId: number) {
    return prisma.rolePermission.create({ data: { role, permissionId } });
  },

  async removePermission(role: string, permissionId: number) {
    return prisma.rolePermission.deleteMany({
      where: { role, permissionId },
    });
  },

  async hasPermission(role: string, permissionSlug: string): Promise<boolean> {
    const count = await prisma.rolePermission.count({
      where: {
        role,
        permission: { slug: permissionSlug },
      },
    });
    return count > 0;
  },
};
