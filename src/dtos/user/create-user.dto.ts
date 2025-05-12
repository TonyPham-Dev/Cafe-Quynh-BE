import { z } from 'zod';
import { UserRoles } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(50),
  fullName: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/).optional(),
  role: z.enum([UserRoles.ADMIN, UserRoles.STAFF]),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {
  @ApiProperty({
    description: 'Username of the user',
    minLength: 3,
    maxLength: 50,
    example: 'johndoe'
  })
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    minLength: 6,
    maxLength: 50,
    example: 'password123'
  })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    minLength: 2,
    maxLength: 100,
    example: 'John Doe'
  })
  fullName: string;

  @ApiProperty({
    description: 'Email address of the user',
    required: false,
    example: 'john.doe@example.com'
  })
  email?: string;

  @ApiProperty({
    description: 'Phone number of the user (10-11 digits)',
    required: false,
    example: '0123456789'
  })
  phone?: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: UserRoles,
    example: UserRoles.STAFF
  })
  role: UserRoles;
}