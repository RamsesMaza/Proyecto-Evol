import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

interface PaymentDetail {
  firstPayment?: { method: string; amount: number; code?: string };
  secondPayment?: { method: string; amount: number; date?: string; details?: string };
  cardAmount?: number;
  cashAmount?: number;
}

interface InvoiceData {
  orderId: number;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  paymentMethod: string;
  paymentDetail?: PaymentDetail | null;
  billingType?: string | null;
  billingRuc?: string | null;
  billingName?: string | null;
  items: Array<{ product: { title: string }; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

const methodLabels: Record<string, string> = {
  yape: 'Yape / Plin', plin: 'Yape / Plin', visa: 'Visa', mastercard: 'Mastercard',
  paypal: 'PayPal', mercadopago: 'Mercado Pago', mixto: 'Pago Mixto',
};

const fmt = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function generateInvoice(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 35, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ml = 35;
    const W = doc.page.width - ml * 2;
    const red = '#C10E1A';
    const dark = '#1f2937';
    const gray = '#6b7280';
    const light = '#f1f5f9';

    // ───── HEADER ─────
    let y = ml;
    doc.rect(0, 0, 13, doc.page.height).fill(red);
    doc.rect(ml, y, W, 72).fill(light).stroke('#e5e7eb');
    doc.fill(dark).fontSize(22).font('Helvetica-Bold').text('PRO EVOL', ml + 12, y + 10);
    doc.fontSize(7.5).font('Helvetica').fill(gray)
      .text('Certificaciones Internacionales · RUC: 20605093062 · Av. Principal 1234, Lima', ml + 12, y + 40);
    const badgeX = doc.page.width - ml - 145;
    doc.rect(badgeX, y + 6, 145, 58).fill(red);
    doc.fill('#fff').fontSize(12).font('Helvetica-Bold')
      .text('RECIBO', badgeX, y + 16, { width: 145, align: 'center' });
    doc.fontSize(18)
      .text(`#${String(data.orderId).padStart(6, '0')}`, badgeX, y + 34, { width: 145, align: 'center' });
    doc.fontSize(7).font('Helvetica')
      .text(new Date(data.createdAt).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric',
      }), badgeX, y + 54, { width: 145, align: 'center' });

    // ───── CUSTOMER + PAYMENT ─────
    y = 122;
    doc.rect(ml, y, W, 74).fill(light).stroke('#e5e7eb');
    doc.fill(red).fontSize(8).font('Helvetica-Bold').text('DATOS DEL CLIENTE', ml + 12, y + 6);
    const cl = (label: string, value: string, x: number, yy: number) => {
      doc.fill(gray).fontSize(7.5).font('Helvetica').text(label, x, yy, { width: 55 });
      doc.fill(dark).fontSize(7.5).font('Helvetica').text(value, x + 58, yy, { width: 160 });
    };
    cl('Cliente:', data.customerName, ml + 12, y + 22);
    cl('Email:', data.customerEmail, ml + 12, y + 36);
    cl('Teléfono:', data.customerPhone || '-', ml + 12, y + 50);
    if (data.customerAddress) {
      cl('Dirección:', `${data.customerAddress}${data.customerCity ? `, ${data.customerCity}` : ''}`, 250, y + 22);
    }
    if (data.billingType === 'factura' && data.billingRuc) {
      cl('RUC:', data.billingRuc, 250, y + 36);
      cl('R. Social:', data.billingName || '-', 250, y + 50);
    } else {
      doc.fill(gray).fontSize(7.5).font('Helvetica').text('Boleta (Consumidor Final)', 250, y + 36);
    }

