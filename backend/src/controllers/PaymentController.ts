import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentModel } from '../models/PaymentModel';
import { validate } from '../middleware/validate';

export const createPreferenceSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    title: z.string().optional(),
    quantity: z.number().min(1).default(1),
    price: z.number().min(0),
  })).min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  customerCity: z.string().optional(),
  customerZip: z.string().optional(),
  shippingMethod: z.string().optional(),
  paymentMethod: z.string().optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  discount: z.number().optional(),
  couponCode: z.string().optional(),
  total: z.number(),
  notes: z.string().optional(),
});

export const checkStatusSchema = z.object({
  paymentId: z.string().optional(),
  orderId: z.number().optional(),
}).refine(d => d.paymentId || d.orderId, { message: 'paymentId u orderId requerido' });

export const PaymentController = {
  validate: {
    createPreference: validate(createPreferenceSchema),
    checkStatus: validate(checkStatusSchema),
  },

  createPreference: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await PaymentModel.createPreference(req.body);
      res.json(result);
    } catch (err) { next(err); }
  },

  webhook: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PaymentModel.handleWebhook(req.body);
      res.status(200).json({ message: 'OK' });
    } catch (err) {
      console.error('Error en webhook MP:', err);
      res.status(200).json({ message: 'OK' });
    }
  },

  checkStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await PaymentModel.checkStatus(req.body);
      res.json(result);
    } catch (err) { next(err); }
  },
};
