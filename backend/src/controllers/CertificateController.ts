import { Request, Response, NextFunction } from 'express';
import { CertificateModel } from '../models/CertificateModel';

const getIp = (req: Request): string | undefined => req.ip || req.socket.remoteAddress;
const uid = (req: Request): number | undefined => (req as any).user?.userId;

export const CertificateController = {

  listUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await CertificateModel.listUsers(req.query.search as string);
      res.json({ users });
    } catch (err) { next(err); }
  },


  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cert = await CertificateModel.create(req.body, uid(req), getIp(req));
      res.status(201).json(cert);
    } catch (err) { next(err); }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await CertificateModel.list(req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cert = await CertificateModel.getById(Number(req.params.id));
      if (!cert) return res.status(404).json({ error: 'Certificado no encontrado' });
      res.json(cert);
    } catch (err) { next(err); }
  },

  myCerts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const certs = await CertificateModel.getByUser(uid(req)!);
      res.json(certs);
    } catch (err) { next(err); }
  },

  verify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const credentialId = String(req.params.credentialId);
      const cert = await CertificateModel.verifyByCredentialId(credentialId);
      if (!cert) return res.status(404).json({ error: 'Certificado no encontrado', valid: false });
      res.json({ valid: true, certificate: cert });
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CertificateModel.delete(Number(req.params.id), uid(req), getIp(req));
      res.json({ message: 'Certificado eliminado' });
    } catch (err) { next(err); }
  },
};
