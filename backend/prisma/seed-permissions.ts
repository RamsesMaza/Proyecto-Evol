import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PermDef {
  name: string;
  slug: string;
  description?: string;
  module: string;
}

const permissions: PermDef[] = [
  // ── General ──────────────────────────────────────────────
  { name: 'Ver Dashboard General', slug: 'dashboard.view', module: 'dashboard', description: 'Acceder al panel principal' },
  { name: 'Ver Dashboard Ventas', slug: 'dashboard.sales', module: 'dashboard', description: 'Ver estadísticas de ventas' },
  { name: 'Ver Dashboard TI', slug: 'dashboard.ti', module: 'dashboard', description: 'Ver panel de administración TI' },
  { name: 'Ver Reportes', slug: 'reports.view', module: 'dashboard', description: 'Acceder a reportes generales' },
  { name: 'Exportar Reportes', slug: 'reports.export', module: 'dashboard', description: 'Exportar reportes a PDF/Excel' },

  // ── Users ────────────────────────────────────────────────
  { name: 'Listar Usuarios', slug: 'users.list', module: 'users', description: 'Ver listado de usuarios' },
  { name: 'Crear Usuarios', slug: 'users.create', module: 'users', description: 'Crear nuevos usuarios' },
  { name: 'Editar Usuarios', slug: 'users.edit', module: 'users', description: 'Editar datos de usuarios' },
  { name: 'Eliminar Usuarios', slug: 'users.delete', module: 'users', description: 'Eliminar usuarios permanentemente' },
  { name: 'Cambiar Estado', slug: 'users.change-status', module: 'users', description: 'Activar/desactivar/bloquear usuarios' },
  { name: 'Cambiar Rol', slug: 'users.change-role', module: 'users', description: 'Cambiar rol de usuarios' },
  { name: 'Restablecer Contraseña', slug: 'users.reset-password', module: 'users', description: 'Forzar cambio de contraseña' },
  { name: 'Ver Actividad', slug: 'users.view-activity', module: 'users', description: 'Ver historial de actividad' },
  { name: 'Ver Perfil Completo', slug: 'users.view-profile', module: 'users', description: 'Ver datos detallados del usuario' },

  // ── Products ─────────────────────────────────────────────
  { name: 'Listar Productos', slug: 'products.list', module: 'products', description: 'Ver catálogo de productos' },
  { name: 'Crear Productos', slug: 'products.create', module: 'products', description: 'Agregar nuevos productos' },
  { name: 'Editar Productos', slug: 'products.edit', module: 'products', description: 'Modificar productos existentes' },
  { name: 'Eliminar Productos', slug: 'products.delete', module: 'products', description: 'Eliminar productos' },
  { name: 'Gestionar Categorías', slug: 'products.manage-categories', module: 'products', description: 'Crear y editar categorías' },

  // ── Orders ───────────────────────────────────────────────
  { name: 'Listar Pedidos', slug: 'orders.list', module: 'orders', description: 'Ver todos los pedidos' },
  { name: 'Crear Pedidos', slug: 'orders.create', module: 'orders', description: 'Crear nuevos pedidos' },
  { name: 'Editar Pedidos', slug: 'orders.edit', module: 'orders', description: 'Modificar pedidos existentes' },
  { name: 'Cancelar Pedidos', slug: 'orders.cancel', module: 'orders', description: 'Cancelar pedidos' },
  { name: 'Actualizar Estado', slug: 'orders.update-status', module: 'orders', description: 'Cambiar estado del pedido' },
  { name: 'Ver Detalle Pedido', slug: 'orders.view-detail', module: 'orders', description: 'Ver información completa del pedido' },

  // ── Clientes ─────────────────────────────────────────────
  { name: 'Listar Clientes', slug: 'clientes.list', module: 'clientes', description: 'Ver base de clientes' },
  { name: 'Crear Clientes', slug: 'clientes.create', module: 'clientes', description: 'Registrar nuevos clientes' },
  { name: 'Editar Clientes', slug: 'clientes.edit', module: 'clientes', description: 'Actualizar datos de clientes' },
  { name: 'Eliminar Clientes', slug: 'clientes.delete', module: 'clientes', description: 'Eliminar clientes' },
  { name: 'Ver Estadísticas', slug: 'clientes.view-stats', module: 'clientes', description: 'Ver estadísticas de clientes' },

  // ── Finanzas ─────────────────────────────────────────────
  { name: 'Ver Finanzas', slug: 'finances.view', module: 'finances', description: 'Acceder al módulo financiero' },
  { name: 'Ver Transacciones', slug: 'finances.transactions', module: 'finances', description: 'Listar transacciones' },
  { name: 'Gestionar Pagos', slug: 'finances.manage-payments', module: 'finances', description: 'Administrar pagos y facturas' },

  // ── Support ──────────────────────────────────────────────
  { name: 'Ver Tickets', slug: 'tickets.list', module: 'support', description: 'Listar tickets de soporte' },
  { name: 'Crear Tickets', slug: 'tickets.create', module: 'support', description: 'Abrir nuevos tickets' },
  { name: 'Actualizar Tickets', slug: 'tickets.update', module: 'support', description: 'Responder y actualizar tickets' },
  { name: 'Cerrar Tickets', slug: 'tickets.close', module: 'support', description: 'Cerrar tickets resueltos' },
  { name: 'Asignar Tickets', slug: 'tickets.assign', module: 'support', description: 'Asignar tickets a personal' },

  // ── Audit ────────────────────────────────────────────────
  { name: 'Ver Auditoría', slug: 'audit.list', module: 'audit', description: 'Consultar registros de auditoría' },
  { name: 'Exportar Auditoría', slug: 'audit.export', module: 'audit', description: 'Exportar logs de auditoría' },
  { name: 'Limpiar Auditoría', slug: 'audit.clear', module: 'audit', description: 'Eliminar logs antiguos' },

  // ── Permissions ──────────────────────────────────────────
  { name: 'Gestionar Permisos', slug: 'permissions.manage', module: 'permissions', description: 'Asignar y remover permisos por rol' },
  { name: 'Crear Permisos', slug: 'permissions.create', module: 'permissions', description: 'Registrar nuevos permisos en el sistema' },

  // ── Sessions ─────────────────────────────────────────────
  { name: 'Ver Sesiones', slug: 'sessions.list', module: 'sessions', description: 'Listar sesiones activas' },
  { name: 'Cerrar Sesiones', slug: 'sessions.close', module: 'sessions', description: 'Forzar cierre de sesión' },
  { name: 'Ver Historial', slug: 'sessions.history', module: 'sessions', description: 'Ver historial completo de sesiones' },

  // ── Security ─────────────────────────────────────────────
  { name: 'Ver Intentos Login', slug: 'login-attempts.list', module: 'security', description: 'Monitorear intentos de inicio de sesión' },
  { name: 'Gestionar 2FA', slug: 'security.manage-2fa', module: 'security', description: 'Configurar autenticación de dos factores' },
  { name: 'Ver Logs Seguridad', slug: 'security.logs', module: 'security', description: 'Acceder a registros de seguridad' },

  // ── Marketing ────────────────────────────────────────────
  { name: 'Ver Campañas', slug: 'marketing.campaigns', module: 'marketing', description: 'Listar campañas de marketing' },
  { name: 'Crear Campañas', slug: 'marketing.create', module: 'marketing', description: 'Crear nuevas campañas' },
  { name: 'Enviar Notificaciones', slug: 'marketing.notifications', module: 'marketing', description: 'Enviar notificaciones a usuarios' },
  { name: 'Ver Analytics', slug: 'marketing.analytics', module: 'marketing', description: 'Ver métricas y analytics' },
];

