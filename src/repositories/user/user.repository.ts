import { PrismaService } from 'src/repositories/database/prisma.service';
import { Prisma, User } from '@prisma/client';
import { BaseCurdRepository } from '../base/base.repository';

export class UserRepository extends BaseCurdRepository<
  User,
  Prisma.UserUncheckedCreateInput,
  Prisma.UserUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }
}
