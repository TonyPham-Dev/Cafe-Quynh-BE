import { z } from 'zod';
import { UserRoles } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = z.object({
  username: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum([UserRoles.ADMIN, UserRoles.STAFF]).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {
  @ApiProperty({
    description: 'Username',
    example: 'John Doe'
  })
  username: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe'
  })
  fullName: string;

  @ApiProperty({
    description: 'Email',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Phone',
    example: '0123456789'
  })
  phone: string;

  @ApiProperty({
    description: 'Role',
    example: 'ADMIN'
  })
  role: 'ADMIN' | 'STAFF';


}