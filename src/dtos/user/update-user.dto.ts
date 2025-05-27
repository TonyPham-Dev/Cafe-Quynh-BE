import { z } from 'zod';
import { UserRoles } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/).optional(),
  role: z.enum([UserRoles.ADMIN, UserRoles.STAFF]).optional(),
  active: z.boolean().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {
  @ApiProperty({
    description: 'Username',
    example: 'John Doe',
    required: false
  })
  username?: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
    required: false
  })
  fullName?: string;

  @ApiProperty({
    description: 'Email',
    example: 'john.doe@example.com',
    required: false
  })
  email?: string;

  @ApiProperty({
    description: 'Phone',
    example: '0123456789',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'Role',
    example: 'ADMIN',
    required: false
  })
  role?: 'ADMIN' | 'STAFF';

  @ApiProperty({
    description: 'Active',
    example: true,
    required: false
  })
  active?: boolean;
}