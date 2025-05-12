import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { RevenueQueryDto, RevenueSummary } from '../../dtos/dashboard/revenue.dto';
import { Prisma } from '@prisma/client';

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

    return result.map(item => ({
      date: item.date,
      totalAmount: Number(item.totalAmount),
      orderCount: Number(item.orderCount),
      averageOrderValue: item.orderCount > 0 
        ? Number(item.totalAmount) / Number(item.orderCount)
        : 0,
    }));
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
} 