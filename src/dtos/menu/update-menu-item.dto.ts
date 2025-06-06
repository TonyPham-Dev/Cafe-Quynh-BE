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
}
