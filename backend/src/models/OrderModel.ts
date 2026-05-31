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

  async list(filters: {
    query?: string; status?: string; paymentStatus?: string;
    page?: number; pageSize?: number; sortField?: string; sortDir?: 'asc' | 'desc';
  }) {
    const { query, status, paymentStatus, page = 0, pageSize = 100, sortField = 'createdAt', sortDir = 'desc' } = filters;
    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (query) {
      where.OR = [
        { customerName: { contains: query } },
        { customerEmail: { contains: query } },
      ];
    }
    const orderBy: any = {};
    orderBy[sortField] = sortDir;
    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where, orderBy, skip: page * pageSize, take: pageSize,
        include: { items: { include: { product: true } } },
      }),
    ]);
    return { orders: orders.map(formatOrder), total };
  },

  async getStats() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [total, paid, pending, cancelled, thisMonth, revenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'paid' } }),
      prisma.order.count({ where: { paymentStatus: 'pending' } }),
      prisma.order.count({ where: { paymentStatus: { in: ['cancelled', 'refunded'] } } }),
      prisma.order.count({ where: { createdAt: { gte: firstOfMonth }, paymentStatus: 'paid' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    ]);
    return { total, paid, pending, cancelled, ingresos: revenue._sum.total || 0, esteMes: thisMonth };
  },
};

function formatOrder(o: any) {
  return {
    id: String(o.id),
    codigo: `ORD-${String(o.id).padStart(4, '0')}`,
    clienteNombre: o.customerName,
    clienteEmail: o.customerEmail,
    clientePhone: o.customerPhone,
    clienteCompany: null,
    vendedorNombre: null,
    fecha: o.createdAt ? (typeof o.createdAt === 'string' ? o.createdAt.split('T')[0] : new Date(o.createdAt).toISOString().split('T')[0]) : '',
    vencimiento: o.createdAt ? (typeof o.createdAt === 'string' ? o.createdAt.split('T')[0] : new Date(o.createdAt).toISOString().split('T')[0]) : '',
    estado: o.paymentStatus === 'paid' ? 'completada' : o.paymentStatus,
    subtotal: o.subtotal,
    descuento: o.discount,
    impuesto: o.tax,
    total: o.total,
    notas: o.notes,
    terminos: null,
    metodoPago: o.paymentMethod,
    items: (o.items || []).map((i: any) => ({
      id: String(i.id),
      producto: i.product?.title || `Producto #${i.productId}`,
      descripcion: null,
      cantidad: i.quantity,
      precioUnit: i.price,
      descuento: 0,
      total: i.quantity * i.price,
    })),
    actividad: [],
    createdAt: o.createdAt ? (typeof o.createdAt === 'string' ? o.createdAt.split('T')[0] : new Date(o.createdAt).toISOString().split('T')[0]) : '',
    updatedAt: o.updatedAt ? (typeof o.updatedAt === 'string' ? o.updatedAt.split('T')[0] : new Date(o.updatedAt).toISOString().split('T')[0]) : '',
  };
}
