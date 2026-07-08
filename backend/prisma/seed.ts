import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Gestión de Calidad', slug: 'gestion-calidad', description: 'Certificaciones para optimizar la calidad de tus procesos' },
  { name: 'Gestión Ambiental', slug: 'gestion-ambiental', description: 'Certificaciones para la sostenibilidad y el medio ambiente' },
  { name: 'Seguridad y Salud', slug: 'seguridad-salud', description: 'Certificaciones para proteger a tus colaboradores' },
  { name: 'Seguridad de la Información', slug: 'seguridad-informacion', description: 'Protege los datos críticos de tu organización' },
  { name: 'Gestión Antisoborno', slug: 'gestion-antisoborno', description: 'Certificaciones para la transparencia y ética empresarial' },
  { name: 'Gestión de Energía', slug: 'gestion-energia', description: 'Optimiza el consumo energético de tu empresa' },
];

const products = [
  {
    title: 'ISO 9001',
    name: 'Gestión de la Calidad',
    description: 'Demuestra tu compromiso con la calidad y la satisfacción del cliente en cada proceso.',
    fullDescription: 'La norma ISO 9001 es el estándar internacional para sistemas de gestión de la calidad (SGC). Ayuda a las organizaciones a cumplir con las expectativas de los clientes y otras partes interesadas, mejorando continuamente sus procesos.',
    price: 1200,
    oldPrice: 1500,
    categoryIndex: 0,
    isNew: false,
    isFeatured: true,
    isOffer: true,
    stock: 999,
    rating: 4.8,
    reviewCount: 124,
    specs: [{ label: 'Duración', value: '3-6 meses' }, { label: 'Auditoría', value: 'Inicial + Seguimiento' }, { label: 'Vigencia', value: '3 años' }, { label: 'Renovación', value: 'Anual' }],
  },
  {
    title: 'ISO 14001',
    name: 'Gestión Ambiental',
    description: 'Mejora tu desempeño ambiental y cumple con todas las normativas ecológicas vigentes.',
    fullDescription: 'ISO 14001 proporciona un marco para proteger el medio ambiente y responder a las condiciones ambientales cambiantes. Ayuda a las organizaciones a gestionar sus responsabilidades ambientales de manera sistemática.',
    price: 1300,
    oldPrice: null,
    categoryIndex: 1,
    isNew: false,
    isFeatured: true,
    isOffer: false,
    stock: 999,
    rating: 4.7,
    reviewCount: 98,
    specs: [{ label: 'Duración', value: '3-6 meses' }, { label: 'Auditoría', value: 'Inicial + Seguimiento' }, { label: 'Vigencia', value: '3 años' }, { label: 'Renovación', value: 'Anual' }],
  },
  {
    title: 'ISO 45001',
    name: 'Seguridad y Salud en el Trabajo',
    description: 'Garantiza un entorno de trabajo seguro, protegiendo a tus empleados y reduciendo riesgos laborales.',
    fullDescription: 'ISO 45001 es el estándar internacional para sistemas de gestión de seguridad y salud en el trabajo (SST). Ayuda a las organizaciones a proporcionar un lugar de trabajo seguro y saludable.',
    price: 1100,
    oldPrice: 1400,
    categoryIndex: 2,
    isNew: false,
    isFeatured: true,
    isOffer: true,
    stock: 999,
    rating: 4.9,
    reviewCount: 156,
    specs: [{ label: 'Duración', value: '3-6 meses' }, { label: 'Auditoría', value: 'Inicial + Seguimiento' }, { label: 'Vigencia', value: '3 años' }, { label: 'Renovación', value: 'Anual' }],
  },
  {
    title: 'ISO 27001',
    name: 'Seguridad de la Información',
    description: 'Protege los datos sensibles de tu empresa y tus clientes con los más altos estándares.',
    fullDescription: 'ISO 27001 especifica los requisitos para establecer, implementar, mantener y mejorar un sistema de gestión de seguridad de la información (SGSI). Es esencial para la ciberseguridad empresarial.',
    price: 1500,
    oldPrice: null,
    categoryIndex: 3,
    isNew: true,
    isFeatured: true,
    isOffer: false,
    stock: 999,
    rating: 4.6,
    reviewCount: 87,
    specs: [{ label: 'Duración', value: '4-8 meses' }, { label: 'Auditoría', value: 'Inicial + Seguimiento' }, { label: 'Vigencia', value: '3 años' }, { label: 'Renovación', value: 'Anual' }],
  },
  {
    title: 'ISO 37001',
    name: 'Gestión Antisoborno',
    description: 'Previene, detecta y enfrenta de forma eficaz el soborno en tus operaciones comerciales.',
    fullDescription: 'ISO 37001 es el estándar internacional para sistemas de gestión antisoborno. Ayuda a las organizaciones a establecer, implementar y mantener un sistema para prevenir, detectar y abordar el soborno.',
    price: 1250,
    oldPrice: 1600,
    categoryIndex: 4,
    isNew: false,
    isFeatured: false,
    isOffer: true,
    stock: 999,
    rating: 4.5,
    reviewCount: 64,
    specs: [{ label: 'Duración', value: '3-6 meses' }, { label: 'Auditoría', value: 'Inicial + Seguimiento' }, { label: 'Vigencia', value: '3 años' }, { label: 'Renovación', value: 'Anual' }],
  },
  {
    title: 'ISO 50001',
    name: 'Gestión de la Energía',
    description: 'Optimiza el uso de la energía, reduce costos operativos y promueve la sostenibilidad.',
    fullDescription: 'ISO 50001 proporciona un marco para establecer sistemas y procesos para mejorar el desempeño energético. Ayuda a las organizaciones a gestionar el uso de la energía de manera más eficiente.',
    price: 1150,
    oldPrice: null,
    categoryIndex: 5,
    isNew: true,
    isFeatured: false,
    isOffer: false,
    stock: 999,
    rating: 4.4,
    reviewCount: 52,
    specs: [{ label: 'Duración', value: '3-6 meses' }, { label: 'Auditoría', value: 'Inicial + Seguimiento' }, { label: 'Vigencia', value: '3 años' }, { label: 'Renovación', value: 'Anual' }],
  },
];

