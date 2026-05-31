import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const firstNames = [
  'Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Jorge', 'Rosa', 'Miguel', 'Elena',
  'Juan', 'Patricia', 'Diego', 'Laura', 'Andrés', 'Sofía', 'Pedro', 'Isabel', 'Manuel', 'Lucía',
  'Ricardo', 'Verónica', 'Fernando', 'Adriana', 'Alberto', 'Mónica', 'Sergio', 'Gabriela', 'Pablo', 'Diana',
  'Raúl', 'Claudia', 'Óscar', 'Mariana', 'Héctor', 'Silvia', 'Marco', 'Natalia', 'Víctor', 'Alejandra',
  'Rubén', 'Andrea', 'Francisco', 'Brenda', 'Antonio', 'Valeria', 'Alejandro', 'Camila', 'Roberto', 'Paola',
  'Javier', 'Liliana', 'Gustavo', 'Renata', 'Enrique', 'Daniela', 'Eduardo', 'Ximena', 'Arturo', 'Constanza',
  'David', 'Fernanda', 'Felipe', 'Karina', 'Cristian', 'Lorena', 'Iván', 'Marisol', 'Adrián', 'Katherine',
  'Mauricio', 'Sabrina', 'Alonso', 'Viviana', 'Jesús', 'Estefanía', 'Christian', 'Alejandra', 'Rodrigo', 'Pamela',
  'Diego', 'Bárbara', 'Humberto', 'Tatiana', 'Edgar', 'Johana', 'René', 'Yuliana', 'César', 'Luz',
  'Ulises', 'Martha', 'Emilio', 'Ruth', 'Martín', 'Erika', 'Joel', 'Rocío', 'Tomás', 'Gloria',
];

const lastNames = [
  'García', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
  'Flores', 'Rivera', 'Castillo', 'Vásquez', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutiérrez', 'Chávez',
  'Romero', 'Álvarez', 'Medina', 'Salazar', 'Moreno', 'Vega', 'Castro', 'Campos', 'Ramos', 'Silva',
  'Díaz', 'Mendoza', 'Peña', 'Guerrero', 'Ruiz', 'Aguilar', 'Vargas', 'Espinoza', 'Carrillo', 'Bravo',
  'Navarro', 'Rojas', 'Miranda', 'Delgado', 'Molina', 'Sandoval', 'Paredes', 'Córdova', 'Figueroa', 'Velasco',
  'Soto', 'Tapia', 'Cáceres', 'Valdivia', 'Huamán', 'Quispe', 'Mamani', 'Condori', 'Sulca', 'Llamoca',
  'Bustamante', 'Linares', 'Salinas', 'Palacios', 'Cornejo', 'Villanueva', 'Ávila', 'Cabrera', 'Calderón', 'Maldonado',
  'Farroñay', 'Huerta', 'Arroyo', 'Quiroz', 'Benites', 'Zevallos', 'Peralta', 'Ojeda', 'Infante', 'Leyva',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone(): string {
  const prefix = randomItem(['+51 9', '+51 9', '+51 9', '01 ']);
  const num = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${prefix}${num.slice(0, 8)}`;
}

const companies = [
  'ACS Perú', 'TechSolutions SAC', 'Grupo Ingeniería EIRL', 'Corporación Andina', 'DataPro Systems',
  'Constructora Los Andes', 'Servicios Generales R&C', 'Inversiones San Isidro', 'Consultoría ABC', 'Logística del Sur',
  'Metal Mecánica SAC', 'Alimentos del Norte', 'Transportes Rápidos', 'Energía Renovable EIRL', 'Telecom Networks',
  'Agroindustrias SAC', 'Minería Responsable', 'Hoteles Turísticos', 'Educación Superior', 'Salud Integral',
  'Banca Corporativa', 'Seguros Confianza', 'Inmobiliaria Horizonte', 'Automotriz del Perú', 'Textiles Export',
  'Pesquera Mar Azul', 'Forestal Amazónica', 'Construcción Civil', 'Petroquímica SAC', 'Mercados Globales',
  '', '', '', '',
];

const statuses = ['nuevo', 'activo', 'activo', 'activo', 'inactivo', 'frecuente', 'frecuente'];

async function main() {
  console.log('Seeding 100 users...');

  // Check existing user count
  const existing = await prisma.user.count();
  console.log(`Existing users: ${existing}`);

  if (existing >= 100) {
    console.log('Already have 100+ users. Skipping seed.');
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash('Test1234!', 10);

  const users: any[] = [];
  const usedEmails = new Set<string>();

  // Get existing emails to avoid duplicates
  const existingUsers = await prisma.user.findMany({ select: { email: true } });
  existingUsers.forEach(u => usedEmails.add(u.email));

  const startDate = new Date('2024-01-01');
  const endDate = new Date();

  let attempts = 0;
  while (users.length < 100 && attempts < 500) {
    attempts++;
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@email.com`;

    if (usedEmails.has(email)) continue;
    usedEmails.add(email);

    const company = randomItem(companies);
    const status = randomItem(statuses);
    const createdAt = randomDate(startDate, endDate);
    const isFavorite = Math.random() < 0.15;

    users.push({
      firstName,
      lastName,
      email,
      phone: randomPhone(),
      company: company || null,
      password: passwordHash,
      role: 'USER',
      status,
      isFavorite,
      createdAt,
    });
  }

  if (users.length === 0) {
    console.log('No users to insert');
    await prisma.$disconnect();
    return;
  }

  // Insert in batches of 25
  for (let i = 0; i < users.length; i += 25) {
    const batch = users.slice(i, i + 25);
    await prisma.user.createMany({ data: batch });
    console.log(`Inserted ${Math.min(i + 25, users.length)} users...`);
  }

  const total = await prisma.user.count();
  console.log(`Done! Total users now: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
