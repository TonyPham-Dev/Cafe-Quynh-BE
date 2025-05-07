import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { CreateCategoryDto } from '../../dtos/category/create-category.dto';
import { UpdateCategoryDto } from '../../dtos/category/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingCategory) {
      throw new BadRequestException('Category name already exists');
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
      },
    });
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.findById(id);
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (data.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingCategory) {
        throw new BadRequestException('Category name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    const category = await this.findById(id);
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Check if category has any menu items
    const menuItemsCount = await this.prisma.menuItem.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (menuItemsCount > 0) {
      throw new BadRequestException('Cannot delete category with existing menu items');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findById(id: number) {
    return this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByType(type: string) {
    return this.prisma.category.findMany({
      where: {
        type: type as any,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
} 