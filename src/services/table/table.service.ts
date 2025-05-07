import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../repositories/database/prisma.service';
import { UserRoles } from '@prisma/client';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  // Get all tables
  async getAllTables() {
    return this.prisma.table.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        orders: {
          where: {
            status: {
              in: ['PENDING', 'PREPARING'],
            },
            deletedAt: null,
          },
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });
  }

  // Get table by ID
  async getTableById(id: number) {
    return this.prisma.table.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        orders: {
          where: {
            status: {
              in: ['PENDING', 'PREPARING'],
            },
            deletedAt: null,
          },
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });
  }

  // Create new table
  async createTable(data: { number: number; capacity: number }) {
    return this.prisma.table.create({
      data: {
        number: data.number,
        capacity: data.capacity,
        status: 'AVAILABLE',
      },
    });
  }

  // Update table
  async updateTable(id: number, data: { number?: number; capacity?: number; status?: string }) {
    return this.prisma.table.update({
      where: { id },
      data: {
        ...(data.number && { number: data.number }),
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.status && { status: data.status as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' }),
      },
    });
  }

  // Delete table (soft delete)
  async deleteTable(id: number) {
    return this.prisma.table.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  // Update table status
  async updateTableStatus(id: number, status: string) {
    return this.prisma.table.update({
      where: { id },
      data: { status: status as 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' },
    });
  }

  // Get table with current order details
  async getTableWithCurrentOrder(id: number) {
    const table = await this.prisma.table.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        orders: {
          where: {
            status: {
              in: ['PENDING', 'PREPARING'],
            },
            deletedAt: null,
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
        },
      },
    });

    if (!table) {
      return null;
    }

    // Calculate duration for current order
    if (table.orders.length > 0) {
      const currentOrder = table.orders[0];
      const duration = Math.floor(
        (new Date().getTime() - currentOrder.startTime.getTime()) / (1000 * 60),
      );
      return {
        ...table,
        currentOrder: {
          ...currentOrder,
          duration,
        },
      };
    }

    return table;
  }
}
