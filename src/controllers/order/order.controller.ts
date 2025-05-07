import { Controller, Get, Post, Body, Param, UseGuards, UsePipes, Request } from '@nestjs/common';
import { OrderService } from 'src/services/order/order.service';
import { Response } from 'src/dtos/base/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { CreateOrderDto, CreateOrderSchema } from '../../dtos/order/create-order.dto';
import { CreateInvoiceDto, CreateInvoiceSchema } from '../../dtos/order/create-invoice.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ErrorCode } from 'src/types/base/error-code.type';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(UserRoles.ADMIN, UserRoles.STAFF)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  async createOrder(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.orderService.create(req.user.id, createOrderDto);
      return Response.success({
        data: order,
        message: 'Create order successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Create order failed',
      });
    }
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    try {
      const order = await this.orderService.getOrderById(Number(id));
      if (!order) {
        return Response.error({
          errorCode: ErrorCode.NOT_FOUND,
          message: 'Order not found',
        });
      }
      return Response.success({
        data: order,
        message: 'Get order successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Get order failed',
      });
    }
  }

  @Get('table/:tableId')
  async getOrdersByTable(@Param('tableId') tableId: string) {
    try {
      const orders = await this.orderService.getOrdersByTable(Number(tableId));
      return Response.success({
        data: orders,
        message: 'Get orders by table successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Get orders by table failed',
      });
    }
  }

  @Post(':id/complete')
  async completeOrder(@Param('id') id: string) {
    try {
      const order = await this.orderService.completeOrder(Number(id));
      return Response.success({
        data: order,
        message: 'Complete order successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Complete order failed',
      });
    }
  }

  @Post(':id/invoice')
  @UsePipes(new ZodValidationPipe(CreateInvoiceSchema))
  async generateInvoice(@Request() req: any, @Param('id') id: string, @Body() createInvoiceDto: CreateInvoiceDto) {
    try {
      const invoice = await this.orderService.generateInvoice(req.user.id, {
        ...createInvoiceDto,
        orderId: Number(id),
      });
      return Response.success({
        data: invoice,
        message: 'Invoice generated successfully',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Failed to generate invoice',
      });
    }
  }
} 