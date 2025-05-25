import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { CreateOrderDto, OrderItemDto } from '../../dtos/order/create-order.dto';
import { CreateInvoiceDto } from '../../dtos/order/create-invoice.dto';
import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import { AddItemsDto } from '../../dtos/order/add-items.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: CreateOrderDto) {
    // Check if table exists and is available
    const table = await this.prisma.table.findFirst({
      where: {
        id: data.tableId,
        deletedAt: null,
      },
    });

    if (!table) {
      throw new BadRequestException('Table not found');
    }

    if (table.status !== 'AVAILABLE') {
      throw new BadRequestException('Table is not available');
    }

    // Get menu items and calculate total
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map(item => item.menuItemId) },
        deletedAt: null,
        active: true,
      },
    });
    console.log({menuItems, items: data.items})
    if (menuItems.length !== data.items.length) {
      throw new BadRequestException('Some menu items are not available');
    }

    // Calculate total amount
    let totalAmount = new Prisma.Decimal(0);
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of data.items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) continue;

      const itemTotal = menuItem.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      orderItems.push({
        menuItem: { connect: { id: menuItem.id } },
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes,
      });
    }

    // Generate order number (you can customize this format)
    const orderNumber = `ORD${Date.now()}`;
    console.log({userId})
    // Create order with items in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          totalAmount,
          table: { connect: { id: data.tableId } },
          user: { connect: { id: userId } },
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          table: true,
        },
      });

      // Update table status
      await prisma.table.update({
        where: { id: data.tableId },
        data: { status: 'OCCUPIED' },
      });

      return order;
    });
  }

  async getOrderById(id: number) {
    return this.prisma.order.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async getOrdersByTable(tableId: number) {
    return this.prisma.order.findMany({
      where: {
        tableId,
        deletedAt: null,
        status: { not: 'COMPLETED' },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async completeOrder(id: number) {
    const order = await this.getOrderById(id);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
        },
      });

      // Update table status if no other active orders
      const activeOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: { not: 'COMPLETED' },
          deletedAt: null,
        },
      });

      if (activeOrders === 0) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedOrder;
    });
  }

  async generateInvoice(userId: number, data: CreateInvoiceDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: data.orderId,
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('Order is already completed');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        amount: order.totalAmount,
        method: data.paymentMethod,
        status: PaymentStatus.COMPLETED,
        order: { connect: { id: order.id } },
      },
    });

    // Complete the order
    const completedOrder = await this.completeOrder(order.id);

    // Generate invoice data
    const invoice = {
      orderNumber: order.orderNumber,
      date: new Date().toLocaleString(),
      tableNumber: order.table.number,
      items: order.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price.mul(item.quantity),
        notes: item.notes,
      })),
      subtotal: order.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: PaymentStatus.COMPLETED,
      cashier: order.user.fullName,
    };

    return invoice;
  }

  async addItems(orderId: number, data: AddItemsDto) {
    // Get the order and verify it exists and is not completed
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
        status: {
          not: 'COMPLETED'
        }
      }
    });

    if (!order) {
      throw new BadRequestException('Order not found or already completed');
    }

    // Get menu items and validate they exist
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map(item => item.menuItemId) },
        deletedAt: null,
        active: true,
      },
    });

    if (menuItems.length !== data.items.length) {
      throw new BadRequestException('Some menu items are not available');
    }

    // Calculate additional amount and prepare order items
    let additionalAmount = new Prisma.Decimal(0);
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of data.items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) continue;

      const itemTotal = menuItem.price.mul(item.quantity);
      additionalAmount = additionalAmount.add(itemTotal);

      orderItems.push({
        menuItem: { connect: { id: menuItem.id } },
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes,
      });
    }

    // Update order with new items in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create new order items
      await prisma.orderItem.createMany({
        data: orderItems.map(item => ({
          orderId,
          menuItemId: item.menuItem.connect!.id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
      });

      // Update order total amount
      await prisma.order.update({
        where: { id: orderId },
        data: {
          totalAmount: order.totalAmount.add(additionalAmount),
        },
      });

      // Fetch updated order with all relations
      const updatedOrder = await prisma.order.findFirst({
        where: { id: orderId },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          table: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,  
            },
          },
        },
      });

      return updatedOrder;
    });
  }
} 