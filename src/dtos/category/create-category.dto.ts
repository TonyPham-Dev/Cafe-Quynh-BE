import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  type: z.string(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {
  @ApiProperty({
    description: 'Name of the category',
    minLength: 2,
    maxLength: 50,
    example: 'Category 1'
  })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    maxLength: 500,
    example: 'Description of the category'
  })
  description: string;

  @ApiProperty({
    description: 'Type of the category',
    example: 'Type of the category'
  })
  type: string;
}

