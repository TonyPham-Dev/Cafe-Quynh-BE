import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { TableService } from '../../services/table/table.service';
import { UserRoles } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from '../../dtos/base/response.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('tables')
@Controller('tables')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  async getAllTables() {
    try {
      const data = await this.tableService.getAllTables();
      return Response.success({
        data,
        message: 'Get all tables successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Get all tables failed',
      });
    }
  }

  @Get(':id')
  async getTableById(@Param('id') id: string) {
    try {
      const data = await this.tableService.getTableById(Number(id));
      return Response.success({
        data,
        message: 'Get table successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Get table failed',
      });
    }
  }

  @Get(':id/current-order')
  async getTableWithCurrentOrder(@Param('id') id: string) {
    try {
      const data = await this.tableService.getTableWithCurrentOrder(Number(id));
      return Response.success({
        data,
        message: 'Get table with current order successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Get table with current order failed',
      });
    }
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  async createTable(@Body() data: { number: number; capacity: number }) {
    try {
      const response = await this.tableService.createTable(data);
      return Response.success({
        data: response,
        message: 'Create table successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Create table failed',
      });
    }
  }

  @Put(':id')
  @Roles(UserRoles.ADMIN)
  async updateTable(
    @Param('id') id: string,
    @Body() data: { number?: number; capacity?: number; status?: string },
  ) {
    try {
      const response = await this.tableService.updateTable(Number(id), data);
      return Response.success({
        data: response,
        message: 'Update table successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Update table failed',
      });
    }
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  async deleteTable(@Param('id') id: string) {
    try {
      const response = await this.tableService.deleteTable(Number(id));
      return Response.success({
        data: response,
        message: 'Delete table successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Delete table failed',
      });
    }
  }

  @Put(':id/status')
  async updateTableStatus(
    @Param('id') id: string,
    @Body() data: { status: string },
  ) {
    try {
      const response = await this.tableService.updateTableStatus(Number(id), data.status);
      return Response.success({
        data: response,
        message: 'Update table status successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Update table status failed',
      });
    }
  }
}
