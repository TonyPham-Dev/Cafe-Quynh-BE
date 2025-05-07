import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { softDeleteMiddleware } from './prisma-middlewares/soft-delete.middleware';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      transactionOptions: {
        timeout: 120000, // 120 seconds
      },
    });
    this.$use(softDeleteMiddleware);
  }
  async onModuleInit() {
    await this.$connect();
  }

  async runMultipleInTransaction<T>(callbacks: ((prisma: Prisma.TransactionClient) => Promise<T>)[]): Promise<T[]> {
    return this.$transaction(async (prisma: Prisma.TransactionClient) => {
      const results: T[] = [];

      for (const callback of callbacks) {
        const result = await callback(prisma);
        results.push(result);
      }

      return results;
    });
  }
}
