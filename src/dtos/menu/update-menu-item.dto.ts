import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateMenuItemSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  image: z.string().url().optional(),
  active: z.boolean().optional(),
});

export class UpdateMenuItemDto extends createZodDto(UpdateMenuItemSchema) {
  @ApiProperty({
    description: 'Name of the menu item',
    minLength: 2,
    maxLength: 100,
    example: 'Menu Item 1'
  })
  name: string;

  @ApiProperty({
    description: 'Description of the menu item',
    maxLength: 500,
    example: 'Description of the menu item'
  })
  description: string;

  @ApiProperty({
    description: 'Price of the menu item',
    example: 100
  })
  price: number;

  @ApiProperty({
    description: 'Category of the menu item',
    example: 'Category 1'
  })
  category: string;

  @ApiProperty({
    description: 'Image of the menu item',
    example: 'https://example.com/image.jpg'
  })
  image: string;

  @ApiProperty({
    description: 'Active of the menu item',
    example: true
  })
  active: boolean;
}
