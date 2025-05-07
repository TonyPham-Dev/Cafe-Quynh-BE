import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { helper } from 'src/libs/helper';
import { Prisma } from '@prisma/client';
import * as _ from 'lodash';
import { ErrorCode } from 'src/types/base/error-code.type';
import { CreateUserDto } from '../../dtos/user/create-user.dto';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { SearchUserDto } from '../../dtos/user/search-user.dto';
import { UserRoles } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    });
  }

  async findUserById(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(data: CreateUserDto) {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      throw new BadRequestException(ErrorCode.USER_EXISTS);
    }

    if (data.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (data.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: data.phone },
      });
      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    return this.prisma.user.create({
      data: {
        username: data.username,
        password: await helper.hashData(data.password),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
      },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }

    if (data.username) {
      const existingUser = await this.findByUsername(data.username);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(ErrorCode.USER_EXISTS);
      }
    }

    if (data.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (data.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: data.phone },
      });
      if (existingPhone && existingPhone.id !== id) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async searchUsers(searchDto: SearchUserDto) {
    const { search, role, active, page, limit } = searchDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (typeof active === 'boolean') {
      where.active = active;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
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
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  setRefreshToken(userId: number, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async findByUsernameDetails(username: string) {
    const user = await this.prisma.user
      .findFirstOrThrow({
        where: {
          username,
        },
        select: {
          id: true,
          username: true,
          password: true,
          active: true,
          role: true,
          refreshToken: true,
        },
      })
      .catch(() => {
        throw new Error(ErrorCode.USER_NOT_FOUND);
      });

    const data = {
      id: user.id,
      username: user.username,
      active: user.active,
      role: user.role,
      password: user.password,
      refreshToken: user.refreshToken,
    };

    return data;
  }

  async updatePassword(userId: number, newPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: await helper.hashData(newPassword),
      },
    });
  }

  async verifyOldPassword(userId: number, oldPassword: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }
    return helper.compare(oldPassword, user.password);
  }
}
