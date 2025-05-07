import { z } from 'zod';
import { UserRoles } from '@prisma/client';

export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/).optional(),
  role: z.enum([UserRoles.ADMIN, UserRoles.STAFF]).optional(),
  active: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>; 