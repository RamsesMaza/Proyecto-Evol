import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { prisma } from '../lib/prisma';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

let mpClient: MercadoPagoConfig | null = null;
if (ACCESS_TOKEN) {
  mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
}

const SUCCESS_URL = process.env.MP_SUCCESS_URL || 'https://proevol.vercel.app/checkout/success';
const FAILURE_URL = process.env.MP_FAILURE_URL || 'https://proevol.vercel.app/checkout';
const PENDING_URL = process.env.MP_PENDING_URL || 'https://proevol.vercel.app/checkout/pending-payment';
const WEBHOOK_URL = process.env.MP_WEBHOOK_URL || 'https://proevol.vercel.app/api/payments/webhook';

export const PaymentModel = {
  async createPreference(data: any) {
    if (!mpClient) throw new Error('Mercado Pago no configurado');

    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        customerCity: data.customerCity,
        customerZip: data.customerZip,
        shippingMethod: data.shippingMethod || 'delivery',
        paymentMethod: data.paymentMethod || 'mercadopago',
        paymentStatus: 'pending',
        status: 'pending_payment',
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        shipping: data.shipping || 0,
        discount: data.discount || 0,
        couponCode: data.couponCode,
        total: data.total,
        notes: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            price: item.price || 0,
          })),
        },
      },
    });

    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: data.items.map((item: any) => ({
          id: String(item.productId),
          title: item.title || `Producto #${item.productId}`,
          quantity: item.quantity || 1,
          currency_id: 'PEN',
          unit_price: item.price || 0,
        })),
        payer: {
          name: data.customerName,
          email: data.customerEmail,
          phone: { number: data.customerPhone || '' },
        },
        external_reference: String(order.id),
        back_urls: { success: SUCCESS_URL, failure: FAILURE_URL, pending: PENDING_URL },
        auto_return: 'approved',
        notification_url: WEBHOOK_URL,
        payment_methods: { excluded_payment_types: [], installments: 1 },
      },
    });

    return {
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      orderId: order.id,
    };
  },

  async handleWebhook(body: any) {
    const { type, data } = body;

    if (type === 'payment' && data?.id && mpClient) {
      const paymentApi = new Payment(mpClient);
      const payment = await paymentApi.get({ id: data.id });

      const orderId = Number(payment.external_reference);
      if (!orderId) return;

      const statusMap: Record<string, string> = {
        approved: 'paid', pending: 'pending', in_process: 'pending',
        in_mediation: 'pending', rejected: 'cancelled',
        cancelled: 'cancelled', refunded: 'refunded', charged_back: 'cancelled',
      };

      const paymentStatus = statusMap[payment.status ?? ''] || 'pending';
      const orderStatus = payment.status === 'approved' ? 'confirmed' : 'pending_payment';

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus, status: orderStatus },
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
    }
  },

  async checkStatus(data: { paymentId?: string; orderId?: number }) {
    if (data.paymentId && mpClient) {
      const paymentApi = new Payment(mpClient);
      const payment = await paymentApi.get({ id: data.paymentId });
      return {
        status: payment.status,
        statusDetail: payment.status_detail,
        orderId: payment.external_reference,
      };
    }

    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { id: true, paymentStatus: true, status: true },
      });
      if (!order) throw new Error('Orden no encontrada');
      return order;
    }

    throw new Error('paymentId u orderId requerido');
  },
};
