import { z } from 'zod';

export const RevenueQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'month', 'year']),
});

export type RevenueQueryDto = z.infer<typeof RevenueQuerySchema>;

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
  revenueByPeriod: RevenueData[];
  topSellingItems: {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  paymentMethodDistribution: {
    method: string;
    count: number;
    amount: number;
  }[];
} 