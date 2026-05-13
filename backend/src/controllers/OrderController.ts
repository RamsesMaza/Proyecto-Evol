import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderModel } from '../models/OrderModel';
import { validate } from '../middleware/validate';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1).default(1),
    price: z.number().min(0),
  })).min(1, 'Debe incluir al menos un producto'),
  customerName: z.string().min(1, 'El nombre es obligatorio'),
  customerEmail: z.string().email('Correo inválido'),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  customerCity: z.string().optional(),
  customerZip: z.string().optional(),
  shippingMethod: z.string().default('delivery'),
  paymentMethod: z.string().default('yape'),
  paymentDetail: z.any().optional(),
  subtotal: z.number().default(0),
  tax: z.number().default(0),
  shipping: z.number().default(0),
  discount: z.number().default(0),
  couponCode: z.string().optional(),
  total: z.number(),
  notes: z.string().optional(),
  billingType: z.string().optional(),
  billingRuc: z.string().optional(),
  billingName: z.string().optional(),
  billingAddress: z.string().optional(),
});

export const OrderController = {
  validate: {
    create: validate(createOrderSchema),
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await OrderModel.create(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await OrderModel.getById(Number(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },

  getInvoice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pdfBuffer = await OrderModel.getInvoice(Number(req.params.id));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="recibo-${req.params.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) { next(err); }
  },

  sendInvoice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await OrderModel.sendInvoice(Number(req.params.id), req.body.email);
      res.json(result);
    } catch (err) { next(err); }
  },
};
