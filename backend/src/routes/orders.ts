import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateInvoice } from '../lib/pdf';
import { sendInvoiceEmail } from '../lib/email';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      items, customerName, customerEmail, customerPhone,
      customerAddress, customerCity, customerZip,
      shippingMethod, paymentMethod, paymentDetail,
      subtotal, tax, shipping, discount, couponCode, total, notes,
      billingType, billingRuc, billingName, billingAddress,
    } = req.body;

    if (!items?.length || !customerName || !customerEmail || total == null || total === '' || isNaN(Number(total))) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        customerName, customerEmail, customerPhone,
        customerAddress, customerCity, customerZip,
        shippingMethod: shippingMethod || 'delivery',
        paymentMethod: paymentMethod || 'yape',
        paymentDetail: paymentDetail ? JSON.stringify(paymentDetail) : null,
        subtotal: Number(subtotal) || 0,
        tax: Number(tax) || 0,
        shipping: Number(shipping) || 0,
        discount: Number(discount) || 0,
        couponCode, total: Number(total), notes,
        billingType: billingType || null,
        billingRuc: billingRuc || null,
        billingName: billingName || null,
        billingAddress: billingAddress || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            price: item.price || 0,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity || 1 } },
      });
    }

    res.status(201).json({ message: 'Orden creada exitosamente', orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }
    res.json({
      ...order,
      paymentDetail: order.paymentDetail ? JSON.parse(order.paymentDetail) : null,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
});

router.get('/:id/invoice', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }

    const pdfBuffer = await generateInvoice({
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="recibo-${order.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ error: 'Error al generar el recibo' });
  }
});

router.post('/:id/send-invoice', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const orderId = Number(req.params.id);

    if (!email) {
      res.status(400).json({ error: 'Correo electrónico requerido' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }

    const pdfBuffer = await generateInvoice({
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

    await sendInvoiceEmail(email, pdfBuffer, orderId);

    res.json({ message: 'Recibo enviado correctamente' });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({ error: 'Error al enviar el recibo por correo' });
  }
});

export default router;
