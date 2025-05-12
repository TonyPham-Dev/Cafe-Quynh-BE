import { Controller, Get, Query, UseGuards, UsePipes } from '@nestjs/common';
import { DashboardService } from 'src/services/dashboard/dashboard.service';
import { Response } from 'src/dtos/base/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { RevenueQueryDto, RevenueQuerySchema } from '../../dtos/dashboard/revenue.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('dashboard')
@Controller('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(UserRoles.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('revenue')
  @UsePipes(new ZodValidationPipe(RevenueQuerySchema))
  @ApiOperation({ summary: 'Get revenue statistics' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month'],
    description: 'Time period for revenue statistics',
    example: 'day'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns revenue statistics including total revenue, orders, and breakdowns',
    schema: {
      example: {
        data: {
          totalRevenue: 1500000,
          totalOrders: 50,
          averageOrderValue: 30000,
          revenueByPeriod: [
            {
              date: '2024-03-20 10:00:00',
              totalAmount: 500000,
              orderCount: 15,
              averageOrderValue: 33333.33
            }
          ],
          topSellingItems: [
            {
              id: 1,
              name: 'Cà phê sữa',
              quantity: 100,
              revenue: 200000
            }
          ],
          paymentMethodDistribution: [
            {
              method: 'CASH',
              count: 30,
              amount: 900000
            }
          ]
        },
        message: 'Get revenue statistics successful'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRevenueStatistics(@Query() query: RevenueQueryDto) {
    try {
      const statistics = await this.dashboardService.getRevenueStatistics(query);
      return Response.success({
        data: statistics,
        message: 'Get revenue statistics successful',
      });
    } catch (error) {
      console.log(error);
      return Response.error({
        errorCode: error.message,
        message: 'Failed to get revenue statistics',
      });
    }
  }
} 