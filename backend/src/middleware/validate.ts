import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    if (target === 'query' || target === 'params') {
      Object.defineProperty(req, target, {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      (req as any)[target] = result.data;
    }
    next();
  };
};
