import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SearchUserSchema = z.object({
  search: z.string().optional(),
  page: z.any().optional(),
  limit: z.any().optional(),
});

export class SearchUserDto extends createZodDto(SearchUserSchema) {
  @ApiProperty({
    description: 'Search keyword',
    example: 'John Doe'
  })
  search: string;

  @ApiProperty({
    description: 'Page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Limit number',
    example: 10
  })
  limit: number;
}
