import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards, UsePipes } from '@nestjs/common';
import { MenuService } from 'src/services/menu/menu.service';
import { Response } from 'src/dtos/base/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { CreateMenuItemDto, CreateMenuItemSchema } from '../../dtos/menu/create-menu-item.dto';
import { UpdateMenuItemDto, UpdateMenuItemSchema } from '../../dtos/menu/update-menu-item.dto';
import { SearchMenuItemDto, SearchMenuItemSchema } from '../../dtos/menu/search-menu-item.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('menu')
@Controller('menu')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async searchMenuItems(@Query() searchDto: SearchMenuItemDto) {
    try {
      const result = await this.menuService.search(searchDto);
      return Response.success({
        data: result.data,
        message: 'Search menu items successful',
      });
    } catch (error) {
      console.log(error);
      return Response.error({
        errorCode: error.message,
        message: 'Search menu items failed',
      });
    }
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateMenuItemSchema))
  async createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    try {
      const menuItem = await this.menuService.create(createMenuItemDto);
      return Response.success({
        data: menuItem,
        message: 'Create menu item successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Create menu item failed',
      });
    }
  }

  @Put(':id')
  @Roles(UserRoles.ADMIN)
  async updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    try {
      const menuItem = await this.menuService.update(Number(id), updateMenuItemDto);
      return Response.success({
        data: menuItem,
        message: 'Update menu item successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Update menu item failed',
      });
    }
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  async deleteMenuItem(@Param('id') id: string) {
    try {
      const menuItem = await this.menuService.delete(Number(id));
      return Response.success({
        data: menuItem,
        message: 'Delete menu item successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Delete menu item failed',
      });
    }
  }
} 