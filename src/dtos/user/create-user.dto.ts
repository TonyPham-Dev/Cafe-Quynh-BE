import { z } from 'zod';
import { UserRoles } from '@prisma/client';

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(50),
  fullName: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/).optional(),
  role: z.enum([UserRoles.ADMIN, UserRoles.STAFF]),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>; 