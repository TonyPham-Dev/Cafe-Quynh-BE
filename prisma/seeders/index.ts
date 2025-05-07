import { helper } from './../../src/libs/helper';
import { PrismaClient, UserRoles } from '@prisma/client';
import * as process from 'process';

const prisma = new PrismaClient();

const seeders = async () => {
  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password: await helper.hashData('admin'),
        role: UserRoles.ADMIN,
      },
    ],
  });
};

seeders().then(() => {
  prisma.$disconnect();
  process.exit();
});
