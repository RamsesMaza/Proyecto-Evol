import { prisma } from '../lib/prisma';
import { NotFoundError } from '../shared/errors';

function generarCodigo(): string {
  const año = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `COT-${año}-${rand}`;
}

const include = {
  items: { orderBy: { id: 'asc' as const } },
  actividad: { orderBy: { fecha: 'desc' as const } },
};

export const CotizacionModel = {
  async list(filters: {
    query?: string;
    estado?: string;
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const { query, estado, page = 0, pageSize = 20, sortField = 'fecha', sortDir = 'desc' } = filters;
    const where: any = {};

    if (estado && estado !== 'todas') where.estado = estado;
    if (query) {
      where.OR = [
        { codigo: { contains: query } },
        { clienteNombre: { contains: query } },
        { clienteEmail: { contains: query } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortField] = sortDir;

    const [total, items] = await Promise.all([
      prisma.cotizacion.count({ where }),
      prisma.cotizacion.findMany({ where, orderBy, skip: page * pageSize, take: pageSize, include: { items: true } }),
    ]);

    return { cotizaciones: items.map(format), total };
  },

  async getById(id: number) {
    const item = await prisma.cotizacion.findUnique({ where: { id }, include });
    if (!item) throw new NotFoundError('Cotización');
    return format(item);
  },

  async create(data: {
    clienteId?: number; clienteNombre: string; clienteEmail: string; clientePhone?: string; clienteCompany?: string;
    vendedorId?: number; vendedorNombre?: string; vencimiento: string; notas?: string; terminos?: string;
    metodoPago?: string; descuento?: number; impuesto?: number; estado?: string;
    items: { producto: string; descripcion?: string; cantidad: number; precioUnit: number; descuento?: number }[];
  }) {
    const descuento = data.descuento || 0;
    const impuesto = data.impuesto || 18;
    const itemsData = data.items.map(i => {
      const total = i.cantidad * i.precioUnit - (i.descuento || 0);
      return { producto: i.producto, descripcion: i.descripcion, cantidad: i.cantidad, precioUnit: i.precioUnit, descuento: i.descuento || 0, total };
    });
    const subtotal = itemsData.reduce((s, i) => s + i.total, 0);
    const descuentoTotal = descuento;
    const impuestoTotal = (subtotal - descuentoTotal) * impuesto / 100;
    const total = subtotal - descuentoTotal + impuestoTotal;

    const cotizacion = await prisma.cotizacion.create({
      data: {
        codigo: generarCodigo(),
        clienteId: data.clienteId, clienteNombre: data.clienteNombre, clienteEmail: data.clienteEmail,
        clientePhone: data.clientePhone, clienteCompany: data.clienteCompany,
        vendedorId: data.vendedorId, vendedorNombre: data.vendedorNombre,
        vencimiento: new Date(data.vencimiento), notas: data.notas, terminos: data.terminos,
        metodoPago: data.metodoPago, descuento: descuentoTotal, impuesto: impuestoTotal,
        subtotal, total,
        estado: (data.estado as any) || 'pendiente',
        items: { create: itemsData },
        actividad: { create: { tipo: 'creada', descripcion: `Cotización creada con ${itemsData.length} producto(s)`, usuario: data.vendedorNombre } },
      },
      include,
    });

    return format(cotizacion);
  },

  async update(id: number, data: {
    clienteNombre?: string; clienteEmail?: string; clientePhone?: string; clienteCompany?: string;
    vencimiento?: string; notas?: string; terminos?: string; metodoPago?: string;
    descuento?: number; impuesto?: number; estado?: string;
    items?: { producto: string; descripcion?: string; cantidad: number; precioUnit: number; descuento?: number }[];
  }) {
    const existing = await prisma.cotizacion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Cotización');

    const updateData: any = { ...data };
    if (data.vencimiento) updateData.vencimiento = new Date(data.vencimiento);

    if (data.items) {
      const descuento = data.descuento ?? existing.descuento;
      const impuesto = data.impuesto ?? existing.impuesto;
      const itemsData = data.items.map(i => {
        const t = i.cantidad * i.precioUnit - (i.descuento || 0);
        return { producto: i.producto, descripcion: i.descripcion, cantidad: i.cantidad, precioUnit: i.precioUnit, descuento: i.descuento || 0, total: t };
      });
      const subtotal = itemsData.reduce((s, i) => s + i.total, 0);
      const impuestoTotal = (subtotal - descuento) * impuesto / 100;
      updateData.subtotal = subtotal;
      updateData.impuesto = impuestoTotal;
      updateData.total = subtotal - descuento + impuestoTotal;

      await prisma.cotizacionItem.deleteMany({ where: { cotizacionId: id } });
      await prisma.cotizacionItem.createMany({ data: itemsData.map(i => ({ ...i, cotizacionId: id })) });
    }

    if (updateData.estado && updateData.estado !== existing.estado) {
      await prisma.cotizacionActividad.create({
        data: { cotizacionId: id, tipo: updateData.estado, descripcion: `Estado cambiado a ${updateData.estado}`, usuario: data.clienteNombre },
      });
    }

    const updated = await prisma.cotizacion.update({ where: { id }, data: updateData, include });
    return format(updated);
  },

  async updateStatus(id: number, estado: string, usuario?: string) {
    const existing = await prisma.cotizacion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Cotización');
    const updated = await prisma.cotizacion.update({
      where: { id }, data: { estado: estado as any },
      include,
    });
    await prisma.cotizacionActividad.create({
      data: { cotizacionId: id, tipo: estado, descripcion: `Estado cambiado a ${estado}`, usuario },
    });
    return format(updated);
  },

  async delete(id: number) {
    const existing = await prisma.cotizacion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Cotización');
    await prisma.cotizacion.delete({ where: { id } });
    return { message: 'Cotización eliminada' };
  },

  async getStats() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [total, pendientes, aprobadas, rechazadas, expiradas, ingresos, mes] = await Promise.all([
      prisma.cotizacion.count(),
      prisma.cotizacion.count({ where: { estado: 'pendiente' } }),
      prisma.cotizacion.count({ where: { estado: 'aprobada' } }),
      prisma.cotizacion.count({ where: { estado: 'rechazada' } }),
      prisma.cotizacion.count({ where: { estado: 'expirada' } }),
      prisma.cotizacion.aggregate({ _sum: { total: true }, where: { estado: 'aprobada' } }),
      prisma.cotizacion.count({ where: { createdAt: { gte: firstOfMonth } } }),
    ]);
    return {
      total, pendientes, aprobadas, rechazadas, expiradas,
      ingresosProyectados: ingresos._sum.total || 0,
      conversionRate: total > 0 ? Math.round((aprobadas / total) * 100) : 0,
      esteMes: mes,
    };
  },
};

function format(c: any) {
  return {
    ...c,
    id: String(c.id),
    fecha: c.fecha ? (typeof c.fecha === 'string' ? c.fecha.split('T')[0] : new Date(c.fecha).toISOString().split('T')[0]) : '',
    vencimiento: c.vencimiento ? (typeof c.vencimiento === 'string' ? c.vencimiento.split('T')[0] : new Date(c.vencimiento).toISOString().split('T')[0]) : '',
    createdAt: c.createdAt ? (typeof c.createdAt === 'string' ? c.createdAt.split('T')[0] : new Date(c.createdAt).toISOString().split('T')[0]) : '',
    updatedAt: c.updatedAt ? (typeof c.updatedAt === 'string' ? c.updatedAt.split('T')[0] : new Date(c.updatedAt).toISOString().split('T')[0]) : '',
    items: (c.items || []).map((i: any) => ({ ...i, id: String(i.id) })),
    actividad: (c.actividad || []).map((a: any) => ({
      ...a, id: String(a.id),
      fecha: a.fecha ? (typeof a.fecha === 'string' ? a.fecha.split('T')[0] : new Date(a.fecha).toISOString().split('T')[0]) : '',
    })),
  };
}
