import { prisma } from '../lib/prisma';
import { AuditModel } from './AuditModel';

function generateCredentialId(): string {
  return `ACS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export const CertificateModel = {

  async listUsers(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }
    return prisma.user.findMany({
      where,
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: 'asc' },
    });
  },

  async create(data: {
    userId: number; title: string; description?: string; issuer?: string;
    expiryDate?: string; imageUrl?: string; course?: string; hours?: number;
  }, createdBy?: number, ip?: string) {
    const cert = await prisma.certificate.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description || null,
        issuer: data.issuer || 'ACS Academy',
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        imageUrl: data.imageUrl || null,
        course: data.course || null,
        hours: data.hours ? Number(data.hours) : null,
        credentialId: generateCredentialId(),
        createdBy: createdBy || null,
      },
    });
    await AuditModel.log({
      userId: createdBy, action: 'CREAR', entity: 'certificate',
      entityId: String(cert.id), description: `Certificado "${cert.title}" creado para usuario #${data.userId}`,
      ipAddress: ip,
    });
    return cert;
  },

  async list(params: { search?: string; page?: number; pageSize?: number }) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const where: any = {};
    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { user: { firstName: { contains: params.search } } },
        { user: { lastName: { contains: params.search } } },
      ];
    }
    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.certificate.count({ where }),
    ]);
    return { certificates, total, page, pageSize };
  },

  async getById(id: number) {
    return prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  },

  async getByUser(userId: number) {
    return prisma.certificate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async delete(id: number, userId?: number, ip?: string) {
    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new Error('Certificado no encontrado');
    await prisma.certificate.delete({ where: { id } });
    await AuditModel.log({
      userId, action: 'ELIMINAR', entity: 'certificate',
      entityId: String(id), description: `Certificado "${cert.title}" eliminado`,
      ipAddress: ip,
    });
    return cert;
  },
};
