import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMenuItemDto } from '../../dtos/menu/create-menu-item.dto';
import { UpdateMenuItemDto } from '../../dtos/menu/update-menu-item.dto';
import { SearchMenuItemDto } from '../../dtos/menu/search-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        category: {
          connect: {
            name: data.category,
          },
        },
        image: data.image,
      },
    });
  }

  async update(id: number, data: UpdateMenuItemDto) {
    const menuItem = await this.findById(id);
    if (!menuItem) {
      throw new BadRequestException('Menu item not found');
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        price: data.price ? new Prisma.Decimal(data.price) : undefined,
        category: data.category ? {
          connect: {
            name: data.category
          }
        } : undefined
      },
    });
  }

  async delete(id: number) {
    const menuItem = await this.findById(id);
    if (!menuItem) {
      throw new BadRequestException('Menu item not found');
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findById(id: number) {
    return this.prisma.menuItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async search(searchDto: SearchMenuItemDto) {
    const { search, category, active, page, limit } = searchDto;
    const skip = (page - 1) * limit;

    const where: Prisma.MenuItemWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = {
        name: category,
      };
    }

    if (typeof active === 'boolean') {
      where.active = active;
    }

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          image: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 