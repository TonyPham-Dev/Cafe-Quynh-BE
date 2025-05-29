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
@Roles(UserRoles.ADMIN, UserRoles.STAFF)
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

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview' })
  async getDashboardOverview() {
    try {
      const overview = await this.dashboardService.getDashboardOverview();
      return Response.success({
        data: overview,
        message: 'Get dashboard overview successful',
      });
    } catch (error) {
      console.log(error);
      return Response.error({
        errorCode: error.message,
        message: 'Failed to get dashboard overview',
      });
    }
  }
} 