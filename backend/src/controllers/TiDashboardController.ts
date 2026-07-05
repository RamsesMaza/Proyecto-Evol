import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/UserModel';
import { AuditModel } from '../models/AuditModel';
import { LoginAttemptModel } from '../models/LoginAttemptModel';
import { SupportTicketModel } from '../models/SupportTicketModel';
import { PermissionModel } from '../models/PermissionModel';
import { OrderModel } from '../models/OrderModel';

export const TiDashboardController = {
  finanzas: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

      const [paidAgg, todayAgg, thisMonthAgg, lastMonthAgg, cancelledAgg,
        paymentMethods, monthlyRevenue, topProducts, cotizacionStats] = await Promise.all([

        prisma.order.aggregate({
          _sum: { total: true, tax: true, discount: true, shipping: true },
          _count: true,
          where: { paymentStatus: 'paid' },
        }),

        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: 'paid', createdAt: { gte: firstOfDay } },
        }),

        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: 'paid', createdAt: { gte: firstOfMonth } },
        }),

        prisma.order.aggregate({
          _sum: { total: true },
          _count: true,
          where: { paymentStatus: 'paid', createdAt: { gte: lastMonthStart, lt: lastMonthEnd } },
        }),

        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: { in: ['cancelled', 'refunded'] } },
        }),

        prisma.$queryRawUnsafe<Array<{ method: string; count: bigint; total: number }>>(
          `SELECT paymentMethod as method, COUNT(*) as count, COALESCE(SUM(total),0) as total
           FROM \`Order\`
           WHERE paymentStatus = 'paid'
           GROUP BY paymentMethod
           ORDER BY total DESC`
        ),

        (async () => {
          const data: { month: string; total: number; count: number; tax: number }[] = [];
          for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const agg = await prisma.order.aggregate({
              _sum: { total: true, tax: true },
              _count: true,
              where: { paymentStatus: 'paid', createdAt: { gte: start, lt: end } },
            });
            data.push({
              month: start.toISOString().slice(0, 7),
              total: agg._sum.total || 0,
              count: agg._count,
              tax: agg._sum.tax || 0,
            });
          }
          return data;
        })(),

        prisma.$queryRawUnsafe<Array<{ productId: number; productName: string; quantity: number; revenue: number }>>(
          `SELECT oi.productId, p.title as productName,
                  SUM(oi.quantity) as quantity,
                  COALESCE(SUM(oi.quantity * oi.price),0) as revenue
           FROM OrderItem oi
           JOIN \`Order\` o ON o.id = oi.orderId
           JOIN Product p ON p.id = oi.productId
           WHERE o.paymentStatus = 'paid'
           GROUP BY oi.productId, p.title
           ORDER BY revenue DESC
           LIMIT 10`
        ),

        (async () => {
          const [total, pendientes, aprobadas, ingresosProyectados] = await Promise.all([
            prisma.cotizacion.count(),
            prisma.cotizacion.count({ where: { estado: 'pendiente' } }),
            prisma.cotizacion.count({ where: { estado: 'aprobada' } }),
            prisma.cotizacion.aggregate({ _sum: { total: true }, where: { estado: 'aprobada' } }),
          ]);
          return {
            projectedRevenue: ingresosProyectados._sum.total || 0,
            pendingRevenue: await prisma.cotizacion.aggregate({
              _sum: { total: true }, where: { estado: 'pendiente' },
            }).then(r => r._sum.total || 0),
            total,
            approvedCount: aprobadas,
            pendingCount: pendientes,
            conversionRate: total > 0 ? Math.round((aprobadas / total) * 100) : 0,
          };
        })(),
      ]);

      const paidCount = paidAgg._count;
      const totalRevenue = paidAgg._sum.total || 0;

      res.json({
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthAgg._sum.total || 0,
          today: todayAgg._sum.total || 0,
          lastMonth: lastMonthAgg._sum.total || 0,
          averageOrder: paidCount > 0 ? totalRevenue / paidCount : 0,
          paidOrders: paidCount,
        },
        paymentMethods: (paymentMethods || []).map((pm: any) => ({
          method: pm.method,
          count: Number(pm.count),
          total: Number(pm.total),
        })),
        financials: {
          taxCollected: paidAgg._sum.tax || 0,
          discountsGiven: paidAgg._sum.discount || 0,
          shippingCollected: paidAgg._sum.shipping || 0,
          refunded: cancelledAgg._sum.total || 0,
        },
        monthlyRevenue,
        topProducts: (topProducts || []).map((p: any) => ({
          productId: Number(p.productId),
          productName: p.productName,
          quantity: Number(p.quantity),
          revenue: Number(p.revenue),
        })),
        cotizaciones: cotizacionStats,
      });
    } catch (err) { next(err); }
  },

  stats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [userStats, loginStats, ticketStats, audits, orderStats, newUsersThisMonth, newUsersToday,
        salesToday, salesThisMonth, totalClientes, newClientesThisMonth, last7Orders,
        salesByDay, userGrowth, dailyLogins] = await Promise.all([
        UserModel.getTiStats(),
        LoginAttemptModel.getStats(),
        SupportTicketModel.getStats(),
        AuditModel.getRecent(10),
        OrderModel.getStats(),
        prisma.user.count({ where: { createdAt: { gte: firstOfMonth } } }),
        prisma.user.count({ where: { createdAt: { gte: firstOfDay } } }),
        prisma.order.count({ where: { createdAt: { gte: firstOfDay }, paymentStatus: 'paid' } }),
        prisma.order.count({ where: { createdAt: { gte: firstOfMonth }, paymentStatus: 'paid' } }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.user.count({ where: { role: 'USER', createdAt: { gte: firstOfMonth } } }),
        prisma.order.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          orderBy: { createdAt: 'asc' },
          take: 7,
          select: { id: true, total: true, createdAt: true, customerName: true, paymentStatus: true },
        }),
        getSalesByDay(30),
        getUserGrowth(12),
        getLoginActivity(7),
      ]);

      res.json({
        ...userStats,
        loginStats,
        ticketStats,
        recentActivity: audits,
        sales: orderStats,
        newUsersThisMonth,
        newUsersToday,
        salesToday,
        salesThisMonth,
        totalClientes,
        newClientesThisMonth,
        last7Orders,
        charts: { salesByDay, userGrowth, dailyLogins },
      });
    } catch (err) { next(err); }
  },

  sessions: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const sessions = await UserModel.getSessions(true);
      res.json({ sessions, total: sessions.length });
    } catch (err) { next(err); }
  },

  closeSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserModel.closeSession(Number(req.params.id));
      res.json({ message: 'Sesión cerrada' });
    } catch (err) { next(err); }
  },

  permissions: {
    list: async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const permissions = await PermissionModel.list();
        res.json({ permissions });
      } catch (err) { next(err); }
    },

    getRolePermissions: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const permissions = await PermissionModel.getRolePermissions(String(req.params.role));
        res.json({ permissions });
      } catch (err) { next(err); }
    },

    assign: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { role, permissionId } = req.body;
        await PermissionModel.assignPermission(role, permissionId);
        res.json({ message: 'Permiso asignado' });
      } catch (err) { next(err); }
    },

    remove: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { role, permissionId } = req.body;
        await PermissionModel.removePermission(role, permissionId);
        res.json({ message: 'Permiso removido' });
      } catch (err) { next(err); }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const perm = await PermissionModel.create(req.body);
        res.status(201).json(perm);
      } catch (err) { next(err); }
    },
  },
};