async function main() {
  console.log('🔑 Seeding permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, description: perm.description ?? '', module: perm.module },
      create: { name: perm.name, slug: perm.slug, description: perm.description ?? '', module: perm.module },
    });
  }
  console.log(`Seeded ${permissions.length} permissions`);

  // ── Assign by role ──────────────────────────────────────
  const allPerms = await prisma.permission.findMany();

  // ADMIN gets everything
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'ADMIN', permissionId: perm.id } },
      update: {},
      create: { role: 'ADMIN', permissionId: perm.id },
    });
  }
  console.log('Assigned ALL permissions to ADMIN');

  // TI gets everything
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'TI', permissionId: perm.id } },
      update: {},
      create: { role: 'TI', permissionId: perm.id },
    });
  }
  console.log('Assigned ALL permissions to TI');

  // SALES gets: dashboard (sales), products (list), orders (all), clientes (all), tickets (list/create)
  const salesSlugs = [
    'dashboard.view', 'dashboard.sales', 'reports.view', 'reports.export',
    'products.list', 'products.create', 'products.edit',
    'orders.list', 'orders.create', 'orders.edit', 'orders.view-detail', 'orders.update-status',
    'clientes.list', 'clientes.create', 'clientes.edit', 'clientes.view-stats',
    'tickets.list', 'tickets.create', 'tickets.update',
  ];
  for (const perm of allPerms.filter(p => salesSlugs.includes(p.slug))) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'SALES', permissionId: perm.id } },
      update: {},
      create: { role: 'SALES', permissionId: perm.id },
    });
  }
  console.log(`Assigned ${salesSlugs.length} permissions to SALES`);

  // USER gets: view dashboard, view products list, create orders, create tickets
  const userSlugs = [
    'dashboard.view',
    'products.list',
    'orders.list', 'orders.create', 'orders.view-detail',
    'tickets.list', 'tickets.create',
  ];
  for (const perm of allPerms.filter(p => userSlugs.includes(p.slug))) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'USER', permissionId: perm.id } },
      update: {},
      create: { role: 'USER', permissionId: perm.id },
    });
  }
  console.log(`Assigned ${userSlugs.length} permissions to USER`);

  console.log('✅ Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
