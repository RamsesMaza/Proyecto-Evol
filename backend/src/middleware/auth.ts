import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';

declare global {
  namespace Express {
    interface User {
      userId: number;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token) as Express.User;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    return;
  }
  next();
};
