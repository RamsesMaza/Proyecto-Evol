import { Router, Request, Response } from 'express';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { prisma } from '../lib/prisma';

const router = Router();

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

let mpClient: MercadoPagoConfig | null = null;
if (ACCESS_TOKEN) {
  mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
} else {
  console.warn('MP_ACCESS_TOKEN no configurado. Mercado Pago deshabilitado.');
}

const SUCCESS_URL = process.env.MP_SUCCESS_URL || 'https://proevol.vercel.app/checkout/success';
const FAILURE_URL = process.env.MP_FAILURE_URL || 'https://proevol.vercel.app/checkout';
const PENDING_URL = process.env.MP_PENDING_URL || 'https://proevol.vercel.app/checkout/pending-payment';
const WEBHOOK_URL = process.env.MP_WEBHOOK_URL || 'https://proevol.vercel.app/api/payments/webhook';

router.post('/create-preference', async (req: Request, res: Response) => {
  try {
    const {
      items, customerName, customerEmail, customerPhone,
      customerAddress, customerCity, customerZip,
      shippingMethod, paymentMethod, subtotal, tax, shipping,
      discount, couponCode, total, notes,
    } = req.body;

    if (!items?.length || !customerName || !customerEmail || !total) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    if (!mpClient) {
      res.status(503).json({ error: 'Mercado Pago no configurado' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        customerName, customerEmail, customerPhone,
        customerAddress, customerCity, customerZip,
        shippingMethod: shippingMethod || 'delivery',
        paymentMethod: paymentMethod || 'mercadopago',
        paymentStatus: 'pending',
        status: 'pending_payment',
        subtotal: subtotal || 0, tax: tax || 0, shipping: shipping || 0,
        discount: discount || 0, couponCode, total, notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId, quantity: item.quantity || 1, price: item.price || 0,
          })),
        },
      },
    });

    const preference = new Preference(mpClient);
    const prefBody: any = {
      body: {
        items: items.map((item: any) => ({
          id: String(item.productId),
          title: item.title || `Producto #${item.productId}`,
          quantity: item.quantity || 1,
          currency_id: 'PEN',
          unit_price: item.price || 0,
        })),
        payer: {
          name: customerName,
          email: customerEmail,
          phone: { number: customerPhone || '' },
        },
        external_reference: String(order.id),
        back_urls: {
          success: SUCCESS_URL,
          failure: FAILURE_URL,
          pending: PENDING_URL,
        },
        auto_return: 'approved',
        notification_url: WEBHOOK_URL,
        payment_methods: {
          excluded_payment_types: [],
          installments: 1,
        },
      },
    };

    const result = await preference.create(prefBody);

    res.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment' && data?.id) {
      if (!mpClient) {
        res.status(503).json({ error: 'Mercado Pago no configurado' });
        return;
      }

      const paymentApi = new Payment(mpClient);
      const payment = await paymentApi.get({ id: data.id });

      const orderId = Number(payment.external_reference);
      if (!orderId) {
        res.status(200).json({ message: 'Sin external_reference' });
        return;
      }

      const statusMap: Record<string, string> = {
        approved: 'paid',
        pending: 'pending',
        in_process: 'pending',
        in_mediation: 'pending',
        rejected: 'cancelled',
        cancelled: 'cancelled',
        refunded: 'refunded',
        charged_back: 'cancelled',
      };

      const paymentStatus = statusMap[payment.status ?? ''] || 'pending';
      const orderStatus = payment.status === 'approved' ? 'confirmed' : 'pending_payment';

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          status: orderStatus,
        },
      });

      if (payment.status === 'approved') {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order) {
          for (const item of order.items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      }

      console.log(`[MP Webhook] Orden #${orderId}: ${payment.status} → ${paymentStatus}`);
    }

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Error en webhook MP:', error);
    res.status(200).json({ message: 'OK' });
  }
});

router.post('/check-status', async (req: Request, res: Response) => {
  try {
    const { paymentId, orderId } = req.body;

    if (paymentId && mpClient) {
      const paymentApi = new Payment(mpClient);
      const payment = await paymentApi.get({ id: paymentId });

      res.json({
        status: payment.status,
        statusDetail: payment.status_detail,
        orderId: payment.external_reference,
      });
      return;
    }

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        select: { id: true, paymentStatus: true, status: true },
      });
      if (!order) {
        res.status(404).json({ error: 'Orden no encontrada' });
        return;
      }
      res.json(order);
      return;
    }

    res.status(400).json({ error: 'paymentId u orderId requerido' });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Error al verificar pago' });
  }
});

export default router;
