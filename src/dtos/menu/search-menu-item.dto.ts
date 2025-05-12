import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const SearchMenuItemSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export class SearchMenuItemDto extends createZodDto(SearchMenuItemSchema) {
  @ApiProperty({
    description: 'Search keyword',
    example: 'Menu Item 1'
  })  
  search: string;

  @ApiProperty({
    description: 'Category of the menu item',
    example: 'Category 1'
  })
  category: string;

  @ApiProperty({
    description: 'Active of the menu item',
    example: true
  })
  active: boolean;
} 