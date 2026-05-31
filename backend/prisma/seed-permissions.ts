import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // User Management
  { name: 'Listar Usuarios', slug: 'users.list', module: 'users' },
  { name: 'Crear Usuarios', slug: 'users.create', module: 'users' },
  { name: 'Editar Usuarios', slug: 'users.edit', module: 'users' },
  { name: 'Cambiar Estado', slug: 'users.change-status', module: 'users' },
  { name: 'Cambiar Rol', slug: 'users.change-role', module: 'users' },
  { name: 'Restablecer Contraseña', slug: 'users.reset-password', module: 'users' },
  { name: 'Ver Actividad', slug: 'users.view-activity', module: 'users' },
  // Support
  { name: 'Ver Tickets', slug: 'tickets.list', module: 'support' },
  { name: 'Crear Tickets', slug: 'tickets.create', module: 'support' },
  { name: 'Actualizar Tickets', slug: 'tickets.update', module: 'support' },
  // Audit
  { name: 'Ver Auditoría', slug: 'audit.list', module: 'audit' },
  // Permissions
  { name: 'Gestionar Permisos', slug: 'permissions.manage', module: 'permissions' },
  // Sessions
  { name: 'Ver Sesiones', slug: 'sessions.list', module: 'sessions' },
  { name: 'Cerrar Sesiones', slug: 'sessions.close', module: 'sessions' },
  // Security
  { name: 'Ver Intentos Login', slug: 'login-attempts.list', module: 'security' },
  // Dashboard
  { name: 'Ver Dashboard TI', slug: 'dashboard.view', module: 'dashboard' },
];

async function main() {
  console.log('Seeding permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, description: perm.description, module: perm.module },
      create: perm,
    });
  }
  console.log(`Seeded ${permissions.length} permissions`);

  // Assign all permissions to ADMIN and TI roles
  const allPerms = await prisma.permission.findMany();
  for (const role of ['ADMIN', 'TI']) {
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: perm.id } },
        update: {},
        create: { role, permissionId: perm.id },
      });
    }
    console.log(`Assigned all permissions to ${role}`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
