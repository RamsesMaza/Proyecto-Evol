import { prisma } from '../lib/prisma';
import { NotFoundError } from '../shared/errors';
import { generateInvoice } from '../lib/pdf';
import { sendInvoiceEmail } from '../lib/email';

export const OrderModel = {
  async create(data: any) {
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        customerCity: data.customerCity,
        customerZip: data.customerZip,
        shippingMethod: data.shippingMethod || 'delivery',
        paymentMethod: data.paymentMethod || 'yape',
        paymentDetail: data.paymentDetail ? JSON.stringify(data.paymentDetail) : null,
        subtotal: Number(data.subtotal) || 0,
        tax: Number(data.tax) || 0,
        shipping: Number(data.shipping) || 0,
        discount: Number(data.discount) || 0,
        couponCode: data.couponCode,
        total: Number(data.total),
        notes: data.notes,
        billingType: data.billingType || null,
        billingRuc: data.billingRuc || null,
        billingName: data.billingName || null,
        billingAddress: data.billingAddress || null,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            price: item.price || 0,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity || 1 } },
      });
    }

    return { orderId: order.id };
  },

  async getById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundError('Orden');
    return {
      ...order,
      paymentDetail: order.paymentDetail ? JSON.parse(order.paymentDetail) : null,
    };
  },

  async getInvoice(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundError('Orden');

    return generateInvoice({
      orderId: order.id,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || undefined,
      customerAddress: order.customerAddress || undefined,
      customerCity: order.customerCity || undefined,
      paymentMethod: order.paymentMethod,
      paymentDetail: order.paymentDetail ? JSON.parse(order.paymentDetail) : null,
      billingType: order.billingType,
      billingRuc: order.billingRuc,
      billingName: order.billingName,
      items: order.items.map((i) => ({
        product: { title: i.product.title },
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
    });
  },

  async sendInvoice(orderId: number, email: string) {
    const pdfBuffer = await this.getInvoice(orderId);
    await sendInvoiceEmail(email, pdfBuffer, orderId);
    return { message: 'Recibo enviado correctamente' };
  },
};
