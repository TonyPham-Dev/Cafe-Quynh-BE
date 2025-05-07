import { z } from 'zod';

export const SearchMenuItemSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type SearchMenuItemDto = z.infer<typeof SearchMenuItemSchema>; 