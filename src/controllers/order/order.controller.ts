import { Controller, Get, Post, Body, Param, UseGuards, UsePipes, Request } from '@nestjs/common';
import { OrderService } from 'src/services/order/order.service';
import { Response } from 'src/dtos/base/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { CreateOrderDto, CreateOrderSchema } from '../../dtos/order/create-order.dto';
import { CreateInvoiceDto, CreateInvoiceSchema } from '../../dtos/order/create-invoice.dto';
import { AddItemsDto, AddItemsSchema } from '../../dtos/order/add-items.dto';
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
      console.log({req: req.user})
      const order = await this.orderService.create(req.user.sub, createOrderDto);
      return Response.success({
        data: order,
        message: 'Create order successful',
      });
    } catch (error) {
      console.log(error);
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
      const invoice = await this.orderService.generateInvoice(req.user.sub, {
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

  @Post(':id/add-items')
  @ApiOperation({ summary: 'Add items to an existing order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    type: AddItemsDto,
    description: 'Items to add to the order',
    examples: {
      example1: {
        summary: 'Add a single item',
        value: {
          items: [{ menuItemId: 1, quantity: 1, notes: 'Extra spicy' }]
        }
      },
      example2: {
        summary: 'Add multiple items',
        value: {
          items: [
            { menuItemId: 1, quantity: 2, notes: 'No onions' },
            { menuItemId: 2, quantity: 1 }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Items added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addItems(
    @Param('id') id: string,
    @Body() addItemsDto: AddItemsDto
  ) {
    try {
      const updatedOrder = await this.orderService.addItems(Number(id), addItemsDto);
      return Response.success({
        data: updatedOrder,
        message: 'Add items to order successful',
      });
    } catch (error) {
      console.log(error);
      return Response.error({
        errorCode: error.message,
        message: 'Add items to order failed',
      });
    }
  }
} 