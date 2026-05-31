import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generarCodigo(): string {
  const año = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `COT-${año}-${rand}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const productosList = [
  'Certificación ISO 9001:2025', 'Certificación ISO 14001:2025', 'Certificación ISO 45001:2025',
  'Certificación ISO 27001:2025', 'Certificación ISO 37001:2025', 'Certificación ISO 50001:2025',
  'Auditoría Interna ISO 9001', 'Auditoría Interna ISO 14001', 'Auditoría Interna ISO 45001',
  'Curso de Implementación ISO 9001', 'Curso de Implementación ISO 14001',
  'Consultoría en Gestión de Calidad', 'Consultoría en Gestión Ambiental',
  'Capacitación en Seguridad y Salud', 'Taller de Liderazgo y Mejora Continua',
  'Evaluación de Riesgos Laborales', 'Diagnóstico Organizacional',
  'Plan de Manejo Ambiental', 'Sistema de Gestión Integrado',
];

const preciosList = [1200, 1500, 1100, 1800, 1300, 1150, 800, 850, 800, 500, 500, 2000, 2200, 600, 400, 900, 1500, 1800, 2500];

const metodosPago = ['transferencia', 'tarjeta', 'yape', 'plin', 'efectivo', null];

const notasList = [
  'Incluye visita técnica inicial y informe de diagnóstico. Vigencia de certificación: 3 años.',
  'Descuento especial por contratar antes del inicio del próximo mes.',
  'El precio incluye materiales digitales y certificado de participación.',
  'Se requiere pago anticipado del 50% para reservar la fecha de auditoría.',
  'Incluye 2 rondas de revisión documentaria antes de la auditoría final.',
  null, null, null,
];

const terminosList = [
  'Válido por 30 días. Aceptamos transferencia bancaria, Yape, Plin y tarjetas.',
  'Pago en 2 cuotas: 50% al inicio, 50% al completar la auditoría.',
  'Cancelación gratuita hasta 7 días antes del inicio del servicio.',
  null, null,
];

const estados = ['pendiente', 'pendiente', 'pendiente', 'pendiente', 'aprobada', 'aprobada', 'rechazada', 'revision', 'expirada'] as const;

async function main() {
  console.log('Seeding cotizaciones...');

  // Get existing users for clientes
  const users = await prisma.user.findMany({ where: { role: 'USER' }, take: 30 });
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (users.length === 0) {
    console.log('No users found. Cannot seed cotizaciones.');
    await prisma.$disconnect();
    return;
  }

  // Delete existing cotizaciones
  await prisma.cotizacionActividad.deleteMany({});
  await prisma.cotizacionItem.deleteMany({});
  await prisma.cotizacion.deleteMany({});
  console.log('Cleared existing cotizaciones');

  const startDate = new Date('2025-01-01');
  const endDate = new Date();
  const usedCodigos = new Set<string>();

  for (let i = 0; i < 25; i++) {
    const user = users[i % users.length];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const fecha = randomDate(startDate, endDate);
    const vencimiento = addDays(fecha, 15 + Math.floor(Math.random() * 30));
    const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];

    // Generate 1-4 items
    const numItems = 1 + Math.floor(Math.random() * 4);
    const selectedProducts = new Set<number>();
    const items: { producto: string; descripcion: string; cantidad: number; precioUnit: number; descuento: number; total: number }[] = [];

    for (let j = 0; j < numItems; j++) {
      let idx: number;
      do { idx = Math.floor(Math.random() * productosList.length); } while (selectedProducts.has(idx));
      selectedProducts.add(idx);

      const cantidad = 1 + Math.floor(Math.random() * 5);
      const precioUnit = preciosList[idx] + (estado === 'aprobada' ? 0 : Math.floor(Math.random() * 300));
      const descuento = Math.random() < 0.3 ? Math.floor(precioUnit * (0.05 + Math.random() * 0.1)) : 0;
      const total = cantidad * precioUnit - descuento;
      items.push({ producto: productosList[idx], descripcion: '', cantidad, precioUnit, descuento, total });
    }

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const descuentoGlobal = Math.random() < 0.2 ? Math.floor(subtotal * (0.05 + Math.random() * 0.1)) : 0;
    const impuestoPorcentaje = 18;
    const impuesto = (subtotal - descuentoGlobal) * impuestoPorcentaje / 100;
    const total = subtotal - descuentoGlobal + impuesto;

    let codigo: string;
    do { codigo = generarCodigo(); } while (usedCodigos.has(codigo));
    usedCodigos.add(codigo);

    const notas = notasList[Math.floor(Math.random() * notasList.length)];
    const terminos = terminosList[Math.floor(Math.random() * terminosList.length)];

    const cotizacion = await prisma.cotizacion.create({
      data: {
        codigo,
        clienteId: user.id,
        clienteNombre: `${user.firstName} ${user.lastName}`,
        clienteEmail: user.email,
        clientePhone: user.phone,
        clienteCompany: user.company,
        vendedorId: admin?.id || null,
        vendedorNombre: admin ? `${admin.firstName} ${admin.lastName}` : null,
        fecha,
        vencimiento,
        estado: estado as any,
        subtotal,
        descuento: descuentoGlobal,
        impuesto,
        total,
        notas,
        terminos,
        metodoPago,
        items: { create: items },
        actividad: {
          create: [
            { tipo: 'creada', descripcion: `Cotización creada con ${items.length} producto(s)`, usuario: admin ? `${admin.firstName} ${admin.lastName}` : null },
            ...(estado !== 'pendiente' ? [{ tipo: estado, descripcion: `Estado cambiado a ${estado}`, usuario: admin ? `${admin.firstName} ${admin.lastName}` : null }] : []),
          ],
        },
      },
    });

    if ((i + 1) % 5 === 0) console.log(`Inserted ${i + 1} cotizaciones...`);
  }

  const total = await prisma.cotizacion.count();
  const stats = await prisma.cotizacion.groupBy({ by: ['estado'], _count: true });
  console.log(`Done! Total cotizaciones: ${total}`);
  for (const s of stats) {
    console.log(`  ${s.estado}: ${s._count}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
