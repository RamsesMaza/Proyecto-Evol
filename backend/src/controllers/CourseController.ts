import { Request, Response, NextFunction } from 'express';
import { CourseModel } from '../models/CourseModel';

const getIp = (req: Request): string | undefined => req.ip || req.socket.remoteAddress;
const uid = (req: Request): number | undefined => (req as any).user?.userId;
const role = (req: Request): string | undefined => (req as any).user?.role;

export const CourseController = {

  list: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await CourseModel.list(req.query as any, role(req), uid(req))); }
    catch (err) { next(err); }
  },

  listAll: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await CourseModel.listAll(req.query as any)); }
    catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.getById(Number(req.params.id));
      if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
      res.json(course);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.create(req.body, uid(req), getIp(req));
      res.status(201).json(course);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.update(Number(req.params.id), { ...req.body, createdBy: uid(req) }, getIp(req));
      res.json(course);
    } catch (err) { next(err); }
  },

  togglePublish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.togglePublish(Number(req.params.id), uid(req), getIp(req));
      res.json(course);
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CourseModel.delete(Number(req.params.id), uid(req), getIp(req));
      res.json({ message: 'Curso eliminado' });
    } catch (err) { next(err); }
  },

  addModule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mod = await CourseModel.addModule(Number(req.params.id), req.body);
      res.status(201).json(mod);
    } catch (err) { next(err); }
  },

  updateModule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mod = await CourseModel.updateModule(Number(req.params.moduleId), req.body);
      res.json(mod);
    } catch (err) { next(err); }
  },

  deleteModule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CourseModel.deleteModule(Number(req.params.moduleId));
      res.json({ message: 'Módulo eliminado' });
    } catch (err) { next(err); }
  },

  addMaterial: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mat = await CourseModel.addMaterial(Number(req.params.moduleId), req.body);
      res.status(201).json(mat);
    } catch (err) { next(err); }
  },

  updateMaterial: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mat = await CourseModel.updateMaterial(Number(req.params.id), req.body);
      res.json(mat);
    } catch (err) { next(err); }
  },

  deleteMaterial: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CourseModel.deleteMaterial(Number(req.params.id));
      res.json({ message: 'Material eliminado' });
    } catch (err) { next(err); }
  },

  enrollmentsByCourse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enrollments = await CourseModel.getEnrollmentsByCourse(Number(req.params.id));
      res.json(enrollments);
    } catch (err) { next(err); }
  },

  enroll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enrollment = await CourseModel.enroll(Number(req.params.id), uid(req)!);
      res.status(201).json(enrollment);
    } catch (err) { next(err); }
  },

  myCourses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enrollments = await CourseModel.getEnrollments(uid(req)!);
      res.json(enrollments);
    } catch (err) { next(err); }
  },

  updateProgress: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enrollment = await CourseModel.updateProgress(Number(req.params.id), uid(req)!, Number(req.body.progress));
      res.json(enrollment);
    } catch (err) { next(err); }
  },
};
