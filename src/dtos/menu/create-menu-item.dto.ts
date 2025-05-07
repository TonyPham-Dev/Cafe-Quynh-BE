import { z } from 'zod';

export const CreateMenuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  category: z.string(),
  image: z.string().url().optional(),
});

export type CreateMenuItemDto = z.infer<typeof CreateMenuItemSchema>; 