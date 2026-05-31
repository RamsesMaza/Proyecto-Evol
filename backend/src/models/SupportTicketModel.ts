import { prisma } from '../lib/prisma';

export const SupportTicketModel = {
  async list(filters: {
    status?: string;
    priority?: string;
    createdById?: number;
    assignedToId?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { status, priority, createdById, assignedToId, page = 0, pageSize = 50 } = filters;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (createdById) where.createdById = createdById;
    if (assignedToId) where.assignedToId = assignedToId;

    const [total, tickets] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);
    return { tickets, total };
  },

  async getById(id: number) {
    return prisma.supportTicket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  async create(data: { title: string; description: string; priority?: string; createdById: number }) {
    return prisma.supportTicket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ?? 'media',
        createdById: data.createdById,
      },
    });
  },

  async update(id: number, data: { status?: string; priority?: string; assignedToId?: number; resolution?: string }) {
    return prisma.supportTicket.update({ where: { id }, data });
  },

  async getStats() {
    const [abiertos, enProgreso, resueltos, cerrados, total] = await Promise.all([
      prisma.supportTicket.count({ where: { status: 'abierto' } }),
      prisma.supportTicket.count({ where: { status: 'en_progreso' } }),
      prisma.supportTicket.count({ where: { status: 'resuelto' } }),
      prisma.supportTicket.count({ where: { status: 'cerrado' } }),
      prisma.supportTicket.count(),
    ]);
    return { abiertos, enProgreso, resueltos, cerrados, total };
  },
};
