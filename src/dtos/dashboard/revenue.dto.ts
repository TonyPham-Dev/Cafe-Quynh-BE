import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RevenueQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']),
});

export class RevenueQueryDto extends createZodDto(RevenueQuerySchema) {
  @ApiProperty({
    description: 'Time period for revenue statistics',
    enum: ['day', 'week', 'month'],
    example: 'day'
  })
  period: 'day' | 'week' | 'month';
}

export interface RevenueData {
  date: string;
  totalAmount: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByPeriod: Array<{
    date: string;
    totalAmount: number;
    orderCount: number;
    averageOrderValue: number;
  }>;
  topSellingItems: Array<{
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethodDistribution: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
} 