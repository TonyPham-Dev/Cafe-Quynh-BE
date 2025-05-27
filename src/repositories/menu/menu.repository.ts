import { PrismaService } from 'src/repositories/database/prisma.service';
import { MenuItem, Prisma, User } from '@prisma/client';
import { BaseCurdRepository } from '../base/base.repository';

export class MenuRepository extends BaseCurdRepository<
  MenuItem,
  Prisma.MenuItemUncheckedCreateInput,
  Prisma.MenuItemUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'menuItem');
  }
}
