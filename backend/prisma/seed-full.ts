import 'dotenv/config';
import { PrismaClient, LeadStatus, LeadPriority, CampaignStatus, CampaignType, CotizacionEstado, CourseLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

function randomBool(prob = 0.5): boolean {
  return Math.random() < prob;
}

function generateCodigo(): string {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `COT-${rand}`;
}

function randomPhone(): string {
  const prefix = randomItem(['+51 9', '+51 9', '01 ']);
  const num = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${prefix}${num.slice(0, 8)}`;
}

const START_DATE = new Date('2025-07-01');
const END_DATE = new Date('2026-07-01');

const firstNames = [
  'Carlos','María','José','Ana','Luis','Carmen','Jorge','Rosa','Miguel','Elena',
  'Juan','Patricia','Diego','Laura','Andrés','Sofía','Pedro','Isabel','Manuel','Lucía',
  'Ricardo','Verónica','Fernando','Adriana','Alberto','Mónica','Sergio','Gabriela','Pablo','Diana',
  'Raúl','Claudia','Óscar','Mariana','Héctor','Silvia','Marco','Natalia','Víctor','Alejandra',
  'Rubén','Andrea','Francisco','Brenda','Antonio','Valeria','Alejandro','Camila','Roberto','Paola',
  'Javier','Liliana','Gustavo','Renata','Enrique','Daniela','Eduardo','Ximena','Arturo','Constanza',
  'David','Fernanda','Felipe','Karina','Cristian','Lorena','Iván','Marisol','Adrián','Katherine',
  'Mauricio','Sabrina','Alonso','Viviana','Jesús','Estefanía','Christian','Bárbara','Rodrigo','Pamela',
  'Humberto','Tatiana','Edgar','Johana','René','Yuliana','César','Luz','Ulises','Martha',
  'Emilio','Ruth','Martín','Erika','Joel','Rocío','Tomás','Gloria','Hugo','Nora',
];

const lastNames = [
  'García','Rodríguez','Martínez','López','Hernández','González','Pérez','Sánchez','Ramírez','Torres',
  'Flores','Rivera','Castillo','Vásquez','Reyes','Morales','Cruz','Ortiz','Gutiérrez','Chávez',
  'Romero','Álvarez','Medina','Salazar','Moreno','Vega','Castro','Campos','Ramos','Silva',
  'Díaz','Mendoza','Peña','Guerrero','Ruiz','Aguilar','Vargas','Espinoza','Carrillo','Bravo',
  'Navarro','Rojas','Miranda','Delgado','Molina','Sandoval','Paredes','Córdova','Figueroa','Velasco',
  'Soto','Tapia','Cáceres','Valdivia','Huamán','Quispe','Mamani','Condori','Llamoca','Bustamante',
  'Linares','Salinas','Palacios','Cornejo','Villanueva','Ávila','Cabrera','Calderón','Maldonado',
  'Huerta','Arroyo','Quiroz','Benites','Zevallos','Peralta','Ojeda','Infante','Leyva','Farfán',
];

const companies = [
  'TechSolutions SAC','Grupo Ingeniería EIRL','Corporación Andina','DataPro Systems',
  'Constructora Los Andes','Servicios Generales R&C','Inversiones San Isidro','Consultoría ABC',
  'Logística del Sur','Metal Mecánica SAC','Alimentos del Norte','Transportes Rápidos',
  'Energía Renovable EIRL','Telecom Networks','Agroindustrias SAC','Minería Responsable',
  'Hoteles Turísticos','Educación Superior','Salud Integral','Banca Corporativa',
  'Seguros Confianza','Inmobiliaria Horizonte','Automotriz del Perú','Textiles Export',
  'Pesquera Mar Azul','Forestal Amazónica','Construcción Civil','Petroquímica SAC',
  'Mercados Globales','Industrias Unidas',
];

const userStatuses = ['activo','activo','activo','activo','inactivo','frecuente','frecuente','nuevo'];

const cityAddresses = [
  { city: 'Lima', zips: ['Lima 01','Lima 15','Lima 18','Lima 23','Lima 33'] },
  { city: 'Arequipa', zips: ['Arequipa 01','Arequipa 04'] },
  { city: 'Cusco', zips: ['Cusco 01','Cusco 03'] },
  { city: 'Trujillo', zips: ['Trujillo 01','Trujillo 02'] },
  { city: 'Piura', zips: ['Piura 01'] },
  { city: 'Chiclayo', zips: ['Chiclayo 01'] },
  { city: 'Huancayo', zips: ['Huancayo 01'] },
  { city: 'Iquitos', zips: ['Iquitos 01'] },
];

const leadSources = ['web','web','web','referral','referral','campaign','social','social','evento','llamada'];
const leadStatuses: LeadStatus[] = ['nuevo','nuevo','nuevo','contactado','contactado','interesado','en_negociacion','convertido','perdido'];
const leadPriorities: LeadPriority[] = ['baja','media','media','alta','urgente'];

const campaignTypes: CampaignType[] = ['email','sms','redes','evento','otro'];
const campaignStatuses: CampaignStatus[] = ['borrador','activa','activa','pausada','finalizada','finalizada','cancelada'];

const cotEstados: CotizacionEstado[] = ['pendiente','pendiente','pendiente','aprobada','aprobada','rechazada','revision','expirada'];

const productNames = [
  'Certificación ISO 9001:2025','Certificación ISO 14001:2025','Certificación ISO 45001:2025',
  'Certificación ISO 27001:2025','Certificación ISO 37001:2025','Certificación ISO 50001:2025',
  'Auditoría Interna ISO 9001','Auditoría Interna ISO 14001','Auditoría Interna ISO 45001',
  'Curso Implementación ISO 9001','Curso Implementación ISO 14001','Curso Implementación ISO 27001',
  'Consultoría Gestión de Calidad','Consultoría Gestión Ambiental','Consultoría Seguridad Informática',
  'Capacitación Seguridad y Salud','Taller Mejora Continua','Evaluación Riesgos Laborales',
  'Diagnóstico Organizacional','Plan Manejo Ambiental','Sistema Gestión Integrado',
  'Auditoría Interna ISO 50001','Curso Implementación ISO 50001','Consultoría Gestión Antisoborno',
  'Capacitación Liderazgo','Taller ISO 9001','Taller ISO 14001','Taller ISO 45001',
];

const productPrices = [1200,1300,1100,1500,1250,1150,800,850,800,500,500,550,2000,2200,1800,600,400,900,1500,1800,2500,750,450,2100,350,300,300,300];

const paymentMethods = ['transferencia','tarjeta','yape','plin','mercadopago'];

const ticketPriorities = ['baja','media','media','alta','urgente'];
const ticketStatuses = ['abierto','abierto','en_progreso','en_progreso','resuelto','resuelto','cerrado'];

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seed Full: Starting...\n');

  const passwordHash = await bcrypt.hash('Test1234!', 10);

  // ── 0. Get existing data ─────────────────────────────────────────────────────
  const existingUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true, firstName: true, lastName: true } });
  const existingUserEmails = new Set(existingUsers.map(u => u.email));
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany();

  const adminUser = existingUsers.find(u => u.role === 'ADMIN');
  const salesUser = existingUsers.find(u => u.role === 'SALES');
  const tiUser = existingUsers.find(u => u.role === 'TI');
  const marketingUser = existingUsers.find(u => u.role === 'MARKETING');
  const auditorUser = existingUsers.find(u => u.role === 'AUDITOR');

  console.log(`Found ${existingUsers.length} existing users, ${categories.length} categories, ${products.length} products`);

  // ── 1. Create 100 additional users ───────────────────────────────────────────
  console.log('\n📦 Creating additional users...');
  const newUsers: any[] = [];
  const usedEmails = new Set(existingUserEmails);

  let attempts = 0;
  while (newUsers.length < 100 && attempts < 1000) {
    attempts++;
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1,999)}@email.com`;
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);

    const company = randomItem(companies);
    const status = randomItem(userStatuses);
    const createdAt = randomDate(START_DATE, END_DATE);
    const role = randomItem(['USER','USER','USER','USER','USER','USER','SALES','MARKETING']);

    newUsers.push({
      firstName, lastName, email,
      phone: randomPhone(),
      company: company,
      password: passwordHash,
      role,
      status,
      isFavorite: randomBool(0.12),
      twoFactorEnabled: randomBool(0.05),
      twoFactorMethod: randomBool(0.05) ? 'email' : null,
      createdAt,
    });
  }

  if (newUsers.length > 0) {
    for (let i = 0; i < newUsers.length; i += 50) {
      await prisma.user.createMany({ data: newUsers.slice(i, i + 50) });
    }
    console.log(`Created ${newUsers.length} new users`);
  }

  // ── 2. Seed permissions (if not already done) ───────────────────────────────
  console.log('\n🔑 Seeding permissions...');
  const permsData = [
    { name: 'Listar Usuarios', slug: 'users.list', module: 'users' },
    { name: 'Crear Usuarios', slug: 'users.create', module: 'users' },
    { name: 'Editar Usuarios', slug: 'users.edit', module: 'users' },
    { name: 'Cambiar Estado', slug: 'users.change-status', module: 'users' },
    { name: 'Cambiar Rol', slug: 'users.change-role', module: 'users' },
    { name: 'Restablecer Contraseña', slug: 'users.reset-password', module: 'users' },
    { name: 'Ver Actividad', slug: 'users.view-activity', module: 'users' },
    { name: 'Ver Tickets', slug: 'tickets.list', module: 'support' },
    { name: 'Crear Tickets', slug: 'tickets.create', module: 'support' },
    { name: 'Actualizar Tickets', slug: 'tickets.update', module: 'support' },
    { name: 'Ver Auditoría', slug: 'audit.list', module: 'audit' },
    { name: 'Gestionar Permisos', slug: 'permissions.manage', module: 'permissions' },
    { name: 'Ver Sesiones', slug: 'sessions.list', module: 'sessions' },
    { name: 'Cerrar Sesiones', slug: 'sessions.close', module: 'sessions' },
    { name: 'Ver Intentos Login', slug: 'login-attempts.list', module: 'security' },
    { name: 'Ver Dashboard TI', slug: 'dashboard.view', module: 'dashboard' },
  ];

  const createdPerms: any[] = [];
  for (const p of permsData) {
    const perm = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    createdPerms.push(perm);
  }
  console.log(`Seeded ${createdPerms.length} permissions`);

  // Assign all to ADMIN and TI
  for (const role of ['ADMIN','TI']) {
    for (const perm of createdPerms) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: perm.id } },
        update: {},
        create: { role, permissionId: perm.id },
      });
    }
  }
  console.log('Assigned permissions to ADMIN and TI');

  // ── 3. Reload all users with IDs ────────────────────────────────────────────
  const allUsers = await prisma.user.findMany({ orderBy: { id: 'asc' } });
  const regularUsers = allUsers.filter(u => u.role === 'USER');
  const salesUsers = allUsers.filter(u => u.role === 'SALES');
  const marketingUsers = allUsers.filter(u => u.role === 'MARKETING');
  const tiUsers = allUsers.filter(u => u.role === 'TI');
  console.log(`Total users: ${allUsers.length} (${regularUsers.length} regular, ${salesUsers.length} sales, ${marketingUsers.length} marketing, ${tiUsers.length} TI)`);

  // ── 4. Clear data from previous runs (reverse FK order) ────────────────────
  console.log('\n🧹 Clearing existing seed data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cotizacionActividad.deleteMany({});
  await prisma.cotizacionItem.deleteMany({});
  await prisma.cotizacion.deleteMany({});
  await prisma.leadActivity.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.campaignResult.deleteMany({});
  await prisma.emailCampaign.deleteMany({});
  await prisma.smsCampaign.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.loginAttempt.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.courseMaterial.deleteMany({});
  await prisma.courseModule.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.segmentMember.deleteMany({});
  await prisma.segment.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  console.log('Cleared existing seed data');

  // ── 5. Generate Orders (300-500) over 12 months ─────────────────────────────
  console.log('\n📋 Generating orders...');

  const numOrders = randomInt(350, 500);

  for (let i = 0; i < numOrders; i++) {
    const user = randomItem(allUsers);
    const addr = randomItem(cityAddresses);
    const zip = randomItem(addr.zips);
    const createdAt = randomDate(START_DATE, END_DATE);
    const status = randomItem(['pending','pending','pending','completed','completed','completed','cancelled','refunded']);
    const paymentStatus = status === 'completed' ? 'paid' : status === 'refunded' ? 'refunded' : 'pending';
    const paymentMethod = randomItem(paymentMethods);
    const numItems = randomInt(1, 5);
    const selectedProducts = new Set<number>();
    const items: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      let idx: number;
      do { idx = randomInt(0, products.length - 1); } while (selectedProducts.has(idx));
      selectedProducts.add(idx);
      const prod = products[idx];
      const qty = randomInt(1, 3);
      const price = prod.price + randomFloat(-100, 200);
      const total = qty * price;
      subtotal += total;
      items.push({ productId: prod.id, quantity: qty, price });
    }

    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const shipping = randomItem([0, 0, 0, 15, 25, 50]);
    const discount = randomBool(0.2) ? parseFloat((subtotal * randomFloat(0.05, 0.15)).toFixed(2)) : 0;
    const total = parseFloat((subtotal + tax + shipping - discount).toFixed(2));

    await prisma.order.create({
      data: {
        userId: user.id,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: user.phone,
        customerAddress: `${randomInt(100, 9999)} Av. ${randomItem(['Principal','Los Olivos','Industrial','Central','Norte','Sur','Este','Oeste'])}`,
        customerCity: addr.city,
        customerZip: zip,
        shippingMethod: randomItem(['delivery','delivery','delivery','pickup']),
        paymentMethod, paymentStatus, status,
        subtotal, tax, shipping, discount, total,
        notes: randomBool(0.15) ? 'Cliente solicitó factura electrónica' : null,
        createdAt,
        items: { create: items },
      },
    });

    if ((i + 1) % 100 === 0) console.log(`  ${i + 1} orders created...`);
  }
  console.log(`Created ${numOrders} orders`);

  // ── 6. Generate Cotizaciones (200-300) ──────────────────────────────────────
  console.log('\n📄 Generating cotizaciones...');
  const numCots = randomInt(200, 300);
  const usedCodigos = new Set<string>();
  let cotBatch: any[] = [];

  for (let i = 0; i < numCots; i++) {
    const user = randomItem(regularUsers);
    const sales = randomBool(0.7) ? randomItem(salesUsers.length > 0 ? salesUsers : allUsers) : null;
    const estado = randomItem(cotEstados);
    const fecha = randomDate(START_DATE, END_DATE);
    const vencimiento = addDays(fecha, randomInt(15, 45));
    const numItems = randomInt(1, 6);

    const selProds = new Set<number>();
    const items: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      let idx: number;
      do { idx = randomInt(0, productNames.length - 1); } while (selProds.has(idx));
      selProds.add(idx);
      const cantidad = randomInt(1, 10);
      const precioUnit = productPrices[idx] + randomFloat(-100, 300);
      const descuento = randomBool(0.25) ? parseFloat((precioUnit * randomFloat(0.05, 0.15)).toFixed(2)) : 0;
      const totalItem = parseFloat((cantidad * precioUnit - descuento).toFixed(2));
      subtotal += totalItem;
      items.push({
        producto: productNames[idx],
        descripcion: randomBool(0.5) ? `Servicio profesional de ${productNames[idx].toLowerCase()}` : '',
        cantidad, precioUnit, descuento, total: totalItem,
      });
    }

    const descuentoGlobal = randomBool(0.15) ? parseFloat((subtotal * randomFloat(0.05, 0.1)).toFixed(2)) : 0;
    const impuesto = parseFloat(((subtotal - descuentoGlobal) * 0.18).toFixed(2));
    const total = parseFloat((subtotal - descuentoGlobal + impuesto).toFixed(2));

    let codigo: string;
    do { codigo = generateCodigo(); } while (usedCodigos.has(codigo));
    usedCodigos.add(codigo);

    const cot = await prisma.cotizacion.create({
      data: {
        codigo,
        clienteId: user.id,
        clienteNombre: `${user.firstName} ${user.lastName}`,
        clienteEmail: user.email,
        clientePhone: user.phone,
        clienteCompany: user.company,
        vendedorId: sales?.id || null,
        vendedorNombre: sales ? `${sales.firstName} ${sales.lastName}` : null,
        fecha, vencimiento,
        estado,
        subtotal, descuento: descuentoGlobal, impuesto, total,
        notas: randomBool(0.4) ? randomItem(['Incluye visita técnica inicial','Descuento por pronto pago','Vigencia: 3 años','Incluye materiales digitales']) : null,
        terminos: randomBool(0.3) ? randomItem(['Válido por 30 días','Pago en 2 cuotas','Cancelación gratuita hasta 7 días antes']) : null,
        metodoPago: randomItem(['transferencia','tarjeta','yape','plin','efectivo',null]),
        items: { create: items },
        actividad: {
          create: [
            { tipo: 'creada', descripcion: `Cotización creada con ${items.length} producto(s)`, usuario: sales ? `${sales.firstName} ${sales.lastName}` : 'Sistema' },
            ...(estado !== 'pendiente' ? [{ tipo: estado, descripcion: `Estado cambiado a ${estado}`, usuario: sales ? `${sales.firstName} ${sales.lastName}` : 'Sistema' }] : []),
          ],
        },
      },
    });

    if ((i + 1) % 50 === 0) console.log(`  ${i + 1} cotizaciones created...`);
  }
  console.log(`Created ${numCots} cotizaciones`);

  // ── 7. Generate Campaigns (20-30) ───────────────────────────────────────────
  console.log('\n📢 Generating campaigns...');
  const numCampaigns = randomInt(20, 30);
  const campaignNames = [
    'Lanzamiento ISO 9001 2025','Campaña Calidad Total','Semana de la Seguridad','Webinar ISO 27001',
    'Newsletter Julio','Oferta Certificaciones','Campaña LinkedIn','Email Marketing Q4',
    'Evento Gestión Ambiental','Campaña Antisoborno','Redes Sociales Diciembre','Conferencia ISO 45001',
    'Campaña Primavera','Webinar Gratuito ISO 14001','Lanzamiento ISO 50001','Campaña Verano',
    'Networking Corporativo','Email Marketing Q1','Campaña LinkedIn Q2','Evento Seguridad Informática',
    'Seminario Calidad','Campaña Fiestas Patrias','Webinar ISO 37001','Campaña Aniversario',
    'Newsletter Mensual','Campaña Educación Continua',
  ];

  for (let i = 0; i < numCampaigns; i++) {
    const name = campaignNames[i % campaignNames.length] + (i >= campaignNames.length ? ` ${Math.floor(i / campaignNames.length) + 1}` : '');
    const type = randomItem(campaignTypes);
    const status = randomItem(campaignStatuses);
    const startDate = randomDate(START_DATE, END_DATE);
    const endDate = status === 'finalizada' || status === 'cancelada' ? addDays(startDate, randomInt(15, 60)) : null;
    const assigned = randomBool(0.7) ? randomItem(marketingUsers.length > 0 ? marketingUsers : allUsers) : null;
    const budget = randomFloat(500, 10000);
    const spent = status === 'activa' || status === 'finalizada' ? randomFloat(100, budget) : 0;

    const campaign = await prisma.campaign.create({
      data: {
        name, type, status,
        description: randomBool(0.7) ? `Campaña de tipo ${type} para generar leads y promover certificaciones.` : null,
        objective: randomItem(['Generar leads','Aumentar ventas','Fidelizar clientes','Promocionar nuevo servicio','Captar clientes potenciales']),
        budget, spent, startDate, endDate,
        assignedTo: assigned?.id || null,
      },
    });

    // Results for active/finished campaigns
    if (status === 'activa' || status === 'finalizada') {
      const numResults = randomInt(1, 4);
      for (let r = 0; r < numResults; r++) {
        const recordedAt = endDate ? randomDate(startDate, endDate) : randomDate(startDate, END_DATE);
        const leadsGen = randomInt(5, 150);
        const leadsConv = randomInt(0, Math.floor(leadsGen * 0.3));
        const revenue = randomFloat(0, leadsConv * 3000);
        await prisma.campaignResult.create({
          data: {
            campaignId: campaign.id,
            leadsGenerated: leadsGen,
            leadsConverted: leadsConv,
            revenue,
            roi: revenue > 0 ? parseFloat(((revenue - budget) / budget * 100).toFixed(2)) : 0,
            impressions: randomInt(1000, 50000),
            clicks: randomInt(50, 3000),
            opens: randomInt(100, 5000),
            recordedAt,
          },
        });
      }

      // Email campaign details
      if (type === 'email' || randomBool(0.3)) {
        await prisma.emailCampaign.create({
          data: {
            campaignId: campaign.id,
            name: `Email: ${name}`,
            subject: randomItem([
              'Certifica tu empresa con nosotros',
              'Oferta especial en certificaciones',
              'Nueva norma ISO 2025 disponible',
              'Capacítate en gestión de calidad',
              'Protege tu información con ISO 27001',
            ]),
            body: '<p>Contenido de la campaña de email.</p>',
            template: randomItem(['default','promocional','informativo','evento']),
            status: status === 'finalizada' ? 'enviada' : status === 'activa' ? 'enviada' : 'borrador',
            sentAt: status === 'finalizada' || status === 'activa' ? randomDate(startDate, endDate || END_DATE) : null,
            recipients: randomInt(100, 5000),
            opened: randomInt(20, 1500),
            clicked: randomInt(5, 300),
            converted: randomInt(0, 50),
          },
        });
      }

      // SMS campaign details
      if (type === 'sms' || randomBool(0.2)) {
        await prisma.smsCampaign.create({
          data: {
            campaignId: campaign.id,
            name: `SMS: ${name}`,
            message: `Estimado cliente, lo invitamos a conocer nuestras certificaciones ISO. Más info en acsperu.com`,
            provider: 'twilio',
            status: status === 'finalizada' ? 'enviada' : status === 'activa' ? 'enviada' : 'borrador',
            sentAt: status === 'finalizada' || status === 'activa' ? randomDate(startDate, endDate || END_DATE) : null,
            sent: randomInt(50, 2000),
            delivered: randomInt(40, 1800),
            responded: randomInt(0, 100),
          },
        });
      }
    }
  }
  console.log(`Created ${numCampaigns} campaigns with results`);

  // ── 8. Generate Leads (300-500) with activities ─────────────────────────────
  console.log('\n🎯 Generating leads...');
  const campaigns = await prisma.campaign.findMany();
  const numLeads = randomInt(300, 500);

  for (let i = 0; i < numLeads; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1,999)}@empresa.com`;
    const status = randomItem(leadStatuses);
    const priority = randomItem(leadPriorities);
    const createdAt = randomDate(START_DATE, END_DATE);
    const assigned = randomBool(0.6) ? randomItem(salesUsers.length > 0 ? [...salesUsers, ...marketingUsers, ...allUsers] : allUsers) : null;
    const campaign = randomBool(0.3) && campaigns.length > 0 ? randomItem(campaigns) : null;
    const source = campaign ? campaign.type : randomItem(leadSources);
    const contactedAt = (status === 'contactado' || status === 'interesado' || status === 'en_negociacion' || status === 'convertido')
      ? addDays(createdAt, randomInt(1, 14)) : null;
    const convertedAt = status === 'convertido' ? addDays(contactedAt || createdAt, randomInt(7, 60)) : null;

    const lead = await prisma.lead.create({
      data: {
        campaignId: campaign?.id || null,
        name: `${firstName} ${lastName}`,
        email,
        phone: randomPhone(),
        company: randomBool(0.6) ? randomItem(companies) : null,
        position: randomBool(0.5) ? randomItem(['Gerente','CEO','Supervisor','Coordinador','Analista','Director','Consultor','Jefe de Calidad','Jefe de Seguridad']) : null,
        source,
        status, priority,
        assignedTo: assigned?.id || null,
        notes: randomBool(0.3) ? randomItem(['Cliente interesado en ISO 9001','Solicita información de precios','Requiere visita técnica','Empresa en proceso de certificación']) : null,
        contactedAt, convertedAt, createdAt,
      },
    });

    // Add activities
    const numActivities = randomInt(1, 5);
    const activityTypes = ['llamada','llamada','email','email','reunion','nota','nota','whatsapp'];
    for (let a = 0; a < numActivities; a++) {
      const actType = randomItem(activityTypes);
      const performer = assigned && randomBool(0.7) ? assigned : randomItem(allUsers);
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: actType,
          description: randomItem([
            `Llamada de seguimiento - ${status}`,
            `Envío de información de certificaciones`,
            `Reunión virtual para presentar propuesta`,
            `Correo con cotización enviado`,
            `Contacto vía WhatsApp`,
            `Nota: Cliente interesado en agendar reunión`,
            `Llamada: Cliente solicita más detalles`,
            `Reunión presencial en oficinas del cliente`,
            `Envío de brochure digital`,
            `Seguimiento post-cotización`,
          ]),
          performedBy: performer.id,
          createdAt: randomDate(createdAt, END_DATE),
        },
      });
    }
    if ((i + 1) % 100 === 0) console.log(`  ${i + 1} leads created...`);
  }
  console.log(`Created ${numLeads} leads with activities`);

  // ── 9. Generate Support Tickets (50-100) ─────────────────────────────────────
  console.log('\n🎫 Generating support tickets...');
  const numTickets = randomInt(50, 100);
  for (let i = 0; i < numTickets; i++) {
    const creator = randomItem(regularUsers.length > 0 ? regularUsers : allUsers);
    const assignee = randomBool(0.6) && tiUsers.length > 0 ? randomItem(tiUsers) : null;
    const status = randomItem(ticketStatuses);
    const createdAt = randomDate(START_DATE, END_DATE);

    await prisma.supportTicket.create({
      data: {
        title: randomItem([
          'Problema con el inicio de sesión','Error al generar cotización','No recibo correos del sistema',
          'Consulta sobre certificación','Problema con facturación','Error en módulo de reportes',
          'Solicito cambio de datos de usuario','No puedo subir documentos','El sistema está lento',
          'Problema con pago en línea','Error al descargar certificado','Consulta técnica sobre ISO',
          'No funciona el buscador','Problema con notificaciones','Error en módulo de cursos',
        ]),
        description: `Descripción detallada del ticket #${i + 1}. El usuario reporta incidencias en el sistema que requieren atención del equipo de soporte técnico.`,
        status, priority: randomItem(ticketPriorities),
        createdById: creator.id,
        assignedToId: assignee?.id || null,
        resolution: status === 'resuelto' || status === 'cerrado' ? randomItem([
          'Se corrigió el error de sesión','Problema resuelto tras actualización','Se realizó el cambio solicitado',
          'Error corregido en el servidor','Se actualizó la configuración',
        ]) : null,
        createdAt, updatedAt: randomDate(createdAt, END_DATE),
      },
    });
  }
  console.log(`Created ${numTickets} support tickets`);

  // ── 10. Generate Reviews (50-100) ───────────────────────────────────────────
  console.log('\n⭐ Generating reviews...');
  const numReviews = randomInt(50, 100);
  const reviewComments = [
    'Excelente servicio, muy profesionales','Muy buena atención y asesoría','Cumplieron con los plazos establecidos',
    'El proceso de certificación fue muy claro','Recomiendo ampliamente sus servicios','Buen soporte durante todo el proceso',
    'La consultoría fue de gran ayuda','Profesionales altamente capacitados','Muy satisfecho con el resultado',
    'El curso superó mis expectativas','Buena relación calidad-precio','Volvería a contratar sus servicios',
    'La certificación nos abrió nuevas oportunidades','Proceso ágil y transparente','Atención personalizada y eficiente',
  ];
  for (let i = 0; i < numReviews; i++) {
    const prod = randomItem(products);
    const user = randomItem(regularUsers.length > 0 ? regularUsers : allUsers);
    await prisma.review.create({
      data: {
        productId: prod.id,
        userName: `${user.firstName} ${user.lastName}`,
        rating: randomInt(3, 5),
        comment: randomItem(reviewComments),
        createdAt: randomDate(START_DATE, END_DATE),
      },
    });
  }
  console.log(`Created ${numReviews} reviews`);

  // ── 11. Generate Notifications (200+) ────────────────────────────────────────
  console.log('\n🔔 Generating notifications...');
  const notificationTypes = ['info','info','success','warning','system','message','promo'];
  const notificationTemplates = [
    { title: 'Bienvenido a ACS Perú', message: 'Gracias por registrarte en nuestra plataforma.', icon: '👋' },
    { title: 'Cotización actualizada', message: 'El estado de tu cotización ha sido actualizado.', icon: '📄' },
    { title: 'Certificación completada', message: 'Tu certificación ISO ha sido emitida exitosamente.', icon: '✅' },
    { title: 'Nuevo curso disponible', message: 'Revisa los nuevos cursos de capacitación.', icon: '📚' },
    { title: 'Recordatorio de pago', message: 'Tienes un pago pendiente por tu certificación.', icon: '💰' },
    { title: 'Ticket resuelto', message: 'Tu ticket de soporte ha sido resuelto.', icon: '🎫' },
    { title: 'Oferta especial', message: 'Aprovecha nuestros descuentos en certificaciones.', icon: '🏷️' },
    { title: 'Actualización del sistema', message: 'Se han realizado mejoras en la plataforma.', icon: '⚙️' },
    { title: 'Mensaje nuevo', message: 'Has recibido un nuevo mensaje en tu bandeja.', icon: '✉️' },
    { title: 'Lead asignado', message: 'Se te ha asignado un nuevo lead.', icon: '🎯' },
  ];

  const numNotifications = randomInt(200, 400);
  for (let i = 0; i < numNotifications; i++) {
    const user = randomItem(allUsers);
    const tmpl = randomItem(notificationTemplates);
    const type = randomItem(notificationTypes);
    await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title: tmpl.title,
        message: tmpl.message,
        icon: tmpl.icon,
        link: randomBool(0.3) ? randomItem(['/dashboard','/cotizaciones','/cursos','/soporte','/certificaciones']) : null,
        readAt: randomBool(0.6) ? randomDate(START_DATE, END_DATE) : null,
        createdAt: randomDate(START_DATE, END_DATE),
      },
    });
  }
  console.log(`Created ${numNotifications} notifications`);

  // ── 12. Generate LoginAttempts (500+) ────────────────────────────────────────
  console.log('\n🔐 Generating login attempts...');
  const numLoginAttempts = randomInt(500, 800);
  const loginBatch: any[] = [];
  for (let i = 0; i < numLoginAttempts; i++) {
    const user = randomBool(0.7) ? randomItem(allUsers) : null;
    const success = randomBool(0.75);
    loginBatch.push({
      email: user ? user.email : `${randomItem(firstNames).toLowerCase()}.${randomItem(lastNames).toLowerCase()}@email.com`,
      userId: user?.id || null,
      ipAddress: `${randomInt(10, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
      success,
      createdAt: randomDate(START_DATE, END_DATE),
    });
    if (loginBatch.length >= 100) {
      await prisma.loginAttempt.createMany({ data: loginBatch });
      loginBatch.length = 0;
    }
  }
  if (loginBatch.length > 0) await prisma.loginAttempt.createMany({ data: loginBatch });
  console.log(`Created ${numLoginAttempts} login attempts`);

  // ── 13. Generate UserSessions ────────────────────────────────────────────────
  console.log('\n💻 Generating user sessions...');
  const numSessions = randomInt(100, 200);
  const sessionBatch: any[] = [];
  for (let i = 0; i < numSessions; i++) {
    const user = randomItem(allUsers);
    const createdAt = randomDate(START_DATE, END_DATE);
    const lastActivity = addDays(createdAt, randomInt(0, 7));
    sessionBatch.push({
      userId: user.id,
      token: `sess_${Buffer.from(`${user.id}_${Date.now()}_${i}`).toString('base64').slice(0, 50)}`,
      ipAddress: `${randomInt(10, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
      userAgent: randomItem([
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148',
        'Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile',
      ]),
      isActive: randomBool(0.6),
      lastActivity,
      createdAt,
    });
    if (sessionBatch.length >= 50) {
      await prisma.userSession.createMany({ data: sessionBatch });
      sessionBatch.length = 0;
    }
  }
  if (sessionBatch.length > 0) await prisma.userSession.createMany({ data: sessionBatch });
  console.log(`Created ${numSessions} sessions`);

  // ── 14. Generate AuditLogs (300+) ────────────────────────────────────────────
  console.log('\n📝 Generating audit logs...');
  const auditActions = [
    { action: 'login', entity: 'User' },
    { action: 'create', entity: 'Order' },
    { action: 'create', entity: 'Cotizacion' },
    { action: 'update', entity: 'Cotizacion' },
    { action: 'create', entity: 'User' },
    { action: 'update', entity: 'User' },
    { action: 'delete', entity: 'Cotizacion' },
    { action: 'create', entity: 'Lead' },
    { action: 'update', entity: 'Lead' },
    { action: 'create', entity: 'Campaign' },
    { action: 'update', entity: 'Campaign' },
    { action: 'create', entity: 'SupportTicket' },
    { action: 'update', entity: 'SupportTicket' },
    { action: 'create', entity: 'Certificate' },
    { action: 'create', entity: 'Course' },
  ];

  const numAuditLogs = randomInt(300, 500);
  for (let i = 0; i < numAuditLogs; i++) {
    const user = randomItem(allUsers);
    const auditAction = randomItem(auditActions);
    const entity = auditAction.entity;
    const description = `${auditAction.action === 'login' ? 'Inicio de sesión' : auditAction.action === 'create' ? 'Creación de' : auditAction.action === 'update' ? 'Actualización de' : 'Eliminación de'} ${entity}`;

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        action: auditAction.action,
        entity,
        entityId: String(randomInt(1, 500)),
        description,
        ipAddress: `${randomInt(10, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
        createdAt: randomDate(START_DATE, END_DATE),
      },
    });
  }
  console.log(`Created ${numAuditLogs} audit logs`);

  // ── 15. Generate Certificates (30-60) ────────────────────────────────────────
  console.log('\n🏅 Generating certificates...');
  const numCerts = randomInt(30, 60);
  const certTitles = [
    'ISO 9001:2025 - Gestión de la Calidad','ISO 14001:2025 - Gestión Ambiental',
    'ISO 45001:2025 - Seguridad y Salud','ISO 27001:2025 - Seguridad de la Información',
    'ISO 37001:2025 - Gestión Antisoborno','ISO 50001:2025 - Gestión de la Energía',
  ];
  for (let i = 0; i < numCerts; i++) {
    const user = randomItem(regularUsers.length > 0 ? regularUsers : allUsers);
    const title = randomItem(certTitles);
    const issueDate = randomDate(START_DATE, END_DATE);
    const credentialId = `ACS-${String(user.id).padStart(4, '0')}-${String(randomInt(1000, 9999))}`;

    await prisma.certificate.create({
      data: {
        userId: user.id,
        title,
        description: `Certificación internacional en ${title}. Otorgada por cumplir con los estándares requeridos.`,
        issuer: 'ACS Perú',
        issueDate,
        expiryDate: addDays(issueDate, 365 * 3),
        course: title,
        hours: randomInt(8, 40),
        credentialId,
        createdBy: adminUser?.id || null,
        imageUrl: null,
      },
    });
  }
  console.log(`Created ${numCerts} certificates`);

  // ── 16. Generate Courses (10-20) with modules and materials ──────────────────
  console.log('\n📚 Generating courses...');
  const courseData = [
    { title: 'Implementación ISO 9001:2025', category: 'Calidad', level: 'intermedio' as const, duration: 24 },
    { title: 'Auditor Interno ISO 14001', category: 'Ambiental', level: 'avanzado' as const, duration: 32 },
    { title: 'Fundamentos ISO 45001', category: 'Seguridad', level: 'basico' as const, duration: 16 },
    { title: 'Seguridad de la Información ISO 27001', category: 'Información', level: 'intermedio' as const, duration: 24 },
    { title: 'Gestión Antisoborno ISO 37001', category: 'Ética', level: 'basico' as const, duration: 12 },
    { title: 'Eficiencia Energética ISO 50001', category: 'Energía', level: 'intermedio' as const, duration: 20 },
    { title: 'Sistemas de Gestión Integrados', category: 'Gestión', level: 'avanzado' as const, duration: 40 },
    { title: 'Liderazgo y Mejora Continua', category: 'Habilidades', level: 'intermedio' as const, duration: 16 },
    { title: 'Gestión de Riesgos Empresariales', category: 'Riesgos', level: 'avanzado' as const, duration: 24 },
    { title: 'Fundamentos de Calidad Total', category: 'Calidad', level: 'basico' as const, duration: 8 },
  ];

  for (const cd of courseData) {
    const course = await prisma.course.create({
      data: {
        title: cd.title,
        description: `Curso completo sobre ${cd.title.toLowerCase()}. Incluye materiales didácticos, ejercicios prácticos y evaluación final.`,
        category: cd.category,
        level: cd.level,
        duration: cd.duration,
        published: randomBool(0.7),
        createdBy: adminUser?.id || null,
        modules: {
          create: [
            { title: 'Introducción', description: 'Conceptos fundamentales', order: 1,
              materials: { create: [
                { title: 'Presentación del Curso', type: 'pdf', duration: 30 },
                { title: 'Guía de Estudio', type: 'pdf', duration: 45 },
              ]},
            },
            { title: 'Marco Teórico', description: 'Fundamentos y normativa aplicable', order: 2,
              materials: { create: [
                { title: 'Norma ISO Completa', type: 'pdf', duration: 60 },
                { title: 'Video Explicativo', type: 'video', embedUrl: 'https://www.youtube.com/watch?v=example', duration: 20 },
              ]},
            },
            { title: 'Implementación Práctica', description: 'Casos prácticos y ejercicios', order: 3,
              materials: { create: [
                { title: 'Taller Práctico', type: 'pdf', duration: 90 },
                { title: 'Plantilla de Documentación', type: 'pdf', duration: 30 },
              ]},
            },
            { title: 'Evaluación Final', description: 'Examen de certificación', order: 4,
              materials: { create: [
                { title: 'Evaluación Final', type: 'pdf', duration: 60 },
              ]},
            },
          ],
        },
      },
    });

    // Enroll some users
    const numEnrollments = randomInt(5, 20);
    const enrolledUsers = new Set<number>();
    for (let e = 0; e < numEnrollments; e++) {
      const user = randomItem(allUsers);
      if (enrolledUsers.has(user.id)) continue;
      enrolledUsers.add(user.id);
      await prisma.courseEnrollment.create({
        data: {
          courseId: course.id,
          userId: user.id,
          progress: randomFloat(0, 100),
          completed: randomBool(0.3),
        },
      });
    }
  }
  console.log(`Created ${courseData.length} courses with modules, materials, and enrollments`);

  // ── 17. Generate Messages (200-400) ──────────────────────────────────────────
  console.log('\n✉️ Generating messages...');
  const numMessages = randomInt(200, 400);
  const messageSubjects = [
    'Consulta sobre certificación','Información de precios','Solicitud de cotización',
    'Seguimiento de propuesta','Confirmación de servicio','Soporte técnico',
    'Invitación a webinar','Actualización de normativa','Recordatorio de pago',
    'Felicitaciones por tu certificación',
  ];

  for (let i = 0; i < numMessages; i++) {
    const sender = randomItem(allUsers);
    const receiver = randomItem(allUsers.filter(u => u.id !== sender.id));
    await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        subject: randomBool(0.7) ? randomItem(messageSubjects) : null,
        body: randomItem([
          `Hola, quisiera recibir más información sobre los servicios de certificación.`,
          `Buenos días, solicito una cotización para ISO 9001.`,
          `Gracias por la atención brindada, quedamos muy satisfechos.`,
          `¿Podemos agendar una reunión para revisar la propuesta?`,
          `Confirmamos nuestra participación en el webinar del próximo jueves.`,
          `Estimado, le envío los documentos solicitados para la auditoría.`,
          `Quedamos atentos a la confirmación del cronograma.`,
          `Por favor, indíquenos los pasos a seguir para iniciar el proceso.`,
          `Le compartimos el informe de diagnóstico preliminar.`,
          `Agradecemos su pronta respuesta y profesionalismo.`,
        ]),
        read: randomBool(0.6),
        createdAt: randomDate(START_DATE, END_DATE),
      },
    });
  }
  console.log(`Created ${numMessages} messages`);

  // ── 18. Generate Segments with members ───────────────────────────────────────
  console.log('\n📊 Generating segments...');
  const segmentData = [
    { name: 'Clientes Premium', description: 'Usuarios con múltiples certificaciones', criteria: 'more_than_2_certificates' },
    { name: 'Nuevos Leads', description: 'Leads registrados en los últimos 30 días', criteria: 'created_last_30_days' },
    { name: 'Empresas Grandes', description: 'Usuarios de grandes corporaciones', criteria: 'company_size_large' },
    { name: 'Interesados en ISO 27001', description: 'Leads interesados en seguridad informática', criteria: 'interest_iso_27001' },
    { name: 'Clientes Frecuentes', description: 'Usuarios con alta frecuencia de compra', criteria: 'high_purchase_frequency' },
    { name: 'Capacitación', description: 'Usuarios inscritos en cursos', criteria: 'enrolled_in_courses' },
    { name: 'Pymes', description: 'Pequeñas y medianas empresas', criteria: 'company_size_small' },
    { name: 'Marketing List', description: 'Usuarios para campañas de marketing', criteria: 'marketing_opt_in' },
  ];

  for (const sd of segmentData) {
    const segment = await prisma.segment.create({
      data: {
        name: sd.name,
        description: sd.description,
        criteria: sd.criteria,
        createdBy: marketingUser?.id || adminUser?.id || null,
      },
    });

    // Add 10-30 random members
    const numMembers = randomInt(10, 30);
    const memberSet = new Set<number>();
    for (let m = 0; m < numMembers; m++) {
      const user = randomItem(allUsers);
      if (memberSet.has(user.id)) continue;
      memberSet.add(user.id);
      await prisma.segmentMember.create({
        data: { segmentId: segment.id, userId: user.id },
      });
    }
  }
  console.log(`Created ${segmentData.length} segments with members`);

  // ── 19. Generate SystemSettings ──────────────────────────────────────────────
  console.log('\n⚙️ Generating system settings...');
  const settings = [
    { key: 'company_name', value: 'ACS Perú' },
    { key: 'company_email', value: 'contacto@acsperu.com' },
    { key: 'company_phone', value: '+51 1 234 5678' },
    { key: 'tax_rate', value: '18' },
    { key: 'currency', value: 'PEN' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'default_language', value: 'es' },
    { key: 'max_login_attempts', value: '5' },
    { key: 'session_timeout', value: '3600' },
    { key: 'recaptcha_enabled', value: 'false' },
    { key: 'smtp_provider', value: 'console' },
    { key: 'smtp_host', value: '' },
    { key: 'smtp_port', value: '587' },
    { key: 'smtp_user', value: '' },
    { key: 'smtp_pass', value: '' },
    { key: 'mercadopago_public_key', value: '' },
    { key: 'mercadopago_access_token', value: '' },
    { key: 'twilio_account_sid', value: '' },
    { key: 'twilio_auth_token', value: '' },
    { key: 'twilio_phone_number', value: '' },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log(`Configured ${settings.length} system settings`);

  // ── 20. Update product specs and images ──────────────────────────────────────
  console.log('\n🖼️ Generating product specs and images...');
  for (const prod of products) {
    // ProductImages
    await prisma.productImage.createMany({
      data: [
        { productId: prod.id, url: `/images/products/${prod.title.toLowerCase().replace(/\s+/g, '-')}-1.jpg`, alt: `${prod.title} - Imagen principal`, order: 0 },
        { productId: prod.id, url: `/images/products/${prod.title.toLowerCase().replace(/\s+/g, '-')}-2.jpg`, alt: `${prod.title} - Detalle`, order: 1 },
      ],
      skipDuplicates: true,
    });

    // ProductSpecs
    const specData = [
      { key: 'Duración', value: randomItem(['3-6 meses','4-8 meses','2-4 meses']) },
      { key: 'Auditoría', value: 'Inicial + Seguimiento' },
      { key: 'Vigencia', value: '3 años' },
      { key: 'Renovación', value: 'Anual' },
    ];
    const existingSpecs = await prisma.productSpec.findMany({ where: { productId: prod.id } });
    if (existingSpecs.length === 0) {
      for (const spec of specData) {
        await prisma.productSpec.create({
          data: { productId: prod.id, key: spec.key, value: spec.value },
        });
      }
    }
  }
  console.log('Product images and specs updated');

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('📊 SEED SUMMARY');
  console.log('═══════════════════════════════════════');
  const counts = {
    Users: await prisma.user.count(),
    Categories: await prisma.category.count(),
    Products: await prisma.product.count(),
    Orders: await prisma.order.count(),
    OrderItems: await prisma.orderItem.count(),
    Cotizaciones: await prisma.cotizacion.count(),
    CotizacionItems: await prisma.cotizacionItem.count(),
    CotizacionActividades: await prisma.cotizacionActividad.count(),
    Campaigns: await prisma.campaign.count(),
    CampaignResults: await prisma.campaignResult.count(),
    EmailCampaigns: await prisma.emailCampaign.count(),
    SmsCampaigns: await prisma.smsCampaign.count(),
    Leads: await prisma.lead.count(),
    LeadActivities: await prisma.leadActivity.count(),
    SupportTickets: await prisma.supportTicket.count(),
    Reviews: await prisma.review.count(),
    Notifications: await prisma.notification.count(),
    LoginAttempts: await prisma.loginAttempt.count(),
    UserSessions: await prisma.userSession.count(),
    AuditLogs: await prisma.auditLog.count(),
    Certificates: await prisma.certificate.count(),
    Courses: await prisma.course.count(),
    CourseModules: await prisma.courseModule.count(),
    CourseMaterials: await prisma.courseMaterial.count(),
    CourseEnrollments: await prisma.courseEnrollment.count(),
    Messages: await prisma.message.count(),
    Segments: await prisma.segment.count(),
    SegmentMembers: await prisma.segmentMember.count(),
    Permissions: await prisma.permission.count(),
    RolePermissions: await prisma.rolePermission.count(),
    SystemSettings: await prisma.systemSetting.count(),
  };
  for (const [key, val] of Object.entries(counts)) {
    console.log(`  ${key.padEnd(25)} ${String(val).padStart(6)}`);
  }
  console.log('═══════════════════════════════════════\n');
  console.log('✅ Seed Full completed successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
