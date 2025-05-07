import { Controller, Get, Query, UseGuards, UsePipes } from '@nestjs/common';
import { DashboardService } from 'src/services/dashboard/dashboard.service';
import { Response } from 'src/dtos/base/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
  async getRevenueStatistics(@Query() query: RevenueQueryDto) {
    try {
      const statistics = await this.dashboardService.getRevenueStatistics(query);
      return Response.success({
        data: statistics,
        message: 'Get revenue statistics successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Failed to get revenue statistics',
      });
    }
  }
} 