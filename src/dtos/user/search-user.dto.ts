import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SearchUserSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional().or(z.literal('')),
  active: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export class SearchUserDto extends createZodDto(SearchUserSchema) {
  @ApiProperty({
    description: 'Search keyword',
    example: 'John Doe',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Role',
    example: 'ADMIN',
    required: false,
    enum: ['ADMIN', 'STAFF', '']
  })
  role?: 'ADMIN' | 'STAFF' | '';

  @ApiProperty({
    description: 'Active',
    example: true,
    required: false
  })
  active?: boolean;
}
