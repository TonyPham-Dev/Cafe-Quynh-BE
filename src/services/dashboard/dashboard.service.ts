import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { RevenueQueryDto, RevenueSummary } from '../../dtos/dashboard/revenue.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueStatistics(query: RevenueQueryDto): Promise<RevenueSummary> {
    const { startDate, endDate, groupBy } = query;

    // Get total revenue and orders
    const totalStats = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
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
    const revenueByPeriod = await this.getRevenueByPeriod(startDate, endDate, groupBy);

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

  private async getRevenueByPeriod(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'month' | 'year',
  ) {
    const format = {
      day: 'YYYY-MM-DD',
      month: 'YYYY-MM',
      year: 'YYYY',
    }[groupBy];

    const result = await this.prisma.$queryRaw<Array<{
      date: string;
      totalAmount: number;
      orderCount: number;
    }>>`
      SELECT 
        DATE_TRUNC(${groupBy}, "createdAt")::text as date,
        SUM("totalAmount") as "totalAmount",
        COUNT(*) as "orderCount"
      FROM orders
      WHERE 
        "createdAt" >= ${new Date(startDate)}
        AND "createdAt" <= ${new Date(endDate)}
        AND "deletedAt" IS NULL
        AND status = 'COMPLETED'
      GROUP BY DATE_TRUNC(${groupBy}, "createdAt")
      ORDER BY date ASC
    `;

    return result.map(item => ({
      date: item.date,
      totalAmount: Number(item.totalAmount),
      orderCount: Number(item.orderCount),
      averageOrderValue: Number(item.totalAmount) / Number(item.orderCount),
    }));
  }

  private async getTopSellingItems(startDate: string, endDate: string) {
    const result = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
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

  private async getPaymentMethodDistribution(startDate: string, endDate: string) {
    const result = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        order: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
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