// Reuse prisma import — declare at module level
import { prisma } from '../lib/prisma';

async function getSalesByDay(days: number) {
  const data: { date: string; total: number; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 86400000);
    const result = await prisma.order.aggregate({
      where: { createdAt: { gte: start, lt: end }, paymentStatus: 'paid' },
      _sum: { total: true },
      _count: true,
    });
    data.push({
      date: start.toISOString().slice(0, 10),
      total: result._sum.total || 0,
      count: result._count,
    });
  }
  return data;
}

async function getUserGrowth(months: number) {
  const data: { month: string; users: number; clients: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const [users, clients] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.user.count({ where: { role: 'USER', createdAt: { gte: start, lt: end } } }),
    ]);
    data.push({
      month: start.toISOString().slice(0, 7),
      users,
      clients,
    });
  }
  return data;
}

async function getLoginActivity(days: number) {
  const data: { date: string; success: number; failed: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 86400000);
    const [success, failed] = await Promise.all([
      prisma.loginAttempt.count({ where: { createdAt: { gte: start, lt: end }, success: true } }),
      prisma.loginAttempt.count({ where: { createdAt: { gte: start, lt: end }, success: false } }),
    ]);
    data.push({
      date: start.toISOString().slice(0, 10),
      success,
      failed,
    });
  }
  return data;
}
