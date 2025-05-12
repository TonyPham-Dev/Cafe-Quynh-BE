import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMenuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  category: z.string(),
  image: z.string().url().optional(),
});

export class CreateMenuItemDto extends createZodDto(CreateMenuItemSchema) {
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
}