    // ───── PAYMENT ─────
    y = 210;
    const hasSplit = !!data.paymentDetail?.firstPayment;
    const pmBoxH = hasSplit ? 60 : 26;
    doc.rect(ml, y, W, pmBoxH).fill(light).stroke('#e5e7eb');
    doc.fill(red).fontSize(8).font('Helvetica-Bold').text('MÉTODO DE PAGO', ml + 12, y + 6);
    if (hasSplit) {
      const fp = data.paymentDetail!.firstPayment!;
      const sp = data.paymentDetail!.secondPayment!;
      doc.fill(dark).fontSize(8).font('Helvetica')
        .text('Mixto: 1° ' + (fp.method === 'tarjeta' ? 'Tarjeta' : 'Efectivo'), ml + 12, y + 22);
      doc.fontSize(8).fill(dark).font('Helvetica-Bold').text(fmt(fp.amount), ml + 130, y + 22);
      if (fp.code) doc.fontSize(7).fill(red).font('Helvetica').text(`Código: ${fp.code}`, ml + 200, y + 22);
      doc.fill(gray).fontSize(7.5).font('Helvetica')
        .text('2° ' + (sp?.method === 'tarjeta' ? 'Tarjeta' : 'Efectivo'), ml + 12, y + 40);
      doc.fontSize(8).fill(dark).font('Helvetica-Bold').text(fmt(sp?.amount ?? 0), ml + 130, y + 40);
      if (sp?.date) doc.fontSize(7).fill(gray).font('Helvetica').text(`Fecha: ${sp.date}`, ml + 200, y + 40);
      const details = sp?.details?.toLowerCase() || '';
      if (details.includes('depósito') || details.includes('transferencia')) {
        doc.fontSize(6.5).fill('#166534')
          .text('BCP Cta.Cte.: 191-2345678-0-00 · CCI: 002-191-123456780000-00', ml + 12, y + 52, { width: W - 24 });
      }
    } else {
      doc.fill(dark).fontSize(8).font('Helvetica').text(methodLabels[data.paymentMethod] || data.paymentMethod, ml + 12, y + 22);
    }

    // ───── ITEMS TABLE ─────
    y = 278;
    const cols = [ml + 12, 210, 330, 400];
    const hdrs = ['Producto / Servicio', 'Precio', 'Cant', 'Total'];
    doc.rect(ml, y, W, 18).fill(dark);
    doc.fill('#fff').fontSize(7.5).font('Helvetica-Bold');
    hdrs.forEach((h, i) => doc.text(h, cols[i], y + 5, { width: cols[i + 1] ? cols[i + 1] - cols[i] - 8 : 100 }));

    let ry = y + 20;
    data.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? '#fff' : light;
      const rh = 16;
      doc.rect(ml, ry, W, rh).fill(bg);
      const total = item.price * item.quantity;
      doc.fill(dark).fontSize(7.5).font('Helvetica')
        .text(item.product.title, cols[0], ry + 3, { width: cols[1] - cols[0] - 6 })
        .text(fmt(item.price), cols[1], ry + 3, { width: cols[2] - cols[1] - 6 })
        .text(String(item.quantity), cols[2], ry + 3, { width: cols[3] - cols[2] - 6 })
        .text(fmt(total), cols[3], ry + 3, { width: 100 });
      ry += rh;
    });

    // ───── TOTALS ─────
    const totW = 185;
    const totX = doc.page.width - ml - totW;
    y = Math.max(ry + 8, 370);
    doc.rect(totX, y, totW, 90).fill(light).stroke('#e5e7eb');
    let ty = y + 8;
    const tRow = (label: string, val: string, big = false, color = dark) => {
      doc.fill(color).fontSize(big ? 11 : 8).font(big ? 'Helvetica-Bold' : 'Helvetica')
        .text(label, totX + 10, ty, { width: 80 })
        .text(val, totX + 90, ty, { width: totW - 100, align: 'right' });
      ty += big ? 22 : 16;
    };
    tRow('Subtotal', fmt(data.subtotal));
    tRow('IGV (18%)', fmt(data.tax));
    tRow('Envío', data.shipping === 0 ? 'Gratis' : fmt(data.shipping));
    if (data.discount > 0) tRow('Descuento', `-${fmt(data.discount)}`, false, '#10b981');
    doc.moveTo(totX + 10, ty).lineTo(totX + totW - 10, ty).stroke('#e5e7eb');
    ty += 6;
    tRow('TOTAL', fmt(data.total), true, dark);

    // ───── FOOTER ─────
    doc.fill(gray).fontSize(7).font('Helvetica')
      .text('Pro Evol Certificaciones · www.proevol.com · contacto@proevol.com', ml, doc.page.height - 30, { align: 'center' })
      .text('Gracias por su preferencia. Este documento es un comprobante de pago válido.', ml, doc.page.height - 20, { align: 'center' });

    doc.end();
  });
}
