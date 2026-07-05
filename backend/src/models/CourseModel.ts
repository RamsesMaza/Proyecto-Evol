import { prisma } from '../lib/prisma';
import { AuditModel } from './AuditModel';

const parseRoles = (val: string | null | undefined): string[] => {
  try { return val ? JSON.parse(val) : []; } catch { return []; }
};

export const CourseModel = {

  async list(params: { search?: string; category?: string; page?: number; pageSize?: number }, userRole?: string, userId?: number) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const where: any = { published: true };
    if (params.search) where.title = { contains: params.search };
    if (params.category) where.category = params.category;
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { modules: true, enrollments: true } }, creator: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.course.count({ where }),
    ]);
    const filtered = courses.filter(c => {
      const roles = parseRoles(c.visibleToRoles);
      const users = parseRoles(c.visibleToUsers);
      if (roles.length === 0 && users.length === 0) return true;
      if (userRole && roles.includes(userRole)) return true;
      if (userId && users.includes(String(userId))) return true;
      return false;
    });
    return { courses: filtered, total: filtered.length, page, pageSize };
  },

  async listAll(params: { search?: string; page?: number; pageSize?: number }) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 50;
    const where: any = {};
    if (params.search) where.title = { contains: params.search };
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { modules: true, enrollments: true } }, creator: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.course.count({ where }),
    ]);
    return { courses, total, page, pageSize };
  },

  async getById(id: number) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        modules: { orderBy: { order: 'asc' }, include: { materials: { orderBy: { createdAt: 'asc' } } } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { enrollments: true } },
      },
    });
  },

  async create(data: {
    title: string; description?: string; category?: string; level?: string;
    imageUrl?: string; duration?: number; visibleToRoles?: string; visibleToUsers?: string;
  }, createdBy?: number, ip?: string) {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category || null,
        level: (data.level as any) || 'basico',
        imageUrl: data.imageUrl || null,
        duration: data.duration ? Number(data.duration) : null,
        visibleToRoles: data.visibleToRoles || '[]',
        visibleToUsers: data.visibleToUsers || '[]',
        createdBy: createdBy || null,
      },
    });
    await AuditModel.log({ userId: createdBy, action: 'CREAR', entity: 'course', entityId: String(course.id), description: `Curso "${course.title}" creado`, ipAddress: ip });
    return course;
  },

  async update(id: number, data: any, ip?: string) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category !== undefined) payload.category = data.category;
    if (data.level !== undefined) payload.level = data.level;
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
    if (data.duration !== undefined) payload.duration = Number(data.duration);
    if (data.visibleToRoles !== undefined) payload.visibleToRoles = data.visibleToRoles;
    if (data.visibleToUsers !== undefined) payload.visibleToUsers = data.visibleToUsers;
    const course = await prisma.course.update({ where: { id }, data: payload });
    await AuditModel.log({ userId: data.createdBy, action: 'ACTUALIZAR', entity: 'course', entityId: String(id), description: `Curso "${course.title}" actualizado`, ipAddress: ip });
    return course;
  },

  async togglePublish(id: number, userId?: number, ip?: string) {
    const current = await prisma.course.findUnique({ where: { id } });
    if (!current) throw new Error('Curso no encontrado');
    const course = await prisma.course.update({ where: { id }, data: { published: !current.published } });
    await AuditModel.log({ userId, action: course.published ? 'PUBLICAR' : 'OCULTAR', entity: 'course', entityId: String(id), description: `Curso "${course.title}" ${course.published ? 'publicado' : 'ocultado'}`, ipAddress: ip });
    return course;
  },

  async delete(id: number, userId?: number, ip?: string) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new Error('Curso no encontrado');
    await prisma.course.delete({ where: { id } });
    await AuditModel.log({ userId, action: 'ELIMINAR', entity: 'course', entityId: String(id), description: `Curso "${course.title}" eliminado`, ipAddress: ip });
    return course;
  },

  /* Modules */
  async addModule(courseId: number, data: { title: string; description?: string; order?: number }) {
    const maxOrder = await prisma.courseModule.aggregate({ where: { courseId }, _max: { order: true } });
    return prisma.courseModule.create({
      data: { courseId, title: data.title, description: data.description || null, order: data.order ?? ((maxOrder._max.order ?? -1) + 1) },
    });
  },

  async updateModule(id: number, data: { title?: string; description?: string; order?: number }) {
    return prisma.courseModule.update({ where: { id }, data });
  },

  async deleteModule(id: number) {
    return prisma.courseModule.delete({ where: { id } });
  },

  /* Materials */
  async addMaterial(moduleId: number, data: { title: string; type?: string; fileUrl?: string; embedUrl?: string; duration?: number }) {
    return prisma.courseMaterial.create({
      data: { moduleId, title: data.title, type: data.type || 'pdf', fileUrl: data.fileUrl || null, embedUrl: data.embedUrl || null, duration: data.duration ? Number(data.duration) : null },
    });
  },

  async updateMaterial(id: number, data: any) {
    return prisma.courseMaterial.update({ where: { id }, data });
  },

  async deleteMaterial(id: number) {
    return prisma.courseMaterial.delete({ where: { id } });
  },

  /* Enrollments */
  async getEnrollmentsByCourse(courseId: number) {
    return prisma.courseEnrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async enroll(courseId: number, userId: number) {
    const existing = await prisma.courseEnrollment.findUnique({ where: { courseId_userId: { courseId, userId } } });
    if (existing) return existing;
    return prisma.courseEnrollment.create({ data: { courseId, userId } });
  },

  async getEnrollments(userId: number) {
    return prisma.courseEnrollment.findMany({
      where: { userId },
      include: { course: { include: { _count: { select: { modules: true } }, creator: { select: { id: true, firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateProgress(courseId: number, userId: number, progress: number) {
    const completed = progress >= 100;
    return prisma.courseEnrollment.update({
      where: { courseId_userId: { courseId, userId } },
      data: { progress: Math.min(progress, 100), completed },
    });
  },
};
