import { Controller, Get, UseGuards, Request, Post, Body, UsePipes, Put, Delete, Param, Query } from '@nestjs/common';
import { UserService } from 'src/services/user/users.service';
import { Response } from 'src/dtos/base/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { CreateUserDto, CreateUserSchema } from '../../dtos/user/create-user.dto';
import { UpdateUserDto, UpdateUserSchema } from '../../dtos/user/update-user.dto';
import { SearchUserDto, SearchUserSchema } from '../../dtos/user/search-user.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('access-token')
@Roles(UserRoles.ADMIN, UserRoles.STAFF)
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req: any) {
    try {
      const user = await this.userService.findByUsername(req.user.username);
      return Response.success({
        data: user,
        message: 'Get user information successful',
      });
    } catch (err) {
      return Response.error({
        errorCode: err.message,
        message: 'Get user information failed',
      });
    }
  }

  @Get()
  @Roles(UserRoles.ADMIN)
  @UsePipes(new ZodValidationPipe(SearchUserSchema))
  async searchUsers(@Query() searchDto: SearchUserDto) {
    try {
      const result = await this.userService.searchUsers(searchDto);
      return Response.success({
        data: result.data,
        message: 'Search users successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Search users failed',
      });
    }
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return Response.success({
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        message: 'Create user successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Create user failed',
      });
    }
  }

  @Put(':id')
  @Roles(UserRoles.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        throw new Error('Invalid user ID');
      }
      const user = await this.userService.update(userId, updateUserDto);
      return Response.success({
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          active: user.active,
        },
        message: 'Update user successful',
      });
    } catch (error) {
      console.log(error)
      return Response.error({
        errorCode: error.message,
        message: 'Update user failed',
      });
    }
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  async deleteUser(@Param('id') id: string) {
    try {
      const user = await this.userService.delete(Number(id));
      return Response.success({
        data: {
          id: user.id,
          username: user.username,
        },
        message: 'Delete user successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Delete user failed',
      });
    }
  }
}
