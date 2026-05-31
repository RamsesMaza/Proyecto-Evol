import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const UserModel = {
  async listByRole(role: string, filters: {
    query?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const { query, status, page = 0, pageSize = 50, sortField = 'createdAt', sortDir = 'desc' } = filters;

    const where: any = { role };

    if (status && status !== 'todos') {
      const statusMap: Record<string, string> = {
        activos: 'activo',
        inactivos: 'inactivo',
        nuevos: 'nuevo',
        frecuentes: 'frecuente',
      };
      where.status = statusMap[status] || status;
    }

    if (query) {
      where.OR = [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { company: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortField] = sortDir;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: page * pageSize,
        take: pageSize,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          role: true,
          status: true,
          isFavorite: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { users, total };
  },

  async update(id: number, data: {
    status?: string;
    isFavorite?: boolean;
  }) {
    return prisma.user.update({ where: { id }, data });
  },

  async updateProfile(id: number, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
  }) {
    return prisma.user.update({ where: { id }, data });
  },

  async listAll(filters: {
    query?: string;
    role?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const { query, role, status, page = 0, pageSize = 50, sortField = 'createdAt', sortDir = 'desc' } = filters;
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (query) {
      where.OR = [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { company: { contains: query } },
        { phone: { contains: query } },
      ];
    }
    const orderBy: any = {};
    orderBy[sortField] = sortDir;
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where, orderBy,
        skip: page * pageSize,
        take: pageSize,
        select: {
          id: true, firstName: true, lastName: true, email: true,
          phone: true, company: true, role: true, status: true,
          isFavorite: true, createdAt: true, updatedAt: true,
        },
      }),
    ]);
    return { users, total };
  },

  async getById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, company: true, role: true, status: true,
        isFavorite: true, createdAt: true, updatedAt: true,
      },
    });
  },

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    role?: string;
    status?: string;
  }) {
    const hashed = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashed,
        phone: data.phone ?? null,
        company: data.company ?? null,
        role: (data.role as any) ?? 'USER',
        status: data.status ?? 'activo',
      },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, company: true, role: true, status: true,
        createdAt: true,
      },
    });
  },

  async updateUser(id: number, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    status?: string;
  }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.role !== undefined && { role: data.role as any }),
        ...(data.status !== undefined && { status: data.status }),
      },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, company: true, role: true, status: true,
        updatedAt: true,
      },
    });
  },

  async resetPassword(id: number, newPassword: string, forceChange?: boolean) {
    const hashed = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
  },

  async getTiStats() {
    const [total, activos, bloqueados, inactivos, admins, sales, users, tis, withSessions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: { in: ['activo', 'frecuente'] } } }),
      prisma.user.count({ where: { status: 'bloqueado' } }),
      prisma.user.count({ where: { status: 'inactivo' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'SALES' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'TI' } }),
      prisma.userSession.count({ where: { isActive: true } }),
    ]);
    return { total, activos, bloqueados, inactivos, admins, sales, users, tis, activeSessions: withSessions };
  },

  async getSessions(activeOnly = true) {
    const where: any = {};
    if (activeOnly) where.isActive = true;
    return prisma.userSession.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
      orderBy: { lastActivity: 'desc' },
    });
  },

  async closeSession(sessionId: number) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  },

  async closeUserSessions(userId: number) {
    return prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  },

  async getActivityHistory(userId: number) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async getLoginHistory(userId: number) {
    return prisma.loginAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async getStats() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, activos, nuevosEsteMes, frecuentes, totalUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'USER', status: { in: ['activo', 'frecuente'] } } }),
      prisma.user.count({ where: { role: 'USER', createdAt: { gte: firstOfMonth } } }),
      prisma.user.count({ where: { role: 'USER', status: 'frecuente' } }),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);

    return {
      total,
      activos,
      nuevosEsteMes,
      frecuentes,
      conversionRate: totalUsers > 0 ? Math.round((activos / totalUsers) * 100) : 0,
    };
  },

  async deleteUser(id: number) {
    return prisma.$transaction(async (tx) => {
      await tx.userSession.deleteMany({ where: { userId: id } });
      await tx.supportTicket.updateMany({ where: { createdById: id }, data: { createdById: null } });
      await tx.supportTicket.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } });
      return tx.user.delete({ where: { id } });
    });
  },
};
