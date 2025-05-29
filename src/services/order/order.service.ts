import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { CreateOrderDto, OrderItemDto } from '../../dtos/order/create-order.dto';
import { CreateInvoiceDto } from '../../dtos/order/create-invoice.dto';
import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import { AddItemsDto } from '../../dtos/order/add-items.dto';
import * as net from 'net';

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
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
        status: { not: 'COMPLETED' }
      },
      include: {
        items: true,
      }
    });

    if (!order) {
      throw new BadRequestException('Order not found or already completed');
    }

    // Lấy danh sách menuItem hợp lệ
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

    const newMenuItemIds = data.items.map(i => i.menuItemId);
    const itemsToDelete = order.items.filter(
      oi => !newMenuItemIds.includes(oi.menuItemId) && !oi.deletedAt
    );
    for (const oi of itemsToDelete) {
      await this.prisma.orderItem.delete({ where: { id: oi.id } });
    }

    let totalAmount = new Prisma.Decimal(0);
    for (const item of data.items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) continue;

      const itemTotal = menuItem.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      const existingOrderItem = order.items.find(oi => oi.menuItemId === item.menuItemId && !oi.deletedAt);

      if (existingOrderItem) {
        await this.prisma.orderItem.update({
          where: { id: existingOrderItem.id },
          data: {
            quantity: item.quantity,
            notes: item.notes,
          }
        });
      } else {
        await this.prisma.orderItem.create({
          data: {
            orderId,
            menuItemId: menuItem.id,
            quantity: item.quantity,
            price: menuItem.price,
            notes: item.notes,
          }
        });
      }
    }

    // 3. Update lại tổng tiền
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount,
      },
    });

    return this.getOrderById(orderId);
  }

  async printInvoice(orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
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

    // Printer configuration
    const printerConfig = {
      ip: '192.168.3.10',
      port: 9100,
    };

    // Format invoice content
    const invoiceContent = this.formatInvoiceContent(order);
    console.log({invoiceContent})
    try {
      // Connect to printer and send data
      await this.sendToPrinter(printerConfig, invoiceContent);
      
      return {
        order,
        printerConfig,
        status: 'Print job completed successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to print: ${error.message}`);
    }
  }

  private formatInvoiceContent(order: any): string {
    const ESC = '\x1B';
    const INIT = `${ESC}@`;
    const BOLD_ON = `${ESC}E1`;
    const BOLD_OFF = `${ESC}E0`;
    const CENTER = `${ESC}a1`;
    const LEFT = `${ESC}a0`;
    const CUT = `${ESC}m`;

    let content = '';
    
    // Header
    content += INIT;
    content += CENTER;
    content += BOLD_ON;
    content += 'RESTAURANT INVOICE\n';
    content += BOLD_OFF;
    content += '------------------------\n\n';

    // Order Info
    content += LEFT;
    content += `Order #: ${order.orderNumber}\n`;
    content += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
    content += `Table: ${order.table.number}\n`;
    content += `Cashier: ${order.user.fullName}\n\n`;

    // Items
    content += BOLD_ON;
    content += 'ITEMS\n';
    content += BOLD_OFF;
    content += '------------------------\n';
    
    order.items.forEach(item => {
      content += `${item.menuItem.name}\n`;
      content += `${item.quantity} x ${item.price} = ${item.price.mul(item.quantity)}\n`;
      if (item.notes) {
        content += `Note: ${item.notes}\n`;
      }
      content += '\n';
    });

    // Total
    content += '------------------------\n';
    content += BOLD_ON;
    content += `TOTAL: ${order.totalAmount}\n`;
    content += BOLD_OFF;
    content += '\n\n';

    // Footer
    content += CENTER;
    content += 'Thank you for dining with us!\n';
    content += '------------------------\n\n';
    content += CUT;

    return content;
  }

  private async sendToPrinter(config: { ip: string; port: number }, content: string): Promise<void> {
    console.log('Attempting to connect to printer:', config);
    
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      const timeout = 5000; // 5 seconds timeout

      // Set up error handling
      client.on('error', (err) => {
        console.error('Printer connection error:', err);
        client.destroy();
        reject(new Error(`Printer connection failed: ${err.message}`));
      });

      client.on('timeout', () => {
        console.error('Printer connection timeout');
        client.destroy();
        reject(new Error('Connection to printer timed out after 5 seconds'));
      });

      // Set up connection
      client.connect(config.port, config.ip, () => {
        console.log('Connected to printer successfully');
        
        // Send data
        client.write(content, (err) => {
          if (err) {
            console.error('Error writing to printer:', err);
            client.destroy();
            reject(new Error(`Failed to write to printer: ${err.message}`));
          } else {
            console.log('Data sent to printer successfully');
            client.end();
            resolve();
          }
        });
      });

      // Handle connection close
      client.on('close', (hadError) => {
        if (hadError) {
          console.error('Connection closed with error');
        } else {
          console.log('Connection closed successfully');
        }
      });
    });
  }
} 