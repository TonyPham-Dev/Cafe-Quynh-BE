import { z } from 'zod';

export const SearchUserSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional(),
  active: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type SearchUserDto = z.infer<typeof SearchUserSchema>; 