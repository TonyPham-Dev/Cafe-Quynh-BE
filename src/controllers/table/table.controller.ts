import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { TableService } from '../../services/table/table.service';
import { UserRoles } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from '../../dtos/base/response.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateTableDto, CreateTableSchema } from '../../dtos/table/create-table.dto';
import { UpdateTableDto, UpdateTableSchema } from '../../dtos/table/update-table.dto';
import { UpdateTableStatusDto, UpdateTableStatusSchema } from '../../dtos/table/update-table-status.dto';

@ApiTags('tables')
@Controller('tables')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth('access-token')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiResponse({ status: 200, description: 'Returns all tables' })
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
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 200, description: 'Returns the table' })
  @ApiResponse({ status: 404, description: 'Table not found' })
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
  @ApiOperation({ summary: 'Get table with current order' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 200, description: 'Returns the table with current order' })
  @ApiResponse({ status: 404, description: 'Table not found' })
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
  @UsePipes(new ZodValidationPipe(CreateTableSchema))
  @ApiOperation({ summary: 'Create new table' })
  @ApiBody({
    type: CreateTableDto,
    description: 'Table creation data',
    examples: {
      example1: {
        summary: 'Create a table for 4 people',
        value: {
          number: 1,
          capacity: 4
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Table created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createTable(@Body() createTableDto: CreateTableDto) {
    try {
      const response = await this.tableService.createTable(createTableDto);
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
  @UsePipes(new ZodValidationPipe(UpdateTableSchema))
  @ApiOperation({ summary: 'Update table' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiBody({
    type: UpdateTableDto,
    description: 'Table update data',
    examples: {
      example1: {
        summary: 'Update table capacity',
        value: {
          capacity: 6
        }
      },
      example2: {
        summary: 'Update table status',
        value: {
          status: 'OCCUPIED'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Table updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async updateTable(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    try {
      const response = await this.tableService.updateTable(Number(id), updateTableDto);
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
  @ApiOperation({ summary: 'Delete table' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Table not found' })
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
  @UsePipes(new ZodValidationPipe(UpdateTableStatusSchema))
  @ApiOperation({ summary: 'Update table status' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiBody({
    type: UpdateTableStatusDto,
    description: 'Table status update data',
    examples: {
      example1: {
        summary: 'Set table as occupied',
        value: {
          status: 'OCCUPIED'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Table status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async updateTableStatus(
    @Param('id') id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
  ) {
    try {
      const response = await this.tableService.updateTableStatus(Number(id), updateTableStatusDto.status);
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