async function main() {
  console.log('Seeding database...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Categories seeded');

  for (const p of products) {
    const category = await prisma.category.findFirst({ where: { slug: categories[p.categoryIndex].slug } });
    if (!category) continue;

    await prisma.product.upsert({
      where: { id: categories.indexOf(categories[p.categoryIndex]) + 1 },
      update: {},
      create: {
        title: p.title,
        name: p.name,
        description: p.description,
        fullDescription: p.fullDescription,
        price: p.price,
        oldPrice: p.oldPrice,
        categoryId: category.id,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
        isOffer: p.isOffer,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        specs: JSON.stringify(p.specs),
      },
    });
  }
  console.log('Products seeded');

  // Seed test users with different roles
  const passwordHash = await bcrypt.hash('Test1234!', 10);
  const testUsers = [
    { email: 'admin@acs.com', role: 'ADMIN', firstName: 'Admin', lastName: 'ACS', phone: '+51 999000001', company: 'ACS Perú', status: 'activo' },
    { email: 'user@acs.com', role: 'USER', firstName: 'Usuario', lastName: 'ACS', phone: '+51 999000002', company: 'ACS Perú', status: 'activo' },
    { email: 'sales@acs.com', role: 'SALES', firstName: 'Ventas', lastName: 'ACS', phone: '+51 999000003', company: 'ACS Perú', status: 'activo' },
    { email: 'ti@acs.com', role: 'TI', firstName: 'Soporte', lastName: 'TI', phone: '+51 999000004', company: 'ACS Perú', status: 'activo' },
    { email: 'marketing@acs.com', role: 'MARKETING', firstName: 'Marketing', lastName: 'ACS', phone: '+51 999000005', company: 'ACS Perú', status: 'activo' },
    { email: 'auditor@acs.com', role: 'AUDITOR', firstName: 'Auditor', lastName: 'ACS', phone: '+51 999000006', company: 'ACS Perú', status: 'activo' },
  ];

  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: passwordHash },
    });
  }
  console.log('Test users seeded');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
