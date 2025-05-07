import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  type: z.string(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>; 