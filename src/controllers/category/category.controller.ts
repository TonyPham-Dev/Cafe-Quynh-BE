import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards, UsePipes } from '@nestjs/common';
import { CategoryService } from 'src/services/category/category.service';
import { Response } from 'src/dtos/base/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { CreateCategoryDto, CreateCategorySchema } from '../../dtos/category/create-category.dto';
import { UpdateCategoryDto, UpdateCategorySchema } from '../../dtos/category/update-category.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('categories')
@Controller('categories')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories() {
    try {
      const categories = await this.categoryService.findAll();
      return Response.success({
        data: categories,
        message: 'Get all categories successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Get all categories failed',
      });
    }
  }

  @Get('type/:type')
  async getCategoriesByType(@Param('type') type: string) {
    try {
      const categories = await this.categoryService.findByType(type);
      return Response.success({
        data: categories,
        message: 'Get categories by type successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Get categories by type failed',
      });
    }
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateCategorySchema))
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoryService.create(createCategoryDto);
      return Response.success({
        data: category,
        message: 'Create category successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Create category failed',
      });
    }
  }

  @Put(':id')
  @Roles(UserRoles.ADMIN)
  @UsePipes(new ZodValidationPipe(UpdateCategorySchema))
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      const category = await this.categoryService.update(Number(id), updateCategoryDto);
      return Response.success({
        data: category,
        message: 'Update category successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Update category failed',
      });
    }
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  async deleteCategory(@Param('id') id: string) {
    try {
      const category = await this.categoryService.delete(Number(id));
      return Response.success({
        data: category,
        message: 'Delete category successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Delete category failed',
      });
    }
  }
} 