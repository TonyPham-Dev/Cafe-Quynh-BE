import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { RevenueQueryDto, RevenueSummary } from '../../dtos/dashboard/revenue.dto';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueStatistics(query: RevenueQueryDto): Promise<RevenueSummary> {
    const { period } = query;
    const { startDate, endDate } = this.getDateRange(period);

    // Get total revenue and orders
    const totalStats = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
        status: 'COMPLETED',
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get revenue by period
    const revenueByPeriod = await this.getRevenueByPeriod(startDate, endDate, period);

    // Get top selling items
    const topSellingItems = await this.getTopSellingItems(startDate, endDate);

    // Get payment method distribution
    const paymentDistribution = await this.getPaymentMethodDistribution(startDate, endDate);

    return {
      totalRevenue: Number(totalStats._sum.totalAmount || 0),
      totalOrders: totalStats._count.id,
      averageOrderValue: totalStats._count.id > 0 
        ? Number(totalStats._sum.totalAmount || 0) / totalStats._count.id 
        : 0,
      revenueByPeriod,
      topSellingItems,
      paymentMethodDistribution: paymentDistribution,
    };
  }

  private getDateRange(period: 'day' | 'week' | 'month'): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (period) {
      case 'day':
        // Today
        break;
      case 'week':
        // Last 7 days
        startDate.setDate(startDate.getDate() - 6);
        break;
      case 'month':
        // Last 30 days
        startDate.setDate(startDate.getDate() - 29);
        break;
    }

    return { startDate, endDate };
  }

  private async getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month',
  ) {
    const groupBy = period === 'month' ? 'day' : 'hour';
    const interval = groupBy === 'hour' ? '1 hour' : '1 day';

    const result = await this.prisma.$queryRaw<Array<{
      date: string;
      totalAmount: number;
      orderCount: number;
    }>>`
      WITH time_series AS (
        SELECT generate_series(
          date_trunc(${groupBy}, ${startDate}::timestamptz),
          date_trunc(${groupBy}, ${endDate}::timestamptz),
          ${interval}::interval
        ) as time_slot
      )
      SELECT 
        time_slot::text as date,
        COALESCE(SUM(o."totalAmount"), 0) as "totalAmount",
        COALESCE(COUNT(o.id), 0) as "orderCount"
      FROM time_series ts
      LEFT JOIN orders o ON 
        date_trunc(${groupBy}, o."createdAt") = ts.time_slot
        AND o."deletedAt" IS NULL
        AND o.status = 'COMPLETED'
      GROUP BY ts.time_slot
      ORDER BY ts.time_slot ASC
    `;

    // Chuyển đổi sang giờ Việt Nam
    return result.map(item => {
      // Log để kiểm tra định dạng ngày thực tế
      console.log('item.date:', item.date);
      let vnDate;
      try {
        vnDate = DateTime.fromSQL(item.date, { zone: 'utc' }).setZone('Asia/Ho_Chi_Minh');
        if (!vnDate.isValid) {
          vnDate = DateTime.fromISO(item.date, { zone: 'utc' }).setZone('Asia/Ho_Chi_Minh');
        }
      } catch {
        vnDate = DateTime.invalid('Invalid DateTime');
      }
      return {
        date: vnDate.isValid ? vnDate.toFormat('yyyy-MM-dd HH:mm') : item.date,
        totalAmount: Number(item.totalAmount),
        orderCount: Number(item.orderCount),
        averageOrderValue: item.orderCount > 0 
          ? Number(item.totalAmount) / Number(item.orderCount)
          : 0,
      };
    });
  }

  private async getTopSellingItems(startDate: Date, endDate: Date) {
    const result = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
          status: 'COMPLETED',
        },
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: {
          in: result.map(item => item.menuItemId),
        },
      },
    });

    return result.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return {
        id: item.menuItemId,
        name: menuItem?.name || 'Unknown Item',
        quantity: Number(item._sum.quantity),
        revenue: Number(item._sum.price) * Number(item._sum.quantity),
      };
    });
  }

  private async getPaymentMethodDistribution(startDate: Date, endDate: Date) {
    const result = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
          status: 'COMPLETED',
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return result.map(item => ({
      method: item.method,
      count: item._count.id,
      amount: Number(item._sum.amount),
    }));
  }

  async getDashboardOverview() {
    // 1. Thời gian
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay()); // Chủ nhật đầu tuần
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 2. Doanh thu hôm nay, tuần, tháng
    const [revenueToday, revenueYesterday, revenueWeek, revenueMonth] = await Promise.all([
      this.prisma.order.aggregate({
        where: { createdAt: { gte: todayStart }, deletedAt: null, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: yesterdayStart, lt: todayStart }, deletedAt: null, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: weekStart }, deletedAt: null, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: monthStart }, deletedAt: null, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      })
    ]);

    // 3. Tổng đơn hôm nay, hôm qua
    const [ordersToday, ordersYesterday] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: todayStart }, deletedAt: null, status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart }, deletedAt: null, status: 'COMPLETED' } })
    ]);

    // 4. Tổng khách hàng
    const customers = await this.prisma.user.count({ where: { deletedAt: null } });

    // 5. Số bàn đang phục vụ / tổng bàn
    const [tablesServing, tablesTotal] = await Promise.all([
      this.prisma.table.count({ where: { status: 'OCCUPIED', deletedAt: null } }),
      this.prisma.table.count({ where: { deletedAt: null } })
    ]);

    // 6. % tăng/giảm so với hôm qua
    const revenueChangePercent = revenueYesterday._sum.totalAmount && Number(revenueYesterday._sum.totalAmount) > 0
      ? ((Number(revenueToday._sum.totalAmount || 0) - Number(revenueYesterday._sum.totalAmount || 0)) / Number(revenueYesterday._sum.totalAmount)) * 100
      : null;
    const ordersChangePercent = ordersYesterday && ordersYesterday > 0
      ? ((ordersToday - ordersYesterday) / ordersYesterday) * 100
      : null;

    // 7. 10 đơn hàng gần nhất
    const recentOrders = await this.prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, username: true, fullName: true } },
        table: true,
        items: { include: { menuItem: true } }
      }
    });

    // 8. Top 5 sản phẩm bán chạy
    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: { order: { status: 'COMPLETED', deletedAt: null } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });
    const menuItems = await this.prisma.menuItem.findMany({ where: { id: { in: topProductsRaw.map(i => i.menuItemId) } } });
    const topProducts = topProductsRaw.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return {
        id: item.menuItemId,
        name: menuItem?.name || 'Unknown',
        quantity: Number(item._sum.quantity),
        revenue: Number(item._sum.price) * Number(item._sum.quantity)
      };
    });

    // 9. Chi tiết doanh thu/ngày, số đơn/ngày, giá trị TB/ngày (30 ngày gần nhất)
    const dailyStatsRaw = await this.prisma.$queryRaw<Array<{
      date: string,
      totalAmount: number,
      orderCount: number
    }>>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as date,
        COALESCE(SUM("totalAmount"), 0) as "totalAmount",
        COUNT(id) as "orderCount"
      FROM orders
      WHERE "createdAt" >= NOW() - INTERVAL '29 days' AND "deletedAt" IS NULL AND status = 'COMPLETED'
      GROUP BY date_trunc('day', "createdAt")
      ORDER BY date ASC
    `;
    const dailyStats = dailyStatsRaw.map(item => ({
      date: item.date,
      totalAmount: Number(item.totalAmount),
      orderCount: Number(item.orderCount),
      averageOrderValue: item.orderCount > 0 ? Number(item.totalAmount) / Number(item.orderCount) : 0
    }));

    return {
      revenueToday: Number(revenueToday._sum.totalAmount || 0),
      revenueWeek: Number(revenueWeek._sum.totalAmount || 0),
      revenueMonth: Number(revenueMonth._sum.totalAmount || 0),
      ordersToday,
      customers,
      tablesServing,
      tablesTotal,
      revenueChangePercent,
      ordersChangePercent,
      recentOrders,
      topProducts,
      dailyStats
    };
  }
} 